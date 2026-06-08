## 1. MG-151: Fix Row Navigation Bug

- [x] 1.1 In `results.component.ts` change `queryParamMap.get('submissionId')` to `queryParamMap.get('submission')` (line ~689)

## 2. Backend — DB Migration & Candidate Entity

- [x] 2.1 Create Flyway migration `V{next}__add_candidate_flags.sql` adding `action_required BOOLEAN NOT NULL DEFAULT false` and `blacklisted BOOLEAN NOT NULL DEFAULT false` columns to `candidates` table
- [x] 2.2 Add `actionRequired` and `blacklisted` boolean fields to the `Candidate` JPA entity
- [x] 2.3 Update `CandidateResponse` record to include `boolean actionRequired` and `boolean blacklisted`

## 3. Backend — Contact Candidate Endpoint (MG-152)

- [x] 3.1 Create `ContactCandidateRequest` DTO with `subject: String` and `message: String`
- [x] 3.2 Add `contactCandidate(UUID candidateId, ContactCandidateRequest req)` method to `CandidateService` interface and `CandidateServiceImpl` — sends email via `JavaMailSender`, sets `actionRequired = true` on the candidate
- [x] 3.3 Add `POST /api/candidates/{id}/contact` endpoint to `CandidateController` calling the new service method
- [x] 3.4 Add invitation block check in invitation creation service: if `candidate.actionRequired == true`, throw 409 conflict

## 4. Backend — Blacklist Endpoint (MG-153)

- [x] 4.1 Create `BlacklistRequest` DTO with `blacklisted: boolean`
- [x] 4.2 Add `setBlacklisted(UUID candidateId, boolean blacklisted, boolean isAdmin)` method to `CandidateService` + impl — throws 403 if `blacklisted == false && !isAdmin`
- [x] 4.3 Add `PATCH /api/candidates/{id}/blacklist` endpoint to `CandidateController` with `@PreAuthorize` check for un-blacklist: `hasRole('ADMIN')` only when setting `false`
- [x] 4.4 Add invitation block check: if `candidate.blacklisted == true`, throw 409 conflict

## 5. Backend — Enrich FlagListItem (MG-152/153)

- [x] 5.1 Update `FlagListItemResponse` to include `UUID candidateId`, `boolean candidateBlacklisted`, `boolean candidateActionRequired`
- [x] 5.2 Update JPQL/query in `SubmissionFlagServiceImpl.getAllFlags()` to JOIN `Candidate` and project the new fields

## 6. Frontend — Models & Services

- [x] 6.1 Update `FlagListItem` interface to add `candidateId: string`, `candidateBlacklisted: boolean`, `candidateActionRequired: boolean`
- [x] 6.2 Add `contactCandidate(candidateId: string, req: {subject: string; message: string}): Observable<void>` to `CandidateService`
- [x] 6.3 Add `setBlacklist(candidateId: string, blacklisted: boolean): Observable<void>` to `CandidateService`

## 7. Frontend — Actions Dropdown UI (MG-152/153/154)

- [x] 7.1 In `flagged-submissions.component.ts` replace the bare "Dismiss" button cell with an actions dropdown trigger button
- [x] 7.2 Implement dropdown open/close state (signal `openDropdownId`) with click-outside close behaviour
- [x] 7.3 Add "View Result" option that triggers the existing routerLink navigation programmatically via `Router.navigate`
- [x] 7.4 Add "Contact Candidate" option: clicking toggles an inline form (`activeForm` signal) with subject input and message textarea; submit calls `candidateSvc.contactCandidate()` and shows success/error inline
- [x] 7.5 Add "Blacklist" / "Unblacklist" option: clicking calls `candidateSvc.setBlacklist()`; update `flags` signal on success; show inline error on 403 with "Admin approval required"
- [x] 7.6 Add "Resolve Flag" option (visible when status FLAGGED or UNDER_REVIEW): toggles inline resolution notes textarea; submit calls two-step `transitionFlag` to RESOLVED; removes row on success
- [x] 7.7 Keep "Dismiss" option (same logic as existing, now inside dropdown)
- [x] 7.8 Add dropdown and inline-form styles to the component's `styles` array

## 8. Testing

- [x] 8.1 Backend: Unit test `CandidateServiceImpl.contactCandidate()` — verify email sent and `actionRequired` set
- [x] 8.2 Backend: Unit test `CandidateServiceImpl.setBlacklisted()` — verify 403 for recruiter un-blacklist
- [x] 8.3 Backend: Integration test `PATCH /api/candidates/{id}/blacklist` with RECRUITER and ADMIN roles
- [x] 8.4 Frontend: Update `flagged-submissions.component.spec.ts` to verify dropdown renders, resolve/dismiss/contact/blacklist behaviours
