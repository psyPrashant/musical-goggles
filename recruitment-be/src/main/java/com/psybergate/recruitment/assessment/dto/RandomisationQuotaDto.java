package com.psybergate.recruitment.assessment.dto;

import com.psybergate.recruitment.domain.QuestionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record RandomisationQuotaDto(
        @NotNull QuestionType questionType,
        @Min(1) int count
) {}
