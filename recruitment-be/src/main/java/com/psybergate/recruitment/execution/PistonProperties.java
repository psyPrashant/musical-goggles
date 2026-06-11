package com.psybergate.recruitment.execution;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "piston")
public record PistonProperties(
        String baseUrl,
        String javaVersion,
        Duration connectTimeout,
        Duration readTimeout,
        long runTimeoutMs,
        long compileTimeoutMs,
        long minIntervalMs,
        long maxQueueWaitMs) {
}
