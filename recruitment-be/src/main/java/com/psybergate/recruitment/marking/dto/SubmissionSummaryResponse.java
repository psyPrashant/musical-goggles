package com.psybergate.recruitment.marking.dto;

import com.psybergate.recruitment.domain.FlagStatus;
import com.psybergate.recruitment.domain.SubmissionStatus;

import java.time.Instant;
import java.util.UUID;

public record SubmissionSummaryResponse(
        UUID submissionId,
        UUID invitationId,
        UUID candidateId,
        String candidateName,
        SubmissionStatus status,
        Instant submittedAt,
        int answeredCount,
        int totalAnswers,
        int markedCount,
        int totalScore,
        int maxScore,
        FlagStatus flagStatus
) {}
