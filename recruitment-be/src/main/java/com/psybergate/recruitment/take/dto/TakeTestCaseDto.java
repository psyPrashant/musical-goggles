package com.psybergate.recruitment.take.dto;

import java.util.UUID;

public record TakeTestCaseDto(
        UUID id,
        String description,
        String stdin,
        String expectedOutput,
        boolean runOnlyOnSubmit
) {}
