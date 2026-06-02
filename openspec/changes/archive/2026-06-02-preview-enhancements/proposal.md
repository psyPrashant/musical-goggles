## Why

GROUP questions added in EP-10 are invisible in their own detail — the question bank shows a GROUP card but gives no way to see the preamble or sub-questions without leaving the page. Separately, the assessments list has no preview shortcut, forcing recruiters to navigate into the builder just to check content. Both gaps slow the content-review workflow.

## What Changes

- **Question bank**: Add a "Group" filter chip so GROUP questions are easily filterable. Add a "Preview" toggle on GROUP question cards that expands inline to show the preamble body and ordered sub-question list — no extra API call needed since `memberQuestions` is already returned by `GET /api/questions`.
- **Assessments list**: Add a "Preview" button to each assessment row that navigates to the existing `/assessments/:id/preview` route.
- **Assessment preview page**: Add rendering support for GROUP questions — currently the preview page silently renders only the GROUP preamble with no sub-questions shown. Add a sub-question list block (including MCQ options) consistent with the existing question rendering.

## Capabilities

### New Capabilities
<!-- None — all changes are UI improvements to existing backend-backed features -->

### Modified Capabilities
- `question-crud`: The question bank view SHALL allow filtering by GROUP type and SHALL show GROUP question content (preamble + sub-questions) inline on demand
- `assessment-questions`: The assessment preview page SHALL render GROUP questions with their full sub-question list, including MCQ options; the assessments list SHALL provide a direct preview shortcut

## Impact

- **Frontend — three modified files only:**
  - `questions.component.ts` — Group filter chip, `previewedId` signal, `togglePreview()`, inline expansion template + styles
  - `assessments.component.ts` — one Preview `routerLink` added to each assessment row
  - `assessment-preview.component.ts` — GROUP sub-question rendering block + styles
- No backend changes — all required data already flows from existing endpoints
- No routing changes — `/assessments/:id/preview` already exists
