## Why

The question bank shows title, type badge, and tags for each question, but gives recruiters no way to see what a candidate will actually experience — forcing them to embed the question in an assessment and load the preview page just to check layout and content. The recently completed `preview-enhancements` change added a structural peek for GROUP cards (sub-question titles and type badges), but that is still not a candidate-facing experience.

## What Changes

- **Question bank — per-card candidate preview toggle**: Every question card (MCQ, TEXT, CODE_SUBMISSION, GROUP) gains a "Preview" toggle that expands an inline panel showing the question exactly as a candidate would see it:
  - **MCQ** — question body + lettered radio-button option list
  - **TEXT** — question body + mock textarea (disabled)
  - **CODE_SUBMISSION** — question body + language badge + mock code editor area (disabled)
  - **GROUP** — group preamble body + each sub-question rendered with its own type-specific candidate view (MCQ sub shows options, TEXT sub shows textarea, CODE sub shows code area)
- **Remove / supersede the existing GROUP structural preview**: The current GROUP expansion (which shows type badges and titles only) is replaced by the richer candidate-facing panel described above.

## Capabilities

### New Capabilities
<!-- None — all data already flows from existing endpoints; no new backend capability needed -->

### Modified Capabilities
- `question-crud`: The question bank view SHALL offer a candidate-facing inline preview for every question type (MCQ, TEXT, CODE_SUBMISSION, GROUP), replacing the current GROUP-only structural preview

## Impact

- **Frontend — one modified file**: `questions.component.ts`
  - Replace the existing GROUP structural expansion (`.group-preview`) with a unified candidate-preview panel
  - Add type-specific rendering: MCQ options list, TEXT textarea placeholder, CODE editor placeholder, GROUP sub-question stack
  - No new signals or methods needed beyond the existing `previewedId` + `togglePreview`
- No backend changes — MCQ options, `languageHint`, and `memberQuestions` are all present in `GET /api/questions` response
- No routing changes
