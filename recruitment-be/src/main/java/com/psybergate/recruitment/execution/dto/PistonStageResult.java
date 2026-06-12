package com.psybergate.recruitment.execution.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PistonStageResult(
        String stdout,
        String stderr,
        String output,
        Integer code,
        String signal) {
}
