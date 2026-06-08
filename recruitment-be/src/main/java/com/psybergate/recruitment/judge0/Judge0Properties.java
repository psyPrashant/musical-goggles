package com.psybergate.recruitment.judge0;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Binding for app.judge0.* in application.yaml.
 */
@ConfigurationProperties(prefix = "app.judge0")
public record Judge0Properties(String baseUrl, String apiKey) {}
