## Why

A recruiter can currently send an assessment invite to a candidate who has already completed (SUBMITTED or AUTO_SUBMITTED) that same assessment. The existing duplicate-invite check only blocks invites when a PENDING or SENT invitation already exists — it does not look at the submission status, so a completed candidate can be re-invited.

## What Changes

- **BE:** In `InvitationServiceImpl.invite()`, add a pre-invite check: if a `CandidateSubmission` exists for the candidate + assessment with status `SUBMITTED` or `AUTO_SUBMITTED`, reject with HTTP 409 and error code `ASSESSMENT_ALREADY_COMPLETED`
- **FE:** In `candidates.component.ts` invite modal, handle the new `ASSESSMENT_ALREADY_COMPLETED` error code with a toast message; additionally, grey out / disable assessments already completed by the candidate in the assessment picker

## Capabilities

### New Capabilities

_(none — this extends existing duplicate-invite handling)_

### Modified Capabilities

- `duplicate-invite`: Add requirement that blocks invites when the candidate has an existing completed submission for the assessment (SUBMITTED or AUTO_SUBMITTED), distinct from the existing PENDING/SENT check

## Impact

- **Backend:** `InvitationServiceImpl` — one new guard; `CandidateSubmissionRepository` — one new query method
- **Frontend:** `candidates.component.ts` — error handling for new code; assessment picker disabled state for completed assessments
- **No breaking changes** — new error code is additive
