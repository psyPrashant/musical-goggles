package com.psybergate.recruitment.flag.dto;

import com.psybergate.recruitment.domain.FlagStatus;
import jakarta.validation.constraints.NotNull;

public record TransitionFlagRequest(
        @NotNull FlagStatus status,
        String resolutionNotes
) {}
