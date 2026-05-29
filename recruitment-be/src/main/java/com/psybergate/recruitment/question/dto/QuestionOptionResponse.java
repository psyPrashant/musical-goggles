package com.psybergate.recruitment.question.dto;

import java.util.UUID;

public record QuestionOptionResponse(UUID id, String text, boolean correct) {}
