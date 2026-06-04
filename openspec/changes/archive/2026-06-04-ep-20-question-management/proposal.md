## Why

The question bank has two gaps blocking effective assessment creation: a hard-coded one-code-question-per-assessment limit that is no longer needed (EP-10 imposed it as a safeguard that the team has since decided to lift), and no way to signal question difficulty — making it impossible to compose balanced assessments or filter questions by complexity.

## What Changes

- **Remove** the backend enforcement of the "at most one CODE_SUBMISSION per assessment" rule and its frontend messaging.
- **Add** a `difficulty` field (EASY / MEDIUM / HARD, optional) to all question types, stored as a column on the `questions` table.
- **Expose** the difficulty field in the question creation / edit form as a three-button selector (mirrors the type selector UX).
- **Return** difficulty in all question API responses so the question bank list and assessment builder can display it.

## Capabilities

### New Capabilities

- `question-difficulty`: Staff can tag a question with Easy, Medium, or Hard difficulty when creating or editing it. The difficulty is displayed as a badge on question cards and returned in all question API responses.

### Modified Capabilities

- `question-crud`: The constraint "an assessment may contain at most one CODE_SUBMISSION question" is lifted. Multiple code-submission questions may now be added to a single assessment.

## Impact

- **Backend**: Remove `countCodeSubmissionInAssessment` guard in `AssessmentServiceImpl.addQuestion`; add `difficulty` enum column to `questions` table via a new Flyway migration; add `difficulty` field to `Question` entity, `QuestionRequest`, `QuestionResponse`, and `QuestionServiceImpl`.
- **Frontend**: Add difficulty selector to `QuestionFormComponent`; display difficulty badge in `QuestionsComponent` question cards; remove any frontend error handling tied to the 422 code-question limit.
- **Tests**: Update/add integration tests for assessment builder (multiple code questions) and question CRUD (difficulty field).
