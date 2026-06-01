package com.psybergate.recruitment.take.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record AnswerInput(
        @NotNull UUID questionId,
        List<UUID> selectedOptionIds,
        String textContent
) {}
