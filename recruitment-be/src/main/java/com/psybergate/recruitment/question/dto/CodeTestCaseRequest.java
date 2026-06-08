package com.psybergate.recruitment.question.dto;

import jakarta.validation.constraints.NotBlank;

public record CodeTestCaseRequest(
        String description,
        String stdin,
        @NotBlank String expectedOutput,
        boolean visible,
        int displayOrder,
        boolean runOnlyOnSubmit
) {}
