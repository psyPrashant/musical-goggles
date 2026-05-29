import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AddQuestionRequest,
  Assessment,
  AssessmentDetail,
  AssessmentPreview,
  AssessmentRequest,
} from './assessment.model';

@Injectable({ providedIn: 'root' })
export class AssessmentService {
  private readonly http = inject(HttpClient);

  listAssessments(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>('/api/assessments');
  }

  getAssessment(id: string): Observable<AssessmentDetail> {
    return this.http.get<AssessmentDetail>(`/api/assessments/${id}`);
  }

  createAssessment(req: AssessmentRequest): Observable<AssessmentDetail> {
    return this.http.post<AssessmentDetail>('/api/assessments', req);
  }

  updateAssessment(id: string, req: AssessmentRequest): Observable<AssessmentDetail> {
    return this.http.put<AssessmentDetail>(`/api/assessments/${id}`, req);
  }

  deleteAssessment(id: string): Observable<void> {
    return this.http.delete<void>(`/api/assessments/${id}`);
  }

  publishAssessment(id: string): Observable<AssessmentDetail> {
    return this.http.put<AssessmentDetail>(`/api/assessments/${id}/publish`, {});
  }

  addQuestion(assessmentId: string, req: AddQuestionRequest): Observable<AssessmentDetail> {
    return this.http.post<AssessmentDetail>(`/api/assessments/${assessmentId}/questions`, req);
  }

  removeQuestion(assessmentId: string, questionId: string): Observable<void> {
    return this.http.delete<void>(`/api/assessments/${assessmentId}/questions/${questionId}`);
  }

  getPreview(assessmentId: string): Observable<AssessmentPreview> {
    return this.http.get<AssessmentPreview>(`/api/assessments/${assessmentId}/preview`);
  }
}
