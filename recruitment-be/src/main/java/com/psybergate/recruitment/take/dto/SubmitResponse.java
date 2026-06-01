package com.psybergate.recruitment.take.dto;

import com.psybergate.recruitment.domain.SubmissionStatus;

import java.time.Instant;
import java.util.UUID;

public record SubmitResponse(
        UUID submissionId,
        String assessmentTitle,
        SubmissionStatus status,
        Instant submittedAt,
        int answeredCount,
        int totalQuestionCount
) {}
