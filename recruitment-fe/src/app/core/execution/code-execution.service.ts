import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RunCodeRequest, RunCodeResponse } from './code-execution.model';

@Injectable({ providedIn: 'root' })
export class CodeExecutionService {
  private readonly http = inject(HttpClient);

  run(sessionToken: string, req: RunCodeRequest): Observable<RunCodeResponse> {
    return this.http.post<RunCodeResponse>('/api/take/run', req, {
      headers: new HttpHeaders({ Authorization: `Bearer ${sessionToken}` }),
    });
  }
}
