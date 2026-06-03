import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { DashboardComponent } from './dashboard.component';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { DashboardService } from '../../core/dashboard/dashboard.service';
import { DashboardStats } from '../../core/dashboard/dashboard.model';

const mockStats: DashboardStats = {
  activeCandidates: 5,
  pendingReviews: 2,
  averageScore: 78.5,
  pipeline: { invited: 3, inProgress: 1, pendingReview: 2, completed: 4, flagged: 2 },
  recentActivity: [],
};

function createComponent(stats = mockStats) {
  const dashboardSvc = { getStats: vi.fn().mockReturnValue(of(stats)) };
  const assessmentSvc = { listAssessments: vi.fn().mockReturnValue(of([])) };

  TestBed.configureTestingModule({
    imports: [DashboardComponent],
    providers: [
      provideRouter([]),
      { provide: DashboardService, useValue: dashboardSvc },
      { provide: AssessmentService, useValue: assessmentSvc },
    ],
  });

  const fixture = TestBed.createComponent(DashboardComponent);
  return { fixture, component: fixture.componentInstance, dashboardSvc };
}

describe('DashboardComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  // ── 7.5: Flagged pipeline stage ──

  it('pipelineStages includes a Flagged stage with value from pipeline.flagged', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    const stages = component.pipelineStages();
    const flaggedStage = stages.find(s => s.label === 'Flagged');
    expect(flaggedStage).toBeDefined();
    expect(flaggedStage!.count).toBe(2);
  });

  it('pipelineStages has 5 stages including Flagged', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    expect(component.pipelineStages().length).toBe(5);
    const labels = component.pipelineStages().map(s => s.label);
    expect(labels).toContain('Flagged');
    expect(labels).toContain('Invited');
    expect(labels).toContain('Completed');
  });

  it('pipelineStages returns empty array when stats is null', () => {
    const { fixture, component } = createComponent({
      ...mockStats,
      pipeline: undefined as any,
    });
    fixture.detectChanges();

    // stats loaded but pipeline undefined — should return []
    component.stats.set(null);
    expect(component.pipelineStages()).toEqual([]);
  });

  it('renders Flagged pipeline stage in template', () => {
    const { fixture } = createComponent();
    fixture.detectChanges();

    const pipelineLabels = fixture.nativeElement.querySelectorAll('.pipeline-label');
    const labels = Array.from(pipelineLabels).map((el: any) => el.textContent.trim());
    expect(labels).toContain('Flagged');
  });
});
