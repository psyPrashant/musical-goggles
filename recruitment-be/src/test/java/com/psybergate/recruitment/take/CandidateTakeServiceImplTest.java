package com.psybergate.recruitment.take;

import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.marking.MarkingService;
import com.psybergate.recruitment.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CandidateTakeServiceImplTest {

    @Mock private AssessmentRepository assessmentRepository;
    @Mock private AssessmentQuestionRepository assessmentQuestionRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private CandidateSubmissionRepository submissionRepository;
    @Mock private CandidateAnswerRepository answerRepository;
    @Mock private AnswerScoreRepository answerScoreRepository;
    @Mock private InvitationRepository invitationRepository;
    @Mock private MarkingService markingService;
    @Mock private ObjectMapper objectMapper;

    @InjectMocks
    private CandidateTakeServiceImpl service;

    private UUID candidateId;
    private UUID assessmentId;
    private UUID submissionId;
    private Assessment assessment;
    private CandidateSubmission submission;
    private McqQuestion mcqQuestion;
    private AssessmentQuestion aq;

    @BeforeEach
    void setUp() {
        candidateId = UUID.randomUUID();
        assessmentId = UUID.randomUUID();
        submissionId = UUID.randomUUID();

        assessment = new Assessment();
        assessment.setTimeLimitMinutes(60);

        submission = new CandidateSubmission();
        submission.setId(submissionId);
        submission.setCandidateId(candidateId);
        submission.setAssessmentId(assessmentId);
        submission.setStatus(SubmissionStatus.IN_PROGRESS);
        submission.setStartedAt(Instant.now().minusSeconds(60));

        mcqQuestion = new McqQuestion();
        mcqQuestion.setId(UUID.randomUUID());

        aq = new AssessmentQuestion();
        aq.setQuestion(mcqQuestion);
        aq.setDisplayOrder(1);
    }

    @Test
    void submitAssessment_oneUnansweredQuestion_createsZeroScoreRecord() {
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        when(submissionRepository.findByCandidateIdAndAssessmentId(candidateId, assessmentId))
                .thenReturn(Optional.of(submission));
        when(invitationRepository.findByCandidate_IdAndAssessment_Id(candidateId, assessmentId))
                .thenReturn(Optional.empty());
        when(submissionRepository.save(any())).thenReturn(submission);

        // No questions answered
        when(answerRepository.findQuestionIdsBySubmissionId(submissionId)).thenReturn(Set.of());
        when(assessmentQuestionRepository.findByAssessmentIdOrderByDisplayOrder(assessmentId))
                .thenReturn(List.of(aq));

        UUID answerId = UUID.randomUUID();
        CandidateAnswer savedAnswer = new CandidateAnswer();
        savedAnswer.setId(answerId);
        when(answerRepository.findBySubmissionIdAndQuestionId(submissionId, mcqQuestion.getId()))
                .thenReturn(Optional.empty());
        when(answerRepository.save(any(CandidateAnswer.class))).thenReturn(savedAnswer);
        when(answerScoreRepository.findByCandidateAnswerId(answerId)).thenReturn(Optional.empty());

        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of(savedAnswer));

        service.submitAssessment(candidateId, assessmentId, false);

        ArgumentCaptor<AnswerScore> scoreCaptor = ArgumentCaptor.forClass(AnswerScore.class);
        verify(answerScoreRepository).save(scoreCaptor.capture());
        AnswerScore saved = scoreCaptor.getValue();
        assertThat(saved.getScore()).isEqualTo(0);
        assertThat(saved.isAutoMarked()).isTrue();
        assertThat(saved.getFeedback()).isEqualTo("Not answered");
        assertThat(saved.getCandidateAnswerId()).isEqualTo(answerId);
    }

    @Test
    void submitAssessment_allQuestionsAnswered_noZeroScoresCreated() {
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        when(submissionRepository.findByCandidateIdAndAssessmentId(candidateId, assessmentId))
                .thenReturn(Optional.of(submission));
        when(invitationRepository.findByCandidate_IdAndAssessment_Id(candidateId, assessmentId))
                .thenReturn(Optional.empty());
        when(submissionRepository.save(any())).thenReturn(submission);

        // All questions answered
        when(answerRepository.findQuestionIdsBySubmissionId(submissionId))
                .thenReturn(Set.of(mcqQuestion.getId()));
        when(assessmentQuestionRepository.findByAssessmentIdOrderByDisplayOrder(assessmentId))
                .thenReturn(List.of(aq));

        CandidateAnswer existingAnswer = new CandidateAnswer();
        existingAnswer.setId(UUID.randomUUID());
        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of(existingAnswer));

        service.submitAssessment(candidateId, assessmentId, false);

        verify(answerScoreRepository, never()).save(any());
    }

    @Test
    void submitAssessment_calledTwice_doesNotCreateDuplicateZeroScore() {
        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
        // First call — submission is IN_PROGRESS
        CandidateSubmission inProgress = submission;
        // Second call — submission is already SUBMITTED (isLocked = true)
        CandidateSubmission submitted = new CandidateSubmission();
        submitted.setId(submissionId);
        submitted.setStatus(SubmissionStatus.SUBMITTED);
        submitted.setSubmittedAt(Instant.now());
        submitted.setCandidateId(candidateId);
        submitted.setAssessmentId(assessmentId);
        submitted.setStartedAt(inProgress.getStartedAt());

        when(submissionRepository.findByCandidateIdAndAssessmentId(candidateId, assessmentId))
                .thenReturn(Optional.of(inProgress))
                .thenReturn(Optional.of(submitted));
        when(invitationRepository.findByCandidate_IdAndAssessment_Id(candidateId, assessmentId))
                .thenReturn(Optional.empty());
        when(submissionRepository.save(any())).thenReturn(submitted);

        when(answerRepository.findQuestionIdsBySubmissionId(submissionId)).thenReturn(Set.of());
        when(assessmentQuestionRepository.findByAssessmentIdOrderByDisplayOrder(assessmentId))
                .thenReturn(List.of(aq));

        UUID answerId = UUID.randomUUID();
        CandidateAnswer savedAnswer = new CandidateAnswer();
        savedAnswer.setId(answerId);
        when(answerRepository.findBySubmissionIdAndQuestionId(submissionId, mcqQuestion.getId()))
                .thenReturn(Optional.empty());
        when(answerRepository.save(any(CandidateAnswer.class))).thenReturn(savedAnswer);
        when(answerScoreRepository.findByCandidateAnswerId(answerId)).thenReturn(Optional.empty());

        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of(savedAnswer));

        // First call creates the score
        service.submitAssessment(candidateId, assessmentId, false);
        verify(answerScoreRepository, times(1)).save(any());

        // Second call — submission is locked, short-circuits before zero-scoring
        service.submitAssessment(candidateId, assessmentId, false);
        // Still only 1 save (second call returns early because isLocked)
        verify(answerScoreRepository, times(1)).save(any());
    }
}
