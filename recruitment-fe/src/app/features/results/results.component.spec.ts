import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ResultsComponent } from './results.component';
import { MarkingService } from '../../core/marking/marking.service';
import { ResultSummary, SubmissionSummary } from '../../core/marking/marking.model';
import { FlagService } from '../../core/flag/flag.service';

const mockSubmissions: SubmissionSummary[] = [
  { submissionId: 's1', candidateId: 'c1', candidateName: 'Alice Smith', status: 'SUBMITTED',
    submittedAt: '2026-05-29T10:00:00Z', answeredCount: 2, totalAnswers: 2, markedCount: 0, flagStatus: null },
  { submissionId: 's2', candidateId: 'c2', candidateName: 'Bob Jones', status: 'IN_PROGRESS',
    submittedAt: null, answeredCount: 1, totalAnswers: 3, markedCount: 0, flagStatus: 'FLAGGED' },
];

const mockResult: ResultSummary = {
  submissionId: 's1',
  candidateName: 'Alice Smith',
  assessmentTitle: 'Test Assessment',
  submittedAt: '2026-05-29T10:00:00Z',
  totalScore: 5,
  markingStatus: 'PENDING_REVIEW',
  questions: [
    { questionId: 'q1', answerId: 'a1', questionTitle: 'What is OOP?', questionType: 'TEXT',
      candidateAnswer: 'Objects and classes', score: null, feedback: null,
      autoMarked: false, markedBy: null, markedAt: null },
  ],
};

describe('ResultsComponent', () => {
  let markingSvc: any;
  let flagSvc: any;

  beforeEach(() => {
    markingSvc = {
      listAllSubmissions: vi.fn().mockReturnValue(of(mockSubmissions)),
      getResult: vi.fn().mockReturnValue(of(mockResult)),
      scoreAnswer: vi.fn().mockReturnValue(of({ answerId: 'a1', score: 8, feedback: '', autoMarked: false, markedBy: 'u1', markedAt: '2026-05-29T10:00:00Z' })),
    };
    flagSvc = {
      createFlag: vi.fn().mockReturnValue(of({ flagId: 'f1', submissionId: 's1', reason: 'COPIED_ANSWERS', status: 'FLAGGED', resolutionNotes: null, createdBy: 'u1', createdAt: '2026-06-01T10:00:00Z' })),
      transitionFlag: vi.fn().mockReturnValue(of({})),
      getAuditTrail: vi.fn().mockReturnValue(of([])),
    };

    TestBed.configureTestingModule({
      imports: [ResultsComponent],
      providers: [
        { provide: MarkingService, useValue: markingSvc },
        { provide: FlagService, useValue: flagSvc },
      ],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('loads all submissions on init', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    fixture.detectChanges();

    expect(markingSvc.listAllSubmissions).toHaveBeenCalled();
    expect(fixture.componentInstance.submissions().length).toBe(2);
  });

  it('clicking a submission loads its result', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.selectSubmission(mockSubmissions[0]);

    expect(markingSvc.getResult).toHaveBeenCalledWith('s1');
    expect(component.result()?.candidateName).toBe('Alice Smith');
    expect(component.result()?.markingStatus).toBe('PENDING_REVIEW');
  });

  it('filter by SUBMITTED hides IN_PROGRESS submissions', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.statusFilter.set('SUBMITTED');
    expect(component.filteredSubmissions().length).toBe(1);
    expect(component.filteredSubmissions()[0].candidateName).toBe('Alice Smith');
  });

  it('submitFlag does not call createFlag when reason is empty', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.selectedSummary.set(mockSubmissions[0]);
    component.flagReason.set('');
    component.submitFlag();

    expect(flagSvc.createFlag).not.toHaveBeenCalled();
  });

  it('submitFlag calls createFlag with selected reason', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.selectedSummary.set(mockSubmissions[0]);
    component.flagReason.set('COPIED_ANSWERS');
    component.submitFlag();

    expect(flagSvc.createFlag).toHaveBeenCalledWith('s1', { reason: 'COPIED_ANSWERS' });
  });
});
