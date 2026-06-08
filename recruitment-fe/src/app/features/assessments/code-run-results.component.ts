import { Component, computed, input } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { TakeTestCase, TestCaseRunResult } from '../../core/take/candidate-take.model';

@Component({
  selector: 'app-code-run-results',
  standalone: true,
  imports: [SlicePipe],
  template: `
    @if (testCases().length > 0 || running() || runError()) {
      <div class="tc-panel">

        <!-- Header — stays visible the whole time -->
        <div class="tc-panel-header">
          <span class="tc-panel-title">Test Cases</span>

          @if (running()) {
            <span class="tc-running">
              <span class="run-spinner"></span>
              Running…
            </span>
          } @else if (runError()) {
            <span class="tc-header-error">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ runError() }}
            </span>
          } @else if (hasResults()) {
            <span class="tc-summary"
                  [class.all-pass]="passCount() === runnableCount()"
                  [class.has-fail]="passCount() < runnableCount()">
              {{ passCount() }} / {{ runnableCount() }} passed
            </span>
          }
        </div>

        <!-- Test case rows — always rendered, state updates in-place -->
        @for (tc of testCases(); track tc.id; let i = $index) {
          @if (tc.runOnlyOnSubmit) {
            <div class="tc-row tc-submit-only">
              <span class="tc-icon tc-icon-submit">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </span>
              <div class="tc-body">
                <span class="tc-name">{{ tc.description ?? 'Test ' + (i + 1) }}</span>
                <span class="tc-submit-badge">Evaluated on submit</span>
              </div>
            </div>
          } @else {
            @let result = resultFor(tc.id);
            <div class="tc-row"
                 [class.tc-pass]="result !== undefined && result.passed === true"
                 [class.tc-fail]="result !== undefined && result.passed === false"
                 [class.tc-pending]="result === undefined && !running()">
              <span class="tc-icon">
                @if (result !== undefined && result.passed === true) {
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                } @else if (result !== undefined && result.passed === false) {
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                } @else {
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                }
              </span>

              <div class="tc-body">
                <span class="tc-name">{{ tc.description ?? 'Test ' + (i + 1) }}</span>
                <div class="tc-io">
                  @if (tc.stdin) {
                    <div class="tc-io-row">
                      <span class="tc-io-key">In</span>
                      <code class="tc-io-val">{{ tc.stdin }}</code>
                    </div>
                  }
                  <div class="tc-io-row">
                    <span class="tc-io-key">Expected</span>
                    <code class="tc-io-val">{{ tc.expectedOutput }}</code>
                  </div>
                  @if (result !== undefined && result.actualOutput !== null) {
                    <div class="tc-io-row">
                      <span class="tc-io-key" [class.actual-wrong]="!result.passed">Actual</span>
                      <code class="tc-io-val" [class.actual-wrong]="!result.passed">
                        {{ result.actualOutput || '(empty)' }}
                      </code>
                    </div>
                  }
                  @if (result !== undefined && !result.passed && result.stderr) {
                    <div class="tc-io-row tc-error-row">
                      <span class="tc-io-key">Error</span>
                      <code class="tc-io-val tc-error-val">{{ result.stderr | slice:0:200 }}</code>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        }

      </div>
    }
  `,
  styles: [`
    .tc-panel {
      border-top: 1px solid var(--border); overflow-y: auto; flex-shrink: 0;
      max-height: 300px;
    }

    /* Header */
    .tc-panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 8px 14px; background: var(--bg-elevated);
      border-bottom: 1px solid var(--border);
      position: sticky; top: 0; z-index: 1;
      min-height: 36px;
    }

    .tc-panel-title {
      font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.07em; color: var(--text-3);
    }

    /* Running state in header */
    .tc-running {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--text-3);
    }

    .run-spinner {
      display: inline-block;
      width: 12px; height: 12px; border-radius: 50%;
      border: 2px solid var(--border); border-top-color: var(--accent);
      animation: spin 0.7s linear infinite; flex-shrink: 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Error in header */
    .tc-header-error {
      display: inline-flex; align-items: center; gap: 5px;
      font-size: 12px; color: var(--danger);
      max-width: 60%; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;
    }
    .tc-header-error svg { flex-shrink: 0; }

    /* Pass/fail summary in header */
    .tc-summary {
      font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 999px;
    }
    .tc-summary.all-pass { background: var(--success-subtle); color: var(--success); }
    .tc-summary.has-fail { background: var(--danger-subtle); color: var(--danger); }

    /* Row base */
    .tc-row {
      display: flex; gap: 10px; align-items: flex-start;
      padding: 10px 14px; border-bottom: 1px solid var(--border);
      transition: background 200ms;
    }
    .tc-row:last-child { border-bottom: none; }

    /* State colours */
    .tc-pass { background: rgba(16,185,129,0.05); }
    .tc-fail { background: rgba(239,68,68,0.05); }
    .tc-submit-only { background: rgba(100,116,139,0.04); opacity: 0.8; }
    /* tc-pending is the default (no result yet) — no extra background */

    /* Icon circle */
    .tc-icon {
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; margin-top: 1px;
      background: var(--bg-elevated); border: 1px solid var(--border);
      transition: background 200ms, border-color 200ms, color 200ms;
    }
    .tc-pass .tc-icon {
      background: var(--success-subtle); border-color: rgba(16,185,129,.35);
      color: var(--success);
    }
    .tc-fail .tc-icon {
      background: var(--danger-subtle); border-color: rgba(239,68,68,.35);
      color: var(--danger);
    }
    .tc-icon-submit { color: var(--text-3); }

    .tc-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px; }

    .tc-name { font-size: 12.5px; font-weight: 500; color: var(--text-1); }

    .tc-submit-badge {
      font-size: 10.5px; font-weight: 600; color: var(--text-3);
      background: var(--bg-elevated); border: 1px solid var(--border);
      padding: 1px 6px; border-radius: 999px; width: fit-content;
    }

    .tc-io { display: flex; flex-direction: column; gap: 3px; }

    .tc-io-row { display: flex; gap: 6px; align-items: flex-start; }

    .tc-io-key {
      font-size: 10.5px; font-weight: 600; color: var(--text-3);
      width: 52px; flex-shrink: 0; padding-top: 2px;
      text-transform: uppercase; letter-spacing: 0.04em;
    }
    .tc-io-key.actual-wrong { color: var(--danger); }

    .tc-io-val {
      font-size: 12px; font-family: var(--font-mono); color: var(--text-1);
      background: var(--bg-card); padding: 1px 6px; border-radius: 3px;
      white-space: pre-wrap; word-break: break-all;
    }
    .tc-io-val.actual-wrong { color: var(--danger); background: var(--danger-subtle); }

    .tc-error-row { margin-top: 2px; }
    .tc-error-val { color: var(--danger); background: var(--danger-subtle); font-size: 11.5px; }
  `],
})
export class CodeRunResultsComponent {
  readonly testCases = input<TakeTestCase[]>([]);
  readonly results = input<TestCaseRunResult[]>([]);
  readonly running = input<boolean>(false);
  readonly runError = input<string | null>(null);

  readonly hasResults = computed(() => this.results().length > 0);

  readonly runnableCount = computed(() =>
    this.testCases().filter(tc => !tc.runOnlyOnSubmit).length
  );

  readonly passCount = computed(() =>
    this.results().filter(r => r.passed).length
  );

  /** Look up the run result for a given test case ID. */
  resultFor(testCaseId: string): TestCaseRunResult | undefined {
    return this.results().find(r => r.testCaseId === testCaseId);
  }
}
