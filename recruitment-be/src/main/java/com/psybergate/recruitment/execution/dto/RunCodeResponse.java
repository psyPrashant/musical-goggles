package com.psybergate.recruitment.execution.dto;

public record RunCodeResponse(
        RunStatus status,
        String stdout,
        String stderr,
        String compileOutput,
        Integer exitCode) {
}
