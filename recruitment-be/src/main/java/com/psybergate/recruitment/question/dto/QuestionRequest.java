package com.psybergate.recruitment.question.dto;

import com.psybergate.recruitment.domain.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record QuestionRequest(
        @NotNull QuestionType type,
        @NotBlank String title,
        @NotBlank String body,
        List<String> tags,
        @Valid List<QuestionOptionRequest> options,
        String languageHint,
        List<UUID> memberQuestionIds,
        @Min(1) Integer maxScore
) {}
