package com.psybergate.recruitment.take.dto;

import java.util.UUID;

public record TestCaseRunResult(
        UUID testCaseId,
        String description,
        String stdin,
        String expectedOutput,
        String actualOutput,
        boolean passed,
        String stderr,
        int judge0StatusId,
        String judge0StatusDescription
) {}
