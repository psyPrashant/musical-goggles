## Context

The question bank (`questions.component.ts`) currently shows each question as a compact card: type badge, difficulty badge, title, first tag, and a row of action buttons. The `preview-enhancements` change (just completed, not yet archived) added:

- A GROUP-only "Preview/Close" toggle that expands the card to show the group preamble and an ordered list of sub-question **titles + type badges only** — a structural peek, not a candidate experience.
- The `previewedId` signal and `togglePreview` method are already in place.

The `Question` model already carries all data needed for full candidate rendering: `options` (MCQ), `languageHint` (CODE), and `memberQuestions` (GROUP) are populated by `GET /api/questions`. No backend changes are required.

The assessment preview page (`assessment-preview.component.ts`) already renders all question types with a full candidate-facing look — that component is the design reference for this work.

## Goals / Non-Goals

**Goals:**
- Every question type (MCQ, TEXT, CODE_SUBMISSION, GROUP) gets an inline "Preview" toggle in the question bank
- The expanded panel shows exactly what the candidate will see: body text, type-specific input area, options for MCQ, sub-question stacks for GROUP
- GROUP sub-questions are rendered with their own type-specific candidate view (recursively: MCQ sub shows options, TEXT sub shows textarea, CODE sub shows code area)
- The existing GROUP structural expansion is replaced by this unified panel

**Non-Goals:**
- Previewing non-GROUP sub-questions from a top-level card without opening the full GROUP preview
- Inline editing from the preview panel
- Assessment-level inline preview (already handled by the existing assessment preview route)

## Decisions

### 1. Unified preview panel, not type-branched toggles

One `.candidate-preview` container holds type-specific rendering blocks (`@if (q.type === 'MCQ')`, `@if (q.type === 'TEXT')`, etc.) rather than separate components or toggle mechanisms per type.

**Rationale:** All four types share the same toggle gesture (`togglePreview`) and the same `previewedId` signal already in place. A single panel container keeps the CSS footprint small. The existing GROUP-only implementation uses this exact approach.

**Alternative considered:** A separate modal/dialog component — more visual weight than needed for a quick content check; introduces focus-trap and z-index complexity.

### 2. Reuse assessment-preview visual patterns

The candidate-preview panel mirrors the card/option styles from `assessment-preview.component.ts`: radio circle + option-letter for MCQ options, monospace textarea for CODE, plain textarea for TEXT.

**Rationale:** Recruiters who use both pages get a consistent experience. Prevents a diverging "what the candidate sees" visual that would confuse QA.

### 3. GROUP sub-questions rendered fully, not structurally

Each sub-question inside a GROUP preview shows its body and its type-specific input block (MCQ options, TEXT textarea, CODE area). This replaces the previous title-only rendering.

**Rationale:** The whole point of the feature is to simulate the candidate experience — showing titles and type badges only is not that.

**Alternative considered:** Titles + type badges only (current behaviour) — rejected as insufficient; a recruiter cannot tell whether MCQ options are well-worded or whether the code prompt makes sense.

### 4. `max-height` scroll cap on the preview panel

The `.candidate-preview` container is capped at `max-height: 480px` with `overflow-y: auto`.

**Rationale:** A GROUP with 5 MCQ sub-questions each with 4 options could produce a 600px+ expansion that pushes other cards off-screen in the grid. Scroll-cap keeps the grid usable.

## Risks / Trade-offs

- **Stale data in GROUP sub-questions**: The bank loads `memberQuestions` at list time. If a sub-question is edited after load, the inline preview shows the old version. → Acceptable: recruiter can refresh the page. No polling needed.
- **MCQ options not masked**: In the bank preview, the `QuestionOption.correct` flag is available — the preview panel does NOT render a "correct" indicator, preserving the recruiter-facing neutral view. But technically correct data is in the DOM. → Not a security concern (this is a recruiter-only view behind auth).
- **Wide GROUP previews in narrow grid columns**: The grid uses `minmax(300px, 1fr)`; a large GROUP expansion fills the full column width, which is acceptable. The scroll cap on height prevents runaway vertical growth.
