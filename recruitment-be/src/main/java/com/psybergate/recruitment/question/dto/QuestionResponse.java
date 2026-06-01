package com.psybergate.recruitment.question.dto;

import com.psybergate.recruitment.domain.QuestionType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record QuestionResponse(
        UUID id,
        QuestionType type,
        String title,
        String body,
        List<String> tags,
        List<QuestionOptionResponse> options,
        String languageHint,
        List<QuestionResponse> memberQuestions,
        Instant createdAt,
        Instant updatedAt
) {}
