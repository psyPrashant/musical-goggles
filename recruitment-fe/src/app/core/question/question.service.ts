import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question, QuestionGroup, QuestionGroupRequest, QuestionRequest } from './question.model';

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

  // ── Question Groups ───────────────────────────────────────────────────────

  listGroups(): Observable<QuestionGroup[]> {
    return this.http.get<QuestionGroup[]>('/api/question-groups');
  }

  getGroup(id: string): Observable<QuestionGroup> {
    return this.http.get<QuestionGroup>(`/api/question-groups/${id}`);
  }

  createGroup(req: QuestionGroupRequest): Observable<QuestionGroup> {
    return this.http.post<QuestionGroup>('/api/question-groups', req);
  }

  updateGroup(id: string, req: QuestionGroupRequest): Observable<QuestionGroup> {
    return this.http.put<QuestionGroup>(`/api/question-groups/${id}`, req);
  }

  deleteGroup(id: string): Observable<void> {
    return this.http.delete<void>(`/api/question-groups/${id}`);
  }

  addQuestionToGroup(groupId: string, questionId: string, displayOrder?: number): Observable<QuestionGroup> {
    return this.http.post<QuestionGroup>(`/api/question-groups/${groupId}/questions`, {
      questionId,
      displayOrder: displayOrder ?? null,
    });
  }

  removeQuestionFromGroup(groupId: string, questionId: string): Observable<void> {
    return this.http.delete<void>(`/api/question-groups/${groupId}/questions/${questionId}`);
  }
}
