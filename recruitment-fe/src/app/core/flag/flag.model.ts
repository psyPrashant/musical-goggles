export type FlagStatus = 'FLAGGED' | 'UNDER_REVIEW' | 'ACTION_REQUIRED' | 'RESOLVED' | 'DISMISSED';
export type FlagReason =
  | 'COPIED_ANSWERS'
  | 'TIMING_ANOMALY'
  | 'AI_GENERATED_CONTENT'
  | 'SUSPICIOUS_BEHAVIOUR'
  | 'OTHER';

export interface FlagResponse {
  flagId: string;
  submissionId: string;
  reason: FlagReason;
  status: FlagStatus;
  resolutionNotes: string | null;
  createdBy: string;
  createdAt: string;
}

export interface FlagAuditEntry {
  id: string;
  action: string;
  fromStatus: FlagStatus | null;
  toStatus: FlagStatus;
  actorUserId: string;
  actorUsername: string;
  occurredAt: string;
}

export interface FlagListItem {
  flagId: string;
  submissionId: string;
  candidateId: string;
  candidateName: string;
  assessmentName: string;
  reason: FlagReason;
  status: FlagStatus;
  createdAt: string;
  candidateBlacklisted: boolean;
  candidateActionRequired: boolean;
}

export interface CreateFlagRequest {
  reason: FlagReason;
}

export interface TransitionFlagRequest {
  status: FlagStatus;
  resolutionNotes?: string | null;
}
