package com.psybergate.recruitment.assessment.dto;

import com.psybergate.recruitment.domain.AssessmentStatus;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record AssessmentDetailResponse(
        UUID id,
        String title,
        String description,
        Integer timeLimitMinutes,
        AssessmentStatus status,
        List<AssessmentQuestionItemResponse> questions,
        boolean passwordProtected,
        Instant createdAt,
        Instant updatedAt
) {}
