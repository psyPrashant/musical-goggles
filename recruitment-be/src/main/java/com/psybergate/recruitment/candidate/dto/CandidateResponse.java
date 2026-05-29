package com.psybergate.recruitment.candidate.dto;

import java.time.Instant;
import java.util.UUID;

public record CandidateResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        Instant createdAt
) {}
