package com.psybergate.recruitment.assessment.dto;

import java.util.List;
import java.util.UUID;

public record AssessmentPreviewResponse(
        UUID id,
        String title,
        String description,
        Integer timeLimitMinutes,
        List<PreviewQuestionDto> questions
) {}
