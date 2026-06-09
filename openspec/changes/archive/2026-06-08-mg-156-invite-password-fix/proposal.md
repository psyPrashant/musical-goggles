## Why

When sending a candidate an invite for a password-protected assessment, the recruiter is prompted to manually re-enter the password that was already set on the assessment. Because this re-entry is never validated against the stored hash, a recruiter who misremembers or mistypes will send the candidate the wrong password — leaving the candidate unable to access the assessment.

## What Changes

- The `Assessment` entity and DB schema gain a new `access_password` column that stores the plain-text password alongside the existing bcrypt hash.
- `AssessmentServiceImpl.applyPassword()` is updated to persist the plain password as well as the hash.
- `InviteRequest` DTO drops the `plainPassword` field entirely (**BREAKING** for any API callers passing that field).
- `InvitationServiceImpl.invite()` reads the password from the assessment entity rather than from the request.
- The invite UI form removes the manual password input field for password-protected assessments.

## Capabilities

### New Capabilities

_(none — this is a bug fix, no new capabilities introduced)_

### Modified Capabilities

- `known-email-invite`: The invite flow no longer accepts a caller-supplied `plainPassword`; the correct password is auto-attached from the assessment. The spec requirement for how the password reaches the candidate email changes.
- `draft-assessment-invite`: Same — draft-invite flow is affected by the same `InviteRequest` contract change.

## Impact

- **Backend**
  - New Flyway migration `V19__add_assessment_access_password.sql`
  - `Assessment` JPA entity (`domain/Assessment.java`)
  - `AssessmentServiceImpl` (`assessment/AssessmentServiceImpl.java`)
  - `InviteRequest` record (`invitation/dto/InviteRequest.java`)
  - `InvitationServiceImpl` (`invitation/InvitationServiceImpl.java`)
- **Frontend**
  - `InviteRequest` TypeScript model (`core/candidate/candidate.model.ts`)
  - `candidates.component.ts` — remove `invitePassword` signal and password input block
- **API contract**: `POST /api/invitations` no longer accepts `plainPassword` in the request body
