package com.psybergate.recruitment.questiongroup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record QuestionGroupRequest(
        @NotBlank String name,
        String description,
        @NotNull Boolean structured
) {}
