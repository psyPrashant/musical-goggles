package com.psybergate.recruitment.marking.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ScoreAnswerRequest(
        @NotNull @Min(0) Integer score,
        String feedback
) {}
