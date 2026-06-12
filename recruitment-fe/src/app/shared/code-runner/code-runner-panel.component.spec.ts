import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { CodeRunnerPanelComponent } from './code-runner-panel.component';
import { CodeExecutionService } from '../../core/execution/code-execution.service';
import { RunCodeResponse } from '../../core/execution/code-execution.model';

@Component({
  imports: [CodeRunnerPanelComponent],
  template: `<app-code-runner-panel [code]="code()" sessionToken="tok" />`,
})
class HostComponent {
  readonly code = signal('public class Main {}');
}

describe('CodeRunnerPanelComponent', () => {
  let runSubject: Subject<RunCodeResponse>;
  let executionService: { run: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    runSubject = new Subject<RunCodeResponse>();
    executionService = { run: vi.fn(() => runSubject.asObservable()) };
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: CodeExecutionService, useValue: executionService }],
    });
  });

  function createPanel() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const panel = fixture.debugElement.children[0].componentInstance as CodeRunnerPanelComponent;
    return { fixture, panel };
  }

  it('disables the Run button and shows spinner while running', () => {
    const { fixture, panel } = createPanel();

    panel.run();
    fixture.detectChanges();

    expect(panel.running()).toBe(true);
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.run-btn');
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain('Running');
    expect(executionService.run).toHaveBeenCalledWith('tok', {
      code: 'public class Main {}',
      stdin: '',
    });
  });

  it('renders stdout and OK status after a successful run', () => {
    const { fixture, panel } = createPanel();

    panel.run();
    runSubject.next({
      status: 'OK',
      stdout: 'hi\n',
      stderr: null,
      compileOutput: null,
      exitCode: 0,
    });
    fixture.detectChanges();

    expect(panel.running()).toBe(false);
    expect(fixture.nativeElement.querySelector('.run-status').textContent).toContain('exit code 0');
    expect(fixture.nativeElement.querySelector('.out-stdout').textContent).toBe('hi\n');
  });

  it('renders compile output for a compile error', () => {
    const { fixture, panel } = createPanel();

    panel.run();
    runSubject.next({
      status: 'COMPILE_ERROR',
      stdout: null,
      stderr: null,
      compileOutput: "Main.java:1: error: ';' expected",
      exitCode: 1,
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.run-status').textContent).toContain(
      'Compile error',
    );
    expect(fixture.nativeElement.querySelector('.out-compile').textContent).toContain(
      "';' expected",
    );
  });

  it('shows a friendly message when the engine is busy (429)', () => {
    const { fixture, panel } = createPanel();

    panel.run();
    runSubject.error({ status: 429 });
    fixture.detectChanges();

    expect(panel.running()).toBe(false);
    expect(fixture.nativeElement.querySelector('.run-error-msg').textContent).toContain('busy');
  });

  it('shows a friendly message when the service is unavailable (503)', () => {
    const { fixture, panel } = createPanel();

    panel.run();
    runSubject.error({ status: 503 });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.run-error-msg').textContent).toContain(
      'unavailable',
    );
  });

  it('does not run when code is blank', () => {
    const { fixture, panel } = createPanel();
    fixture.componentInstance.code.set('   ');
    fixture.detectChanges();

    panel.run();

    expect(executionService.run).not.toHaveBeenCalled();
  });
});
