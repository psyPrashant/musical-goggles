package com.psybergate.recruitment.candidate.dto;

import com.psybergate.recruitment.domain.SubmissionStatus;

import java.time.Instant;
import java.util.UUID;

/**
 * One entry in a candidate's assessment history — combines invitation + submission data.
 * {@code status} is PENDING or EXPIRED when no submission exists, otherwise the submission status.
 */
public record CandidateHistoryItemResponse(
        UUID assessmentId,
        String assessmentName,
        Instant invitedAt,
        UUID submissionId,
        String status,          // PENDING | EXPIRED | SUBMITTED | AUTO_SUBMITTED | IN_PROGRESS
        Instant submittedAt,
        Integer totalScore,
        String markingStatus,   // FULLY_MARKED | PENDING_REVIEW | null
        String linkedRole       // always null until job-linking epic
) {}
