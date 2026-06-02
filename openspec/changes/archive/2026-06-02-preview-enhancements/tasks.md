## 1. Question Bank — Group Filter Chip (questions.component.ts)

- [x] 1.1 Add `{ value: 'GROUP', label: 'Group' }` to the `typeFilters` array so GROUP questions are filterable via the chip bar

## 2. Question Bank — GROUP Inline Preview (questions.component.ts)

- [x] 2.1 Add `readonly previewedId = signal<string | null>(null)` to track which GROUP card is currently expanded
- [x] 2.2 Add `togglePreview(id: string)` method: sets `previewedId` to `id` if not already open, otherwise sets it to `null`
- [x] 2.3 Add a "Preview" / "Close" toggle button inside `q-actions` — visible only when `q.type === 'GROUP'`; calls `togglePreview(q.id)` and changes label based on `previewedId() === q.id`
- [x] 2.4 Add the expansion panel inside `q-card`, below the existing footer: `@if (q.type === 'GROUP' && previewedId() === q.id)` — render preamble body and `@for` over `q.memberQuestions` with position number, type badge, and title per row
- [x] 2.5 Handle the empty-member edge case: if `q.memberQuestions` is empty or absent, render a "No sub-questions available" message inside the expansion
- [x] 2.6 Add CSS: `.group-preview` (expansion container, `max-height: 320px`, `overflow-y: auto`, border-top separator), `.group-preamble` (preamble text), `.sub-q-list` (flex column, gap), `.sub-q-row` (flex row: number + badge + title), `.sub-q-num` (small grey ordinal)

## 3. Assessments List — Preview Button (assessments.component.ts)

- [x] 3.1 Add a Preview `routerLink` button to each assessment row's `assessment-actions` section: `<a [routerLink]="['/assessments', a.id, 'preview']" class="btn btn-ghost btn-sm">Preview</a>` with an eye icon SVG

## 4. Assessment Preview — GROUP Sub-Question Rendering (assessment-preview.component.ts)

- [x] 4.1 Add `@if (q.type === 'GROUP' && q.subQuestions)` block in the question card template, after the existing CODE_SUBMISSION block: render the group body as a preamble paragraph, then `@for` over `q.subQuestions`
- [x] 4.2 Each sub-question entry: show a position number, `type-badge`, and `sub.body` text
- [x] 4.3 For MCQ sub-questions: render `sub.options` as a lettered option list (`A. option text`, `B. option text`, …) matching the existing top-level MCQ option style
- [x] 4.4 Add CSS: `.sub-questions` (container, flex column, gap, border-top), `.sub-q-card` (individual sub block, inset background), `.sub-q-header` (flex row: number + badge), `.sub-q-body` (sub-question body text), `.sub-q-option-list` (option list), `.sub-q-option-item` (option row)

## 5. Verification

- [x] 5.1 Run `npx tsc --noEmit` — zero TypeScript errors
- [x] 5.2 Run `npm test` — all existing tests pass
