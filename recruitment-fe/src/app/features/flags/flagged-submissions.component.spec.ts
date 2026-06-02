import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { FlaggedSubmissionsComponent } from './flagged-submissions.component';
import { FlagService } from '../../core/flag/flag.service';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { FlagListItem } from '../../core/flag/flag.model';

const mockFlags: FlagListItem[] = [
  { flagId: 'f1', submissionId: 's1', candidateName: 'Alice', assessmentName: 'Test A',
    reason: 'COPIED_ANSWERS', status: 'FLAGGED', createdAt: '2026-06-01T10:00:00Z' },
  { flagId: 'f2', submissionId: 's2', candidateName: 'Bob', assessmentName: 'Test B',
    reason: 'TIMING_ANOMALY', status: 'RESOLVED', createdAt: '2026-06-02T10:00:00Z' },
];

describe('FlaggedSubmissionsComponent', () => {
  let flagSvc: any;
  let assessmentSvc: any;

  beforeEach(() => {
    flagSvc = {
      getAllFlags: vi.fn().mockReturnValue(of(mockFlags)),
    };
    assessmentSvc = {
      listAssessments: vi.fn().mockReturnValue(of([])),
    };

    TestBed.configureTestingModule({
      imports: [FlaggedSubmissionsComponent],
      providers: [
        { provide: FlagService, useValue: flagSvc },
        { provide: AssessmentService, useValue: assessmentSvc },
      ],
    });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('loads all flags on init', () => {
    const fixture = TestBed.createComponent(FlaggedSubmissionsComponent);
    fixture.detectChanges();

    expect(flagSvc.getAllFlags).toHaveBeenCalled();
    expect(fixture.componentInstance.flags().length).toBe(2);
    expect(fixture.componentInstance.filtered().length).toBe(2);
  });

  it('filterReason filters by reason', () => {
    const fixture = TestBed.createComponent(FlaggedSubmissionsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.filterReason.set('TIMING_ANOMALY');
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].candidateName).toBe('Bob');
  });

  it('clearFilters resets all filter signals', () => {
    const fixture = TestBed.createComponent(FlaggedSubmissionsComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.filterReason.set('COPIED_ANSWERS');
    component.filterFromDate.set('2026-06-01');
    component.clearFilters();

    expect(component.filterReason()).toBe('');
    expect(component.filterFromDate()).toBe('');
    expect(component.filtered().length).toBe(2);
  });
});
