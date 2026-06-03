## Context

`ResultSummaryResponse` currently exposes `totalScore: int` but no denominator. `SubmissionSummaryResponse` exposes `answeredCount` and `markedCount` but no score fields. Neither the list nor the detail can show a percentage or fraction without changes to the API response.

The scoring model: MCQ questions are auto-marked 0 or 1; text/code questions receive arbitrary integer scores manually. No `maxPoints` field exists at question or assessment level.

## Goals / Non-Goals

**Goals:**
- Surface `maxScore` (total question count) and `answeredCount` in detail and list API responses
- Show percentage in list, fraction in detail header, answered-count in detail
- Keep changes purely additive — no breaking changes to existing fields

**Non-Goals:**
- Per-question max points or weighting (out of scope)
- Fixing the pre-existing `totalAnswers = answeredCount` bug in `SubmissionSummaryResponse`
- Percentage on the candidate history page or dashboard

## Decisions

### 1. maxScore = total question count

**Decision**: `maxScore = aqList.size()` — the number of questions configured on the assessment.

**Rationale**: MCQ max is always 1; text/code have no defined max. Using question count as the denominator is consistent with how staff already reason about scores ("6 out of 8 questions"). Avoids any schema change.

**Alternative considered**: Adding a `maxPoints` field to the `Question` entity. Rejected — out of scope for EP-18 and would require a Flyway migration and UI changes to the question builder.

### 2. Percentage display: only when FULLY_MARKED

**Decision**: Show "—" in the list when `markedCount < totalAnswers` (not all answers have been scored) or `maxScore = 0`.

**Rationale**: A partial score gives a misleading percentage. `SubmissionSummary` does not include `markingStatus`, so `markedCount < totalAnswers` is the equivalent proxy (both fields already present).

### 3. Batch question count query in buildSummaries

**Decision**: Add `countGroupByAssessmentId` JPQL query to `AssessmentQuestionRepository` rather than calling `findByAssessmentIdOrderByDisplayOrder` per submission.

**Rationale**: `buildSummaries` processes all submissions in one pass. N individual queries would be a performance regression. A single `GROUP BY` query returns counts for all assessments at once.

### 4. totalScore in SubmissionSummaryResponse computed from existing score load

**Decision**: Reuse the `scoreRepository.findByCandidateAnswerIdIn(allAnswerIds)` collection that `buildSummaries` already loads for `markedCount`. Sum scores per submission from the same result set.

**Rationale**: No additional database query needed. The scores are already in memory.

## Risks / Trade-offs

- **[Low risk]** Text questions with scores > 1 will make `totalScore > maxScore` possible (e.g. "12/8"). This is technically valid — manual markers can award any non-negative integer. The display is honest; staff understand it.
- **[Low risk]** `maxScore = 0` guard prevents division-by-zero. An assessment with no questions configured cannot be sent (publishing guard exists upstream), so this is a defensive-only check.
