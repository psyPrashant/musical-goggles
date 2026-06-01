import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question, QuestionRequest } from './question.model';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly http = inject(HttpClient);

  // ── Questions ─────────────────────────────────────────────────────────────

  listQuestions(type?: string, tag?: string): Observable<Question[]> {
    let params = new HttpParams();
    if (type) params = params.set('type', type);
    if (tag) params = params.set('tag', tag);
    return this.http.get<Question[]>('/api/questions', { params });
  }

  getQuestion(id: string): Observable<Question> {
    return this.http.get<Question>(`/api/questions/${id}`);
  }

  createQuestion(req: QuestionRequest): Observable<Question> {
    return this.http.post<Question>('/api/questions', req);
  }

  updateQuestion(id: string, req: QuestionRequest): Observable<Question> {
    return this.http.put<Question>(`/api/questions/${id}`, req);
  }

  deleteQuestion(id: string): Observable<void> {
    return this.http.delete<void>(`/api/questions/${id}`);
  }

  // ── Tags ──────────────────────────────────────────────────────────────────

  listTags(): Observable<string[]> {
    return this.http.get<string[]>('/api/tags');
  }
}
