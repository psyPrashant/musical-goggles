## 1. Backend — Database & Entity

- [x] 1.1 Add Flyway migration: `ALTER TABLE questions ADD COLUMN max_score INT NOT NULL DEFAULT 1`
- [x] 1.2 Add `int maxScore` field (with `@Column(name = "max_score")`) to `Question` base entity

## 2. Backend — DTOs & Service

- [x] 2.1 Add `maxScore` to `QuestionRequest` (with `@Min(1)` validation, default 1)
- [x] 2.2 Add `maxScore` to `QuestionResponse`
- [x] 2.3 Update `QuestionServiceImpl` to pass `maxScore` through on create and update

## 3. Backend — Marking & Results

- [x] 3.1 Replace `countGroupByAssessmentId` query in `AssessmentQuestionRepository` with `sumMaxScoreGroupByAssessmentId` (JPQL: `SUM(aq.question.maxScore)`)
- [x] 3.2 Update `SubmissionServiceImpl.buildSummaries()` to call `sumMaxScoreGroupByAssessmentId` instead of `countGroupByAssessmentId`
- [x] 3.3 Update `SubmissionServiceImpl.getResult()` to use `aqList.stream().mapToInt(aq -> aq.getQuestion().getMaxScore()).sum()` for `maxScore` in `ResultSummaryResponse`

## 4. Backend — MCQ Auto-Marking

- [x] 4.1 Update MCQ auto-marking logic to award `question.maxScore` points (not fixed 1) for a correct answer

## 5. Backend — Candidate Attempt Payload

- [x] 5.1 Include `maxScore` in the assessment-attempt question DTO returned to the candidate

## 6. Frontend — Model

- [x] 6.1 Add `maxScore: number` to the `Question` / `QuestionResponse` interface in `question.model.ts` (or equivalent)

## 7. Frontend — Question Authoring Form

- [x] 7.1 Add numeric "Points" input to `question-form.component.ts` (all question types), defaulting to 1
- [x] 7.2 Wire the Points field to the `maxScore` field on the form model and API request
- [x] 7.3 Display `maxScore` as a "X pt / X pts" badge on each question card in the questions list

## 8. Frontend — Candidate Attempt View

- [x] 8.1 Display per-question point badge ("X pt" / "X pts") in the candidate attempt component

## 9. Tests

- [x] 9.1 Update `QuestionRequest`/`QuestionResponse` spec mocks in frontend tests to include `maxScore`
- [x] 9.2 Verify backend compiles and tests pass (`./mvnw test`)
- [x] 9.3 Verify frontend type-checks and tests pass (`npm test`)
