import { Component, inject, input, signal } from '@angular/core';
import { CodeExecutionService } from '../../core/execution/code-execution.service';
import { RunCodeResponse } from '../../core/execution/code-execution.model';

@Component({
  selector: 'app-code-runner-panel',
  template: `
    <div class="runner-bar">
      <button class="run-btn" (click)="run()" [disabled]="running() || !code().trim()">
        @if (running()) {
          <span class="run-spinner"></span> Running…
        } @else {
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          Run
        }
      </button>
      <button class="stdin-toggle" (click)="showStdin.set(!showStdin())">
        {{ showStdin() ? 'Hide input' : 'Program input (stdin)' }}
      </button>
      <span class="run-shortcut">Ctrl+Enter to run</span>
    </div>

    @if (showStdin()) {
      <textarea
        class="stdin-input"
        rows="3"
        [value]="stdin()"
        (input)="stdin.set($any($event.target).value)"
        placeholder="Input passed to your program's stdin…"
        spellcheck="false"
      ></textarea>
    }

    @if (errorMsg(); as msg) {
      <div class="run-output run-error-msg">{{ msg }}</div>
    } @else if (result(); as r) {
      <div class="run-output">
        <div class="run-status status-{{ r.status.toLowerCase() }}">
          @switch (r.status) {
            @case ('OK') {
              Finished — exit code {{ r.exitCode ?? 0 }}
            }
            @case ('COMPILE_ERROR') {
              Compile error
            }
            @case ('RUNTIME_ERROR') {
              Runtime error — exit code {{ r.exitCode }}
            }
            @case ('TIMED_OUT') {
              Timed out — your program took too long
            }
          }
        </div>
        @if (r.compileOutput) {
          <pre class="out-compile">{{ r.compileOutput }}</pre>
        }
        @if (r.stdout) {
          <pre class="out-stdout">{{ r.stdout }}</pre>
        }
        @if (r.stderr) {
          <pre class="out-stderr">{{ r.stderr }}</pre>
        }
        @if (!r.compileOutput && !r.stdout && !r.stderr) {
          <pre class="out-empty">(no output)</pre>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      margin-top: 8px;
    }
    .runner-bar {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .run-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border: none;
      border-radius: 6px;
      background: var(--accent, #4f7cff);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    .run-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .run-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid rgba(255, 255, 255, 0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .stdin-toggle {
      background: none;
      border: none;
      color: var(--text-2, #9a9aa5);
      font-size: 12px;
      cursor: pointer;
      text-decoration: underline;
    }
    .run-shortcut {
      margin-left: auto;
      font-size: 11px;
      color: var(--text-2, #9a9aa5);
    }
    .stdin-input {
      width: 100%;
      margin-top: 8px;
      padding: 8px;
      border: 1px solid var(--border, #2a2a35);
      border-radius: 6px;
      background: var(--surface-2, #16161d);
      color: var(--text, #e8e8ee);
      font-family: Consolas, monospace;
      font-size: 12px;
      resize: vertical;
      box-sizing: border-box;
    }
    .run-output {
      margin-top: 8px;
      border: 1px solid var(--border, #2a2a35);
      border-radius: 6px;
      overflow: hidden;
    }
    .run-status {
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-ok {
      color: #3dba6f;
    }
    .status-compile_error {
      color: #d9a23d;
    }
    .status-runtime_error,
    .status-timed_out {
      color: #e05858;
    }
    pre {
      margin: 0;
      padding: 8px 10px;
      font-family: Consolas, monospace;
      font-size: 12.5px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 240px;
      overflow: auto;
      border-top: 1px solid var(--border, #2a2a35);
    }
    .out-compile {
      color: #d9a23d;
    }
    .out-stdout {
      color: var(--text, #e8e8ee);
    }
    .out-stderr {
      color: #e05858;
    }
    .out-empty {
      color: var(--text-2, #9a9aa5);
      font-style: italic;
    }
    .run-error-msg {
      padding: 8px 10px;
      font-size: 12.5px;
      color: #d9a23d;
    }
  `,
})
export class CodeRunnerPanelComponent {
  private readonly executionService = inject(CodeExecutionService);

  readonly code = input.required<string>();
  readonly sessionToken = input.required<string>();

  readonly running = signal(false);
  readonly showStdin = signal(false);
  readonly stdin = signal('');
  readonly result = signal<RunCodeResponse | null>(null);
  readonly errorMsg = signal<string | null>(null);

  run(): void {
    if (this.running() || !this.code().trim()) return;
    this.running.set(true);
    this.errorMsg.set(null);
    this.result.set(null);

    this.executionService
      .run(this.sessionToken(), { code: this.code(), stdin: this.stdin() })
      .subscribe({
        next: (res) => {
          this.running.set(false);
          this.result.set(res);
        },
        error: (err) => {
          this.running.set(false);
          this.errorMsg.set(this.friendlyError(err?.status));
        },
      });
  }

  private friendlyError(status: number | undefined): string {
    switch (status) {
      case 429:
        return 'The execution engine is busy — wait a moment and try again.';
      case 503:
        return 'The code execution service is unavailable right now. Your code is still saved.';
      default:
        return 'Could not run your code. Your answer is still saved — try again shortly.';
    }
  }
}
