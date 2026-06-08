import { Component, computed, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-code-editor',
  standalone: true,
  imports: [MonacoEditorModule, FormsModule],
  template: `
    <ngx-monaco-editor
      [options]="editorOptions()"
      [ngModel]="value()"
      (ngModelChange)="valueChange.emit($event)"
      style="height: 420px; display: block; border-radius: 6px; overflow: hidden;">
    </ngx-monaco-editor>
  `,
})
export class CodeEditorComponent {
  readonly value = input<string>('');
  readonly language = input<string>('java');
  readonly readonly = input<boolean>(false);
  readonly valueChange = output<string>();

  readonly editorOptions = computed(() => ({
    language: this.language(),
    theme: 'vs-dark',
    readOnly: this.readonly(),
    minimap: { enabled: false },
    fontSize: 13,
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 4,
    wordWrap: 'on',
  }));
}
