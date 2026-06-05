import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ResultsComponent } from './results.component';
import { MarkingService } from '../../core/marking/marking.service';
import { ResultSummary, SubmissionSummary } from '../../core/marking/marking.model';
import { FlagService } from '../../core/flag/flag.service';
import { ReminderService } from '../../core/reminder/reminder.service';

const mockSubmissions: SubmissionSummary[] = [
  { submissionId: 's1', invitationId: 'inv1', candidateId: 'c1', candidateName: 'Alice Smith', assessmentId: 'a1', assessmentTitle: 'Assessment 1', status: 'SUBMITTED',
    submittedAt: '2026-05-29T10:00:00Z', answeredCount: 2, totalAnswers: 2, markedCount: 0, totalScore: 0, maxScore: 2, flagStatus: null },
  { submissionId: 's2', invitationId: 'inv2', candidateId: 'c2', candidateName: 'Bob Jones', assessmentId: 'a2', assessmentTitle: 'Assessment 2', status: 'IN_PROGRESS',
    submittedAt: null, answeredCount: 1, totalAnswers: 3, markedCount: 0, totalScore: 0, maxScore: 3, flagStatus: 'FLAGGED' },
  { submissionId: null, invitationId: 'inv3', candidateId: 'c3', candidateName: 'Carol White', assessmentId: 'a3', assessmentTitle: 'Assessment 3', status: 'NOT_STARTED',
    submittedAt: null, answeredCount: 0, totalAnswers: 0, markedCount: 0, totalScore: 0, maxScore: 0, flagStatus: null },
];

const mockResult: ResultSummary = {
  submissionId: 's1',
  candidateName: 'Alice Smith',
  assessmentTitle: 'Test Assessment',
  submittedAt: '2026-05-29T10:00:00Z',
  totalScore: 5,
  maxScore: 1,
  answeredCount: 1,
  markingStatus: 'PENDING_REVIEW',
  questions: [
    { questionId: 'q1', answerId: 'a1', questionTitle: 'What is OOP?', questionType: 'TEXT',
      candidateAnswer: 'Objects and classes', score: null, maxScore: 1, feedback: null,
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
      scoreAnswerByQuestion: vi.fn().mockReturnValue(of({ answerId: 'a-new', score: 3, feedback: '', autoMarked: false, markedBy: 'u1', markedAt: '2026-05-29T10:00:00Z' })),
    };
    flagSvc = {
      createFlag: vi.fn().mockReturnValue(of({ flagId: 'f1', submissionId: 's1', reason: 'COPIED_ANSWERS', status: 'FLAGGED', resolutionNotes: null, createdBy: 'u1', createdAt: '2026-06-01T10:00:00Z' })),
      transitionFlag: vi.fn().mockReturnValue(of({})),
      getAuditTrail: vi.fn().mockReturnValue(of([])),
    };
    const reminderSvc = {
      sendReminder: vi.fn().mockReturnValue(of({ id: 'r1', sentAt: '2026-06-02T08:00:00Z', sendType: 'MANUAL', sentBy: 'u1' })),
      getReminderHistory: vi.fn().mockReturnValue(of([])),
    };

    TestBed.configureTestingModule({
      imports: [ResultsComponent],
      providers: [
        { provide: MarkingService, useValue: markingSvc },
        { provide: FlagService, useValue: flagSvc },
        { provide: ReminderService, useValue: reminderSvc },
      ],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('loads all submissions on init', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    fixture.detectChanges();

    expect(markingSvc.listAllSubmissions).toHaveBeenCalled();
    expect(fixture.componentInstance.submissions().length).toBe(3);
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

  it('saveScore uses scoreAnswer when answerId is present', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const resultWithAnswer: ResultSummary = { ...mockResult, submissionId: 's1' };
    component.result.set(resultWithAnswer);
    component.selectedSummary.set(mockSubmissions[0]);

    const question = mockResult.questions[0]; // answerId: 'a1'
    component.editScores.set({ [question.questionId]: 8 });
    component.saveScore(question);

    expect(markingSvc.scoreAnswer).toHaveBeenCalledWith('s1', 'a1', expect.objectContaining({ score: 8 }));
    expect(markingSvc.scoreAnswerByQuestion).not.toHaveBeenCalled();
  });

  it('saveScore uses scoreAnswerByQuestion when answerId is null', () => {
    const fixture = TestBed.createComponent(ResultsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const unansweredQuestion = { ...mockResult.questions[0], answerId: null };
    const resultWithUnanswered: ResultSummary = { ...mockResult, submissionId: 's1', questions: [unansweredQuestion] };
    component.result.set(resultWithUnanswered);
    component.selectedSummary.set(mockSubmissions[0]);

    component.editScores.set({ [unansweredQuestion.questionId]: 3 });
    component.saveScore(unansweredQuestion);

    expect(markingSvc.scoreAnswerByQuestion).toHaveBeenCalledWith('s1', 'q1', expect.objectContaining({ score: 3 }));
    expect(markingSvc.scoreAnswer).not.toHaveBeenCalled();
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
