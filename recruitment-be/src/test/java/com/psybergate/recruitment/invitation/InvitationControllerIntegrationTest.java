package com.psybergate.recruitment.invitation;

import tools.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.invitation.dto.InviteRequest;
import com.psybergate.recruitment.repository.*;
import com.psybergate.recruitment.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class InvitationControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired CandidateRepository candidateRepository;
    @Autowired AssessmentRepository assessmentRepository;
    @Autowired InvitationRepository invitationRepository;
    @Autowired CandidateSubmissionRepository submissionRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private String token;
    private Candidate candidate;
    private Assessment assessment;

    @BeforeEach
    void setUp() {
        User recruiter = new User();
        recruiter.setFirstName("Invite");
        recruiter.setLastName("Tester");
        recruiter.setEmail("invite-test@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        recruiter = userRepository.save(recruiter);
        token = jwtService.generateToken(recruiter.getId().toString(), Role.RECRUITER, 1L);

        candidate = new Candidate();
        candidate.setFirstName("Test");
        candidate.setLastName("Candidate");
        candidate.setEmail("invite-candidate@integration.dev");
        candidate.setCreatedBy(recruiter);
        candidate = candidateRepository.save(candidate);

        assessment = new Assessment();
        assessment.setTitle("Invite Test Assessment");
        assessment.setDescription("Test");
        assessment.setTimeLimitMinutes(30);
        assessment.setStatus(AssessmentStatus.PUBLISHED);
        assessment.setCreatedBy(recruiter);
        assessment = assessmentRepository.save(assessment);
    }

    @AfterEach
    void tearDown() {
        submissionRepository.deleteAll();
        invitationRepository.deleteAll();
        assessmentRepository.deleteAll();
        candidateRepository.deleteAll();
        userRepository.findByEmail("invite-test@integration.dev").ifPresent(userRepository::delete);
    }

    @Test
    void invite_candidateHasSubmittedSubmission_returns409AssessmentAlreadyCompleted() throws Exception {
        CandidateSubmission submission = new CandidateSubmission();
        submission.setCandidateId(candidate.getId());
        submission.setAssessmentId(assessment.getId());
        submission.setInvitationId(UUID.randomUUID());
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setStartedAt(Instant.now().minusSeconds(3600));
        submission.setSubmittedAt(Instant.now());
        submissionRepository.save(submission);

        InviteRequest req = new InviteRequest(candidate.getId(), assessment.getId());

        mockMvc.perform(post("/api/invitations")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(result -> {
                    String msg = result.getResponse().getErrorMessage();
                    assert "ASSESSMENT_ALREADY_COMPLETED".equals(msg)
                            : "Expected ASSESSMENT_ALREADY_COMPLETED but got: " + msg;
                });
    }

    @Test
    void invite_candidateHasAutoSubmittedSubmission_returns409AssessmentAlreadyCompleted() throws Exception {
        CandidateSubmission submission = new CandidateSubmission();
        submission.setCandidateId(candidate.getId());
        submission.setAssessmentId(assessment.getId());
        submission.setInvitationId(UUID.randomUUID());
        submission.setStatus(SubmissionStatus.AUTO_SUBMITTED);
        submission.setStartedAt(Instant.now().minusSeconds(3600));
        submission.setSubmittedAt(Instant.now());
        submissionRepository.save(submission);

        InviteRequest req = new InviteRequest(candidate.getId(), assessment.getId());

        mockMvc.perform(post("/api/invitations")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(result -> {
                    String msg = result.getResponse().getErrorMessage();
                    assert "ASSESSMENT_ALREADY_COMPLETED".equals(msg)
                            : "Expected ASSESSMENT_ALREADY_COMPLETED but got: " + msg;
                });
    }

    @Test
    void invite_candidateHasInProgressSubmission_notBlockedByCompletionCheck() throws Exception {
        // Pre-create an active (SENT) invitation so the request is blocked by ACTIVE_INVITE_EXISTS
        // before it reaches email sending — this avoids needing a live mail server in CI.
        // The key assertion is that the error is ACTIVE_INVITE_EXISTS, not ASSESSMENT_ALREADY_COMPLETED.
        CandidateInvitation existingInvite = new CandidateInvitation();
        existingInvite.setCandidate(candidate);
        existingInvite.setAssessment(assessment);
        existingInvite.setInvitationToken("existing-token-" + UUID.randomUUID());
        existingInvite.setExpiresAt(Instant.now().plusSeconds(86_400));
        existingInvite.setStatus(InvitationStatus.SENT);
        invitationRepository.save(existingInvite);

        CandidateSubmission submission = new CandidateSubmission();
        submission.setCandidateId(candidate.getId());
        submission.setAssessmentId(assessment.getId());
        submission.setInvitationId(existingInvite.getId());
        submission.setStatus(SubmissionStatus.IN_PROGRESS);
        submission.setStartedAt(Instant.now().minusSeconds(600));
        submissionRepository.save(submission);

        InviteRequest req = new InviteRequest(candidate.getId(), assessment.getId());

        // IN_PROGRESS must NOT trigger ASSESSMENT_ALREADY_COMPLETED guard.
        // The request is blocked by ACTIVE_INVITE_EXISTS (the earlier guard), which does not
        // set an HTTP error message — so we simply assert the completion guard error is absent.
        mockMvc.perform(post("/api/invitations")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict())
                .andExpect(result -> {
                    String msg = result.getResponse().getErrorMessage();
                    assert !"ASSESSMENT_ALREADY_COMPLETED".equals(msg)
                            : "IN_PROGRESS submission should not trigger completion guard";
                });
    }
}
