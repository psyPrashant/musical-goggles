## Context

The marking flow has two related bugs (MG-143, MG-144) that both surface when a GROUP question contains sub-questions the candidate left unanswered.

**Current state:**
- `scoreUnansweredQuestions()` in `CandidateTakeServiceImpl` creates a phantom `CandidateAnswer` + `AnswerScore(0, "Not answered", autoMarked=true)` for every unanswered question on submission — including GROUP sub-questions. This works for *new* submissions.
- However, the recruiter scoring endpoint (`PUT /api/submissions/{id}/answers/{answerId}/score`) requires an existing `answerId`. If for any reason a `CandidateAnswer` is absent (old seeded data, edge cases), the frontend receives `answerId: null`, the Save button is disabled, and scoring is impossible.
- `getResult()` computes `fullyMarked = false` whenever any GROUP sub-question has no `CandidateAnswer` — even if all reachable questions have been scored. This permanently traps those submissions as "Pending Review".

## Goals / Non-Goals

**Goals:**
- Allow recruiters to score GROUP sub-questions that have no `CandidateAnswer` row.
- Compute `FULLY_MARKED` correctly: only block on answered-but-unscored questions, not unanswered ones.
- Keep changes minimal and backward-compatible — no schema changes.

**Non-Goals:**
- Retroactively backfilling `CandidateAnswer` rows for all historical submissions.
- Changing the candidate-facing submission flow.
- Modifying how auto-scoring works on submission.

## Decisions

### Decision 1 — New `questionId`-based scoring endpoint instead of modifying the existing one

**Options considered:**
- *A) Add optional `questionId` body field to existing `PUT .../answers/{answerId}/score`* — awkward URL (the `{answerId}` path param would be meaningless when `questionId` is used), confusing contract.
- *B) New endpoint `PUT .../questions/{questionId}/score` on the same submission resource* — clear intent, discoverable, no changes to the existing endpoint contract.

**Decision: Option B.** The new endpoint:
1. Validates `questionId` belongs to the submission's assessment.
2. `findOrCreate`s a `CandidateAnswer(submissionId, questionId)` with no content (unanswered).
3. Upserts the `AnswerScore` — same logic as the existing `scoreAnswer()`.
4. Returns an `AnswerScoreResponse` with the newly created/found `answerId`.

The existing `PUT .../answers/{answerId}/score` is unchanged.

### Decision 2 — Frontend fallback: use `questionId` endpoint when `answerId` is null

**Options considered:**
- *A) Pre-fetch answers before showing the marking view, creating phantom CandidateAnswers server-side on GET* — side effects in a GET, violates REST.
- *B) Frontend `saveScore()` falls back to the new questionId endpoint when `answerId` is null* — clean, no side effects until the recruiter actually saves a score.

**Decision: Option B.** If `q.answerId` is null, `saveScore()` calls `PUT .../questions/{questionId}/score`. The Save button is unconditionally enabled for GROUP sub-questions (remove the `!sub.answerId` disabled guard); the guard moves inside `saveScore()` to route to the correct endpoint.

After a successful save, `getResult()` is re-fetched as normal — the newly created `CandidateAnswer` will appear and the sub-question's `answerId` will be populated going forward.

### Decision 3 — Fix `fullyMarked` to only block on answered-but-unscored

**Current logic** (both standalone and GROUP paths):
```
if (answer == null) → fullyMarked = false   // BUG: unanswered question blocks completion
if (answer != null && score == null) → fullyMarked = false   // correct
```

**New logic:**
```
if (answer != null && score == null) → fullyMarked = false   // only this blocks
// answer == null → unanswered, implicitly 0, does NOT block fullyMarked
```

This aligns with the `unanswered-question-scoring` spec: unanswered questions are auto-scored 0, so they are already "marked". The recruiter can still override via the new endpoint (Decision 1).

The same two-line fix applies to both the standalone question path and the GROUP sub-question path in `getResult()`.

## Risks / Trade-offs

- **Old submissions may show FULLY_MARKED prematurely** — a submission where a TEXT sub-question has no `CandidateAnswer` (unanswered, never manually scored) will now be considered fully marked even though its contribution is implicitly 0. This is acceptable per spec: unanswered questions are intended to be scored 0.
- **Phantom CandidateAnswer created on first save** — calling the questionId endpoint creates a `CandidateAnswer` with null content. This is consistent with how `scoreUnansweredQuestions` works but could confuse any future code that assumes all `CandidateAnswer` rows have content. Mitigation: add `isDraft: false` and `savedAt = now()` to make it look like a legitimate unanswered record (same as unanswered scoring).
- **`answeredCount` in `getResult()` will not include phantom answers created mid-marking** — the `answeredCount` stat increments only when `subAnswer != null`. A sub-question scored via questionId endpoint will create a CandidateAnswer, so on the *next* `getResult()` call the count will update correctly.

## Migration Plan

1. Deploy backend with new endpoint and `fullyMarked` fix — fully backward-compatible.
2. Deploy frontend with `saveScore()` fallback — no migration scripts needed.
3. Existing seeded submissions will automatically reflect correct `FULLY_MARKED` status on their next `getResult()` load (Decision 3 fix).
4. Rollback: revert both BE and FE commits independently; no data changes to undo.
