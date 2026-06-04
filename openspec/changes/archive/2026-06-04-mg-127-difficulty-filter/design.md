## Context

Both `QuestionsComponent` and `AssessmentDetailComponent` already load all questions into memory (`questions` / `allQuestions` signals). The difficulty field is present on every `Question` object returned by the API. All filtering is therefore pure client-side — no extra HTTP call or backend change is needed.

## Goals / Non-Goals

**Goals**
- Difficulty filter chips in question bank (`QuestionsComponent`).
- Difficulty filter chips + difficulty badges in assessment builder picker (`AssessmentDetailComponent`).
- Difficulty badges on the existing-questions table rows in the assessment builder.
- Remove `codeSubmissionLimitReached` dead code.

**Non-Goals**
- Server-side `?difficulty=` query parameter (not needed; all questions are loaded).
- Sorting by difficulty.
- Showing difficulty in the candidate-facing take view.

## Decisions

### 1. Client-side filtering only

All question data is already in memory; an API round-trip would add latency and complexity for no gain.

### 2. `QuestionsComponent`: extend `filtered` computed

`filtered` already composes search + type + tag. Add `selectedDifficulty` signal and extend the predicate: `!d || q.difficulty === d`. This keeps all filter logic in one computed, consistent with the existing pattern.

### 3. `AssessmentDetailComponent`: convert `filterDifficulty` to reactive

The component uses imperative `filterQuestions()` today. Rather than refactoring the whole component, add a `filterDifficulty` plain field alongside the existing `filterType` and call `filterQuestions()` on change — matching the existing pattern exactly.

### 4. Remove `codeSubmissionLimitReached`

The signal, its setter call, and the warning paragraph are all dead code since MG-119. Remove them cleanly.

## Risks / Trade-offs

- **Risk**: If a future feature adds server-side difficulty filtering, the client-side approach diverges. → Mitigation: the `?difficulty=` query param shape is reserved in the API for future use.

## Open Questions

None.
