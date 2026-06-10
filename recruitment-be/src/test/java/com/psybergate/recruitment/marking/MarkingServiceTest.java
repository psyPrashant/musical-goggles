package com.psybergate.recruitment.marking;

import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MarkingServiceTest {

    @Mock private CandidateAnswerRepository answerRepository;
    @Mock private AnswerScoreRepository scoreRepository;
    @Mock private QuestionRepository questionRepository;

    @InjectMocks
    private MarkingServiceImpl service;

    private UUID submissionId;

    @BeforeEach
    void setUp() {
        submissionId = UUID.randomUUID();
    }

    @Test
    void autoMarkMcq_noAnswers_doesNotInteractWithScoreRepository() {
        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of());

        service.autoMarkMcq(submissionId);

        verifyNoInteractions(scoreRepository);
    }

    @Test
    void autoMarkMcq_nonMcqQuestion_skipped() {
        UUID questionId = UUID.randomUUID();
        CandidateAnswer answer = buildAnswer(submissionId, questionId, null);

        TextQuestion textQ = new TextQuestion();
        textQ.setId(questionId);

        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of(answer));
        when(questionRepository.findAllById(any())).thenReturn(List.of(textQ));

        service.autoMarkMcq(submissionId);

        verifyNoInteractions(scoreRepository);
    }

    @Test
    void autoMarkMcq_mcqAlreadyScored_idempotent() {
        UUID questionId = UUID.randomUUID();
        UUID correctId = UUID.randomUUID();
        String selectedJson = "[\"" + correctId + "\"]";
        CandidateAnswer answer = buildAnswer(submissionId, questionId, selectedJson);

        McqQuestion mcq = buildMcq(questionId, correctId, 10);
        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of(answer));
        when(questionRepository.findAllById(any())).thenReturn(List.of(mcq));
        when(scoreRepository.findByCandidateAnswerId(answer.getId())).thenReturn(Optional.of(new AnswerScore()));

        service.autoMarkMcq(submissionId);

        verify(scoreRepository, never()).save(any());
    }

    @Test
    void autoMarkMcq_correctAnswer_savesMaxScore() {
        UUID questionId = UUID.randomUUID();
        UUID correctId = UUID.randomUUID();
        String selectedJson = "[\"" + correctId + "\"]";
        CandidateAnswer answer = buildAnswer(submissionId, questionId, selectedJson);

        McqQuestion mcq = buildMcq(questionId, correctId, 5);
        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of(answer));
        when(questionRepository.findAllById(any())).thenReturn(List.of(mcq));
        when(scoreRepository.findByCandidateAnswerId(answer.getId())).thenReturn(Optional.empty());

        service.autoMarkMcq(submissionId);

        ArgumentCaptor<AnswerScore> captor = ArgumentCaptor.forClass(AnswerScore.class);
        verify(scoreRepository).save(captor.capture());
        assertThat(captor.getValue().getScore()).isEqualTo(5);
        assertThat(captor.getValue().isAutoMarked()).isTrue();
        assertThat(captor.getValue().getCandidateAnswerId()).isEqualTo(answer.getId());
    }

    @Test
    void autoMarkMcq_incorrectAnswer_savesZeroScore() {
        UUID questionId = UUID.randomUUID();
        UUID correctId = UUID.randomUUID();
        UUID wrongId = UUID.randomUUID();
        String selectedJson = "[\"" + wrongId + "\"]";
        CandidateAnswer answer = buildAnswer(submissionId, questionId, selectedJson);

        McqQuestion mcq = buildMcq(questionId, correctId, 5);
        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of(answer));
        when(questionRepository.findAllById(any())).thenReturn(List.of(mcq));
        when(scoreRepository.findByCandidateAnswerId(answer.getId())).thenReturn(Optional.empty());

        service.autoMarkMcq(submissionId);

        ArgumentCaptor<AnswerScore> captor = ArgumentCaptor.forClass(AnswerScore.class);
        verify(scoreRepository).save(captor.capture());
        assertThat(captor.getValue().getScore()).isEqualTo(0);
    }

    @Test
    void autoMarkMcq_nullSelectedOptions_savesZeroScore() {
        UUID questionId = UUID.randomUUID();
        UUID correctId = UUID.randomUUID();
        CandidateAnswer answer = buildAnswer(submissionId, questionId, null);

        McqQuestion mcq = buildMcq(questionId, correctId, 5);
        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of(answer));
        when(questionRepository.findAllById(any())).thenReturn(List.of(mcq));
        when(scoreRepository.findByCandidateAnswerId(answer.getId())).thenReturn(Optional.empty());

        service.autoMarkMcq(submissionId);

        ArgumentCaptor<AnswerScore> captor = ArgumentCaptor.forClass(AnswerScore.class);
        verify(scoreRepository).save(captor.capture());
        assertThat(captor.getValue().getScore()).isEqualTo(0);
    }

    @Test
    void autoMarkMcq_partiallyCorrectSelection_savesZero() {
        // Selecting one correct + one wrong option should NOT equal the correct set
        UUID questionId = UUID.randomUUID();
        UUID correctId = UUID.randomUUID();
        UUID wrongId = UUID.randomUUID();
        String selectedJson = "[\"" + correctId + "\",\"" + wrongId + "\"]";
        CandidateAnswer answer = buildAnswer(submissionId, questionId, selectedJson);

        McqQuestion mcq = buildMcq(questionId, correctId, 5);
        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of(answer));
        when(questionRepository.findAllById(any())).thenReturn(List.of(mcq));
        when(scoreRepository.findByCandidateAnswerId(answer.getId())).thenReturn(Optional.empty());

        service.autoMarkMcq(submissionId);

        ArgumentCaptor<AnswerScore> captor = ArgumentCaptor.forClass(AnswerScore.class);
        verify(scoreRepository).save(captor.capture());
        assertThat(captor.getValue().getScore()).isEqualTo(0);
    }

    @Test
    void autoMarkMcq_mixOfMcqAndTextQuestions_onlyMcqGetsScored() {
        UUID mcqQuestionId = UUID.randomUUID();
        UUID textQuestionId = UUID.randomUUID();
        UUID correctId = UUID.randomUUID();

        CandidateAnswer mcqAnswer = buildAnswer(submissionId, mcqQuestionId,
                "[\"" + correctId + "\"]");
        CandidateAnswer textAnswer = buildAnswer(submissionId, textQuestionId, null);
        textAnswer.setTextContent("some text answer");

        McqQuestion mcq = buildMcq(mcqQuestionId, correctId, 3);
        TextQuestion textQ = new TextQuestion();
        textQ.setId(textQuestionId);

        when(answerRepository.findBySubmissionId(submissionId)).thenReturn(List.of(mcqAnswer, textAnswer));
        when(questionRepository.findAllById(any())).thenReturn(List.of(mcq, textQ));
        when(scoreRepository.findByCandidateAnswerId(mcqAnswer.getId())).thenReturn(Optional.empty());

        service.autoMarkMcq(submissionId);

        verify(scoreRepository, times(1)).save(any());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private CandidateAnswer buildAnswer(UUID submissionId, UUID questionId, String selectedOptionIds) {
        CandidateAnswer a = new CandidateAnswer();
        a.setId(UUID.randomUUID());
        a.setSubmissionId(submissionId);
        a.setQuestionId(questionId);
        a.setSelectedOptionIds(selectedOptionIds);
        return a;
    }

    private McqQuestion buildMcq(UUID questionId, UUID correctOptionId, int maxScore) {
        QuestionOption correct = new QuestionOption();
        correct.setId(correctOptionId);
        correct.setCorrect(true);
        correct.setOptionText("Correct option");

        QuestionOption wrong = new QuestionOption();
        wrong.setId(UUID.randomUUID());
        wrong.setCorrect(false);
        wrong.setOptionText("Wrong option");

        McqQuestion mcq = new McqQuestion();
        mcq.setId(questionId);
        mcq.setTitle("MCQ");
        mcq.setBody("Choose one");
        mcq.setMaxScore(maxScore);
        mcq.setOptions(List.of(correct, wrong));
        return mcq;
    }
}
