package com.psybergate.recruitment.questiongroup.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddQuestionToGroupRequest(
        @NotNull UUID questionId,
        Integer displayOrder
) {}
