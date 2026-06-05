import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AnswerScoreResponse,
  ResultSummary,
  ScoreAnswerRequest,
  SubmissionSummary,
} from './marking.model';

@Injectable({ providedIn: 'root' })
export class MarkingService {
  private readonly http = inject(HttpClient);

  listSubmissions(assessmentId: string): Observable<SubmissionSummary[]> {
    return this.http.get<SubmissionSummary[]>(`/api/assessments/${assessmentId}/submissions`);
  }

  listAllSubmissions(): Observable<SubmissionSummary[]> {
    return this.http.get<SubmissionSummary[]>('/api/submissions');
  }

  getResult(submissionId: string): Observable<ResultSummary> {
    return this.http.get<ResultSummary>(`/api/submissions/${submissionId}/result`);
  }

  scoreAnswer(
    submissionId: string,
    answerId: string,
    req: ScoreAnswerRequest,
  ): Observable<AnswerScoreResponse> {
    return this.http.put<AnswerScoreResponse>(
      `/api/submissions/${submissionId}/answers/${answerId}/score`,
      req,
    );
  }

  scoreAnswerByQuestion(
    submissionId: string,
    questionId: string,
    req: ScoreAnswerRequest,
  ): Observable<AnswerScoreResponse> {
    return this.http.put<AnswerScoreResponse>(
      `/api/submissions/${submissionId}/questions/${questionId}/score`,
      req,
    );
  }
}
