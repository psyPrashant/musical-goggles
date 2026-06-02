export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  cellPhone?: string | null;
  createdAt: string;
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
  plainPassword?: string | null;
}

export interface InviteResponse {
  invitationId: string;
  invitationLink: string;
  token: string;
  expiresAt: string;
}

export type HistoryStatus = 'PENDING' | 'EXPIRED' | 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED';
export type HistoryMarkingStatus = 'FULLY_MARKED' | 'PENDING_REVIEW';

export interface CandidateHistoryItem {
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
