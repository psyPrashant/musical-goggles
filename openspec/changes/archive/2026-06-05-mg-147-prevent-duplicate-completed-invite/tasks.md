## 1. Backend — Submission Repository Query

- [x] 1.1 Add `existsByStatusIn(UUID candidateId, UUID assessmentId, List<SubmissionStatus> statuses): boolean` (or equivalent) to `CandidateSubmissionRepository` — query for the existence of a submission for the given candidate + assessment with status in `[SUBMITTED, AUTO_SUBMITTED]`

## 2. Backend — Invitation Guard

- [x] 2.1 In `InvitationServiceImpl.invite()`, before the existing PENDING/SENT duplicate check, add: if `submissionRepository.existsCompleted(candidateId, assessmentId)` → throw `AssessmentAlreadyCompletedException` (HTTP 409, ASSESSMENT_ALREADY_COMPLETED)
- [x] 2.2 Write integration test: invite to completed assessment returns 409 with `ASSESSMENT_ALREADY_COMPLETED`
- [x] 2.3 Write integration test: invite to in-progress (NOT_STARTED/IN_PROGRESS) assessment is not blocked by the completion check

## 3. Frontend — Invite Modal Error Handling

- [x] 3.1 In `candidates.component.ts` `_doInviteFlow()` / `sendInvite()` error handler, add case for error code `ASSESSMENT_ALREADY_COMPLETED` → show toast "This candidate has already completed this assessment."

## 4. Frontend — Disable Completed Assessments in Picker

- [x] 4.1 When the invite modal opens, ensure candidate history is loaded (it already is via `loadHistory()`); derive a `completedAssessmentIds` set from history items where `status === 'SUBMITTED' || status === 'AUTO_SUBMITTED'`
- [x] 4.2 In the assessment selection list, bind `[disabled]` or a `completed` CSS class to items whose `id` is in `completedAssessmentIds`; prevent selection on click

## 5. Verification

- [x] 5.1 Run `./mvnw test -Dtest=InvitationControllerIntegrationTest` — 3/3 tests pass
- [x] 5.2 Run `npx tsc --noEmit` in `recruitment-fe/` — no type errors
