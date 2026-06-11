package com.psybergate.recruitment.execution.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PistonExecuteResponse(
        String language,
        String version,
        PistonStageResult compile,
        PistonStageResult run) {
}
