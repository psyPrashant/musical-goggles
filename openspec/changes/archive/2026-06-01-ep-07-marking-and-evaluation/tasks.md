## 1. Data Model — Backend

- [x] 1.1 Create `AnswerScore` JPA entity with fields: `id`, `candidateAnswerId` (unique FK), `score` (int ≥ 0), `feedback` (text, nullable), `markedBy` (UUID, nullable), `markedAt` (timestamp), `isAutoMarked` (boolean)
- [x] 1.2 Write Liquibase migration V9 to create `answer_scores` table with unique constraint on `candidate_answer_id`
- [x] 1.3 Create `AnswerScoreRepository` (Spring Data JPA) with `findByCandidateAnswerId` and `findByCandidateAnswerIdIn`

## 2. MCQ Auto-Marking — Backend

- [x] 2.1 Create `MarkingService` / `MarkingServiceImpl` with `autoMarkMcq(submissionId)` method that loads all MCQ `CandidateAnswer` records, compares selected option IDs against `QuestionOption.isCorrect`, and writes `AnswerScore` rows (`score: 1` if fully correct, `score: 0` otherwise, `isAutoMarked: true`, `markedBy: null`)
- [x] 2.2 Handle multiple-correct MCQ: score 1 only if candidate's `selectedOptionIds` exactly matches the set of correct option IDs for the question
- [x] 2.3 Skip (no score written) for MCQ questions that have no `CandidateAnswer` in the submission
- [x] 2.4 Extend `CandidateTakeServiceImpl.submitAssessment()` to call `markingService.autoMarkMcq(submissionId)` after locking, within the same `@Transactional` method; skip if submission already locked (idempotent re-submit path)
- [x] 2.5 Write unit tests: single-correct MCQ scores 1; wrong answer scores 0; multiple-correct all-right scores 1; multiple-correct partial scores 0; unanswered question produces no score row; no-MCQ submission writes no score rows

## 3. Submission Listing — Backend

- [x] 3.1 Create `SubmissionController` with `GET /api/assessments/{assessmentId}/submissions` endpoint, secured for `ROLE_RECRUITER` and `ROLE_ADMIN`
- [x] 3.2 Create `SubmissionService` / `SubmissionServiceImpl` with `listSubmissions(assessmentId)` method
- [x] 3.3 Build `SubmissionSummaryResponse` DTO: `submissionId`, `candidateId`, `candidateName`, `status`, `submittedAt`, `answeredCount`, `totalAnswers`, `markedCount`; order by `submittedAt DESC`, `IN_PROGRESS` last
- [x] 3.4 Add `findByAssessmentId` to `CandidateSubmissionRepository` if not already present
- [x] 3.5 Write unit tests: assessment with submissions returns correct list; assessment with no submissions returns empty list; 404 for unknown assessment

## 4. Manual Marking — Backend

- [x] 4.1 Add `PUT /api/submissions/{submissionId}/answers/{answerId}/score` endpoint to `SubmissionController`, secured for `ROLE_RECRUITER` and `ROLE_ADMIN`
- [x] 4.2 Implement `scoreAnswer(submissionId, answerId, score, feedback, markerId)` in `SubmissionService`: validate answer belongs to submission; validate score ≥ 0; upsert `AnswerScore` with `isAutoMarked: false`, `markedBy`, and `markedAt: now()`
- [x] 4.3 Build `ScoreAnswerRequest` DTO (`score`, `feedback`) and `AnswerScoreResponse` DTO (`answerId`, `score`, `feedback`, `isAutoMarked`, `markedBy`, `markedAt`)
- [x] 4.4 Return HTTP 404 when `answerId` does not belong to `submissionId`; return HTTP 400 when score < 0
- [x] 4.5 Write unit tests: new score created; existing score overwritten; answer not in submission returns 404; negative score returns 400; marker ID captured from security context

## 5. Result Summary — Backend

- [x] 5.1 Add `GET /api/submissions/{submissionId}/result` endpoint to `SubmissionController`
- [x] 5.2 Implement `getResult(submissionId)` in `SubmissionService`: load submission + all answers + all scores; build per-question detail (resolve MCQ selected option text); compute `totalScore` and `markingStatus` (FULLY_MARKED if all answers scored, else PENDING_REVIEW)
- [x] 5.3 Build `ResultSummaryResponse` DTO: `submissionId`, `candidateName`, `assessmentTitle`, `submittedAt`, `totalScore`, `markingStatus`, `questions` (list of `ResultQuestionDto`)
- [x] 5.4 Build `ResultQuestionDto`: `questionId`, `answerId`, `questionTitle`, `questionType`, `candidateAnswer` (resolved text, nullable), `score` (nullable), `feedback` (nullable), `isAutoMarked`, `markedBy`, `markedAt`
- [x] 5.5 Resolve MCQ `candidateAnswer` to option text (not raw UUIDs) by loading `QuestionOption` by ID
- [x] 5.6 Return HTTP 404 when submission not found; return HTTP 403 for CANDIDATE role
- [x] 5.7 Write unit tests: fully-marked submission returns FULLY_MARKED status and correct total; partially-marked returns PENDING_REVIEW; no answers returns totalScore 0; MCQ answer shows option text not UUID

## 6. Security & Integration — Backend

- [x] 6.1 Verify Spring Security config covers `/api/submissions/**` for RECRUITER/ADMIN roles
- [x] 6.2 Add integration test: submit MCQ assessment → check auto-mark scores written; then fetch result summary → verify totalScore and FULLY_MARKED status
- [x] 6.3 Add integration test: submit text-answer assessment → fetch result summary (PENDING_REVIEW) → manual mark → fetch result summary again (FULLY_MARKED)

## 7. Submission Listing — Frontend

- [x] 7.1 Create `MarkingService` (Angular) with `listSubmissions(assessmentId)`, `getResult(submissionId)`, and `scoreAnswer(submissionId, answerId, req)` methods
- [x] 7.2 Replace mock data in `ResultsComponent` with real `markingService.listSubmissions()` call; display candidate name, status, answered count, marking progress
- [x] 7.3 Wire submission row click to load `getResult(submissionId)` in the right-hand detail panel

## 8. Result & Marking — Frontend

- [x] 8.1 Render per-question scoring panel from `ResultSummaryResponse`: show question body, candidate answer, score (if present), feedback
- [x] 8.2 Add score input and feedback textarea for unscored text/code questions; call `scoreAnswer()` on save
- [x] 8.3 Show `isAutoMarked` badge on MCQ answers that were auto-scored; allow recruiter to override the score
- [x] 8.4 Display `FULLY_MARKED` / `PENDING_REVIEW` status badge and total score in the result panel header

## 9. Frontend Tests

- [x] 9.1 Unit test `MarkingService`: listSubmissions, getResult, scoreAnswer — mock HTTP calls
- [x] 9.2 Unit test `ResultsComponent`: renders submission list from service; clicking a submission loads result detail
