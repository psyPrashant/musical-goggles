package com.psybergate.recruitment.ai.dto;

import java.util.List;

public record GroqChatRequest(String model, List<GroqMessage> messages, double temperature) {
}
