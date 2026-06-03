export interface PipelineStats {
  invited: number;
  inProgress: number;
  pendingReview: number;
  completed: number;
  flagged: number;
}

export interface ActivityEvent {
  type: string;
  description: string;
  meta: string;
  occurredAt: string;
}

export interface DashboardStats {
  activeCandidates: number;
  pendingReviews: number;
  averageScore: number | null;
  pipeline: PipelineStats;
  recentActivity: ActivityEvent[];
}
