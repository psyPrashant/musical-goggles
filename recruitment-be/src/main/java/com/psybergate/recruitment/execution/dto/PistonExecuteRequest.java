package com.psybergate.recruitment.execution.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record PistonExecuteRequest(
        String language,
        String version,
        List<PistonFile> files,
        String stdin,
        @JsonProperty("compile_timeout") long compileTimeout,
        @JsonProperty("run_timeout") long runTimeout) {
}
