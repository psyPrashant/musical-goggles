## Context

`QuestionFormComponent` (`recruitment-fe/src/app/features/questions/question-form.component.ts`) already has a working "GROUP" mode: a `memberQuestions` signal holds the ordered sub-question list, populated only via a bank-search picker (`allQuestions`/`filteredBank`/`addMember`/`removeMember`). On submit, `memberQuestionIds` (existing question ids) is sent to `POST /api/questions`.

On the backend, `QuestionServiceImpl.buildGroup()` validates ≥2 `memberQuestionIds`, resolves each to an existing `Question`, and builds `GroupQuestionMember` rows. `create()`/`update()` set `question.setMaxScore(req.maxScore() != null ? req.maxScore() : 1)` for **all** types, including GROUP — the GROUP's `maxScore` is therefore whatever the recruiter typed (default 1), unrelated to its members. A one-off migration (`V16.2__fix_group_max_scores.sql`) previously corrected historical data to `SUM(member.maxScore)`, but the create/update code path doesn't enforce this.

GROUP questions cannot be edited via the form today (`groupEditBlocked`) — this change does not alter that.

## Goals / Non-Goals

**Goals:**
- Let a recruiter add sub-questions to a GROUP from two sources — the existing bank picker, and a new inline "create new sub-question" mini-form — into one ordered list.
- Persist newly-authored sub-questions as normal, reusable bank questions before/while creating the GROUP.
- Make GROUP `maxScore` always equal `SUM(member.maxScore)`, computed server-side, for create and update.
- Remove the editable Points field from the form for GROUP and replace it with a live read-only total.

**Non-Goals:**
- Editing an existing GROUP's sub-questions (still blocked by `groupEditBlocked`) — out of scope.
- Nested GROUP-of-GROUP support — remains disallowed.
- Any database schema change — `maxScore` is already a plain int column on `questions`.
- Drag-and-drop reordering — out of scope; sub-questions are ordered by add-sequence with simple remove.

## Decisions

### 1. Single unified, ordered sub-question list (discriminated union)

Replace the GROUP-only `memberQuestions: Question[]` signal with a single ordered list:

```ts
type SubQuestionEntry =
  | { source: 'bank'; question: Question }
  | { source: 'new'; draft: NewSubQuestionDraft };
```

Both the bank picker's "Add" and the inline mini-form's "Add sub-question" push onto this same list, in click order. The list drives:
- Rendering (each entry shows a "New" badge when `source === 'new'`, otherwise the existing bank-row presentation)
- Removal (single `removeEntry(index)` for both sources)
- The live "Total points" computed signal: `sum(entries.map(e => e.source === 'bank' ? e.question.maxScore : e.draft.maxScore))`
- The ≥2 validation (`entries.length >= 2`)

**Alternative considered**: keep two separate arrays (`memberQuestions` for bank, `newSubQuestions` for inline) and concatenate at render/submit time. Rejected — display order would have to be tracked by a separate ordering array anyway, which is effectively the same unified list with extra indirection.

### 2. Two-phase submit: create new sub-questions first, then the GROUP (no backend API change)

For each `source === 'new'` entry, the FE issues `POST /api/questions` with that entry's payload (type/title/body/maxScore/options/languageHint — same shape the form already builds for standalone MCQ/TEXT/CODE_SUBMISSION questions), in parallel via `forkJoin`. Each response yields a real `id`. The FE then builds `memberQuestionIds` by walking the unified list in order, using `entry.question.id` for `'bank'` entries and the freshly-returned id for `'new'` entries, and submits `POST /api/questions` for the GROUP exactly as today.

**Alternative considered**: extend `QuestionRequest`/`buildGroup()` to accept a `newMembers: QuestionRequest[]` payload and create everything transactionally on the backend. Rejected for this change — it would require new DTOs, validation duplication for each sub-type (MCQ option validation, etc.) on the backend, and a larger blast radius, for a feature whose primary value (inline authoring UX) is achievable entirely client-side by reusing the existing single-question creation endpoint. New sub-questions becoming independently visible/reusable in the bank immediately is also a desirable side effect of this approach, not just an artifact of it.

### 3. GROUP `maxScore` computed server-side from members, always

In `QuestionServiceImpl`, factor out:

```java
private int resolveMaxScore(Question question, QuestionRequest req) {
    if (question instanceof GroupQuestion gq) {
        return gq.getMembers().stream()
                .mapToInt(m -> m.getQuestion().getMaxScore())
                .sum();
    }
    return req.maxScore() != null ? req.maxScore() : 1;
}
```

- `create()`: call `resolveMaxScore` *after* `buildEntity(req)` (so `gq.getMembers()` is populated) instead of using `req.maxScore()` directly.
- `update()`: call `resolveMaxScore` after the entity's members are known (today, update doesn't touch GROUP members, so the existing persisted members are used as-is).

This makes `maxScore` for GROUP a derived, server-owned value — any client-supplied `maxScore` for `type=GROUP` is ignored. The FE simply omits `maxScore` from the GROUP payload (or may send it; it's ignored either way).

**Alternative considered**: compute the total only in the FE and continue trusting `req.maxScore()`. Rejected — this is exactly the drift the proposal is meant to eliminate; a server-side invariant guarantees correctness regardless of client version or direct API use.

## Risks / Trade-offs

- **[Risk]** Two-phase submit means new sub-questions can be persisted to the bank even if the subsequent GROUP creation fails (e.g. network error, validation failure on the GROUP step) → orphaned-but-valid standalone questions.
  **Mitigation**: These are not invalid or corrupt data — they are normal, reusable bank questions (exactly what would exist if the recruiter had pre-created them manually, which is today's only option). On GROUP-step failure, the form surfaces the error and keeps the recruiter's unsaved GROUP state (title/body/sub-question list, now with the new entries resolved to bank ids) so they can retry without re-entering data or duplicating the already-created sub-questions.

- **[Risk]** `forkJoin` of N parallel `POST /api/questions` calls — if some succeed and some fail, partial creation occurs.
  **Mitigation**: Acceptable per above; the form reports which sub-question(s) failed via the existing `error` signal so the recruiter knows what to fix and retry.

## Migration Plan

No schema or data migration required. `V16.2__fix_group_max_scores.sql` already brought existing GROUP rows in line with `SUM(member.maxScore)`; this change makes that the enforced invariant for all future create/update operations. No rollback considerations beyond a normal code revert.
