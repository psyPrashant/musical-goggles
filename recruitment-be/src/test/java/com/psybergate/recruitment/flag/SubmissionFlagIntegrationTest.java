package com.psybergate.recruitment.flag;

import tools.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.flag.dto.CreateFlagRequest;
import com.psybergate.recruitment.flag.dto.TransitionFlagRequest;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class SubmissionFlagIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired CandidateRepository candidateRepository;
    @Autowired AssessmentRepository assessmentRepository;
    @Autowired InvitationRepository invitationRepository;
    @Autowired CandidateSubmissionRepository submissionRepository;
    @Autowired SubmissionFlagRepository flagRepository;
    @Autowired SubmissionFlagAuditRepository auditRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private User recruiter;
    private Candidate candidate;
    private Assessment assessment;
    private CandidateSubmission submission;
    private String recruiterToken;
    private String candidateToken;

    @BeforeEach
    void setUp() {
        recruiter = new User();
        recruiter.setEmail("flag-recruiter@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        recruiter = userRepository.save(recruiter);
        recruiterToken = jwtService.generateToken(recruiter.getId().toString(), Role.RECRUITER, 1L);

        candidate = new Candidate();
        candidate.setFirstName("Flag");
        candidate.setLastName("Tester");
        candidate.setEmail("flag-candidate@integration.dev");
        candidate.setCreatedBy(recruiter);
        candidate = candidateRepository.save(candidate);

        assessment = new Assessment();
        assessment.setTitle("Flag Test Assessment");
        assessment.setDescription("Test");
        assessment.setTimeLimitMinutes(60);
        assessment.setCreatedBy(recruiter);
        assessment = assessmentRepository.save(assessment);

        CandidateInvitation invitation = new CandidateInvitation();
        invitation.setCandidate(candidate);
        invitation.setAssessment(assessment);
        invitation.setInvitationToken("flag-test-token-" + UUID.randomUUID());
        invitation.setExpiresAt(Instant.now().plusSeconds(86_400));
        invitationRepository.save(invitation);

        submission = new CandidateSubmission();
        submission.setCandidateId(candidate.getId());
        submission.setAssessmentId(assessment.getId());
        submission.setInvitationId(invitation.getId());
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setStartedAt(Instant.now().minusSeconds(3600));
        submission.setSubmittedAt(Instant.now());
        submission = submissionRepository.save(submission);

        candidateToken = jwtService.generateToken(UUID.randomUUID().toString(), Role.RECRUITER, 1L);
    }

    @AfterEach
    void tearDown() {
        auditRepository.deleteAll();
        flagRepository.deleteAll();
        submissionRepository.deleteAll();
        invitationRepository.deleteAll();
        assessmentRepository.deleteAll();
        candidateRepository.deleteAll();
        userRepository.findByEmail("flag-recruiter@integration.dev").ifPresent(userRepository::delete);
    }

    // ── 5.2: POST /api/submissions/{id}/flags ─────────────────────────────

    @Test
    void createFlag_happyPath_returns201() throws Exception {
        var req = new CreateFlagRequest(FlagReason.COPIED_ANSWERS);
        mockMvc.perform(post("/api/submissions/{id}/flags", submission.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("FLAGGED"))
                .andExpect(jsonPath("$.reason").value("COPIED_ANSWERS"));
    }

    @Test
    void createFlag_duplicateOpenFlag_returns409() throws Exception {
        var req = new CreateFlagRequest(FlagReason.COPIED_ANSWERS);
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/submissions/{id}/flags", submission.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());

        // Second flag should 409
        mockMvc.perform(post("/api/submissions/{id}/flags", submission.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void createFlag_nullReason_returns400() throws Exception {
        mockMvc.perform(post("/api/submissions/{id}/flags", submission.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":null}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createFlag_withoutAuth_returns403() throws Exception {
        mockMvc.perform(post("/api/submissions/{id}/flags", submission.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\":\"COPIED_ANSWERS\"}"))
                .andExpect(status().isForbidden());
    }

    // ── 5.3: flag status transitions ──────────────────────────────────────

    @Test
    void transitionFlag_toUnderReview_returns200() throws Exception {
        var flag = createFlag();
        var req = new TransitionFlagRequest(FlagStatus.UNDER_REVIEW, null);

        mockMvc.perform(patch("/api/submissions/{sid}/flags/{fid}", submission.getId(), flag.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UNDER_REVIEW"));
    }

    @Test
    void transitionFlag_resolveWithoutNotes_returns400() throws Exception {
        var flag = createFlag();
        transitionToUnderReview(flag.getId());

        var req = new TransitionFlagRequest(FlagStatus.RESOLVED, null);

        mockMvc.perform(patch("/api/submissions/{sid}/flags/{fid}", submission.getId(), flag.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void transitionFlag_invalidTransitionFlaggedToResolved_returns422() throws Exception {
        var flag = createFlag();
        var req = new TransitionFlagRequest(FlagStatus.RESOLVED, "notes");

        mockMvc.perform(patch("/api/submissions/{sid}/flags/{fid}", submission.getId(), flag.getId())
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnprocessableEntity());
    }

    // ── 5.4: GET /api/flags with/without filters ──────────────────────────

    @Test
    void getAllFlags_noFilters_returnsAll() throws Exception {
        createFlag();

        mockMvc.perform(get("/api/flags")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void getAllFlags_filterByAssessmentId_returnsOnlyMatching() throws Exception {
        createFlag();

        mockMvc.perform(get("/api/flags")
                .param("assessmentId", assessment.getId().toString())
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    void getAllFlags_filterByDifferentAssessmentId_returnsEmpty() throws Exception {
        createFlag();

        mockMvc.perform(get("/api/flags")
                .param("assessmentId", UUID.randomUUID().toString())
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    // ── helpers ───────────────────────────────────────────────────────────

    private SubmissionFlag createFlag() {
        SubmissionFlag flag = new SubmissionFlag();
        flag.setSubmissionId(submission.getId());
        flag.setReason(FlagReason.COPIED_ANSWERS);
        flag.setStatus(FlagStatus.FLAGGED);
        flag.setCreatedBy(recruiter.getId());
        return flagRepository.save(flag);
    }

    private void transitionToUnderReview(UUID flagId) throws Exception {
        var req = new TransitionFlagRequest(FlagStatus.UNDER_REVIEW, null);
        mockMvc.perform(patch("/api/submissions/{sid}/flags/{fid}", submission.getId(), flagId)
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)));
    }
}
