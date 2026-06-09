export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cellPhone?: string | null;
  createdAt: string;
  blacklisted: boolean;
  actionRequired: boolean;
  activeFlagStatus?: 'FLAGGED' | 'UNDER_REVIEW' | null;
}

export interface CandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
  cellPhone?: string | null;
}

export interface InviteRequest {
  candidateId: string;
  assessmentId: string;
}

export interface InviteResponse {
  invitationId: string;
  invitationLink: string;
  token: string;
  expiresAt: string;
}

export type HistoryStatus = 'PENDING' | 'EXPIRED' | 'CANCELLED' | 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED';
export type HistoryMarkingStatus = 'FULLY_MARKED' | 'PENDING_REVIEW';

export interface CandidateHistoryItem {
  invitationId: string;
  assessmentId: string;
  assessmentName: string;
  invitedAt: string;
  submissionId: string | null;
  status: HistoryStatus;
  submittedAt: string | null;
  totalScore: number | null;
  markingStatus: HistoryMarkingStatus | null;
  linkedRole: string | null;
}
