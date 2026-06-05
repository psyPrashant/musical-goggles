package com.psybergate.recruitment.marking;

import tools.jackson.databind.ObjectMapper;
import com.psybergate.recruitment.AbstractIntegrationTest;
import com.psybergate.recruitment.TestDatasourceInitializer;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.domain.SubmissionStatus;
import com.psybergate.recruitment.marking.dto.ScoreAnswerRequest;
import com.psybergate.recruitment.repository.*;
import com.psybergate.recruitment.security.JwtService;
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
class MarkingIntegrationTest extends AbstractIntegrationTest {

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
    @Autowired AnswerScoreRepository scoreRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired JwtService jwtService;

    private User recruiter;
    private Candidate candidate;
    private Assessment assessment;
    private McqQuestion mcqQuestion;
    private QuestionOption correctOption;
    private CandidateInvitation invitation;
    private String recruiterToken;
    private String candidateSessionToken;

    @BeforeEach
    void setUp() {
        recruiter = new User();
        recruiter.setFirstName("Test");
        recruiter.setLastName("Recruiter");
        recruiter.setEmail("marking-recruiter@integration.dev");
        recruiter.setPasswordHash(passwordEncoder.encode("pass"));
        recruiter.setRole(Role.RECRUITER);
        recruiter = userRepository.save(recruiter);
        recruiterToken = jwtService.generateToken(recruiter.getId().toString(), Role.RECRUITER, 1L);

        candidate = new Candidate();
        candidate.setFirstName("Mark");
        candidate.setLastName("Tester");
        candidate.setEmail("marking-candidate@integration.dev");
        candidate.setCreatedBy(recruiter);
        candidate = candidateRepository.save(candidate);

        assessment = new Assessment();
        assessment.setTitle("Marking Test Assessment");
        assessment.setDescription("Test");
        assessment.setTimeLimitMinutes(60);
        assessment.setCreatedBy(recruiter);
        assessment = assessmentRepository.save(assessment);

        mcqQuestion = new McqQuestion();
        mcqQuestion.setTitle("What is 2+2?");
        mcqQuestion.setBody("Pick the correct answer");
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

        invitation = new CandidateInvitation();
        invitation.setCandidate(candidate);
        invitation.setAssessment(assessment);
        invitation.setInvitationToken("mark-test-token-" + UUID.randomUUID());
        invitation.setExpiresAt(Instant.now().plusSeconds(86_400));
        invitation = invitationRepository.save(invitation);

        candidateSessionToken = jwtService.generateCandidateSessionToken(
                candidate.getId().toString(), assessment.getId().toString());
    }

    @AfterEach
    void tearDown() {
        scoreRepository.deleteAll();
        answerRepository.deleteAll();
        submissionRepository.deleteAll();
        invitationRepository.deleteAll();
        assessmentQuestionRepository.deleteAll();
        questionRepository.deleteAll();
        assessmentRepository.deleteAll();
        candidateRepository.deleteAll();
        userRepository.findByEmail("marking-recruiter@integration.dev").ifPresent(userRepository::delete);
    }

    // ── auto-marking on submit ─────────────────────────────────────────────

