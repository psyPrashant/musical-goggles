package com.psybergate.recruitment.marking.dto;

import com.psybergate.recruitment.domain.FlagStatus;
import com.psybergate.recruitment.domain.SubmissionStatus;

import java.time.Instant;
import java.util.UUID;

public record SubmissionSummaryResponse(
        UUID submissionId,
        UUID candidateId,
        String candidateName,
        SubmissionStatus status,
        Instant submittedAt,
        int answeredCount,
        int totalAnswers,
        int markedCount,
        FlagStatus flagStatus
) {}
