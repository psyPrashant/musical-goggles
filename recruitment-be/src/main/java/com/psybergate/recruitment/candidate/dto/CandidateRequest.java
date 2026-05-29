package com.psybergate.recruitment.candidate.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CandidateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email
) {}
