import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { FlaggedSubmissionsComponent } from './flagged-submissions.component';
import { FlagService } from '../../core/flag/flag.service';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { CandidateService } from '../../core/candidate/candidate.service';
import { FlagListItem } from '../../core/flag/flag.model';

const mockFlags: FlagListItem[] = [
  { flagId: 'f1', submissionId: 's1', candidateId: 'c1', candidateName: 'Alice', assessmentName: 'Test A',
    reason: 'COPIED_ANSWERS', status: 'FLAGGED', createdAt: '2026-06-01T10:00:00Z',
    candidateBlacklisted: false, candidateActionRequired: false },
  { flagId: 'f2', submissionId: 's2', candidateId: 'c2', candidateName: 'Bob', assessmentName: 'Test B',
    reason: 'TIMING_ANOMALY', status: 'RESOLVED', createdAt: '2026-06-02T10:00:00Z',
    candidateBlacklisted: false, candidateActionRequired: false },
  { flagId: 'f3', submissionId: 's3', candidateId: 'c3', candidateName: 'Carol', assessmentName: 'Test C',
    reason: 'OTHER', status: 'UNDER_REVIEW', createdAt: '2026-06-03T10:00:00Z',
    candidateBlacklisted: true, candidateActionRequired: false },
];

let flagSvc: any;
let candidateSvc: any;

function createComponent(flagSvcOverrides?: Partial<typeof flagSvc>, candidateSvcOverrides?: Partial<typeof candidateSvc>) {
  flagSvc = {
    getAllFlags: vi.fn().mockReturnValue(of(mockFlags)),
    transitionFlag: vi.fn().mockReturnValue(of({})),
    ...flagSvcOverrides,
  };
  candidateSvc = {
    contactCandidate: vi.fn().mockReturnValue(of(undefined)),
    setBlacklist: vi.fn().mockReturnValue(of(undefined)),
    ...candidateSvcOverrides,
  };

  TestBed.configureTestingModule({
    imports: [FlaggedSubmissionsComponent],
    providers: [
      provideRouter([]),
      { provide: FlagService, useValue: flagSvc },
      { provide: AssessmentService, useValue: { listAssessments: vi.fn().mockReturnValue(of([])) } },
      { provide: CandidateService, useValue: candidateSvc },
    ],
  });

  const fixture = TestBed.createComponent(FlaggedSubmissionsComponent);
  return { fixture, component: fixture.componentInstance };
}

