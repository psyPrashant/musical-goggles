package com.psybergate.recruitment.take.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RunCodeRequest(
        @NotNull UUID questionId,
        String sourceCode,           // nullable/blank allowed — Judge0 returns a compile error
        String language              // nullable; defaults to "java" in service
) {}
