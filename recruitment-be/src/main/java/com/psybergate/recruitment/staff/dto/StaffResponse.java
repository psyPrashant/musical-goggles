package com.psybergate.recruitment.staff.dto;

import java.time.Instant;
import java.util.UUID;

public record StaffResponse(
        UUID id,
        String firstName,
        String lastName,
        String email,
        String role,
        Instant createdAt
) {}
