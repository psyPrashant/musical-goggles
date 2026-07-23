package com.psybergate.recruitment.assessment;

import com.psybergate.recruitment.assessment.dto.AddAssessmentQuestionRequest;
import com.psybergate.recruitment.domain.*;
import com.psybergate.recruitment.question.domain.TextQuestion;
import com.psybergate.recruitment.repository.AssessmentQuestionRepository;
import com.psybergate.recruitment.repository.AssessmentRepository;
import com.psybergate.recruitment.repository.QuestionRepository;
import com.psybergate.recruitment.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssessmentServiceTest {

    @Mock private AssessmentRepository assessmentRepository;
    @Mock private AssessmentQuestionRepository assessmentQuestionRepository;
    @Mock private QuestionRepository questionRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AssessmentServiceImpl service;

    private UUID assessmentId;
    private Assessment assessment;

    @BeforeEach
    void setUp() {
        assessmentId = UUID.randomUUID();
        assessment = new Assessment();
        assessment.setId(assessmentId);
        assessment.setTitle("Test Assessment");
        assessment.setQuestions(new java.util.ArrayList<>());

        when(assessmentRepository.findById(assessmentId)).thenReturn(Optional.of(assessment));
    }

    @Test
    void addQuestion_standaloneQuestionAlreadyAGroupMemberOnThisAssessment_returns409() {
        UUID sharedQuestionId = UUID.randomUUID();
        TextQuestion sharedQuestion = new TextQuestion();
        sharedQuestion.setId(sharedQuestionId);
        sharedQuestion.setMaxScore(5);

        GroupQuestionMember member = new GroupQuestionMember();
        member.setQuestion(sharedQuestion);

        GroupQuestion existingGroup = new GroupQuestion();
        existingGroup.setId(UUID.randomUUID());
        existingGroup.setMembers(List.of(member));

        AssessmentQuestion existingGroupAq = new AssessmentQuestion();
        existingGroupAq.setQuestion(existingGroup);
        existingGroupAq.setDisplayOrder(1);

        when(questionRepository.findById(sharedQuestionId)).thenReturn(Optional.of(sharedQuestion));
        when(assessmentQuestionRepository.findByAssessmentIdAndQuestionId(assessmentId, sharedQuestionId))
                .thenReturn(Optional.empty());
        when(assessmentQuestionRepository.findByAssessmentIdOrderByDisplayOrder(assessmentId))
                .thenReturn(List.of(existingGroupAq));

        assertThatThrownBy(() -> service.addQuestion(assessmentId,
                new AddAssessmentQuestionRequest(sharedQuestionId, 2)))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void addQuestion_groupWhoseMembersAreAlreadyStandaloneOnThisAssessment_returns409() {
        UUID sharedQuestionId = UUID.randomUUID();
        TextQuestion sharedQuestion = new TextQuestion();
        sharedQuestion.setId(sharedQuestionId);
        sharedQuestion.setMaxScore(5);

        GroupQuestionMember member = new GroupQuestionMember();
        member.setQuestion(sharedQuestion);

        GroupQuestion newGroup = new GroupQuestion();
        UUID groupId = UUID.randomUUID();
        newGroup.setId(groupId);
        newGroup.setMembers(List.of(member));

        AssessmentQuestion existingStandaloneAq = new AssessmentQuestion();
        existingStandaloneAq.setQuestion(sharedQuestion);
        existingStandaloneAq.setDisplayOrder(1);

        when(questionRepository.findById(groupId)).thenReturn(Optional.of(newGroup));
        when(assessmentQuestionRepository.findByAssessmentIdAndQuestionId(assessmentId, groupId))
                .thenReturn(Optional.empty());
        when(assessmentQuestionRepository.findByAssessmentIdOrderByDisplayOrder(assessmentId))
                .thenReturn(List.of(existingStandaloneAq));

        assertThatThrownBy(() -> service.addQuestion(assessmentId,
                new AddAssessmentQuestionRequest(groupId, 2)))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        e -> assertThat(e.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));
    }

    @Test
    void addQuestion_noOverlap_succeeds() {
        UUID questionId = UUID.randomUUID();
        TextQuestion question = new TextQuestion();
        question.setId(questionId);
        question.setMaxScore(5);

        when(questionRepository.findById(questionId)).thenReturn(Optional.of(question));
        when(assessmentQuestionRepository.findByAssessmentIdAndQuestionId(assessmentId, questionId))
                .thenReturn(Optional.empty());
        when(assessmentQuestionRepository.findByAssessmentIdOrderByDisplayOrder(assessmentId))
                .thenReturn(List.of());
        lenient().when(assessmentQuestionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var result = service.addQuestion(assessmentId, new AddAssessmentQuestionRequest(questionId, 1));

        assertThat(result.created()).isTrue();
    }
}
