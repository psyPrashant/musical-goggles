package com.psybergate.recruitment.marking.dto;

import java.time.Instant;
import java.util.UUID;

public record AnswerScoreResponse(
        UUID answerId,
        int score,
        String feedback,
        boolean autoMarked,
        UUID markedBy,
        Instant markedAt
) {}
