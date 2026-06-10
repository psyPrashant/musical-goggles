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
    { questionId: 'q1', title: 'Question One', type: 'TEXT', displayOrder: 10, subQuestionCount: 0, difficulty: null },
    { questionId: 'q2', title: 'Question Two', type: 'MCQ', displayOrder: 20, subQuestionCount: 0, difficulty: 'EASY' },
  ],
  passwordProtected: false,
  createdAt: '2026-05-29T00:00:00Z',
  updatedAt: '2026-05-29T00:00:00Z',
  randomiseQuestions: false,
  randomisationQuotas: [],
};

const allQuestions = [
  { id: 'q3', type: 'TEXT', title: 'Easy Text Q', body: '', tags: [], options: null, languageHint: null, difficulty: 'EASY', createdAt: '', updatedAt: '' },
  { id: 'q4', type: 'MCQ', title: 'Hard MCQ Q', body: '', tags: [], options: [], languageHint: null, difficulty: 'HARD', createdAt: '', updatedAt: '' },
  { id: 'q5', type: 'TEXT', title: 'No Diff Q', body: '', tags: [], options: null, languageHint: null, difficulty: null, createdAt: '', updatedAt: '' },
];

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

  it('renders questions in display order with difficulty badge', () => {
    const fixture = TestBed.createComponent(AssessmentDetailComponent);
    fixture.detectChanges();

    httpMock.expectOne('/api/assessments/abc123').flush(mockAssessment);
    httpMock.expectOne('/api/questions').flush([]);
    fixture.detectChanges();

    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Question One');
    expect(rows[1].textContent).toContain('Question Two');
    // q2 has EASY difficulty — badge should render
    expect(rows[1].textContent).toContain('Easy');
  });

  it('difficulty filter hides non-matching questions in picker', () => {
    const fixture = TestBed.createComponent(AssessmentDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne('/api/assessments/abc123').flush(mockAssessment);
    httpMock.expectOne('/api/questions').flush(allQuestions);
    fixture.detectChanges();

    // Before filter: q3, q4, q5 visible (q1, q2 are already in assessment)
    expect(component.filteredAvailable().length).toBe(3);

    // Filter by EASY
    component.filterDifficulty = 'EASY';
    component.filterQuestions();
    expect(component.filteredAvailable().length).toBe(1);
    expect(component.filteredAvailable()[0].title).toBe('Easy Text Q');
  });

  it('difficulty filter All shows all available questions', () => {
    const fixture = TestBed.createComponent(AssessmentDetailComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    httpMock.expectOne('/api/assessments/abc123').flush(mockAssessment);
    httpMock.expectOne('/api/questions').flush(allQuestions);
    fixture.detectChanges();

    component.filterDifficulty = 'HARD';
    component.filterQuestions();
    expect(component.filteredAvailable().length).toBe(1);

    component.filterDifficulty = '';
    component.filterQuestions();
    expect(component.filteredAvailable().length).toBe(3);
  });

  it('difficulty badge shown on picker rows', () => {
    const fixture = TestBed.createComponent(AssessmentDetailComponent);
    fixture.detectChanges();

    httpMock.expectOne('/api/assessments/abc123').flush(mockAssessment);
    httpMock.expectOne('/api/questions').flush(allQuestions);
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.available-item');
    // q3 is Easy — badge should show
    expect(items[0].textContent).toContain('Easy');
    // q4 is Hard — badge should show
    expect(items[1].textContent).toContain('Hard');
    // q5 has no difficulty — no badge
    const badges = items[2].querySelectorAll('.diff-badge');
    expect(badges.length).toBe(0);
  });
});
