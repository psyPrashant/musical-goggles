package com.psybergate.recruitment.marking.dto;

import com.psybergate.recruitment.domain.QuestionType;

import java.time.Instant;
import java.util.UUID;

public record ResultQuestionDto(
        UUID questionId,
        UUID answerId,
        String questionTitle,
        QuestionType questionType,
        String candidateAnswer,
        Integer score,
        String feedback,
        boolean autoMarked,
        UUID markedBy,
        Instant markedAt
) {}
