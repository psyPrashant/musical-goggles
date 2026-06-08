import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { FlagService } from './flag.service';
import { FlagListItem, FlagResponse } from './flag.model';

const mockFlag: FlagResponse = {
  flagId: 'flag-1',
  submissionId: 'sub-1',
  reason: 'COPIED_ANSWERS',
  status: 'FLAGGED',
  resolutionNotes: null,
  createdBy: 'user-1',
  createdAt: '2026-06-01T10:00:00Z',
};

const mockListItem: FlagListItem = {
  flagId: 'flag-1',
  submissionId: 'sub-1',
  candidateId: 'cand-1',
  candidateName: 'Jane Doe',
  assessmentName: 'Test Assessment',
  reason: 'COPIED_ANSWERS',
  status: 'FLAGGED',
  createdAt: '2026-06-01T10:00:00Z',
  candidateBlacklisted: false,
  candidateActionRequired: false,
};

describe('FlagService', () => {
  let service: FlagService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FlagService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('createFlag sends POST /api/submissions/{id}/flags', () => {
    service.createFlag('sub-1', { reason: 'COPIED_ANSWERS' }).subscribe(r => {
      expect(r.status).toBe('FLAGGED');
      expect(r.reason).toBe('COPIED_ANSWERS');
    });
    const req = httpMock.expectOne('/api/submissions/sub-1/flags');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.reason).toBe('COPIED_ANSWERS');
    req.flush(mockFlag);
  });

  it('transitionFlag sends PATCH /api/submissions/{id}/flags/{flagId}', () => {
    service.transitionFlag('sub-1', 'flag-1', { status: 'UNDER_REVIEW' }).subscribe(r => {
      expect(r.status).toBe('UNDER_REVIEW');
    });
    const req = httpMock.expectOne('/api/submissions/sub-1/flags/flag-1');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.status).toBe('UNDER_REVIEW');
    req.flush({ ...mockFlag, status: 'UNDER_REVIEW' });
  });

  it('getAuditTrail sends GET /api/submissions/{id}/flags/{flagId}/audit', () => {
    service.getAuditTrail('sub-1', 'flag-1').subscribe(entries => {
      expect(entries.length).toBe(1);
    });
    const req = httpMock.expectOne('/api/submissions/sub-1/flags/flag-1/audit');
    expect(req.request.method).toBe('GET');
    req.flush([{ id: 'a1', action: 'CREATED', fromStatus: null, toStatus: 'FLAGGED', actorUserId: 'u1', actorUsername: 'user1', occurredAt: '2026-06-01T10:00:00Z' }]);
  });

  it('getCandidateFlags sends GET /api/candidates/{id}/flags', () => {
    service.getCandidateFlags('cand-1').subscribe(list => {
      expect(list.length).toBe(1);
    });
    const req = httpMock.expectOne('/api/candidates/cand-1/flags');
    expect(req.request.method).toBe('GET');
    req.flush([mockListItem]);
  });

  it('getAllFlags without filters sends GET /api/flags', () => {
    service.getAllFlags().subscribe(list => {
      expect(list.length).toBe(1);
    });
    const req = httpMock.expectOne('/api/flags');
    expect(req.request.method).toBe('GET');
    req.flush([mockListItem]);
  });

  it('getAllFlags with reason filter includes query param', () => {
    service.getAllFlags({ reason: 'TIMING_ANOMALY' }).subscribe();
    const req = httpMock.expectOne(r => r.url === '/api/flags' && r.params.get('reason') === 'TIMING_ANOMALY');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('createFlag propagates HTTP errors', () => {
    let error: unknown;
    service.createFlag('sub-1', { reason: 'OTHER' }).subscribe({
      error: e => { error = e; },
    });
    const req = httpMock.expectOne('/api/submissions/sub-1/flags');
    req.flush('Conflict', { status: 409, statusText: 'Conflict' });
    expect(error).toBeTruthy();
  });
});
