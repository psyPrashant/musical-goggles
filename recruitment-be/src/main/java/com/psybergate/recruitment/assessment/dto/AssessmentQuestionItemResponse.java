package com.psybergate.recruitment.assessment.dto;

import com.psybergate.recruitment.domain.QuestionType;

import java.util.UUID;

public record AssessmentQuestionItemResponse(
        UUID questionId,
        String title,
        QuestionType type,
        int displayOrder
) {}
