## 1. Extend Preview Toggle to All Question Types (questions.component.ts)

- [x] 1.1 Remove the `@if (q.type === 'GROUP')` guard around the Preview/Close button in `q-actions` so the button renders for all question types (MCQ, TEXT, CODE_SUBMISSION, GROUP)

## 2. Replace GROUP Structural Expansion with Unified Candidate Panel (questions.component.ts)

- [x] 2.1 Remove the existing `@if (q.type === 'GROUP' && previewedId() === q.id)` structural block (`.group-preview` with `.sub-q-list` / `.sub-q-row`) from the `q-card` template
- [x] 2.2 Add unified `@if (previewedId() === q.id)` expansion block below the card footer: outer container `.candidate-preview`; render `q.body` inside `.preview-body`
- [x] 2.3 Inside the panel, add `@if (q.type === 'MCQ' && q.options)`: render a `.preview-options` list where each option is a `.preview-option-row` with a `.preview-radio` circle, `.preview-letter` (`A`, `B`, …), and `.preview-option-text`
- [x] 2.4 Inside the panel, add `@if (q.type === 'TEXT')`: render a disabled `<textarea>` with placeholder "Candidate types their answer here…" inside `.preview-answer-area`
- [x] 2.5 Inside the panel, add `@if (q.type === 'CODE_SUBMISSION')`: render `.preview-code-area` with an optional `.preview-lang-badge` (when `q.languageHint` is set) and a disabled `<textarea class="preview-code-textarea">` with placeholder "Candidate submits code here…"
- [x] 2.6 Inside the panel, add `@if (q.type === 'GROUP')`: render a `.sub-q-stack` container; for each sub-question in `q.memberQuestions` (via `@for`) render a `.sub-q-item` with: a `.sub-q-header` row (`.sub-q-pos` ordinal + `type-badge`), `.sub-q-body` text, and a nested MCQ options block (`@if sub.type === 'MCQ' && sub.options`), TEXT textarea (`@if sub.type === 'TEXT'`), and CODE area (`@if sub.type === 'CODE_SUBMISSION'`) — same structure as the top-level preview blocks (2.3–2.5)
- [x] 2.7 Inside the GROUP block, handle the empty-member edge case: `@if (!q.memberQuestions || q.memberQuestions.length === 0)` — render `<span class="sub-q-empty">No sub-questions available.</span>` before the `@for`

## 3. CSS — Replace Old Classes, Add Unified Candidate-Preview Styles (questions.component.ts)

- [x] 3.1 Remove old CSS rules: `.group-preview`, `.group-preamble`, `.sub-q-list`, `.sub-q-row`, `.sub-q-num`, `.sub-q-title`, `.sub-q-empty`
- [x] 3.2 Add `.candidate-preview`: border-top `1px solid var(--border)`, padding-top `14px`, `max-height: 480px`, `overflow-y: auto`, `display: flex; flex-direction: column; gap: 12px`
- [x] 3.3 Add `.preview-body`: `font-size: 13px`, `color: var(--text-1)`, `line-height: 1.65`, `margin: 0`
- [x] 3.4 Add `.preview-options`: `display: flex; flex-direction: column; gap: 6px`; `.preview-option-row`: `display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm)`; `.preview-radio`: `width: 15px; height: 15px; border-radius: 50%; border: 2px solid var(--border); flex-shrink: 0`; `.preview-letter`: `font-size: 12px; font-weight: 600; color: var(--text-3); width: 14px`; `.preview-option-text`: `font-size: 12.5px; color: var(--text-1)`
- [x] 3.5 Add `.preview-answer-area` and `.preview-code-area`: `display: flex; flex-direction: column; gap: 6px`; `.preview-lang-badge`: `font-size: 11.5px; background: rgba(168,85,247,0.13); color: #a855f7; padding: 2px 8px; border-radius: 999px; font-weight: 500; align-self: flex-start`; shared `textarea` inside preview: `width: 100%; padding: 8px 10px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-3); font-size: 12.5px; resize: vertical; box-sizing: border-box; font-family: var(--font); line-height: 1.6`; `.preview-code-textarea`: additionally `font-family: var(--font-mono)`
- [x] 3.6 Add `.sub-q-stack`: `display: flex; flex-direction: column; gap: 10px`; `.sub-q-item`: `background: var(--bg-elevated); border-radius: var(--radius-sm); padding: 10px 12px; display: flex; flex-direction: column; gap: 8px`; `.sub-q-header`: `display: flex; align-items: center; gap: 8px`; `.sub-q-pos`: `font-size: 11px; font-weight: 600; color: var(--text-3)`; `.sub-q-body`: `font-size: 12.5px; color: var(--text-1); line-height: 1.6; margin: 0`; `.sub-q-empty`: `font-size: 12px; color: var(--text-3); font-style: italic`

## 4. Verification

- [x] 4.1 Run `npx tsc --noEmit` — zero TypeScript errors
- [x] 4.2 Run `npm test` — all existing tests pass
