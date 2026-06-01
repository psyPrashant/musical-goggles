## 1. Data Model — Backend

- [x] 1.1 Create `CandidateSubmission` JPA entity with fields: `id`, `candidateId`, `assessmentId`, `invitationId` (unique), `status` (enum: IN_PROGRESS / SUBMITTED / AUTO_SUBMITTED), `startedAt`, `submittedAt`
- [x] 1.2 Create `SubmissionStatus` enum class
- [x] 1.3 Create `CandidateAnswer` JPA entity with fields: `id`, `submissionId`, `questionId`, `selectedOptionIds` (JSON text), `textContent` (text), `isDraft`, `savedAt`; add unique constraint on `(submissionId, questionId)`
- [x] 1.4 Write Liquibase migration to create `candidate_submission` table
- [x] 1.5 Write Liquibase migration to create `candidate_answer` table
- [x] 1.6 Create `CandidateSubmissionRepository` and `CandidateAnswerRepository` (Spring Data JPA)

## 2. Assessment Loading — Backend

- [x] 2.1 Create `CandidateTakeController` with `GET /api/take/assessment` endpoint (secured by candidate JWT)
- [x] 2.2 Create `CandidateTakeService` / `CandidateTakeServiceImpl` with `loadAssessment(candidateId, assessmentId)` method
- [x] 2.3 Implement lazy submission creation: create `CandidateSubmission` (IN_PROGRESS) if none exists for the `(candidateId, assessmentId)` pair; return existing if already started
- [x] 2.4 Build `AssessmentTakeResponse` DTO: `assessmentId`, `title`, `description`, `startedAt`, `deadline`, `totalQuestionCount`, `questions` (ordered by `displayOrder`), `answers`
- [x] 2.5 Build `TakeQuestionDto` — includes question text and type; for MCQ includes options (id + text only, no `isCorrect`)
- [x] 2.6 Return HTTP 409 when `CandidateSubmission` is already `SUBMITTED` or `AUTO_SUBMITTED`
- [x] 2.7 Write unit tests: first load creates submission; second load returns same; submitted attempt returns 409; MCQ options lack isCorrect

## 3. Draft Answer Save — Backend

- [x] 3.1 Add `PUT /api/take/answers` endpoint to `CandidateTakeController`
- [x] 3.2 Implement upsert logic in `CandidateTakeService`: insert or update `CandidateAnswer` by `(submissionId, questionId)`
- [x] 3.3 Validate each `questionId` in request belongs to the candidate's assessment; return HTTP 403 for out-of-scope questions
- [x] 3.4 Validate MCQ `selectedOptionIds` are valid `QuestionOption` UUIDs for the given question; return HTTP 400 on invalid
- [x] 3.5 Validate `textContent` length ≤ 65,535 characters; return HTTP 400 if exceeded
- [x] 3.6 Return HTTP 409 when submission is already locked (`SUBMITTED` / `AUTO_SUBMITTED`)
- [x] 3.7 Return HTTP 409 when the current time exceeds the submission deadline
- [x] 3.8 Build `SaveAnswersRequest` DTO (list of answer objects with `questionId`, `selectedOptionIds`, `textContent`) and `SaveAnswersResponse` DTO
- [x] 3.9 Write unit tests: new answer created; existing answer updated; out-of-scope question rejected; oversized text rejected; locked submission rejected; post-deadline rejected

## 4. Final Submission — Backend

- [x] 4.1 Add `POST /api/take/submit` endpoint to `CandidateTakeController`
- [x] 4.2 Implement `submitAssessment(candidateId, assessmentId, autoSubmitted)` in `CandidateTakeService`: set status to SUBMITTED or AUTO_SUBMITTED, record `submittedAt`, update `CandidateInvitation.status` to COMPLETED — all in one transaction
- [x] 4.3 Make submit idempotent: return existing `submittedAt` if submission is already locked
- [x] 4.4 Return HTTP 404 when no `IN_PROGRESS` submission exists
- [x] 4.5 Build `SubmitRequest` DTO (`autoSubmitted` flag) and `SubmitResponse` DTO (`submissionId`, `assessmentTitle`, `status`, `submittedAt`, `answeredCount`, `totalQuestionCount`)
- [x] 4.6 Write unit tests: manual submit locks + transitions invitation; auto-submit sets AUTO_SUBMITTED; idempotent on double-call; 404 when no submission; post-deadline submit accepted

## 5. Security & Integration — Backend

- [x] 5.1 Configure Spring Security to permit `GET /api/take/assessment`, `PUT /api/take/answers`, `POST /api/take/submit` for `role=CANDIDATE` JWT claims
- [x] 5.2 Add integration test: full candidate flow — load assessment → save draft answers → submit → confirm locked
- [x] 5.3 Add integration test: page-refresh scenario — load twice, assert single submission record and draft answers preserved

## 6. Assessment Loading — Frontend

- [x] 6.1 Create `CandidateTakeService` (Angular) with `loadAssessment()`, `saveAnswers()`, and `submit()` methods calling the new API endpoints
- [x] 6.2 Replace mock assessment data in `AssessmentTakeComponent` with real `CandidateTakeService.loadAssessment()` call
- [x] 6.3 Initialise the countdown timer from the server-returned `deadline` timestamp (absolute UTC) so refresh-safe
- [x] 6.4 Render question list from API response; ensure MCQ options display without `isCorrect`

## 7. Draft Save & Answer Inputs — Frontend

- [x] 7.1 Wire MCQ answer selection to call `saveAnswers()` on each selection change (debounced 500ms)
- [x] 7.2 Wire text/code answer textarea to call `saveAnswers()` on change (debounced 1000ms)
- [x] 7.3 Pre-populate answer inputs from `answers` in the `GET /api/take/assessment` response on load/refresh
- [x] 7.4 Handle 409 response from `PUT /api/take/answers` (deadline/locked): show toast and disable further editing

## 8. Submission & Confirmation — Frontend

- [x] 8.1 Wire "Submit Assessment" button to call `submit({ autoSubmitted: false })`
- [x] 8.2 On timer expiry, cancel any in-flight autosave and call `submit({ autoSubmitted: true })`
- [x] 8.3 On successful submission response, navigate to a confirmation screen showing `assessmentTitle`, `submittedAt`, `answeredCount / totalQuestionCount`
- [x] 8.4 Disable all answer inputs and the submit button once submission is locked

## 9. Frontend Tests

- [x] 9.1 Unit test `CandidateTakeService`: loadAssessment, saveAnswers, submit — mock HTTP calls
- [x] 9.2 Unit test `AssessmentTakeComponent`: timer initialised from deadline; answer pre-population on refresh; submit button calls service
