package com.psybergate.recruitment.ai.dto;

import java.util.List;

public record GroqChatResponse(List<GroqChoice> choices) {
}