    @Test
    void submitWithCorrectMcqAnswer_autoMarksScore1() throws Exception {
        // Load assessment (creates submission)
        mockMvc.perform(get("/api/take/assessment")
                .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        // Save correct MCQ answer
        String saveBody = """
            {"answers":[{"questionId":"%s","selectedOptionIds":["%s"]}]}
            """.formatted(mcqQuestion.getId(), correctOption.getId());

        mockMvc.perform(put("/api/take/answers")
                .header("Authorization", "Bearer " + candidateSessionToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(saveBody))
                .andExpect(status().isOk());

        // Submit
        mockMvc.perform(post("/api/take/submit")
                .header("Authorization", "Bearer " + candidateSessionToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new SubmitRequest(false))))
                .andExpect(status().isOk());

        // Verify auto-mark score
        CandidateSubmission sub = submissionRepository
                .findByCandidateIdAndAssessmentId(candidate.getId(), assessment.getId()).orElseThrow();
        CandidateAnswer answer = answerRepository.findBySubmissionId(sub.getId()).get(0);
        AnswerScore score = scoreRepository.findByCandidateAnswerId(answer.getId()).orElseThrow();

        org.junit.jupiter.api.Assertions.assertEquals(1, score.getScore());
        org.junit.jupiter.api.Assertions.assertTrue(score.isAutoMarked());
        org.junit.jupiter.api.Assertions.assertNull(score.getMarkedBy());
    }

    @Test
    void submitWithWrongMcqAnswer_autoMarksScore0() throws Exception {
        QuestionOption wrong = mcqQuestion.getOptions().stream()
                .filter(o -> !o.isCorrect()).findFirst().orElseThrow();

        mockMvc.perform(get("/api/take/assessment")
                .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        String saveBody = """
            {"answers":[{"questionId":"%s","selectedOptionIds":["%s"]}]}
            """.formatted(mcqQuestion.getId(), wrong.getId());

        mockMvc.perform(put("/api/take/answers")
                .header("Authorization", "Bearer " + candidateSessionToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(saveBody))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/take/submit")
                .header("Authorization", "Bearer " + candidateSessionToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new SubmitRequest(false))))
                .andExpect(status().isOk());

        CandidateSubmission sub = submissionRepository
                .findByCandidateIdAndAssessmentId(candidate.getId(), assessment.getId()).orElseThrow();
        CandidateAnswer answer = answerRepository.findBySubmissionId(sub.getId()).get(0);
        AnswerScore score = scoreRepository.findByCandidateAnswerId(answer.getId()).orElseThrow();

        org.junit.jupiter.api.Assertions.assertEquals(0, score.getScore());
    }

    // ── result summary ─────────────────────────────────────────────────────

    @Test
    void fullFlow_submitAndFetchResult_showsFullyMarked() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        String saveBody = """
            {"answers":[{"questionId":"%s","selectedOptionIds":["%s"]}]}
            """.formatted(mcqQuestion.getId(), correctOption.getId());

        mockMvc.perform(put("/api/take/answers")
                .header("Authorization", "Bearer " + candidateSessionToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(saveBody))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/take/submit")
                .header("Authorization", "Bearer " + candidateSessionToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new SubmitRequest(false))))
                .andExpect(status().isOk());

        CandidateSubmission sub = submissionRepository
                .findByCandidateIdAndAssessmentId(candidate.getId(), assessment.getId()).orElseThrow();

        mockMvc.perform(get("/api/submissions/" + sub.getId() + "/result")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.markingStatus").value("FULLY_MARKED"))
                .andExpect(jsonPath("$.totalScore").value(1))
                .andExpect(jsonPath("$.candidateName").value("Mark Tester"))
                .andExpect(jsonPath("$.questions", hasSize(1)))
                .andExpect(jsonPath("$.questions[0].score").value(1));
    }

    @Test
    void manualMarkFlow_pendingThenMarkedThenFullyMarked() throws Exception {
        // Set up a text question assessment
        TextQuestion textQ = new TextQuestion();
        textQ.setTitle("Explain OOP");
        textQ.setBody("What is OOP?");
        textQ.setCreatedBy(recruiter);
        textQ = (TextQuestion) questionRepository.save(textQ);

        Assessment textAssessment = new Assessment();
        textAssessment.setTitle("Text Assessment");
        textAssessment.setDescription("Test");
        textAssessment.setTimeLimitMinutes(30);
        textAssessment.setCreatedBy(recruiter);
        textAssessment = assessmentRepository.save(textAssessment);

        AssessmentQuestion aq2 = new AssessmentQuestion();
        aq2.setAssessment(textAssessment);
        aq2.setQuestion(textQ);
        aq2.setDisplayOrder(1);
        assessmentQuestionRepository.save(aq2);

        CandidateInvitation inv2 = new CandidateInvitation();
        inv2.setCandidate(candidate);
        inv2.setAssessment(textAssessment);
        inv2.setInvitationToken("text-token-" + UUID.randomUUID());
        inv2.setExpiresAt(Instant.now().plusSeconds(86_400));
        invitationRepository.save(inv2);

        String textToken = jwtService.generateCandidateSessionToken(
                candidate.getId().toString(), textAssessment.getId().toString());

        // Load, answer, submit
        mockMvc.perform(get("/api/take/assessment")
                .header("Authorization", "Bearer " + textToken)).andExpect(status().isOk());

        String saveBody = """
            {"answers":[{"questionId":"%s","textContent":"OOP is about objects"}]}
            """.formatted(textQ.getId());

        mockMvc.perform(put("/api/take/answers")
                .header("Authorization", "Bearer " + textToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(saveBody))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/take/submit")
                .header("Authorization", "Bearer " + textToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new SubmitRequest(false))))
                .andExpect(status().isOk());

