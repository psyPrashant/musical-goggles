import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { CodeEditorComponent } from './code-editor.component';
import { MonacoLoaderService } from './monaco-loader.service';

@Component({
  imports: [CodeEditorComponent],
  template: `<app-code-editor [value]="value()" (valueChange)="onChange($event)" />`,
})
class HostComponent {
  readonly value = signal('initial code');
  changes: string[] = [];
  onChange(text: string): void {
    this.changes.push(text);
  }
}

function fakeMonaco() {
  const listeners: Array<() => void> = [];
  const editor = {
    value: '',
    getValue: vi.fn(() => editor.value),
    setValue: vi.fn((v: string) => {
      editor.value = v;
      listeners.forEach((l) => l());
    }),
    onDidChangeModelContent: vi.fn((cb: () => void) => listeners.push(cb)),
    addCommand: vi.fn(),
    updateOptions: vi.fn(),
    dispose: vi.fn(),
  };
  const monaco = {
    editor: {
      create: vi.fn((_el: HTMLElement, options: any) => {
        editor.value = options.value;
        return editor;
      }),
      setTheme: vi.fn(),
    },
    KeyMod: { CtrlCmd: 2048 },
    KeyCode: { Enter: 3 },
  };
  return { monaco, editor, listeners };
}

describe('CodeEditorComponent', () => {
  describe('when Monaco fails to load', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [
          {
            provide: MonacoLoaderService,
            useValue: { load: () => Promise.reject(new Error('offline')) },
          },
        ],
      });
    });

    it('renders a textarea fallback wired to valueChange', async () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('.editor-fallback');
      expect(textarea).toBeTruthy();
      expect(textarea.value).toBe('initial code');

      textarea.value = 'edited';
      textarea.dispatchEvent(new Event('input'));
      expect(fixture.componentInstance.changes).toEqual(['edited']);
    });
  });

  describe('when Monaco loads', () => {
    let fake: ReturnType<typeof fakeMonaco>;

    beforeEach(() => {
      fake = fakeMonaco();
      TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [
          { provide: MonacoLoaderService, useValue: { load: () => Promise.resolve(fake.monaco) } },
        ],
      });
    });

    it('creates the editor with the initial value and emits on edits', async () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(fake.monaco.editor.create).toHaveBeenCalled();
      expect(fake.editor.value).toBe('initial code');

      // Simulate a user edit
      fake.editor.value = 'user typed';
      fake.listeners.forEach((l) => l());
      expect(fixture.componentInstance.changes).toEqual(['user typed']);
    });

    it('pushes external value changes into the editor without re-emitting', async () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();

      fixture.componentInstance.value.set('from outside');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fake.editor.setValue).toHaveBeenCalledWith('from outside');
      expect(fixture.componentInstance.changes).toEqual([]);
    });

    it('disposes the editor on destroy', async () => {
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      await fixture.whenStable();

      fixture.destroy();
      expect(fake.editor.dispose).toHaveBeenCalled();
    });
  });
});
