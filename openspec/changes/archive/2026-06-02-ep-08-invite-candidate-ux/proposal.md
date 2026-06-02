## Why

The candidate invitation flow has four UX gaps introduced by the EP-05/EP-06 implementation: duplicate invitations can be created silently, typing a known email in the invite form produces an unhelpful 409 error instead of proceeding, inviting to a DRAFT assessment fails with a generic error rather than offering a fix, and candidates cannot be corrected after creation. These gaps slow recruiters down and create dirty data.

## What Changes

- Introduce a duplicate-invite guard on the backend (`InvitationServiceImpl`) using the already-present but unused `findByCandidate_IdAndAssessment_Id()` repository method; surface the 409 as a toast in the UI.
- Add `GET /api/candidates/by-email` endpoint; use it in the invite form to silently pre-populate candidate details when an existing email is typed, avoiding the dead-end 409 error.
- Add a frontend-only DRAFT-assessment confirmation dialog that detects `status === 'DRAFT'` before the invite HTTP call and offers a "Publish & Send" shortcut.
- Add `PUT /api/candidates/{id}` endpoint and an inline edit UI in the candidates table so recruiters can correct names and email addresses.
- Add a minimal shared `ToastService` + `ToastComponent` to support non-blocking notification messages across the app.

## Capabilities

### New Capabilities

- `duplicate-invite`: Prevents creating duplicate invitations for the same candidate + assessment pair; returns 409 `DUPLICATE_INVITE` and shows a toast warning.
- `known-email-invite`: Recovers gracefully when the invite form email matches an existing candidate — looks up the candidate by email and proceeds with the invite for the selected (different) assessment.
- `draft-assessment-invite`: Detects a DRAFT assessment selection before sending the invite and presents an inline "Publish & Send" / "Cancel" confirmation dialog.
- `candidate-edit`: Allows recruiters to edit a candidate's first name, last name, and email address directly from the candidates list.

### Modified Capabilities

- `candidate-invitation`: The invite flow now enforces uniqueness per candidate+assessment pair and handles the known-email path. Existing WHEN/THEN scenarios for the happy-path invite are unchanged; new conflict scenarios are added.

## Impact

**Backend**
- `recruitment-be/src/main/java/com/psybergate/recruitment/invitation/InvitationServiceImpl.java` — duplicate check
- `recruitment-be/src/main/java/com/psybergate/recruitment/candidate/CandidateController.java` — new `by-email` endpoint + `PUT /{id}`
- `recruitment-be/src/main/java/com/psybergate/recruitment/candidate/CandidateService.java` + `CandidateServiceImpl.java` — new `findByEmail` + `update` methods
- `recruitment-be/src/main/java/com/psybergate/recruitment/repository/CandidateRepository.java` — new derived queries

**Frontend**
- `recruitment-fe/src/app/features/candidates/candidates.component.ts` — all invite-flow and edit-flow changes
- `recruitment-fe/src/app/core/candidate/candidate.service.ts` — new service methods
- `recruitment-fe/src/app/core/toast/` — new ToastService + ToastComponent (shared)
- `recruitment-fe/src/app/app.config.ts` — register ToastService
- Shell component — render `<app-toast>`
