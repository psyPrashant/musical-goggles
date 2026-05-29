package com.psybergate.recruitment.invitation.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record InviteRequest(
        @NotNull UUID candidateId,
        @NotNull UUID assessmentId,
        String plainPassword
) {}
