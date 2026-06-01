package com.psybergate.recruitment.take.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AssessmentTakeResponse(
        UUID assessmentId,
        String title,
        String description,
        int totalQuestionCount,
        Instant startedAt,
        Instant deadline,
        List<TakeQuestionDto> questions,
        List<TakeAnswerDto> answers
) {}
