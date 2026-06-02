package com.psybergate.recruitment.flag.dto;

import com.psybergate.recruitment.domain.FlagStatus;

import java.time.Instant;
import java.util.UUID;

public record FlagAuditResponse(
        UUID id,
        String action,
        FlagStatus fromStatus,
        FlagStatus toStatus,
        UUID actorUserId,
        String actorUsername,
        Instant occurredAt
) {}
