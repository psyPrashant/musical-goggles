import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CandidatesComponent } from './candidates.component';
import { CandidateService } from '../../core/candidate/candidate.service';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { ToastService } from '../../core/toast/toast.service';
import { FlagService } from '../../core/flag/flag.service';
import { Candidate, CandidateHistoryItem } from '../../core/candidate/candidate.model';

const mockCandidate: Candidate = {
  id: 'c-1', firstName: 'Alice', lastName: 'Smith',
  email: 'alice@example.com', createdAt: '2026-01-01T00:00:00Z',
};

const mockHistory: CandidateHistoryItem[] = [
  {
    assessmentId: 'a-1', assessmentName: 'Java Assessment',
    invitedAt: '2026-05-01T10:00:00Z', submissionId: 's-1',
    status: 'SUBMITTED', submittedAt: '2026-05-02T10:00:00Z',
    totalScore: 15, markingStatus: 'FULLY_MARKED', linkedRole: null,
  },
  {
    assessmentId: 'a-2', assessmentName: 'Python Assessment',
    invitedAt: '2026-04-01T10:00:00Z', submissionId: null,
    status: 'PENDING', submittedAt: null,
    totalScore: null, markingStatus: null, linkedRole: null,
  },
  {
    assessmentId: 'a-3', assessmentName: 'Old Assessment',
    invitedAt: '2026-03-01T10:00:00Z', submissionId: null,
    status: 'EXPIRED', submittedAt: null,
    totalScore: null, markingStatus: null, linkedRole: null,
  },
];

describe('CandidatesComponent — assessment history', () => {
  let candidateSvc: any;
  let assessmentSvc: any;
  let toastSvc: any;
  let flagSvc: any;

  beforeEach(() => {
    candidateSvc = {
      listCandidates: vi.fn().mockReturnValue(of([mockCandidate])),
      getHistory: vi.fn().mockReturnValue(of(mockHistory)),
      createCandidate: vi.fn(),
      sendInvitation: vi.fn(),
      updateCandidate: vi.fn(),
      getCandidateByEmail: vi.fn(),
    };
    assessmentSvc = { listAssessments: vi.fn().mockReturnValue(of([])) };
    toastSvc = { show: vi.fn() };
    flagSvc = { getCandidateFlags: vi.fn().mockReturnValue(of([])) };

    TestBed.configureTestingModule({
      imports: [CandidatesComponent],
      providers: [
        { provide: CandidateService, useValue: candidateSvc },
        { provide: AssessmentService, useValue: assessmentSvc },
        { provide: ToastService, useValue: toastSvc },
        { provide: FlagService, useValue: flagSvc },
      ],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('openAssessmentHistory loads history for the candidate', () => {
    const fixture = TestBed.createComponent(CandidatesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.openAssessmentHistory(mockCandidate);

    expect(candidateSvc.getHistory).toHaveBeenCalledWith('c-1');
    expect(component.historyItems().length).toBe(3);
    expect(component.showAssessmentHistory()).toBe(true);
  });

  it('historyFiltered — Completed filter shows only submitted entries', () => {
    const fixture = TestBed.createComponent(CandidatesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.openAssessmentHistory(mockCandidate);
    component.historyStatusFilter.set('SUBMITTED');

    const filtered = component.historyFiltered();
    expect(filtered.length).toBe(1);
    expect(filtered[0].status).toBe('SUBMITTED');
  });

  it('historyFiltered — Pending filter shows only pending entries', () => {
    const fixture = TestBed.createComponent(CandidatesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.openAssessmentHistory(mockCandidate);
    component.historyStatusFilter.set('PENDING');

    expect(component.historyFiltered().every(i => i.status === 'PENDING')).toBe(true);
  });

  it('historySortAsc — toggling sort reverses order', () => {
    const fixture = TestBed.createComponent(CandidatesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.openAssessmentHistory(mockCandidate);
    component.historySortAsc.set(false); // newest first (default)
    const descFirst = component.historyFiltered()[0].invitedAt;

    component.historySortAsc.set(true); // oldest first
    const ascFirst = component.historyFiltered()[0].invitedAt;

    expect(descFirst > ascFirst).toBe(true); // newest > oldest
  });

  it('historyFiltered — empty when filter matches nothing', () => {
    const fixture = TestBed.createComponent(CandidatesComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    // Use items with only SUBMITTED status
    component.historyItems.set([mockHistory[0]]);
    component.historyStatusFilter.set('PENDING');

    expect(component.historyFiltered().length).toBe(0);
  });
});
