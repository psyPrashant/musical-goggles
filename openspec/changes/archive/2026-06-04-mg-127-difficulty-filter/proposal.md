## Why

Now that questions have a difficulty level, recruiters can't yet use it to narrow down questions when browsing the question bank or composing an assessment. Without filtering, finding questions of the right difficulty requires scrolling through the full list. The difficulty badge is also absent from the assessment builder's question picker and the existing-questions table, so it's impossible to judge an assessment's difficulty balance at a glance.

## What Changes

- Add a **difficulty filter** (All / Easy / Medium / Hard chip row) to the question bank page — client-side, no new API call needed.
- Add a **difficulty filter** to the "Add Question from Bank" panel inside the assessment detail (create/edit) page — also client-side.
- Display a **difficulty badge** on each available-question row in the assessment builder picker.
- Display a **difficulty badge** on each row of the existing-questions table in the assessment builder.
- Remove the now-stale `codeSubmissionLimitReached` warning from the assessment builder (the limit was lifted in MG-119).

## Capabilities

### New Capabilities

- `question-difficulty-filter`: The question bank and assessment builder picker each have a difficulty filter row (All / Easy / Medium / Hard). Selecting a difficulty hides questions that don't match. The filter composes with the existing type and search filters.

### Modified Capabilities

- `question-difficulty`: Difficulty badges are now also shown in the assessment builder — both in the picker list and in the existing-questions table.
- `question-crud`: The stale "code submission limit reached" warning is removed from the assessment builder UI following the MG-119 fix.

## Impact

- **Frontend only** — no backend changes. All filtering is client-side using already-loaded question data.
- `QuestionsComponent`: add `selectedDifficulty` signal, extend `filtered` computed, render difficulty chip row.
- `AssessmentDetailComponent`: add `filterDifficulty` field, extend `filterQuestions()`, add difficulty badge to picker rows and existing-questions table, remove `codeSubmissionLimitReached`.
- Tests: add Vitest tests for difficulty filter in both components.
