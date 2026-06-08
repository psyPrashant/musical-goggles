package com.psybergate.recruitment.question.dto;

import java.util.UUID;

public record CodeTestCaseResponse(
        UUID id,
        String description,
        String stdin,
        String expectedOutput,
        boolean visible,
        int displayOrder,
        boolean runOnlyOnSubmit
) {}
