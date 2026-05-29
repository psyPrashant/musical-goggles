package com.psybergate.recruitment.assessment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record AddAssessmentQuestionRequest(
        @NotNull UUID questionId,
        @NotNull @Positive Integer displayOrder
) {}
