package com.psybergate.recruitment.marking.dto;

import com.psybergate.recruitment.domain.QuestionType;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ResultQuestionDto(
        UUID questionId,
        UUID answerId,
        String questionTitle,
        QuestionType questionType,
        String candidateAnswer,
        Integer score,
        int maxScore,
        String feedback,
        boolean autoMarked,
        UUID markedBy,
        Instant markedAt,
        List<ResultQuestionDto> subQuestions
) {}
