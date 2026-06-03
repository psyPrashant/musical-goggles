## 1. Backend — Repository

- [x] 1.1 Add `findQuestionIdsBySubmissionId(UUID submissionId): Set<UUID>` to `CandidateAnswerRepository` (returns IDs of questions that already have an answer for this submission)
- [x] 1.2 Verify `AnswerScoreRepository.save()` is usable for bulk insert (no new method needed if `saveAll` already exists)

## 2. Backend — Service

- [x] 2.1 In `CandidateTakeServiceImpl.submitAssessment()`, after `autoMarkMcq()`, fetch all question IDs for the assessment via `AssessmentQuestionRepository`
- [x] 2.2 Compute the set of unanswered question IDs (all question IDs minus answered IDs from task 1.1)
- [x] 2.3 For each unanswered question ID, create a `CandidateAnswer` (empty text, no selected options, `isDraft=false`) and save it
- [x] 2.4 For each created answer, create an `AnswerScore(score=0, autoMarked=true, feedback="Not answered")` and save it
- [x] 2.5 Guard against duplicate insert: skip creation if an `AnswerScore` already exists for the question (handles retry/double-submit)

## 3. Backend — Tests

- [x] 3.1 Unit test: `submitAssessment()` with one unanswered question — verify `CandidateAnswer` and `AnswerScore(score=0)` are created
- [x] 3.2 Unit test: `submitAssessment()` with all questions answered — verify no zero-score records are created
- [x] 3.3 Unit test: `submitAssessment()` called twice (retry) — verify no duplicate scores, idempotent
- [x] 3.4 Integration test: submit assessment → verify result endpoint returns `FULLY_MARKED` when all questions are MCQ or unanswered

## 4. Frontend — Guide Screen

- [x] 4.1 Add `phase = signal<'guide' | 'in-progress' | 'submitted'>('guide')` to `AssessmentTakeComponent`
- [x] 4.2 On component init, load the assessment as before; keep `phase` as `'guide'` unless `submission.status === 'IN_PROGRESS'` (returning candidate skips guide)
- [x] 4.3 Add `startAssessment()` method: set `phase` to `'in-progress'` and start the countdown timer
- [x] 4.4 Add guide screen template block (`@if phase() === 'guide'`): show assessment title, time limit, question count, four rules bullet points, and a "Start Assessment" primary button
- [x] 4.5 Wrap existing question view in `@if phase() === 'in-progress'` (was always shown before)
- [x] 4.6 Add CSS for guide screen card (centred, max-width ~560px, consistent with existing component theming)

## 5. Frontend — beforeunload Listener

- [x] 5.1 Register `window.addEventListener('beforeunload', onBeforeUnload)` when `phase` transitions to `'in-progress'`
- [x] 5.2 Set `event.preventDefault()` and `event.returnValue = ''` inside the handler (triggers native browser dialog)
- [x] 5.3 Remove the listener in `ngOnDestroy` and when `phase` transitions to `'submitted'` or `'guide'`

## 6. Frontend — Give Up Button & Modal

- [x] 6.1 Add `showGiveUpModal = signal(false)` to the component
- [x] 6.2 Add "Give Up" button to the assessment header (alongside the existing Submit button); styled as a secondary/danger variant
- [x] 6.3 Add Give Up confirmation modal template (`@if showGiveUpModal()`): title "Give up this attempt?", body copy, Cancel and Confirm buttons
- [x] 6.4 Add `confirmGiveUp()` method: call `takeService.submitAssessment()` with `autoSubmitted=true`, then set `phase` to `'submitted'` and remove `beforeunload` listener
- [x] 6.5 Add `cancelGiveUp()` method: set `showGiveUpModal` to `false`

## 7. Frontend — Zero-Answer Submit Guard

- [x] 7.1 In the existing `openSubmitModal()` method, check if `answeredCount() === 0`
- [x] 7.2 Add `zeroAnswerWarning = signal(false)` to track the guard state
- [x] 7.3 Set `zeroAnswerWarning(true)` when submit is triggered with zero answers
- [x] 7.4 In the submit confirmation modal template, show a prominent red warning block when `zeroAnswerWarning()` is true: "You have not answered any questions. Are you sure you want to submit?"
- [x] 7.5 Ensure the Confirm button still submits regardless of `zeroAnswerWarning` state

## 8. Frontend — Tests

- [x] 8.1 Component spec: guide screen is shown on init when no in-progress submission; clicking Start transitions to in-progress
- [x] 8.2 Component spec: returning candidate with IN_PROGRESS submission skips guide screen
- [x] 8.3 Component spec: `beforeunload` listener is added on transition to in-progress and removed on submit
- [x] 8.4 Component spec: Give Up modal opens on button click; confirm triggers submit service; cancel closes modal
- [x] 8.5 Component spec: zero-answer guard shows warning in submit modal when `answeredCount` is 0; not shown when at least 1 answer exists
