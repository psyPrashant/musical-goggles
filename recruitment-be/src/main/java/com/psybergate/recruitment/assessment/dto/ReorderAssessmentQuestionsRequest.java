package com.psybergate.recruitment.assessment.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;
import java.util.UUID;

public record ReorderAssessmentQuestionsRequest(
        @NotNull @Valid List<QuestionOrderItem> questions
) {
    public record QuestionOrderItem(
            @NotNull UUID questionId,
            @NotNull @Positive int displayOrder
    ) {}
}
