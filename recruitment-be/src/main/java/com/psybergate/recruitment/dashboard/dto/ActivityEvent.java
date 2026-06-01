package com.psybergate.recruitment.dashboard.dto;

import java.time.Instant;

public record ActivityEvent(String type, String description, String meta, Instant occurredAt) {}
