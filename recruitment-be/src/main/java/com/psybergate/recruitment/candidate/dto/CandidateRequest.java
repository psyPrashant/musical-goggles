package com.psybergate.recruitment.candidate.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CandidateRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @Pattern(regexp = "^[+\\d\\s()\\-]{7,20}$") String cellPhone
) {}
