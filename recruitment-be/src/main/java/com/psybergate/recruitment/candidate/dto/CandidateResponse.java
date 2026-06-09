package com.psybergate.recruitment.candidate.dto;

import com.psybergate.recruitment.domain.FlagStatus;

import java.time.Instant;
import java.util.UUID;

public record CandidateResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String cellPhone,
        Instant createdAt,
        boolean actionRequired,
        boolean blacklisted,
        FlagStatus activeFlagStatus
) {}
