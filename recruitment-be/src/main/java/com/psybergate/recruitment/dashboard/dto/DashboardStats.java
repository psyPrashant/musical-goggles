package com.psybergate.recruitment.dashboard.dto;

import java.util.List;

public record DashboardStats(
        int activeCandidates,
        int pendingReviews,
        Double averageScore,
        PipelineStats pipeline,
        List<ActivityEvent> recentActivity) {}