        CandidateSubmission sub = submissionRepository
                .findByCandidateIdAndAssessmentId(candidate.getId(), textAssessment.getId()).orElseThrow();
        CandidateAnswer answer = answerRepository.findBySubmissionId(sub.getId()).get(0);

        // Check PENDING_REVIEW before marking
        mockMvc.perform(get("/api/submissions/" + sub.getId() + "/result")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.markingStatus").value("PENDING_REVIEW"))
                .andExpect(jsonPath("$.totalScore").value(0));

        // Manual mark
        ScoreAnswerRequest scoreReq = new ScoreAnswerRequest(8, "Good answer");
        mockMvc.perform(put("/api/submissions/" + sub.getId() + "/answers/" + answer.getId() + "/score")
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(scoreReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(8))
                .andExpect(jsonPath("$.autoMarked").value(false));

        // Check FULLY_MARKED after marking
        mockMvc.perform(get("/api/submissions/" + sub.getId() + "/result")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.markingStatus").value("FULLY_MARKED"))
                .andExpect(jsonPath("$.totalScore").value(8));
    }

    // ── submission listing ─────────────────────────────────────────────────

    @Test
    void listSubmissions_assessmentWithSubmission_returns200() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/assessments/" + assessment.getId() + "/submissions")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].candidateName").value("Mark Tester"));
    }

    @Test
    void listSubmissions_unknownAssessment_returns404() throws Exception {
        mockMvc.perform(get("/api/assessments/" + UUID.randomUUID() + "/submissions")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isNotFound());
    }

    // ── scoreByQuestionId (MG-143) ─────────────────────────────────────────

    @Test
    void scoreByQuestionId_noExistingAnswer_createsCandidateAnswerAndSavesScore() throws Exception {
        // Directly create a submitted submission with no answers
        CandidateSubmission sub = new CandidateSubmission();
        sub.setCandidateId(candidate.getId());
        sub.setAssessmentId(assessment.getId());
        sub.setInvitationId(invitation.getId());
        sub.setStartedAt(Instant.now());
        sub.setStatus(SubmissionStatus.SUBMITTED);
        sub.setSubmittedAt(Instant.now());
        sub = submissionRepository.save(sub);

        // No CandidateAnswer exists for mcqQuestion
        org.junit.jupiter.api.Assertions.assertTrue(
                answerRepository.findBySubmissionIdAndQuestionId(sub.getId(), mcqQuestion.getId()).isEmpty());

        ScoreAnswerRequest req = new ScoreAnswerRequest(1, "Good");
        mockMvc.perform(put("/api/submissions/" + sub.getId() + "/questions/" + mcqQuestion.getId() + "/score")
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(1))
                .andExpect(jsonPath("$.autoMarked").value(false))
                .andExpect(jsonPath("$.answerId").isNotEmpty());

        // CandidateAnswer should now exist
        org.junit.jupiter.api.Assertions.assertTrue(
                answerRepository.findBySubmissionIdAndQuestionId(sub.getId(), mcqQuestion.getId()).isPresent());
    }

    @Test
    void scoreByQuestionId_questionNotInAssessment_returns404() throws Exception {
        CandidateSubmission sub = new CandidateSubmission();
        sub.setCandidateId(candidate.getId());
        sub.setAssessmentId(assessment.getId());
        sub.setInvitationId(invitation.getId());
        sub.setStartedAt(Instant.now());
        sub.setStatus(SubmissionStatus.SUBMITTED);
        sub.setSubmittedAt(Instant.now());
        sub = submissionRepository.save(sub);

        ScoreAnswerRequest req = new ScoreAnswerRequest(1, null);
        mockMvc.perform(put("/api/submissions/" + sub.getId() + "/questions/" + UUID.randomUUID() + "/score")
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isNotFound());
    }

    // ── fullyMarked with missing CandidateAnswer (MG-144) ──────────────────

    @Test
    void getResult_unansweredQuestionHasNoAnswer_doesNotBlockFullyMarked() throws Exception {
        // Create a second TEXT question and add it to the assessment
        TextQuestion textQ = new TextQuestion();
        textQ.setTitle("Explain recursion");
        textQ.setBody("What is recursion?");
        textQ.setCreatedBy(recruiter);
        textQ = (TextQuestion) questionRepository.save(textQ);

        AssessmentQuestion aq2 = new AssessmentQuestion();
        aq2.setAssessment(assessment);
        aq2.setQuestion(textQ);
        aq2.setDisplayOrder(2);
        assessmentQuestionRepository.save(aq2);

        // Create a submitted submission
        CandidateSubmission sub = new CandidateSubmission();
        sub.setCandidateId(candidate.getId());
        sub.setAssessmentId(assessment.getId());
        sub.setInvitationId(invitation.getId());
        sub.setStartedAt(Instant.now());
        sub.setStatus(SubmissionStatus.SUBMITTED);
        sub.setSubmittedAt(Instant.now());
        sub = submissionRepository.save(sub);

        // Create CandidateAnswer + AnswerScore for mcqQuestion only; textQ has none
        CandidateAnswer mcqAnswer = new CandidateAnswer();
        mcqAnswer.setSubmissionId(sub.getId());
        mcqAnswer.setQuestionId(mcqQuestion.getId());
        mcqAnswer.setSavedAt(Instant.now());
        mcqAnswer = answerRepository.save(mcqAnswer);

        AnswerScore mcqScore = new AnswerScore();
        mcqScore.setCandidateAnswerId(mcqAnswer.getId());
        mcqScore.setScore(1);
        mcqScore.setAutoMarked(true);
        mcqScore.setMarkedAt(Instant.now());
        scoreRepository.save(mcqScore);

        // textQ has no CandidateAnswer — blocks FULLY_MARKED until recruiter scores it via questionId endpoint
        mockMvc.perform(get("/api/submissions/" + sub.getId() + "/result")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.markingStatus").value("PENDING_REVIEW"));

        // Recruiter scores the unanswered textQ via the questionId endpoint
        ScoreAnswerRequest scoreTextQ = new ScoreAnswerRequest(0, "Not answered");
        mockMvc.perform(put("/api/submissions/" + sub.getId() + "/questions/" + textQ.getId() + "/score")
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(scoreTextQ)))
                .andExpect(status().isOk());

        // Now all questions are scored — should be FULLY_MARKED
        mockMvc.perform(get("/api/submissions/" + sub.getId() + "/result")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.markingStatus").value("FULLY_MARKED"));
    }

    @Test
    void getResult_noAnswersAtAll_returnsPendingReview() throws Exception {
        // Submission with no CandidateAnswer rows must never show FULLY_MARKED
        CandidateSubmission sub = new CandidateSubmission();
        sub.setCandidateId(candidate.getId());
        sub.setAssessmentId(assessment.getId());
        sub.setInvitationId(invitation.getId());
        sub.setStartedAt(Instant.now());
        sub.setStatus(SubmissionStatus.SUBMITTED);
        sub.setSubmittedAt(Instant.now());
        sub = submissionRepository.save(sub);

        mockMvc.perform(get("/api/submissions/" + sub.getId() + "/result")
                .header("Authorization", "Bearer " + recruiterToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.markingStatus").value("PENDING_REVIEW"));
    }

    // ── manual marking edge cases ──────────────────────────────────────────

    @Test
    void scoreAnswer_negativeScore_returns400() throws Exception {
        mockMvc.perform(get("/api/take/assessment")
                .header("Authorization", "Bearer " + candidateSessionToken))
                .andExpect(status().isOk());

        CandidateSubmission sub = submissionRepository
                .findByCandidateIdAndAssessmentId(candidate.getId(), assessment.getId()).orElseThrow();
        CandidateAnswer answer = new CandidateAnswer();
        answer.setSubmissionId(sub.getId());
        answer.setQuestionId(mcqQuestion.getId());
        answer.setSavedAt(Instant.now());
        answer = answerRepository.save(answer);

        ScoreAnswerRequest bad = new ScoreAnswerRequest(-1, null);
        mockMvc.perform(put("/api/submissions/" + sub.getId() + "/answers/" + answer.getId() + "/score")
                .header("Authorization", "Bearer " + recruiterToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest());
    }
}
