package com.psybergate.recruitment.candidate.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyPasswordRequest(
        @NotBlank String password,
        @NotBlank String invitationToken
) {}
