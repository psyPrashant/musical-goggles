import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { AssessmentDetailComponent } from './assessment-detail.component';
import { AssessmentDetail } from '../../core/assessment/assessment.model';

const mockAssessment: AssessmentDetail = {
  id: 'abc123',
  title: 'Test Assessment',
  description: null,
  timeLimitMinutes: 60,
  status: 'DRAFT',
  questions: [
    { questionId: 'q1', title: 'Question One', type: 'TEXT', displayOrder: 10, subQuestionCount: 0 },
    { questionId: 'q2', title: 'Question Two', type: 'MCQ', displayOrder: 20, subQuestionCount: 0 },
  ],
  passwordProtected: false,
  createdAt: '2026-05-29T00:00:00Z',
  updatedAt: '2026-05-29T00:00:00Z',
};

describe('AssessmentDetailComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AssessmentDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'abc123' } } },
        },
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('renders questions in display order', () => {
    const fixture = TestBed.createComponent(AssessmentDetailComponent);
    fixture.detectChanges();

    httpMock.expectOne('/api/assessments/abc123').flush(mockAssessment);
    httpMock.expectOne('/api/questions').flush([]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Question One');
    expect(rows[1].textContent).toContain('Question Two');
  });

  it('CODE_SUBMISSION add button is disabled when limit reached', () => {
    const fixture = TestBed.createComponent(AssessmentDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const assessmentWithCode: AssessmentDetail = {
      ...mockAssessment,
      questions: [{ questionId: 'cq1', title: 'Sort it', type: 'CODE_SUBMISSION', displayOrder: 10, subQuestionCount: 0 }],
    };

    httpMock.expectOne('/api/assessments/abc123').flush(assessmentWithCode);
    httpMock.expectOne('/api/questions').flush([
      { id: 'cq2', type: 'CODE_SUBMISSION', title: 'Another code Q', body: '', tags: [], options: null, languageHint: null, createdAt: '', updatedAt: '' },
    ]);
    fixture.detectChanges();

    expect(component.codeSubmissionLimitReached()).toBe(true);
    const addBtn = fixture.nativeElement.querySelector('button[disabled]');
    expect(addBtn).toBeTruthy();
  });
});