describe('FlaggedSubmissionsComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('loads all flags on init', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    expect(flagSvc.getAllFlags).toHaveBeenCalled();
    expect(component.flags().length).toBe(3);
    // f2 is RESOLVED — filtered() only shows FLAGGED and UNDER_REVIEW
    expect(component.filtered().length).toBe(2);
  });

  it('filterReason filters by reason', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    // f3 (Carol, UNDER_REVIEW) has reason OTHER; TIMING_ANOMALY belongs to f2 which is RESOLVED and excluded
    component.filterReason.set('COPIED_ANSWERS');
    expect(component.filtered().length).toBe(1);
    expect(component.filtered()[0].candidateName).toBe('Alice');
  });

  it('clearFilters resets all filter signals', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    component.filterReason.set('COPIED_ANSWERS');
    component.filterFromDate.set('2026-06-01');
    component.clearFilters();

    expect(component.filterReason()).toBe('');
    expect(component.filterFromDate()).toBe('');
    // f2 (RESOLVED) is excluded; f1 and f3 (open) remain
    expect(component.filtered().length).toBe(2);
  });

  // ── Dropdown ──────────────────────────────────────────────────────────────

  it('toggleDropdown opens and closes the dropdown for a flag', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    component.toggleDropdown('f1');
    expect(component.openDropdownId()).toBe('f1');

    component.toggleDropdown('f1');
    expect(component.openDropdownId()).toBeNull();
  });

  it('dropdown renders Actions button for each open-flag row', () => {
    const { fixture } = createComponent();
    fixture.detectChanges();

    // f2 (RESOLVED) is excluded from filtered(), so only 2 rows rendered
    const btns = fixture.nativeElement.querySelectorAll('.btn-actions');
    expect(btns.length).toBe(2);
  });

  // ── Dismiss ───────────────────────────────────────────────────────────────

  it('dismissFlag removes the row from flags on success (UNDER_REVIEW → DISMISSED)', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    component.dismissFlag(mockFlags[2]);
    fixture.detectChanges();

    expect(flagSvc.transitionFlag).toHaveBeenCalledWith('s3', 'f3', {
      status: 'DISMISSED', resolutionNotes: 'Dismissed from flagged list',
    });
    expect(component.flags().find(f => f.flagId === 'f3')).toBeUndefined();
  });

  it('dismissFlag performs two-step transition for FLAGGED status', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    component.dismissFlag(mockFlags[0]); // f1 is FLAGGED

    expect(flagSvc.transitionFlag).toHaveBeenNthCalledWith(1, 's1', 'f1', { status: 'UNDER_REVIEW' });
    expect(flagSvc.transitionFlag).toHaveBeenNthCalledWith(2, 's1', 'f1', {
      status: 'DISMISSED', resolutionNotes: 'Dismissed from flagged list',
    });
    expect(component.flags().find(f => f.flagId === 'f1')).toBeUndefined();
  });

  it('dismissFlag sets dismissError on failure', () => {
    const { fixture, component } = createComponent({
      transitionFlag: vi.fn().mockReturnValue(throwError(() => new Error('network error'))),
    });
    fixture.detectChanges();

    component.dismissFlag(mockFlags[2]);
    fixture.detectChanges();

    expect(component.dismissError()).toEqual({ flagId: 'f3', message: 'Dismiss failed. Try again.' });
    expect(component.flags().find(f => f.flagId === 'f3')).toBeDefined();
  });

  // ── Resolve ───────────────────────────────────────────────────────────────

  it('submitResolve calls two-step transition to RESOLVED and removes row', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    component.openResolveForm(mockFlags[0]); // f1 FLAGGED
    component.updateResolveNotes('Confirmed no cheating');
    component.submitResolve(mockFlags[0]);

    expect(flagSvc.transitionFlag).toHaveBeenNthCalledWith(1, 's1', 'f1', { status: 'UNDER_REVIEW' });
    expect(flagSvc.transitionFlag).toHaveBeenNthCalledWith(2, 's1', 'f1', {
      status: 'RESOLVED', resolutionNotes: 'Confirmed no cheating',
    });
    expect(component.flags().find(f => f.flagId === 'f1')).toBeUndefined();
  });

  it('submitResolve does nothing when notes are empty', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    component.openResolveForm(mockFlags[0]);
    component.submitResolve(mockFlags[0]); // notes still empty

    expect(flagSvc.transitionFlag).not.toHaveBeenCalled();
  });

  // ── Contact ───────────────────────────────────────────────────────────────

  it('submitContact calls contactCandidate and sets actionRequired on success', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    component.openContactForm(mockFlags[0]);
    component.updateContactMessage('Please review the assessment policy.');
    component.submitContact(mockFlags[0]);

    expect(candidateSvc.contactCandidate).toHaveBeenCalledWith('c1', {
      subject: expect.any(String),
      message: 'Please review the assessment policy.',
    });
    expect(component.flags().find(f => f.flagId === 'f1')?.candidateActionRequired).toBe(true);
  });

  it('submitContact shows error on failure without setting actionRequired', () => {
    const { fixture, component } = createComponent(undefined, {
      contactCandidate: vi.fn().mockReturnValue(throwError(() => new Error('fail'))),
    });
    fixture.detectChanges();

    component.openContactForm(mockFlags[0]);
    component.updateContactMessage('Hello');
    component.submitContact(mockFlags[0]);

    const f = component.activeForm();
    expect(f?.type === 'contact' && (f as any).error).toBeTruthy();
    expect(component.flags().find(f => f.flagId === 'f1')?.candidateActionRequired).toBe(false);
  });

  // ── Blacklist ─────────────────────────────────────────────────────────────

  it('toggleBlacklist blacklists a candidate and updates flag state', () => {
    const { fixture, component } = createComponent();
    fixture.detectChanges();

    component.toggleBlacklist(mockFlags[0]); // f1 not blacklisted

    expect(candidateSvc.setBlacklist).toHaveBeenCalledWith('c1', true);
    expect(component.flags().find(f => f.flagId === 'f1')?.candidateBlacklisted).toBe(true);
  });

  it('toggleBlacklist shows admin error on 403', () => {
    const { fixture, component } = createComponent(undefined, {
      setBlacklist: vi.fn().mockReturnValue(throwError(() => ({ status: 403 }))),
    });
    fixture.detectChanges();

    component.toggleBlacklist(mockFlags[0]);

    expect(component.blacklistError()?.flagId).toBe('f1');
    expect(component.blacklistError()?.message).toContain('admins');
  });
});
