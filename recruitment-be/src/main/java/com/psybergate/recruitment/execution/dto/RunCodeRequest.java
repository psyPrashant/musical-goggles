package com.psybergate.recruitment.execution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RunCodeRequest(
        @NotBlank @Size(max = 65_535) String code,
        @Size(max = 10_000) String stdin) {
}
