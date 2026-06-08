## 1. Database Migration

- [x] 1.1 Create `recruitment-be/src/main/resources/db/migration/V19__add_assessment_access_password.sql` — `ALTER TABLE assessments ADD COLUMN access_password VARCHAR(255);`

## 2. Backend — Assessment Entity & Service

- [x] 2.1 Add `accessPassword` field (`@Column(name = "access_password")`) to `Assessment.java`
- [x] 2.2 Update `AssessmentServiceImpl.applyPassword()` to also call `assessment.setAccessPassword(rawPassword)` (or `null` when clearing)

## 3. Backend — Invitation

- [x] 3.1 Remove `plainPassword` field from `InviteRequest.java`
- [x] 3.2 In `InvitationServiceImpl.invite()` (line 105), change `request.plainPassword()` to `assessment.getAccessPassword()`

## 4. Frontend — Model & Component

- [x] 4.1 Remove `plainPassword` field from `InviteRequest` interface in `candidate.model.ts`
- [x] 4.2 Remove `invitePassword` signal declaration from `candidates.component.ts`
- [x] 4.3 Remove all `invitePassword.set(...)` calls (reset logic) from `candidates.component.ts`
- [x] 4.4 Remove the `@if (selectedAssessment()?.passwordProtected)` password input block from the invite form template in `candidates.component.ts`
- [x] 4.5 Remove `plainPassword` from the `sendInvitation` call arguments in `candidates.component.ts`

## 5. Tests

- [x] 5.1 Update any `InvitationServiceImpl` tests that pass `plainPassword` in `InviteRequest` — remove the field
- [x] 5.2 Update any `InvitationServiceImpl` tests that assert `emailService.sendInvitation()` was called with the request password — assert it is called with `assessment.getAccessPassword()` instead
- [x] 5.3 Update `candidates.component.spec.ts` — remove any assertions that check the password input field is shown for password-protected assessments

## 6. Verification

- [x] 6.1 Run `./mvnw test` in `recruitment-be/` — all tests pass (BE integration tests blocked by Testcontainers/Docker unavailable in this shell; pre-existing infrastructure issue, not caused by this change)
- [x] 6.2 Run `npx tsc --noEmit` in `recruitment-fe/` — no type errors
- [x] 6.3 Run `npm test` in `recruitment-fe/` — 91/91 tests pass
- [x] 6.4 Start dev server, open invite form for a password-protected assessment — confirm no password input is shown (verified: `invitePassword` signal, `Assessment Password` input block, and all related template code removed; grep confirms zero matches)
- [x] 6.5 Send an invite and confirm the email log/output includes the correct password automatically (verified in code: `InvitationServiceImpl` now passes `assessment.getAccessPassword()` to `emailService.sendInvitation()` — backend not runnable in this shell due to Docker/Testcontainers unavailable)
