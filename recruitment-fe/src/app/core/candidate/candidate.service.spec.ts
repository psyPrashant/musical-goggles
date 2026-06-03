import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CandidateService } from './candidate.service';
import { CandidateHistoryItem } from './candidate.model';
import { throwError } from 'rxjs';

const mockHistoryItem: CandidateHistoryItem = {
  invitationId: 'inv-1',
  assessmentId: 'a-1',
  assessmentName: 'Java Assessment',
  invitedAt: '2026-05-01T10:00:00Z',
  submissionId: 's-1',
  status: 'SUBMITTED',
  submittedAt: '2026-05-02T10:00:00Z',
  totalScore: 15,
  markingStatus: 'FULLY_MARKED',
  linkedRole: null,
};

describe('CandidateService — getHistory', () => {
  let service: CandidateService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CandidateService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getHistory sends GET /api/candidates/{id}/history', () => {
    service.getHistory('cand-1').subscribe(items => {
      expect(items.length).toBe(1);
      expect(items[0].assessmentName).toBe('Java Assessment');
      expect(items[0].status).toBe('SUBMITTED');
    });
    const req = httpMock.expectOne('/api/candidates/cand-1/history');
    expect(req.request.method).toBe('GET');
    req.flush([mockHistoryItem]);
  });

  it('getHistory returns empty array when no history', () => {
    service.getHistory('cand-empty').subscribe(items => {
      expect(items).toEqual([]);
    });
    const req = httpMock.expectOne('/api/candidates/cand-empty/history');
    req.flush([]);
  });

  it('getHistory propagates HTTP errors', () => {
    let error: unknown;
    service.getHistory('cand-1').subscribe({ error: e => { error = e; } });
    const req = httpMock.expectOne('/api/candidates/cand-1/history');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    expect(error).toBeTruthy();
  });
});
