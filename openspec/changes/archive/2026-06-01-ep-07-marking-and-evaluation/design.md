## Context

EP-06 delivered `CandidateSubmission` and `CandidateAnswer` entities. When a candidate submits, their answers are locked and stored. The marking epic sits entirely on top of this — it reads submissions, writes scores, and surfaces aggregated results to recruiters. No candidate-facing code changes.

Current state of relevant domain:
- `CandidateSubmission` — holds status (IN_PROGRESS / SUBMITTED / AUTO_SUBMITTED), startedAt, submittedAt
- `CandidateAnswer` — holds per-question answer content (selectedOptionIds as JSON, textContent), isDraft
- `QuestionOption.isCorrect` — exists, is the source of truth for MCQ auto-marking
- No `AnswerScore` entity exists yet

The frontend `ResultsComponent` was scaffolded in MG-55 with mock data (split-panel evaluation view with per-question scoring). This epic wires it to real APIs.

## Goals / Non-Goals

**Goals:**
- Recruiters can list all candidate submissions for an assessment
- MCQ answers are auto-scored at submission time with no manual input
- Recruiters can manually score text and code answers with a numeric score and free-text feedback
- A result summary endpoint gives a per-candidate aggregate suitable for comparison
- The marking data model supports the future export/ranking requirements noted in MG-40

**Non-Goals:**
- Bulk marking operations (mark all answers for all candidates at once)
- Automated AI-assisted marking of text/code answers
- Exporting results as CSV/PDF (future sprint)
- Candidate-facing result visibility (candidates do not see their scores)
- Email notification to candidates when marking is complete

## Decisions

### 1. `AnswerScore` as a separate entity linked to `CandidateAnswer`

**Decision:** A dedicated `AnswerScore` entity holds `candidateAnswerId` (unique FK), `score` (numeric), `feedback` (text, nullable), `markedBy` (UUID, nullable — null for auto-marks), `markedAt` (timestamp), and `isAutoMarked` (boolean).

**Rationale:** Separating score from answer keeps the `CandidateAnswer` table as the immutable record of what the candidate submitted. Scores can be revised (a recruiter re-marks) without touching the answer. The `isAutoMarked` flag distinguishes MCQ auto-scores from human assessments in the result summary. The unique FK on `candidateAnswerId` ensures one score per answer.

**Alternative considered:** Add `score` and `feedback` columns directly to `CandidateAnswer`. Simpler schema but conflates the candidate's submission record with the recruiter's evaluation, makes revisions awkward, and loses marker identity/timestamp.

### 2. MCQ auto-marking fires synchronously inside `submitAssessment()`, same transaction

**Decision:** After locking the `CandidateSubmission`, the submit service calls the auto-marking logic in the same `@Transactional` method. All MCQ `AnswerScore` rows are written atomically with the submission lock.

**Rationale:** Atomicity guarantees that if auto-marking fails for any reason, the submission is also rolled back — preventing a state where the submission is locked but scores are missing. The result summary can then immediately query scores for SUBMITTED assessments. MCQ auto-marking is cheap (in-memory comparison); there is no need for async processing.

**Alternative considered:** Trigger auto-marking asynchronously (e.g., Spring `@Async` or a message queue). More resilient under load but adds operational complexity, introduces a window where submission is locked but scores are absent, and is unnecessary for this scale.

### 3. Manual marking endpoint replaces or creates a score record (upsert)

**Decision:** `PUT /api/submissions/{submissionId}/answers/{answerId}/score` upserts the `AnswerScore` — creates it if none exists, overwrites if present. The `isAutoMarked` flag is set to false and `markedBy` is set to the authenticated user's ID.

**Rationale:** Recruiters need to be able to correct a score without a separate "update" endpoint. Upsert simplifies the client. An auto-marked MCQ score can be overridden by a human (e.g., the recruiter disagrees with the auto-result) — the upsert model handles this naturally. The original auto-score is not preserved once overridden, which is acceptable.

**Alternative considered:** Append-only score history. More auditable but significantly more complex to query for the "current" score in result summaries.

### 4. Marking completeness determined by comparing answer count to `AnswerScore` count

**Decision:** The result summary marks an assessment as `FULLY_MARKED` when every `CandidateAnswer` for the submission has a corresponding `AnswerScore`. If any answers lack a score, the status is `PENDING_REVIEW`. This is computed at query time — no stored status field.

**Rationale:** Computing completeness at query time avoids stale status bugs (e.g., a score is deleted and the status doesn't update). Given the small number of answers per submission, the extra join is negligible.

### 5. `GET /api/assessments/{id}/submissions` is recruiter/admin only; scoring endpoints are also recruiter/admin only

**Decision:** All EP-07 endpoints require `ROLE_RECRUITER` or `ROLE_ADMIN`. Candidates have no access to submissions, scores, or results.

**Rationale:** Consistent with the role model. `@PreAuthorize("hasAnyRole('RECRUITER','ADMIN')")` on the controller class.

## Risks / Trade-offs

- **Re-mark over auto-score**: When a recruiter manually scores an MCQ answer, the auto-score is silently overwritten. This is intentional but could surprise users. Mitigation: the frontend can display a warning ("This question was auto-scored") before allowing override. The `isAutoMarked` flag is returned in the score response to support this.

- **Partial auto-marking on submit**: If a submission has no MCQ questions, auto-marking runs but produces zero `AnswerScore` rows. The result summary must correctly show `PENDING_REVIEW` (all text/code answers need human marking) rather than `FULLY_MARKED`. Mitigation: the completeness check counts total answers, not just MCQ answers.

- **Score range validation**: The spec allows any numeric score. Without a constraint, a recruiter could enter −100 or 9999. Mitigation: validate score ≥ 0 server-side; upper bound tied to the question's max score if that field is added later (deferred).

## Migration Plan

1. Add Liquibase migration: create `answer_scores` table (V9)
2. Deploy backend (additive — no existing tables changed, except `CandidateTakeServiceImpl` extended)
3. Frontend: replace mock data in `ResultsComponent` with real API calls

Rollback: drop `answer_scores` table — no other tables are altered.

## Open Questions

- Should the submission listing endpoint paginate? Current assumption: no pagination (small dataset per assessment). Add if needed.
- Should a manually-set score on an MCQ answer prevent future re-auto-marking? Current assumption: once manually set, auto-marking never overwrites it (relevant if a re-submission scenario is ever added).
