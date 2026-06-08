import { Component, input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { inject } from '@angular/core';

@Component({
  selector: 'app-test-case-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="tc-section">
      <div class="tc-header">
        <span class="tc-title">Test Cases</span>
        <button type="button" class="tc-add-btn" (click)="addTestCase()">+ Add Test Case</button>
      </div>

      @for (group of formArray().controls; track $index; let i = $index) {
        <div class="tc-card" [formGroup]="asGroup(group)">
          <div class="tc-card-header">
            <span class="tc-num">Test Case {{ i + 1 }}</span>
            <div class="tc-flags">
              <label class="tc-flag-label">
                <input type="checkbox" formControlName="visible" />
                Visible to candidate
              </label>
              <label class="tc-flag-label tc-submit-only-label" [class.is-active]="asGroup(group).get('runOnlyOnSubmit')?.value">
                <input type="checkbox" formControlName="runOnlyOnSubmit" />
                Submit only
              </label>
            </div>
            <button type="button" class="tc-remove-btn" (click)="removeTestCase(i)">Remove</button>
          </div>

          @if (asGroup(group).get('runOnlyOnSubmit')?.value) {
            <div class="tc-submit-only-notice">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              This test case will not run when the candidate clicks "Test Code" — it is evaluated only on final submission.
            </div>
          }

          <div class="tc-field">
            <label class="field-label">Description (optional)</label>
            <input class="field-input" type="text" formControlName="description"
                   placeholder="e.g. Returns sum of two numbers" />
          </div>

          <div class="tc-row">
            <div class="tc-field">
              <label class="field-label">Input (stdin)</label>
              <textarea class="field-textarea" rows="3" formControlName="stdin"
                        placeholder="Input passed to stdin, or leave blank"></textarea>
            </div>
            <div class="tc-field">
              <label class="field-label">Expected Output <span class="required">*</span></label>
              <textarea class="field-textarea" rows="3" formControlName="expectedOutput"
                        placeholder="Expected stdout output"></textarea>
              @if (asGroup(group).get('expectedOutput')?.invalid && asGroup(group).get('expectedOutput')?.touched) {
                <span class="field-error">Expected output is required</span>
              }
            </div>
          </div>
        </div>
      }

      @if (formArray().length === 0) {
        <p class="tc-empty">No test cases yet. Add one to enable auto-scoring.</p>
      }
    </div>
  `,
  styles: [`
    .tc-section { margin-top: 8px; }
    .tc-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px;
    }
    .tc-title { font-size: 13px; font-weight: 600; color: var(--text-1); }
    .tc-add-btn {
      padding: 5px 12px; background: var(--accent-subtle); color: var(--accent);
      border: 1px solid var(--accent); border-radius: var(--radius-sm);
      font-size: 12px; font-weight: 600; cursor: pointer; font-family: var(--font);
    }
    .tc-add-btn:hover { background: var(--accent); color: #fff; }

    .tc-card {
      border: 1px solid var(--border); border-radius: var(--radius-sm);
      padding: 14px; margin-bottom: 10px; background: var(--bg-elevated);
    }
    .tc-card-header {
      display: flex; align-items: center; gap: 12px; margin-bottom: 12px;
    }
    .tc-num { font-size: 12px; font-weight: 700; color: var(--text-2); flex-shrink: 0; }

    .tc-flags { display: flex; align-items: center; gap: 16px; flex: 1; }

    .tc-flag-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--text-2); cursor: pointer; white-space: nowrap;
    }
    .tc-submit-only-label { color: var(--text-3); }
    .tc-submit-only-label.is-active { color: var(--warning); font-weight: 600; }

    .tc-submit-only-notice {
      display: flex; align-items: flex-start; gap: 7px;
      padding: 8px 10px; margin-bottom: 12px;
      background: var(--warning-subtle); border: 1px solid rgba(245,158,11,.25);
      border-radius: var(--radius-sm); color: var(--warning); font-size: 12px;
      line-height: 1.5;
    }
    .tc-submit-only-notice svg { flex-shrink: 0; margin-top: 1px; }

    .tc-remove-btn {
      padding: 3px 8px; background: none; border: 1px solid var(--danger);
      color: var(--danger); border-radius: var(--radius-sm);
      font-size: 11px; cursor: pointer; font-family: var(--font); flex-shrink: 0;
    }
    .tc-remove-btn:hover { background: var(--danger-subtle); }

    .tc-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .tc-field { display: flex; flex-direction: column; gap: 4px; }
    .field-label { font-size: 12px; font-weight: 600; color: var(--text-2); }
    .required { color: var(--danger); }
    .field-input, .field-textarea {
      padding: 7px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm);
      background: var(--bg-card); color: var(--text-1); font-size: 13px;
      font-family: var(--font-mono); resize: vertical;
    }
    .field-textarea { min-height: 60px; }
    .field-error { font-size: 11px; color: var(--danger); }

    .tc-empty { font-size: 13px; color: var(--text-3); text-align: center; padding: 16px 0; }
  `],
})
export class TestCaseFormComponent {
  readonly formArray = input.required<FormArray>();

  private readonly fb = inject(FormBuilder);

  addTestCase() {
    this.formArray().push(
      this.fb.group({
        description: [''],
        stdin: [''],
        expectedOutput: ['', Validators.required],
        visible: [true],
        runOnlyOnSubmit: [false],
      }),
    );
  }

  removeTestCase(index: number) {
    this.formArray().removeAt(index);
  }

  asGroup(control: unknown): FormGroup {
    return control as FormGroup;
  }
}
