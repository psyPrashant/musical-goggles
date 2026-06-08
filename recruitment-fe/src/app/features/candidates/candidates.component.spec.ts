import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CandidatesComponent } from './candidates.component';
import { CandidateService } from '../../core/candidate/candidate.service';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { ToastService } from '../../core/toast/toast.service';
import { FlagService } from '../../core/flag/flag.service';
import { Candidate, CandidateHistoryItem } from '../../core/candidate/candidate.model';

const base: Candidate = {
  id: 'c1', firstName: 'Alice', lastName: 'Smith',
  email: 'alice@example.com', cellPhone: '+27 82 111 2222', createdAt: '2026-01-01T00:00:00Z',
  blacklisted: false, actionRequired: false,
};

const noPhone: Candidate = {
  id: 'c2', firstName: 'Bob', lastName: 'Jones',
  email: 'bob@example.com', cellPhone: null, createdAt: '2026-01-02T00:00:00Z',
  blacklisted: false, actionRequired: false,
};

const mockCandidate: Candidate = {
  id: 'c-1', firstName: 'Alice', lastName: 'Smith',
  email: 'alice@example.com', createdAt: '2026-01-01T00:00:00Z',
  blacklisted: false, actionRequired: false,
};

const mockHistory: CandidateHistoryItem[] = [
  {
    invitationId: 'inv-1', assessmentId: 'a-1', assessmentName: 'Java Assessment',
    invitedAt: '2026-05-01T10:00:00Z', submissionId: 's-1',
    status: 'SUBMITTED', submittedAt: '2026-05-02T10:00:00Z',
    totalScore: 15, markingStatus: 'FULLY_MARKED', linkedRole: null,
  },
  {
    invitationId: 'inv-2', assessmentId: 'a-2', assessmentName: 'Python Assessment',
    invitedAt: '2026-04-01T10:00:00Z', submissionId: null,
    status: 'PENDING', submittedAt: null,
    totalScore: null, markingStatus: null, linkedRole: null,
  },
  {
    invitationId: 'inv-3', assessmentId: 'a-3', assessmentName: 'Old Assessment',
    invitedAt: '2026-03-01T10:00:00Z', submissionId: null,
    status: 'EXPIRED', submittedAt: null,
    totalScore: null, markingStatus: null, linkedRole: null,
  },
];

describe('CandidatesComponent — phone field', () => {
  let candidateSvc: any;
  let component: CandidatesComponent;

  beforeEach(() => {
    candidateSvc = {
      listCandidates: vi.fn().mockReturnValue(of([base, noPhone])),
      updateCandidate: vi.fn(),
      createCandidate: vi.fn(),
      sendInvitation: vi.fn(),
      getCandidateByEmail: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [CandidatesComponent],
      providers: [
        { provide: CandidateService, useValue: candidateSvc },
        { provide: AssessmentService, useValue: { listAssessments: vi.fn().mockReturnValue(of([])), publishAssessment: vi.fn() } },
        { provide: ToastService, useValue: { show: vi.fn() } },
        { provide: FlagService, useValue: { getCandidateFlags: vi.fn().mockReturnValue(of([])) } },
      ],
    });

    const fixture = TestBed.createComponent(CandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('renders phone value in table when set', () => {
    const found = component.filtered().find(c => c.id === 'c1');
    expect(found?.cellPhone).toBe('+27 82 111 2222');
  });

  it('renders null phone as dash sentinel (null value)', () => {
    const found = component.filtered().find(c => c.id === 'c2');
    expect(found?.cellPhone).toBeNull();
  });

  it('startEdit populates editPhone from candidate', () => {
    component.startEdit(base);
    expect(component.editPhone()).toBe('+27 82 111 2222');
  });

  it('startEdit sets editPhone to empty string when candidate has no phone', () => {
    component.startEdit(noPhone);
    expect(component.editPhone()).toBe('');
  });

  it('saveEdit sends cellPhone in PUT request body', () => {
    const updated = { ...base, cellPhone: '+27 83 999 0000' };
    candidateSvc.updateCandidate.mockReturnValue(of(updated));

    component.startEdit(base);
    component.editPhone.set('+27 83 999 0000');
    component.saveEdit('c1');

    expect(candidateSvc.updateCandidate).toHaveBeenCalledWith('c1', expect.objectContaining({
      cellPhone: '+27 83 999 0000',
    }));
  });

  it('saveEdit sends cellPhone: null when phone field is cleared', () => {
    const updated = { ...base, cellPhone: null };
    candidateSvc.updateCandidate.mockReturnValue(of(updated));

    component.startEdit(base);
    component.editPhone.set('');
    component.saveEdit('c1');

    expect(candidateSvc.updateCandidate).toHaveBeenCalledWith('c1', expect.objectContaining({
      cellPhone: null,
    }));
  });

  it('after successful save, candidate list reflects updated phone', () => {
    const updated = { ...base, cellPhone: '+27 71 000 1234' };
    candidateSvc.updateCandidate.mockReturnValue(of(updated));

    component.startEdit(base);
    component.editPhone.set('+27 71 000 1234');
    component.saveEdit('c1');

    const saved = component.candidates().find(c => c.id === 'c1');
    expect(saved?.cellPhone).toBe('+27 71 000 1234');
  });
});

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
