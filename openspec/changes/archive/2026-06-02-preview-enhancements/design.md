## Context

Three separate gaps in the current UI:

1. **Question bank**: GROUP filter is missing from `typeFilters`. No way to inspect a GROUP question's content from the list — the card shows title and type badge only. The `Question` model already carries `memberQuestions?: Question[]` populated by the backend, so the sub-question data is available the moment the list loads.

2. **Assessments list**: Each row has Publish / Edit / Results / Delete. No preview shortcut. The candidate-facing preview route (`/assessments/:id/preview` → `AssessmentPreviewComponent`) already exists and works — it just isn't linked from the list.

3. **Assessment preview page**: `AssessmentPreviewComponent` handles MCQ (shows options) and CODE_SUBMISSION (shows language hint) but has no `instanceof GROUP` branch. GROUP questions display their preamble body only — the sub-questions are never rendered, even though `PreviewQuestion.subQuestions` is populated by the backend (EP-10).

## Goals / Non-Goals

**Goals:**
- Recruiters can filter the question bank to show only GROUP questions
- Recruiters can expand a GROUP card in the bank to read the preamble and see the sub-question titles/types
- Recruiters can click "Preview" on any assessment row to open the candidate-facing preview
- The candidate-facing assessment preview correctly renders GROUP questions with preamble + sub-questions (including MCQ options in sub-questions)

**Non-Goals:**
- Preview for non-GROUP questions in the question bank (MCQ/TEXT/CODE cards are adequately described by their title)
- Inline assessment preview (navigating to the existing preview page is sufficient)
- Editing from the preview page

## Decisions

### 1. Inline card expansion for GROUP question preview (not a modal)

Clicking "Preview" on a GROUP card toggles an expansion panel below the existing card content. A `previewedId` signal tracks which card (if any) is expanded; a second click collapses it. Only one card is expanded at a time.

**Rationale:** The sub-question list is compact (typically 2–5 items). An inline panel keeps the recruiter in context without a modal overlay obscuring the grid. The card simply grows — no z-index or focus-trap logic required.

**Alternative considered:** Full-screen modal — more visual weight than the content warrants; harder to dismiss without a dedicated close button.

### 2. Assessment preview uses `routerLink` to the existing route (no inline modal)

The assessments list adds `<a [routerLink]="['/assessments', a.id, 'preview']">Preview</a>` to each row's action area. The existing `AssessmentPreviewComponent` already handles loading, error states, password-protected badge, and question rendering.

**Rationale:** Zero duplication — the preview page is already complete and tested. A `routerLink` is a one-line change.

### 3. GROUP sub-questions in the preview page mirror the question-card pattern

The GROUP branch in `AssessmentPreviewComponent` renders the preamble as the main `question-body`, then appends a `sub-questions` container with individual `sub-q-card` elements. Each sub-card uses the same `type-badge`, `question-body`, and (for MCQ) `option-list` patterns as the top-level question cards, ensuring visual consistency.

## Risks / Trade-offs

- **Large GROUP questions**: If a GROUP has many sub-questions the inline expansion in the question bank card can become tall. Mitigation: cap the bank expansion at `max-height: 320px` with `overflow-y: auto`.
- **Data freshness**: The bank expansion relies on `memberQuestions` data from the initial list load. If a sub-question is deleted after the list was loaded, the expanded view shows a stale title. This is acceptable — recruiters can refresh the page. No polling needed.
