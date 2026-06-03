package com.psybergate.recruitment.take;

import tools.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.repository.*;

import com.psybergate.recruitment.security.JwtService;
import com.psybergate.recruitment.take.dto.AnswerInput;
import com.psybergate.recruitment.take.dto.SaveAnswersRequest;
import com.psybergate.recruitment.take.dto.SubmitRequest;
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
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@AutoConfigureMockMvc
@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class CandidateTakeControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired UserRepository userRepository;
    @Autowired CandidateRepository candidateRepository;
    @Autowired AssessmentRepository assessmentRepository;
    @Autowired AssessmentQuestionRepository assessmentQuestionRepository;
    @Autowired QuestionRepository questionRepository;
    @Autowired InvitationRepository invitationRepository;
    @Autowired CandidateSubmissionRepository submissionRepository;
    @Autowired CandidateAnswerRepository answerRepository;
    @Autowired AnswerScoreRepository answerScoreRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private User recruiter;
    private Candidate candidate;
    private Assessment assessment;
    private McqQuestion mcqQuestion;
    private QuestionOption correctOption;
    private String candidateSessionToken;

    @BeforeEach
    void setUp() {
        recruiter = new User();
        recruiter.setEmail("take-recruiter@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        recruiter = userRepository.save(recruiter);

        candidate = new Candidate();
        candidate.setFirstName("Jane");
        candidate.setLastName("Tester");
        candidate.setEmail("take-candidate@integration.dev");
        candidate.setCreatedBy(recruiter);
        candidate = candidateRepository.save(candidate);

        assessment = new Assessment();
        assessment.setTitle("Integration Test Assessment");
        assessment.setDescription("Test");
        assessment.setTimeLimitMinutes(60);
        assessment.setCreatedBy(recruiter);
        assessment = assessmentRepository.save(assessment);

        mcqQuestion = new McqQuestion();
        mcqQuestion.setTitle("Q1");
        mcqQuestion.setBody("What is 2+2?");
        mcqQuestion.setCreatedBy(recruiter);
        mcqQuestion = (McqQuestion) questionRepository.save(mcqQuestion);

        correctOption = new QuestionOption();
        correctOption.setOptionText("4");
        correctOption.setCorrect(true);
        correctOption.setMcqQuestion(mcqQuestion);

        QuestionOption wrongOption = new QuestionOption();
        wrongOption.setOptionText("5");
        wrongOption.setCorrect(false);
        wrongOption.setMcqQuestion(mcqQuestion);

        mcqQuestion.getOptions().addAll(List.of(correctOption, wrongOption));
        mcqQuestion = (McqQuestion) questionRepository.save(mcqQuestion);
        correctOption = mcqQuestion.getOptions().stream().filter(QuestionOption::isCorrect).findFirst().orElseThrow();

        AssessmentQuestion aq = new AssessmentQuestion();
        aq.setAssessment(assessment);
        aq.setQuestion(mcqQuestion);
        aq.setDisplayOrder(1);
        assessmentQuestionRepository.save(aq);

        CandidateInvitation invitation = new CandidateInvitation();
        invitation.setCandidate(candidate);
        invitation.setAssessment(assessment);
        invitation.setInvitationToken("test-invitation-token-" + UUID.randomUUID());
        invitation.setExpiresAt(Instant.now().plusSeconds(86_400));
        invitationRepository.save(invitation);

        candidateSessionToken = jwtService.generateCandidateSessionToken(
                candidate.getId().toString(),
                assessment.getId().toString()
        );
    }

    @AfterEach
    void tearDown() {
        answerRepository.deleteAll();
        submissionRepository.deleteAll();
        invitationRepository.deleteAll();
        assessmentQuestionRepository.deleteAll();
        questionRepository.deleteAll();
        assessmentRepository.deleteAll();
        candidateRepository.deleteAll();
        userRepository.findByEmail("take-recruiter@integration.dev").ifPresent(userRepository::delete);
    }

    // ── load assessment ───────────────────────────────────────────────────────

    @Test
    void loadAssessment_firstCall_createsSubmissionAndReturns200() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assessmentId").value(assessment.getId().toString()))
                .andExpect(jsonPath("$.title").value("Integration Test Assessment"))
                .andExpect(jsonPath("$.deadline", notNullValue()))
                .andExpect(jsonPath("$.questions", hasSize(1)))
                .andExpect(jsonPath("$.answers", hasSize(0)));

        org.junit.jupiter.api.Assertions.assertEquals(1,
                submissionRepository.findByCandidateIdAndAssessmentId(
                        candidate.getId(), assessment.getId()).isPresent() ? 1 : 0);
    }

    @Test
    void loadAssessment_secondCall_returnsSameSubmission() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        long count = submissionRepository.findAll().stream()
                .filter(s -> s.getCandidateId().equals(candidate.getId()))
                .count();
        org.junit.jupiter.api.Assertions.assertEquals(1, count);
    }

    @Test
    void loadAssessment_mcqOptionsDoNotContainIsCorrect() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.questions[0].options[0].correct").doesNotExist())
                .andExpect(jsonPath("$.questions[0].options[0].optionText", notNullValue()));
    }

    @Test
    void loadAssessment_noCandidateJwt_returns403() throws Exception {
        mockMvc.perform(get("/api/take/assessment"))
                .andExpect(status().is(anyOf(equalTo(401), equalTo(403))));
    }

    // ── save answers ──────────────────────────────────────────────────────────

    @Test
    void saveAnswers_newMcqAnswer_returns200AndPersists() throws Exception {
        // First load to create submission
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        SaveAnswersRequest req = new SaveAnswersRequest(List.of(
                new AnswerInput(mcqQuestion.getId(), List.of(correctOption.getId()), null)
        ));

        mockMvc.perform(put("/api/take/answers")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answers", hasSize(1)))
                .andExpect(jsonPath("$.answers[0].questionId").value(mcqQuestion.getId().toString()));
    }

    @Test
    void saveAnswers_outOfScopeQuestion_returns403() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        SaveAnswersRequest req = new SaveAnswersRequest(List.of(
                new AnswerInput(UUID.randomUUID(), null, "some text")
        ));

        mockMvc.perform(put("/api/take/answers")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    void saveAnswers_oversizedText_returns400() throws Exception {
        TextQuestion textQ = new TextQuestion();
        textQ.setTitle("Essay Q");
        textQ.setBody("Write an essay");
        textQ.setCreatedBy(recruiter);
        textQ = (TextQuestion) questionRepository.save(textQ);

        AssessmentQuestion aq2 = new AssessmentQuestion();
        aq2.setAssessment(assessment);
        aq2.setQuestion(textQ);
        aq2.setDisplayOrder(2);
        assessmentQuestionRepository.save(aq2);

        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        String tooLong = "x".repeat(65_536);
        SaveAnswersRequest req = new SaveAnswersRequest(List.of(
                new AnswerInput(textQ.getId(), null, tooLong)
        ));

        mockMvc.perform(put("/api/take/answers")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    // ── submit ────────────────────────────────────────────────────────────────

    @Test
    void submit_manualSubmit_locksSubmissionAndReturns200() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/take/submit")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitRequest(false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.submittedAt", notNullValue()))
                .andExpect(jsonPath("$.assessmentTitle").value("Integration Test Assessment"));

        CandidateSubmission sub = submissionRepository
                .findByCandidateIdAndAssessmentId(candidate.getId(), assessment.getId())
                .orElseThrow();
        org.junit.jupiter.api.Assertions.assertEquals(SubmissionStatus.SUBMITTED, sub.getStatus());
    }

    @Test
    void submit_idempotentOnDoubleCall_returns200BothTimes() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        SubmitRequest req = new SubmitRequest(false);
        String body = objectMapper.writeValueAsString(req);

        mockMvc.perform(post("/api/take/submit")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/take/submit")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    @Test
    void submit_autoSubmit_setsAutoSubmittedStatus() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/take/submit")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitRequest(true))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AUTO_SUBMITTED"));
    }

    // ── unanswered question zero-scoring ─────────────────────────────────────

    @Test
    void submit_withNoAnswers_createsZeroScoreForUnansweredQuestion() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/take/submit")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitRequest(false))))
                .andExpect(status().isOk());

        CandidateSubmission sub = submissionRepository
                .findByCandidateIdAndAssessmentId(candidate.getId(), assessment.getId())
                .orElseThrow();

        List<CandidateAnswer> answers = answerRepository.findBySubmissionId(sub.getId());
        org.junit.jupiter.api.Assertions.assertEquals(1, answers.size(),
                "Expected one auto-created answer record for the unanswered question");

        List<AnswerScore> scores = answerScoreRepository
                .findByCandidateAnswerIdIn(List.of(answers.get(0).getId()));
        org.junit.jupiter.api.Assertions.assertEquals(1, scores.size());
        org.junit.jupiter.api.Assertions.assertEquals(0, scores.get(0).getScore());
        org.junit.jupiter.api.Assertions.assertTrue(scores.get(0).isAutoMarked());
        org.junit.jupiter.api.Assertions.assertEquals("Not answered", scores.get(0).getFeedback());
    }

    // ── integration: full flow ────────────────────────────────────────────────

    @Test
    void fullFlow_loadSaveDraftSubmit_answersPreservedAndLocked() throws Exception {
        // Load
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        // Save draft
        SaveAnswersRequest saveReq = new SaveAnswersRequest(List.of(
                new AnswerInput(mcqQuestion.getId(), List.of(correctOption.getId()), null)
        ));
        mockMvc.perform(put("/api/take/answers")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saveReq)))
                .andExpect(status().isOk());

        // Reload — draft answer should be in response
        mockMvc.perform(get("/api/take/assessment")
                        .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answers", hasSize(1)));

        // Submit
        mockMvc.perform(post("/api/take/submit")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new SubmitRequest(false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answeredCount").value(1))
                .andExpect(jsonPath("$.totalQuestionCount").value(1));

        // Draft save after submit returns 409
        mockMvc.perform(put("/api/take/answers")
                        .header("Authorization", "Bearer " + candidateSessionToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(saveReq)))
                .andExpect(status().isConflict());
    }
}
