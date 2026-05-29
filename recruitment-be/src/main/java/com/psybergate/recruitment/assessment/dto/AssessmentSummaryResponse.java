package com.psybergate.recruitment.assessment.dto;

import com.psybergate.recruitment.domain.AssessmentStatus;

import java.time.Instant;
import java.util.UUID;

public record AssessmentSummaryResponse(
        UUID id,
        String title,
        String description,
        Integer timeLimitMinutes,
        AssessmentStatus status,
        int questionCount,
        Instant createdAt,
        Instant updatedAt
) {}
