## 1. Backend — GROUP maxScore computed from members

- [x] 1.1 In `QuestionServiceImpl`, add a `private int resolveMaxScore(Question question, QuestionRequest req)` helper: returns `SUM(member.getQuestion().getMaxScore())` when `question instanceof GroupQuestion`, otherwise `req.maxScore() != null ? req.maxScore() : 1`
- [x] 1.2 In `create()`, call `resolveMaxScore` after `buildEntity(req)` (so GROUP members are populated) instead of using `req.maxScore()` directly
- [x] 1.3 In `update()`, call `resolveMaxScore` using the entity's existing members for GROUP questions, instead of `req.maxScore()`
- [x] 1.4 Add/update unit tests in the question service test suite: creating a GROUP with members of maxScore 2/3/5 yields `maxScore=10` regardless of `req.maxScore()`; updating a non-GROUP question still honors `req.maxScore()`

## 2. Frontend — unify sub-question list model

- [x] 2.1 In `question-form.component.ts`, replace the `memberQuestions` signal with a `subQuestionEntries` signal of a discriminated union type `{ source: 'bank'; question: Question } | { source: 'new'; draft: NewSubQuestionDraft }`
- [x] 2.2 Define `NewSubQuestionDraft` (type, title, body, maxScore, options, languageHint) matching the standalone `QuestionRequest` shape for MCQ/TEXT/CODE_SUBMISSION
- [x] 2.3 Update `addMember()` to push a `{ source: 'bank', question }` entry onto `subQuestionEntries`; update `filteredBank()` to exclude ids already present among `'bank'` entries
- [x] 2.4 Replace `removeMember(id)` with `removeEntry(index)` that splices `subQuestionEntries`
- [x] 2.5 Add a `totalPoints = computed(...)` signal summing `maxScore` across all `subQuestionEntries` (`question.maxScore` for `'bank'`, `draft.maxScore` for `'new'`)
- [x] 2.6 Update the ≥2 sub-questions validation (`memberError`) to check `subQuestionEntries().length`

## 3. Frontend — inline "create new sub-question" mini-form

- [x] 3.1 Add a mini `FormGroup` for the new-sub-question draft: type selector (MCQ / Text / Code Submission only — no Group), title, body, points, MCQ options `FormArray` (reuse `makeOption`/`addOption`/`removeOption`/`markCorrect` patterns), language hint (CODE_SUBMISSION only)
- [x] 3.2 Add an "Add sub-question" button that validates the mini-form (MCQ: ≥2 options, exactly 1 correct; title/body required), and on success pushes `{ source: 'new', draft }` onto `subQuestionEntries` and resets the mini-form
- [x] 3.3 Render the unified `subQuestionEntries` list: existing bank-row presentation for `'bank'` entries, plus a "New" badge and the draft's title/type for `'new'` entries; both removable via `removeEntry(index)`

## 4. Frontend — Points field / Total points display

- [x] 4.1 Wrap the existing "Points (max score)" field in `@if (form.get('type')?.value !== 'GROUP')`
- [x] 4.2 Add a read-only "Total points" display (shown only when type is GROUP) bound to the `totalPoints` computed signal

## 5. Frontend — two-phase submit for GROUP

- [x] 5.1 In `submit()` for `type === 'GROUP'`, partition `subQuestionEntries()` into `'new'` drafts and `'bank'` questions while preserving order
- [x] 5.2 Build `forkJoin` of `svc.createQuestion(draft)` calls for each `'new'` entry; on success, map each response `id` back into its original position
- [x] 5.3 Construct `memberQuestionIds` from the combined ordered list (`'bank'` entry ids + newly-created ids) and submit `POST /api/questions` for the GROUP as today (omit `maxScore`, since the backend now ignores/recomputes it for GROUP)
- [x] 5.4 On failure of either phase, set `error` with a descriptive message and leave `subQuestionEntries`/form fields intact for retry; if some `'new'` entries were already created successfully before a failure, replace those entries in `subQuestionEntries` with `'bank'` entries referencing their new ids so retry does not recreate them

## 6. Styling

- [x] 6.1 Add a `.new-badge` style for inline-authored sub-question entries
- [x] 6.2 Add styles for the inline "create new sub-question" mini-form section (consistent with existing `.bank-picker` / `.field` styling)
- [x] 6.3 Add a `.total-points` read-only display style

## 7. Verification

- [ ] 7.1 `cd recruitment-be && ./mvnw test` — backend tests pass, including new GROUP maxScore tests (blocked locally: Testcontainers cannot reach Docker on this machine; `./mvnw -q compile test-compile` succeeds)
- [x] 7.2 `cd recruitment-fe && npx tsc --noEmit` — no type errors
- [x] 7.3 `cd recruitment-fe && npm test` — no regressions
- [x] 7.4 Manual: `npm start`, create a GROUP question using only inline-authored sub-questions (2+, mixed types incl. MCQ) — verify it saves, the new sub-questions appear individually in the bank, and the GROUP's "X pts total" equals the sum
- [x] 7.5 Manual: create a GROUP using a mix of bank-picked and inline-authored sub-questions — verify order, "New" badges, and computed total are correct
- [x] 7.6 Manual: attempt to submit a GROUP with only 1 combined sub-question — verify the existing validation error still appears
