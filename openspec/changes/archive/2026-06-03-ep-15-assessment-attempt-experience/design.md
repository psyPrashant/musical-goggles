## Context

The existing `AssessmentTakeComponent` drops a candidate directly into a live assessment. The timer begins the moment the page loads, there is no orientation screen, and there is no controlled exit path — candidates who close the tab silently lose time with no warning. On the backend, `submitAssessment()` only creates answer records for questions the candidate actually touched; questions left unanswered produce no `CandidateAnswer` and no `AnswerScore`, leaving marking status perpetually `PENDING_REVIEW` even when there is nothing to mark.

The component already manages a submission-state machine (`IN_PROGRESS → SUBMITTED / AUTO_SUBMITTED`) and has a submit confirmation modal. The backend already has `MarkingService.autoMarkMcq()` called on every submit path.

## Goals / Non-Goals

**Goals:**
- Guide screen shown before timer starts; Start button is the only trigger for `IN_PROGRESS`.
- Browser native leave-warning (`beforeunload`) active during `IN_PROGRESS` phase only.
- Give Up action available during `IN_PROGRESS`; submits via existing endpoint as `AUTO_SUBMITTED`.
- Submit blocked or warned when zero questions answered.
- All unanswered questions receive `score=0, autoMarked=true` on every submit path.

**Non-Goals:**
- No full-screen lock or tab-switching detection (future epic).
- No new backend endpoint or HTTP status code changes.
- No changes to the submission status enum — Give Up reuses `AUTO_SUBMITTED`.
- No pagination or lazy loading of questions.
- No changes to how draft auto-save works.

## Decisions

### D1: Guide screen as a frontend `phase` state, not a separate route
**Decision**: Add a `phase = signal<'guide' | 'in-progress' | 'submitted'>('guide')` to `AssessmentTakeComponent`. The component loads the assessment data (existing `GET /api/take/assessment`) on init but stays on the guide screen until the candidate clicks Start.
**Rationale**: Avoids a new route and a second navigation event. The assessment data is needed on the guide screen anyway (title, time limit, question count). Timer is not started until `phase` transitions to `in-progress`.
**Alternative considered**: Separate `/take/guide/:id` route. Rejected — creates a navigation step that can be skipped by URL-manipulation; the server-side check (invitation status) is unchanged.

### D2: `beforeunload` listener scope
**Decision**: Register `window.addEventListener('beforeunload', handler)` in the `ngOnInit`/`afterNextRender` cycle only when `phase === 'in-progress'`, and remove it on `ngOnDestroy` or when phase transitions out of `in-progress`.
**Rationale**: The browser ignores the `returnValue` string in modern browsers and shows its own generic dialog — no custom message is needed. The listener must be removed on clean exit (submit, give up, guide screen) to avoid false positives.
**Alternative considered**: Angular router `CanDeactivate` guard. Rejected — `beforeunload` also covers hard closes/crashes; the guard only fires on Angular navigation.

### D3: Give Up reuses `AUTO_SUBMITTED` status
**Decision**: Give Up calls `POST /api/take/submit` with the existing `autoSubmitted=true` flag.
**Rationale**: Avoids a new submission status variant and a DB migration. `AUTO_SUBMITTED` already communicates "not voluntarily completed" to reviewers. A future improvement can add a `GIVEN_UP` status if distinction matters.

### D4: Zero-answer submit guard is frontend-only
**Decision**: Before showing the submit confirmation modal, check `answeredCount === 0`. If true, show a red-border warning variant of the modal with stronger copy ("You have not answered any questions — are you sure?"). The submit still goes through if confirmed.
**Rationale**: The backend has no concept of "minimum answers required" — that is a UX courtesy, not a business rule. A soft guard (warn, don't block) is safer than a hard block that could trap a candidate.

### D5: Unanswered-question auto-scoring at submit time
**Decision**: In `CandidateTakeServiceImpl.submitAssessment()`, after `autoMarkMcq()`, fetch all question IDs for the assessment, subtract those already answered (`CandidateAnswerRepository.findQuestionIdsBySubmissionId()`), and for each unanswered question create a `CandidateAnswer` (empty) and an `AnswerScore(score=0, autoMarked=true, feedback="Not answered")`.
**Rationale**: Marking status (`FULLY_MARKED` / `PENDING_REVIEW`) is computed by checking whether every assessment question has a score. Auto-inserting zero scores for blanks means the marking status resolves immediately without recruiter intervention.
**Alternative considered**: Compute marking status ignoring unanswered questions. Rejected — it makes the `FULLY_MARKED` flag unreliable and complicates the Results view.

## Risks / Trade-offs

- **[Risk] Timer starts on client** — a candidate could open DevTools and prevent `phase` from transitioning. → **Mitigation**: Server records `startedAt` from the first `saveAnswers` call (existing behaviour); the guide screen delay is cosmetic, not a security boundary.
- **[Risk] `beforeunload` may not fire** in all PWA/mobile browser scenarios. → **Mitigation**: Timer continues server-side regardless; the warning is best-effort UX.
- **[Risk] Duplicate zero scores on retry** — if `submitAssessment()` is called twice (network retry), score creation would fail on the unique constraint. → **Mitigation**: Wrap score insertion in a `findOrCreate` pattern or catch duplicate-key and continue; the idempotency of the zero-score insert is safe.
