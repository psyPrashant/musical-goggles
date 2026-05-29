export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

export interface CandidateRequest {
  firstName: string;
  lastName: string;
  email: string;
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
