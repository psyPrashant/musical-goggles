## Context

When a submission contains a GROUP question, `CandidateAnswer` rows are stored per sub-question ID (not per GROUP ID). The existing `getResult()` method iterates `assessment_questions` (top-level only) and looks up each answer by question ID. GROUP questions return null from this lookup because no `CandidateAnswer` has the GROUP's own ID. Sub-question answers therefore never surface in the response.

`buildSummaries()` passes `answered` (count of CandidateAnswer rows) as both `answeredCount` and `totalAnswers`, so the denominator in "x/x marked" equals how many questions were answered rather than how many are in the assessment.

## Goals / Non-Goals

**Goals:**
- GROUP sub-questions appear individually in the marking detail view with their candidate answer and score
- `answeredCount / questions.length` and `markedCount / totalAnswers` denominators are accurate
- Recruiters can mark each sub-question in the same flow as standalone questions

**Non-Goals:**
- Changing how candidates take GROUP questions (that flow is already correct)
- Flattening GROUP questions — the GROUP preamble should remain visible for context

## Decisions

**Nested DTO over flat expansion** — `ResultQuestionDto` gets an optional `List<ResultQuestionDto> subQuestions`. The GROUP entry is kept as the preamble row (no answer/score of its own); sub-question entries nest beneath it. This preserves context for the recruiter and avoids renumbering Q1/Q2 in the list. Alternative (flat) was rejected because it loses the GROUP preamble text.

**Backend expansion in `getResult()`** — When `rawQ.getType() == GROUP`, cast to `GroupQuestion`, iterate `getMembers()`, look up each member's answer from `answerByQuestionId`, and build child `ResultQuestionDto` entries. This requires eager-loading `GroupQuestion.members` + each `GroupQuestionMember.question`.

**Fix `totalAnswers` in `buildSummaries()`** — Compute a separate `totalAnswerableByAssessment` map: for each assessment, count non-GROUP assessment questions plus the sub-question count of each GROUP. Join this to submissions via `assessmentId`. Pass this as `totalAnswers` instead of `answered`.

**Frontend computed helper `totalQuestionCount()`** — Rather than using `result()!.questions.length` directly, compute `questions.reduce((n, q) => n + (q.subQuestions?.length ?? 1), 0)` for the answered-stat denominator.

## Risks / Trade-offs

- `GroupQuestion.members` must be loaded — ensure the `getResult()` fetch path doesn't hit N+1. Use `JOIN FETCH` or accept the extra query per GROUP (assessments rarely have many GROUPs).
- `totalAnswers` fix in `buildSummaries()` is a slightly heavier query but only runs on the list endpoint, not per-submission detail.
