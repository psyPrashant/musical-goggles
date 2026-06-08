package com.psybergate.recruitment.flag.dto;

import com.psybergate.recruitment.domain.FlagReason;
import com.psybergate.recruitment.domain.FlagStatus;

import java.time.Instant;
import java.util.UUID;

public record FlagListItemResponse(
        UUID flagId,
        UUID submissionId,
        UUID candidateId,
        String candidateName,
        String assessmentName,
        FlagReason reason,
        FlagStatus status,
        Instant createdAt,
        boolean candidateBlacklisted,
        boolean candidateActionRequired
) {}
