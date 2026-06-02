package com.psybergate.recruitment.flag.dto;

import com.psybergate.recruitment.domain.FlagReason;
import jakarta.validation.constraints.NotNull;

public record CreateFlagRequest(
        @NotNull FlagReason reason
) {}
