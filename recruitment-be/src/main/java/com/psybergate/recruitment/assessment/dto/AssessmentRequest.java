package com.psybergate.recruitment.assessment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record AssessmentRequest(
        @NotBlank String title,
        String description,
        @NotNull @Positive Integer timeLimitMinutes,
        String accessPassword,
        boolean randomiseQuestions,
        List<RandomisationQuotaDto> randomisationQuotas
) {}
