package com.psybergate.recruitment.questiongroup;

import com.psybergate.recruitment.questiongroup.dto.AddQuestionToGroupRequest;
import com.psybergate.recruitment.questiongroup.dto.QuestionGroupRequest;
import com.psybergate.recruitment.questiongroup.dto.QuestionGroupResponse;

import java.util.List;
import java.util.UUID;

public interface QuestionGroupService {

    QuestionGroupResponse create(QuestionGroupRequest request);

    List<QuestionGroupResponse> findAll();

    QuestionGroupResponse findById(UUID id);

    QuestionGroupResponse update(UUID id, QuestionGroupRequest request);

    void delete(UUID id);

    QuestionGroupResponse addQuestion(UUID groupId, AddQuestionToGroupRequest request);

    void removeQuestion(UUID groupId, UUID questionId);
}
