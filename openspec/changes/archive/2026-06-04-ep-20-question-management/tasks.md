## 1. MG-119 — Remove CODE_SUBMISSION limit (Backend)

- [ ] 1.1 Delete the `countCodeSubmissionInAssessment` guard block in `AssessmentServiceImpl.addQuestion` (lines 99–105)
- [ ] 1.2 Remove the `countCodeSubmissionInAssessment` method from `AssessmentQuestionRepository` (and any JPQL query)
- [ ] 1.3 Update or remove the integration test in `AssessmentControllerIntegrationTest` that asserts a 422 when adding a second code question; replace with a test asserting a second code question is accepted

## 2. MG-120 — Difficulty field (Backend)

- [ ] 2.1 Create `Difficulty` enum in `com.psybergate.recruitment.domain` with values `EASY`, `MEDIUM`, `HARD`
- [ ] 2.2 Add `difficulty` field (nullable, `@Enumerated(EnumType.STRING)`) to the `Question` entity
- [ ] 2.3 Write Flyway migration `V15__add_difficulty_to_questions.sql`: `ALTER TABLE questions ADD COLUMN difficulty VARCHAR(10) CHECK (difficulty IN ('EASY','MEDIUM','HARD'))`
- [ ] 2.4 Add optional `difficulty` field to `QuestionRequest` DTO
- [ ] 2.5 Add `difficulty` field to `QuestionResponse` DTO
- [ ] 2.6 Map `difficulty` in `QuestionServiceImpl` create and update methods
- [ ] 2.7 Add integration test: create question with difficulty HARD, assert response contains `difficulty: HARD`
- [ ] 2.8 Add integration test: create question without difficulty, assert response contains `difficulty: null`

## 3. MG-119 — Remove CODE_SUBMISSION limit (Frontend)

- [ ] 3.1 Remove any frontend error handling or messaging that references the 422 "at most one code submission question" response in the assessment builder component

## 4. MG-120 — Difficulty field (Frontend)

- [ ] 4.1 Add `difficulty?: 'EASY' | 'MEDIUM' | 'HARD'` to the `Question` model in `question.model.ts`
- [ ] 4.2 Add a difficulty selector (None / Easy / Medium / Hard buttons) to `QuestionFormComponent`, matching the style of the type selector
- [ ] 4.3 Wire `difficulty` into the form payload in `QuestionFormComponent.submit()`
- [ ] 4.4 Patch `difficulty` when loading a question in edit mode
- [ ] 4.5 Display a coloured difficulty badge on question cards in `QuestionsComponent` (only when difficulty is set)
- [ ] 4.6 Add Vitest tests for `QuestionFormComponent`: difficulty selector renders, difficulty included in submitted payload
- [ ] 4.7 Add Vitest tests for `QuestionsComponent`: difficulty badge shown when set, not shown when null

## 5. OpenSpec housekeeping

- [ ] 5.1 Append prompts used to `prompts.md`
- [ ] 5.2 Commit all changes with a conventional commit message
