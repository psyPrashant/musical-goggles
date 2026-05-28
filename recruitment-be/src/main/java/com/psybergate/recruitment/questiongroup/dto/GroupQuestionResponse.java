package com.psybergate.recruitment.questiongroup.dto;

import com.psybergate.recruitment.domain.QuestionType;

import java.util.UUID;

public record GroupQuestionResponse(
        UUID questionId,
        String title,
        QuestionType type,
        Integer displayOrder
) {}
