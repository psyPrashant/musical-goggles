package com.psybergate.recruitment.assessment.dto;

import com.psybergate.recruitment.domain.QuestionType;

import java.util.List;
import java.util.UUID;

public record PreviewQuestionDto(
        UUID id,
        QuestionType type,
        String body,
        List<PreviewOptionDto> options,
        String languageHint
) {}
