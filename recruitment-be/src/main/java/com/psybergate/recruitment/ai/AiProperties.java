package com.psybergate.recruitment.ai;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ai.groq")
public record AiProperties(
        String apiKey,
        String baseUrl,
        String model,
        @DecimalMin("0.0") @DecimalMax("2.0") double temperature,
        @Min(1) @Max(300) int timeoutSeconds
) {}
