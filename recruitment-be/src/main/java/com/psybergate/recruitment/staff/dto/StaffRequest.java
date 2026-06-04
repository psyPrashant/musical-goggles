package com.psybergate.recruitment.staff.dto;

import com.psybergate.recruitment.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record StaffRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @Email @NotBlank String email,
        String password,
        @NotNull Role role
) {}
