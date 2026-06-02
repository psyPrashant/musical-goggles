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
