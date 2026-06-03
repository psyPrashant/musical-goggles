package com.psybergate.recruitment.take.dto;

import com.psybergate.recruitment.domain.QuestionType;

import java.util.List;
import java.util.UUID;

public record TakeQuestionDto(
        UUID id,
        int displayOrder,
        QuestionType type,
        String title,
        String body,
        int maxScore,
        List<TakeOptionDto> options,
        List<TakeQuestionDto> subQuestions
) {}
