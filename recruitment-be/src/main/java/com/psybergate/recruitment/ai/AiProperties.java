package com.psybergate.recruitment.ai;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "ai.groq")
@Validated
public record AiProperties(
        @NotBlank String apiKey,
        String baseUrl,
        @NotBlank String model,
        @DecimalMin("0.0") @DecimalMax("2.0") double temperature,
        @Min(1) @Max(300) int timeoutSeconds
) {}
