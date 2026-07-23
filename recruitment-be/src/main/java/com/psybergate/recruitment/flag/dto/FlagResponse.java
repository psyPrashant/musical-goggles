package com.psybergate.recruitment.flag.dto;

import com.psybergate.recruitment.domain.FlagStatus;
import com.psybergate.recruitment.flag.domain.FlagReason;

import java.time.Instant;
import java.util.UUID;

public record FlagResponse(
        UUID flagId,
        UUID submissionId,
        FlagReason reason,
        FlagStatus status,
        String resolutionNotes,
        UUID createdBy,
        Instant createdAt
) {}
