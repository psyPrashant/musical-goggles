package com.psybergate.recruitment.take.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SaveAnswersRequest(
        @NotEmpty @Valid List<AnswerInput> answers
) {}
