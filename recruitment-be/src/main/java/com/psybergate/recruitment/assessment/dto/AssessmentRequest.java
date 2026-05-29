package com.psybergate.recruitment.assessment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AssessmentRequest(
        @NotBlank String title,
        String description,
        @NotNull @Positive Integer timeLimitMinutes,
        String accessPassword
) {}
