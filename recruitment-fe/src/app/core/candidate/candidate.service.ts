import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate, CandidateRequest, InviteRequest, InviteResponse } from './candidate.model';

@Injectable({ providedIn: 'root' })
export class CandidateService {
  private readonly http = inject(HttpClient);

  listCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>('/api/candidates');
  }

  getCandidate(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`/api/candidates/${id}`);
  }

  createCandidate(req: CandidateRequest): Observable<Candidate> {
    return this.http.post<Candidate>('/api/candidates', req);
  }

  sendInvitation(req: InviteRequest): Observable<InviteResponse> {
    return this.http.post<InviteResponse>('/api/invitations', req);
  }
}
