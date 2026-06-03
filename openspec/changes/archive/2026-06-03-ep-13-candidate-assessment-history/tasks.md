## 1. Backend — DTO & Response Model

- [x] 1.1 Create `CandidateHistoryItemResponse` record with fields: `assessmentId`, `assessmentName`, `invitedAt`, `submissionId` (nullable), `status` (PENDING/SUBMITTED/AUTO_SUBMITTED/EXPIRED), `submittedAt` (nullable), `totalScore` (nullable), `markingStatus` (nullable), `linkedRole` (nullable, always null for now)

## 2. Backend — Service

- [x] 2.1 Add `getAssessmentHistory(UUID candidateId)` to `CandidateService` interface
- [x] 2.2 Implement in `CandidateServiceImpl`: load all invitations for candidate ordered by `createdAt` DESC; for each, look up submission via `invitationId`; compute status (`EXPIRED` if no submission and `expiresAt` is past, `PENDING` if no submission and not expired); batch-load answer scores for all found submissions and compute `totalScore` and `markingStatus`
- [x] 2.3 Return 404 if candidate not found

## 3. Backend — Controller

- [x] 3.1 Add `GET /api/candidates/{candidateId}/history` to `CandidateController`, secured to `ADMIN`/`RECRUITER`, returns `List<CandidateHistoryItemResponse>`

## 4. Backend — Repository

- [x] 4.1 Add `findByCandidateIdOrderByCreatedAtDesc(UUID candidateId)` to `InvitationRepository`
- [x] 4.2 Add `findByInvitationId(UUID invitationId)` to `CandidateSubmissionRepository` (if not already present)

## 5. Backend — Tests

- [x] 5.1 Unit test `CandidateServiceImpl.getAssessmentHistory` — candidate not found (404), pending invitation, expired invitation, completed + scored submission, completed + unscored submission
- [x] 5.2 Integration test `GET /api/candidates/{id}/history` — happy path returns list, 404 for unknown candidate, 401 without auth

## 6. Frontend — Model & Service

- [x] 6.1 Add `CandidateHistoryItem` interface to `candidate.model.ts` with fields: `assessmentId`, `assessmentName`, `invitedAt`, `submissionId`, `status`, `submittedAt`, `totalScore`, `markingStatus`, `linkedRole`
- [x] 6.2 Add `getHistory(candidateId: string): Observable<CandidateHistoryItem[]>` to `CandidateService`

## 7. Frontend — Candidates Component

- [x] 7.1 Add assessment history modal state signals: `showHistory`, `historyCandidate`, `historyItems`, `historyLoading`, `historyStatusFilter`, `historySortAsc`
- [x] 7.2 Add `openHistory(c: Candidate)` method — sets candidate, clears state, calls `getHistory()`, populates `historyItems`
- [x] 7.3 Add `historyFiltered` computed signal — filters by `historyStatusFilter` (All / Completed / Pending / Expired) and sorts by `invitedAt` (asc/desc via `historySortAsc`)
- [x] 7.4 Add "Assessment History" button (📋) to each candidate row in display mode, beside existing Edit and Invite buttons
- [x] 7.5 Add history modal template: header with candidate name, filter chips (All / Completed / Pending / Expired), sort toggle (Newest/Oldest), table of history entries
- [x] 7.6 Each history row shows: assessment name, status badge, date (submittedAt if completed, invitedAt otherwise), score ("Pending review" if FULLY_MARKED=false, numeric if marked, "—" if pending/expired), role context ("No linked role")
- [x] 7.7 Completed entries (SUBMITTED/AUTO_SUBMITTED) with a `submissionId` show a clickable link that navigates to `/results` with the submissionId as a query param (or fragment)
- [x] 7.8 Show "No assessment history recorded" when `historyFiltered()` is empty
- [x] 7.9 Add CSS for history modal rows, status badges, sort/filter controls

## 8. Frontend — Tests

- [x] 8.1 Unit test `CandidateService.getHistory` — verify `GET /api/candidates/{id}/history` is called, errors propagate
- [x] 8.2 Component test `CandidatesComponent` — `openHistory` populates `historyItems`; filter by Completed shows only submitted entries; sort toggle reverses order; empty history shows placeholder
