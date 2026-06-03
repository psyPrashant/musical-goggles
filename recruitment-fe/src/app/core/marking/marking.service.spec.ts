import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { MarkingService } from './marking.service';
import { ResultSummary, SubmissionSummary } from './marking.model';

const mockSummary: SubmissionSummary = {
  submissionId: 'sub-1',
  invitationId: 'inv-1',
  candidateId: 'cand-1',
  candidateName: 'Jane Doe',
  status: 'SUBMITTED',
  submittedAt: '2026-05-29T10:00:00Z',
  answeredCount: 2,
  totalAnswers: 2,
  markedCount: 1,
  totalScore: 7,
  maxScore: 2,
  flagStatus: null,
};

const mockResult: ResultSummary = {
  submissionId: 'sub-1',
  candidateName: 'Jane Doe',
  assessmentTitle: 'Test Assessment',
  submittedAt: '2026-05-29T10:00:00Z',
  totalScore: 7,
  maxScore: 2,
  answeredCount: 2,
  markingStatus: 'FULLY_MARKED',
  questions: [],
};

describe('MarkingService', () => {
  let service: MarkingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(MarkingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listAllSubmissions sends GET /api/submissions', () => {
    service.listAllSubmissions().subscribe(list => {
      expect(list.length).toBe(1);
      expect(list[0].candidateName).toBe('Jane Doe');
    });
    const req = httpMock.expectOne('/api/submissions');
    expect(req.request.method).toBe('GET');
    req.flush([mockSummary]);
  });

  it('listSubmissions sends GET /api/assessments/{id}/submissions', () => {
    service.listSubmissions('aaa').subscribe();
    const req = httpMock.expectOne('/api/assessments/aaa/submissions');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('getResult sends GET /api/submissions/{id}/result', () => {
    service.getResult('sub-1').subscribe(r => {
      expect(r.markingStatus).toBe('FULLY_MARKED');
      expect(r.totalScore).toBe(7);
    });
    const req = httpMock.expectOne('/api/submissions/sub-1/result');
    expect(req.request.method).toBe('GET');
    req.flush(mockResult);
  });

  it('scoreAnswer sends PUT /api/submissions/{id}/answers/{aid}/score', () => {
    service.scoreAnswer('sub-1', 'ans-1', { score: 8, feedback: 'Good' }).subscribe(r => {
      expect(r.score).toBe(8);
    });
    const req = httpMock.expectOne('/api/submissions/sub-1/answers/ans-1/score');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.score).toBe(8);
    req.flush({ answerId: 'ans-1', score: 8, feedback: 'Good', autoMarked: false, markedBy: 'u1', markedAt: '2026-05-29T10:00:00Z' });
  });
});
