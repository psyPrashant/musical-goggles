import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CandidatesComponent } from './candidates.component';
import { CandidateService } from '../../core/candidate/candidate.service';
import { AssessmentService } from '../../core/assessment/assessment.service';
import { ToastService } from '../../core/toast/toast.service';
import { FlagService } from '../../core/flag/flag.service';
import { Candidate } from '../../core/candidate/candidate.model';

const base: Candidate = {
  id: 'c1', firstName: 'Alice', lastName: 'Smith',
  email: 'alice@example.com', cellPhone: '+27 82 111 2222', createdAt: '2026-01-01T00:00:00Z',
};

const noPhone: Candidate = {
  id: 'c2', firstName: 'Bob', lastName: 'Jones',
  email: 'bob@example.com', cellPhone: null, createdAt: '2026-01-02T00:00:00Z',
};

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
