package com.psybergate.recruitment.invitation.dto;

import java.time.Instant;
import java.util.UUID;

public record InviteResponse(
        UUID invitationId,
        String invitationLink,
        String token,
        Instant expiresAt
) {}
