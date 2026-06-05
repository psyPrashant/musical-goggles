package com.psybergate.recruitment.dashboard.dto;

import java.time.Instant;
import java.util.UUID;

public record ActivityEvent(String type, String description, String meta, Instant occurredAt, UUID submissionId) {}
