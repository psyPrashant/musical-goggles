package com.psybergate.recruitment.candidate.dto;

import jakarta.validation.constraints.NotBlank;

public record ContactCandidateRequest(
        @NotBlank String subject,
        @NotBlank String message
) {}
