import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MonacoLoaderService } from './monaco-loader.service';
import { ThemeService } from '../../core/theme/theme.service';

@Component({
  selector: 'app-code-editor',
  template: `
    @if (loadFailed()) {
      <textarea
        class="editor-fallback"
        [style.height]="height()"
        [value]="value()"
        [readOnly]="readOnly()"
        (input)="onFallbackInput($any($event.target).value)"
        placeholder="// Write your solution here…"
        spellcheck="false"
      ></textarea>
    }
    <div #editorHost class="editor-host" [style.height]="loadFailed() ? '0' : height()"></div>
  `,
  styles: `
    :host {
      display: block;
      border: 1px solid var(--border, #2a2a35);
      border-radius: 8px;
      overflow: hidden;
    }
    .editor-host {
      width: 100%;
    }
    .editor-fallback {
      width: 100%;
      border: none;
      outline: none;
      resize: vertical;
      padding: 0.75rem;
      background: var(--surface-2, #16161d);
      color: var(--text, #e8e8ee);
      font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      box-sizing: border-box;
    }
  `,
})
export class CodeEditorComponent implements AfterViewInit, OnDestroy {
  private readonly monacoLoader = inject(MonacoLoaderService);
  private readonly themeService = inject(ThemeService);

  readonly value = input<string>('');
  readonly language = input<string>('java');
  readonly readOnly = input<boolean>(false);
  readonly height = input<string>('320px');

  readonly valueChange = output<string>();
  readonly runRequested = output<void>();

  readonly loadFailed = signal(false);

  private readonly editorHost = viewChild.required<ElementRef<HTMLDivElement>>('editorHost');

  private monaco: any = null;
  private editor: any = null;
  private suppressEmit = false;
  private destroyed = false;

  constructor() {
    // Push external value changes (e.g. question navigation) into the editor
    // without re-emitting them as edits.
    effect(() => {
      const next = this.value();
      if (this.editor && this.editor.getValue() !== next) {
        this.suppressEmit = true;
        this.editor.setValue(next);
        this.suppressEmit = false;
      }
    });
    effect(() => {
      const dark = this.themeService.isDark();
      this.monaco?.editor.setTheme(dark ? 'vs-dark' : 'vs');
    });
    effect(() => {
      this.editor?.updateOptions({ readOnly: this.readOnly() });
    });
  }

  ngAfterViewInit(): void {
    this.monacoLoader.load().then(
      (monaco) => {
        if (this.destroyed) return;
        this.monaco = monaco;
        this.createEditor(monaco);
      },
      () => this.loadFailed.set(true),
    );
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.editor?.dispose();
    this.editor = null;
  }

  onFallbackInput(text: string): void {
    this.valueChange.emit(text);
  }

  private createEditor(monaco: any): void {
    this.editor = monaco.editor.create(this.editorHost().nativeElement, {
      value: this.value(),
      language: this.language(),
      readOnly: this.readOnly(),
      theme: this.themeService.isDark() ? 'vs-dark' : 'vs',
      minimap: { enabled: false },
      automaticLayout: true,
      fontSize: 14,
      scrollBeyondLastLine: false,
      padding: { top: 8, bottom: 8 },
      tabSize: 4,
    });
    this.editor.onDidChangeModelContent(() => {
      if (!this.suppressEmit) {
        this.valueChange.emit(this.editor.getValue());
      }
    });
    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () =>
      this.runRequested.emit(),
    );
  }
}
