## Why

Questions are currently worth 1 point each regardless of complexity, so a 5-minute MCQ and a 30-minute coding challenge carry equal weight. Staff need to assign different point values per question so that assessment scores reflect real difficulty and effort, and so that marking and result displays use the correct denominators.

## What Changes

- Add a `maxScore` (`int`, default 1, `NOT NULL`) field to the `Question` entity and the `questions` table via a Flyway migration
- Expose `maxScore` in `QuestionRequest` (create/edit, validated `@Min(1)`) and `QuestionResponse`
- Add a "Points" number input to the question creation and edit form in the frontend (all question types)
- Show the question's point value as a badge in the candidate attempt view
- Replace the count-based denominator in `SubmissionServiceImpl` with `SUM(question.maxScore)` for `maxScore` on both `ResultSummaryResponse` and `SubmissionSummaryResponse`
- Add a `sumMaxScoreGroupByAssessmentId` JPQL query to `AssessmentQuestionRepository`
- Update `mcq-auto-marking`: MCQ correct answer awards `question.maxScore` points instead of always 1

## Capabilities

### New Capabilities
- `question-point-value`: Staff can define a point value per question (any type) on the create/edit form; the value is persisted on the Question entity and defaults to 1

- `question-points-attempt-display`: During an assessment attempt, each question displays its point value so the candidate can prioritise their time

### Modified Capabilities
- `score-percentage-results-list`: The percentage denominator changes from question count to `SUM(question.maxScore)` across the assessment
- `score-fraction-result-detail`: The fraction `X/Y` denominator changes from question count to `SUM(question.maxScore)`
- `result-summary`: The `maxScore` field on `ResultSummaryResponse` now represents weighted total instead of raw question count
- `mcq-auto-marking`: A correctly answered MCQ awards `question.maxScore` points (not a fixed 1)

## Impact

- **BE entity**: `Question.java` + all subclasses (field added on base class)
- **BE migration**: new Flyway V-file — `ALTER TABLE questions ADD COLUMN max_score INT NOT NULL DEFAULT 1`
- **BE DTOs**: `QuestionRequest`, `QuestionResponse`
- **BE service**: `QuestionServiceImpl` (pass through on create/update), `SubmissionServiceImpl` (denominator recalculation), MCQ auto-marking logic
- **BE repository**: `AssessmentQuestionRepository` — new JPQL aggregate query
- **FE model**: `question.model.ts` — add `maxScore: number`
- **FE forms**: `question-form.component.ts` — Points field
- **FE attempt**: candidate attempt question component — point badge
- **Tests**: spec mocks for `QuestionResponse`, `SubmissionSummary`, `ResultSummary` need updating
