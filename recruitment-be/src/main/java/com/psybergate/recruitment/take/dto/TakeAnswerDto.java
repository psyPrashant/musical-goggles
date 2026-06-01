package com.psybergate.recruitment.take.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record TakeAnswerDto(
        UUID questionId,
        List<UUID> selectedOptionIds,
        String textContent,
        Instant savedAt
) {}
