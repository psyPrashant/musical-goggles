package com.psybergate.recruitment.questiongroup.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record QuestionGroupResponse(
        UUID id,
        String name,
        String description,
        boolean structured,
        List<GroupQuestionResponse> questions,
        Instant createdAt,
        Instant updatedAt
) {}
