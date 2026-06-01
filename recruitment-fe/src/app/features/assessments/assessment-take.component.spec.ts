import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AssessmentTakeComponent } from './assessment-take.component';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { AuthService } from '../../core/auth/auth.service';
import { CandidateTakeService } from '../../core/take/candidate-take.service';
import { AssessmentTakeResponse, SubmitResponse } from '../../core/take/candidate-take.model';

const MOCK_TOKEN = 'mock-session-token';
const NOW = Date.now();

const mockTakeResponse: AssessmentTakeResponse = {
  assessmentId: 'aaa',
  title: 'Test Assessment',
  description: null,
  totalQuestionCount: 1,
  startedAt: new Date(NOW - 5000).toISOString(),
  deadline: new Date(NOW + 3600 * 1000).toISOString(),
  questions: [
    { id: 'q1', displayOrder: 1, type: 'MCQ', title: 'Q1', body: 'What is 2+2?', options: [{ id: 'o1', optionText: '4' }] },
  ],
  answers: [
    { questionId: 'q1', selectedOptionIds: ['o1'], textContent: null, savedAt: new Date().toISOString() },
  ],
};

const mockSubmitResponse: SubmitResponse = {
  submissionId: 'sub-1',
  assessmentTitle: 'Test Assessment',
  status: 'SUBMITTED',
  submittedAt: new Date().toISOString(),
  answeredCount: 1,
  totalQuestionCount: 1,
};

function createComponent() {
  const authSvc = {
    validateCandidateToken: vi.fn().mockReturnValue(of({ token: MOCK_TOKEN })),
  };
  const assessmentSvc = {
    getPreview: vi.fn().mockReturnValue(of({
      id: 'aaa', title: 'Test', description: null, timeLimitMinutes: 60,
      passwordRequired: false, questions: [],
    })),
    verifyPassword: vi.fn().mockReturnValue(of({ valid: true })),
  };
  const takeSvc = {
    loadAssessment: vi.fn().mockReturnValue(of(mockTakeResponse)),
    saveAnswers: vi.fn().mockReturnValue(of({ answers: [] })),
    submit: vi.fn().mockReturnValue(of(mockSubmitResponse)),
  };

  TestBed.configureTestingModule({
    imports: [AssessmentTakeComponent],
    providers: [
      { provide: AuthService, useValue: authSvc },
      { provide: AssessmentService, useValue: assessmentSvc },
      { provide: CandidateTakeService, useValue: takeSvc },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: { get: () => 'aaa' },
            queryParamMap: { get: () => 'inv-token' },
          },
        },
      },
    ],
  });

  const fixture = TestBed.createComponent(AssessmentTakeComponent);
  return { fixture, component: fixture.componentInstance, takeSvc, assessmentSvc, authSvc };
}

describe('AssessmentTakeComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads assessment on init and pre-populates answers from saved state', () => {
    const { fixture, component, takeSvc } = createComponent();
    // of() emits synchronously, so detectChanges is enough
    fixture.detectChanges();

    expect(takeSvc.loadAssessment).toHaveBeenCalledWith(MOCK_TOKEN);
    expect(component.preview()).not.toBeNull();
    expect(component.preview()!.title).toBe('Test Assessment');
    // Pre-populated from saved answer
    expect(component.answers()['q1']).toBe('o1');
  });

  it('initialises timer from server deadline, not full timeLimitMinutes', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    const t = component.timeLeft();
    // deadline is ~1 hour away from NOW
    expect(t).toBeGreaterThan(3500);
    expect(t).toBeLessThanOrEqual(3601);
  });

  it('doSubmit with autoSubmitted:false calls service and sets submitted state', () => {
    const { fixture, component, takeSvc } = createComponent();
    fixture.detectChanges();

    component['doSubmit'](false);

    expect(takeSvc.submit).toHaveBeenCalledWith(MOCK_TOKEN, { autoSubmitted: false });
    expect(component.submitted()).toBe(true);
    expect(component.submitResult()?.status).toBe('SUBMITTED');
  });

  it('doSubmit with autoSubmitted:true marks as auto-submitted', () => {
    const { fixture, component, takeSvc } = createComponent();
    fixture.detectChanges();

    component['doSubmit'](true);

    expect(takeSvc.submit).toHaveBeenCalledWith(MOCK_TOKEN, { autoSubmitted: true });
    expect(component.submitted()).toBe(true);
  });
});
