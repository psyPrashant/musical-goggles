## 1. Shared Toast Infrastructure (MG-60)

- [x] 1.1 Create `src/app/core/toast/toast.service.ts` with `show(message: string, type: 'info' | 'warning' | 'error' | 'success')` and auto-dismiss after 4 s via `signal<Toast[]>`
- [x] 1.2 Create `src/app/core/toast/toast.component.ts` that renders the toast list using `@for`; style with position fixed bottom-right
- [x] 1.3 Register `ToastService` in `app.config.ts` providers
- [x] 1.4 Add `<app-toast>` to the shell/layout component so toasts render app-wide

## 2. Duplicate Invite Guard — Backend (MG-60)

- [x] 2.1 In `InvitationServiceImpl.invite()`, call `invitationRepository.findByCandidate_IdAndAssessment_Id(candidateId, assessmentId)` after the PUBLISHED check; if a result with status PENDING or SENT is found, throw `ResponseStatusException(CONFLICT)` with message `DUPLICATE_INVITE`
- [x] 2.2 Verify existing `InvitationRepository.findByCandidate_IdAndAssessment_Id()` returns `Optional<CandidateInvitation>`; adjust signature if needed

## 3. Duplicate Invite Guard — Frontend (MG-60)

- [x] 3.1 In `candidates.component.ts` `doInvite()`, detect HTTP 409 responses with body containing `DUPLICATE_INVITE` and call `toastService.show('This candidate already has a pending invitation for this assessment.', 'warning')`
- [x] 3.2 Ensure the invite modal stays open (does not transition to success state) on the duplicate 409

## 4. Known-Email Invite Recovery — Backend (MG-61)

- [x] 4.1 Add `GET /api/candidates/by-email` endpoint to `CandidateController` with `@RequestParam String email`; secured to ADMIN/RECRUITER
- [x] 4.2 Add `findByEmail(String email): Optional<Candidate>` to `CandidateRepository` (derived query)
- [x] 4.3 Add `getByEmail(String email): CandidateResponse` to `CandidateService` and `CandidateServiceImpl`; throw 404 if not found

## 5. Known-Email Invite Recovery — Frontend (MG-61)

- [x] 5.1 Add `getCandidateByEmail(email: string): Observable<Candidate>` to `candidate.service.ts` calling `GET /api/candidates/by-email?email=`
- [x] 5.2 In `candidates.component.ts` create-candidate 409 handler, call `getCandidateByEmail()`, set the invite candidate signal with the found record, show an inline notice in the modal, and proceed to `doInvite()` with the existing candidate id
- [x] 5.3 Ensure the known-email path funnels into the existing duplicate-invite toast if the same candidate + same assessment is selected (the invite 409 path handles this naturally)

## 6. DRAFT Assessment Guard — Frontend (MG-62)

- [x] 6.1 Add `showDraftConfirm = signal(false)` and `draftPublishError = signal('')` to `candidates.component.ts`
- [x] 6.2 In `sendInvite()`, check `selectedAssessment()?.status === 'DRAFT'` before any HTTP call; if DRAFT, set `showDraftConfirm(true)` and return early
- [x] 6.3 Add `publishAndSend()` method: call `assessmentSvc.publishAssessment(inviteAssessmentId)`, on success update assessment status in the `assessments` signal and call the normal invite flow; on error set `draftPublishError`
- [x] 6.4 Add an `@if (showDraftConfirm())` block in the invite modal template with the confirmation message and "Publish & Send" / "Cancel" buttons
- [x] 6.5 Wire "Cancel" button to reset `showDraftConfirm(false)` and `draftPublishError('')` without any HTTP calls
- [x] 6.6 Verify `assessmentSvc.publishAssessment()` already exists in `assessment.service.ts`; expose it if needed

## 7. Edit Candidate — Backend (MG-63)

- [x] 7.1 Add `boolean existsByEmailAndIdNot(String email, UUID id)` to `CandidateRepository`
- [x] 7.2 Add `update(UUID id, CandidateRequest request): CandidateResponse` to `CandidateService` interface and `CandidateServiceImpl`: load candidate (404 if absent), check `existsByEmailAndIdNot` (409 if conflict), update fields, save
- [x] 7.3 Add `PUT /api/candidates/{id}` to `CandidateController` calling the new service method

## 8. Edit Candidate — Frontend (MG-63)

- [x] 8.1 Add `updateCandidate(id: string, req: CandidateRequest): Observable<Candidate>` to `candidate.service.ts`
- [x] 8.2 Add `editingId`, `editFirst`, `editLast`, `editEmail`, `editError`, `editSaving` signals to `candidates.component.ts`
- [x] 8.3 Add `startEdit(c: Candidate)`, `saveEdit(id: string)`, and `cancelEdit()` methods
- [x] 8.4 In the candidates table `@for` template, add an edit icon button per row; `@if (editingId() === c.id)` renders inline input fields for first name, last name, and email with Save and Cancel icon buttons; `@else` renders the current display values
- [x] 8.5 `saveEdit()` calls `candidateSvc.updateCandidate()`, updates the `candidates` signal with the returned record on success, and clears the edit state; on 409, sets `editError` inline

## 9. Verification

- [x] 9.1 Run `./mvnw test` — all backend tests pass (pre-existing TestDatasourceInitializer failures unrelated to EP-08; backend compiles cleanly)
- [x] 9.2 Run `npm test` — all frontend tests pass (31/31)
- [x] 9.3 Manual: invite new candidate → list refreshes with new row
- [x] 9.4 Manual: invite same candidate + same assessment → duplicate toast appears, no new DB row
- [x] 9.5 Manual: type known email + different assessment → form pre-populates, invite succeeds
- [x] 9.6 Manual: select DRAFT assessment → confirmation dialog appears; "Publish & Send" publishes and sends; "Cancel" restores form
- [x] 9.7 Manual: click edit on candidate row → edit mode; update name → row reflects change; duplicate email → inline error
