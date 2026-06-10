import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { AssessmentPreviewComponent } from './assessment-preview.component';
import { AssessmentPreview } from '../../core/assessment/assessment.model';

const mockPreview: AssessmentPreview = {
  id: 'abc123',
  title: 'Java Assessment',
  description: 'For senior roles',
  timeLimitMinutes: 60,
  passwordRequired: false,
  questions: [
    {
      id: 'q1',
      type: 'MCQ',
      body: 'What is polymorphism?',
      maxScore: 1,
      options: [
        { id: 'o1', text: 'Method overriding' },
        { id: 'o2', text: 'Variables' },
      ],
      languageHint: null,
    },
    {
      id: 'q2',
      type: 'TEXT',
      body: 'Describe OOP principles.',
      maxScore: 2,
      options: null,
      languageHint: null,
    },
    {
      id: 'q3',
      type: 'CODE_SUBMISSION',
      body: 'Write a binary search.',
      maxScore: 5,
      options: null,
      languageHint: 'java',
    },
  ],
  randomiseQuestions: false,
  randomisationQuotas: [],
};

describe('AssessmentPreviewComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AssessmentPreviewComponent],
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

  it('renders all three question types', () => {
    const fixture = TestBed.createComponent(AssessmentPreviewComponent);
    fixture.detectChanges();

    httpMock.expectOne('/api/assessments/abc123/preview').flush(mockPreview);
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('.question-card');
    expect(cards.length).toBe(3);
  });

  it('renders MCQ options without isCorrect', () => {
    const fixture = TestBed.createComponent(AssessmentPreviewComponent);
    fixture.detectChanges();

    httpMock.expectOne('/api/assessments/abc123/preview').flush(mockPreview);
    fixture.detectChanges();

    const optionItems = fixture.nativeElement.querySelectorAll('.option-item');
    expect(optionItems.length).toBe(2);
    // The rendered HTML should not contain "isCorrect" anywhere
    expect(fixture.nativeElement.innerHTML).not.toContain('isCorrect');
  });

  it('renders CODE_SUBMISSION with language hint badge', () => {
    const fixture = TestBed.createComponent(AssessmentPreviewComponent);
    fixture.detectChanges();

    httpMock.expectOne('/api/assessments/abc123/preview').flush(mockPreview);
    fixture.detectChanges();

    const langBadge = fixture.nativeElement.querySelector('.lang-badge');
    expect(langBadge).toBeTruthy();
    expect(langBadge.textContent.trim()).toBe('java');
  });

  it('shows question title in preview header', () => {
    const fixture = TestBed.createComponent(AssessmentPreviewComponent);
    fixture.detectChanges();

    httpMock.expectOne('/api/assessments/abc123/preview').flush(mockPreview);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.page-title').textContent.trim()).toBe('Java Assessment');
  });
});
