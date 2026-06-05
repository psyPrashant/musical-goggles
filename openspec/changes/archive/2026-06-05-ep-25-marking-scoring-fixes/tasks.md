## 1. Backend — New questionId-based scoring endpoint (MG-143)

- [x] 1.1 Add `scoreByQuestionId(submissionId, questionId, score, feedback, markerId)` method to `SubmissionService` interface
- [x] 1.2 Implement `scoreByQuestionId()` in `SubmissionServiceImpl`: validate questionId belongs to the assessment, find-or-create `CandidateAnswer`, upsert `AnswerScore`
- [x] 1.3 Add `PUT /api/submissions/{submissionId}/questions/{questionId}/score` controller endpoint in the marking controller, secured to `ROLE_RECRUITER` / `ROLE_ADMIN`

## 2. Backend — Fix fullyMarked logic (MG-144)

- [x] 2.1 In `SubmissionServiceImpl.getResult()`, update GROUP sub-question loop: remove `fullyMarked = false` when `subAnswer == null`; keep `fullyMarked = false` only when `subAnswer != null && subAnswerScore == null`
- [x] 2.2 Apply the same fix to the standalone question path: remove `fullyMarked = false` when `answer == null`; keep it only when `answer != null && answerScore == null`

## 3. Frontend — Wire up questionId scoring (MG-143)

- [x] 3.1 Add `scoreAnswerByQuestion(submissionId, questionId, req: ScoreAnswerRequest)` method to `MarkingService` calling `PUT .../questions/{questionId}/score`
- [x] 3.2 Update `saveScore()` in `results.component.ts`: when `q.answerId` is null, call `scoreAnswerByQuestion` instead of `scoreAnswer`
- [x] 3.3 Remove `!sub.answerId` from the `[disabled]` binding on the Save button for GROUP sub-questions

## 4. Tests

- [x] 4.1 Backend unit test: `scoreByQuestionId` creates `CandidateAnswer` when absent, then saves `AnswerScore`
- [x] 4.2 Backend unit test: `getResult()` returns `FULLY_MARKED` when all `CandidateAnswer` rows have scores, even when some questions have no `CandidateAnswer`
- [x] 4.3 Frontend unit test: `saveScore()` routes to the questionId endpoint when `answerId` is null
