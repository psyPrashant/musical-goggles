## Why

EP-10 added GROUP as a first-class question type with full backend support, but the "Add Question" form (`QuestionFormComponent`) still only shows MCQ, Text, and Code Submission as type options — there is no way for a recruiter to create a GROUP question through the UI. The type exists in the system but is unreachable from the question bank.

## What Changes

- Add "Group / Scenario" as a fourth option in the question type selector
- When GROUP is selected, show a member question picker: a search box that queries the existing question bank, a list of matching questions the recruiter can add, and an ordered list of selected sub-questions with remove support
- Validate that at least 2 member questions are selected before the form can be submitted
- Wire the GROUP submit path to include `memberQuestionIds` in the API payload
- Block GROUP questions from being edited (the backend has no update path for GROUP); show a clear informational message instead

## Capabilities

### New Capabilities
<!-- None — no new backend capability; this is purely exposing an existing backend feature in the UI -->

### Modified Capabilities
- `question-crud`: The requirement that a recruiter can create questions of four types now needs a corresponding UI requirement — the `QuestionFormComponent` SHALL support GROUP creation with a member picker

## Impact

- **Frontend — one modified file only**: `question-form.component.ts`
- No backend changes — `POST /api/questions` with `type=GROUP` already works (EP-10)
- No routing changes — the existing `/questions/new` and `/questions/:id/edit` routes already load `QuestionFormComponent`
- No new dependencies
