package com.psybergate.recruitment.candidate;

import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.repository.*;
import com.psybergate.recruitment.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class CandidateHistoryIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired UserRepository userRepository;
    @Autowired CandidateRepository candidateRepository;
    @Autowired AssessmentRepository assessmentRepository;
    @Autowired InvitationRepository invitationRepository;
    @Autowired CandidateSubmissionRepository submissionRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private User recruiter;
    private Candidate candidate;
    private Assessment assessment;
    private CandidateInvitation invitation;
    private String recruiterToken;

    @BeforeEach
    void setUp() {
        recruiter = new User();
        recruiter.setFirstName("Test");
        recruiter.setLastName("Recruiter");
        recruiter.setEmail("hist-recruiter@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        recruiter = userRepository.save(recruiter);
        recruiterToken = jwtService.generateToken(recruiter.getId().toString(), Role.RECRUITER, 1L);

        candidate = new Candidate();
        candidate.setFirstName("History");
        candidate.setLastName("Tester");
        candidate.setEmail("hist-candidate@integration.dev");
        candidate.setCreatedBy(recruiter);
        candidate = candidateRepository.save(candidate);

        assessment = new Assessment();
        assessment.setTitle("History Test Assessment");
        assessment.setDescription("Test");
        assessment.setTimeLimitMinutes(60);
        assessment.setCreatedBy(recruiter);
        assessment = assessmentRepository.save(assessment);

        invitation = new CandidateInvitation();
        invitation.setCandidate(candidate);
        invitation.setAssessment(assessment);
        invitation.setInvitationToken("hist-test-" + UUID.randomUUID());
        invitation.setExpiresAt(Instant.now().plusSeconds(86_400));
        invitation = invitationRepository.save(invitation);
    }

    @AfterEach
    void tearDown() {
        submissionRepository.deleteAll();
        invitationRepository.deleteAll();
        assessmentRepository.deleteAll();
        candidateRepository.deleteAll();
        userRepository.findByEmail("hist-recruiter@integration.dev").ifPresent(userRepository::delete);
    }

    @Test
    void getHistory_happyPath_returnsInvitations() throws Exception {
        mockMvc.perform(get("/api/candidates/{id}/history", candidate.getId())
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].assessmentName").value("History Test Assessment"))
                .andExpect(jsonPath("$[0].status").value("PENDING"));
    }

    @Test
    void getHistory_withSubmission_returnsSubmittedStatus() throws Exception {
        CandidateSubmission submission = new CandidateSubmission();
        submission.setCandidateId(candidate.getId());
        submission.setAssessmentId(assessment.getId());
        submission.setInvitationId(invitation.getId());
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setStartedAt(Instant.now().minusSeconds(3600));
        submission.setSubmittedAt(Instant.now());
        submissionRepository.save(submission);

        mockMvc.perform(get("/api/candidates/{id}/history", candidate.getId())
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].status").value("SUBMITTED"))
                .andExpect(jsonPath("$[0].submissionId").isNotEmpty());
    }

    @Test
    void getHistory_candidateNotFound_returns404() throws Exception {
        mockMvc.perform(get("/api/candidates/{id}/history", UUID.randomUUID())
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void getHistory_withoutAuth_returns401() throws Exception {
        mockMvc.perform(get("/api/candidates/{id}/history", candidate.getId()))
                .andExpect(status().isUnauthorized());
    }
}
