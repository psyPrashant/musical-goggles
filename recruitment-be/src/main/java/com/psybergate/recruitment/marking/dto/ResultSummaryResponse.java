package com.psybergate.recruitment.marking.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ResultSummaryResponse(
        UUID submissionId,
        String candidateName,
        String assessmentTitle,
        Instant submittedAt,
        int totalScore,
        String markingStatus,
        List<ResultQuestionDto> questions
) {}
