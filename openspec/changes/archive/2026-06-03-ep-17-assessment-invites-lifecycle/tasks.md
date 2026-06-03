## 1. Database Migration (MG-111)

- [x] 1.1 No DB migration needed — `candidate_invitations.status` is `VARCHAR(20)` with no CHECK constraint; `CANCELLED` is accepted by the DB as-is

## 2. Backend Domain (MG-111)

- [x] 2.1 Add `CANCELLED` to `InvitationStatus` enum

## 3. Cancel Invite — Backend (MG-111)

- [x] 3.1 Add `cancelInvitation(UUID invitationId)` to `InvitationService` interface
- [x] 3.2 Implement `cancelInvitation` in `InvitationServiceImpl` — load by id (404 if missing), guard only PENDING/SENT (400 otherwise), set status to CANCELLED, save
- [x] 3.3 Add `DELETE /api/invitations/{id}` to `InvitationController` returning 204 No Content

## 4. One-Active-Invite Constraint — Backend (MG-112)

- [x] 4.1 Add `countActiveInvitationsByCandidate(UUID candidateId)` query to `InvitationRepository` — counts PENDING+SENT rows for the candidate across all assessments
- [x] 4.2 Add global active-invite guard to `InvitationServiceImpl.invite()` — check before per-assessment duplicate check, throw 409 `ACTIVE_INVITE_EXISTS` if count > 0

## 5. Configurable Frontend URL — Backend (MG-114)

- [x] 5.1 `app.base-url` already exists in `application.yaml` as `http://localhost:4200` — no change needed
- [x] 5.2 Inject `@Value("${app.base-url}")` in `InvitationController`, use it as `baseUrl` instead of deriving from `HttpServletRequest`
- [x] 5.3 `ReminderServiceImpl` already uses `@Value("${app.base-url}")` — no change needed

## 6. Fix Pending Review Count — Backend (MG-113)

- [x] 6.1 Investigated `countPendingReviews` in `CandidateSubmissionRepository` — query is correct (SUBMITTED/AUTO_SUBMITTED with unscored answers); `DashboardServiceImpl` uses it correctly
- [x] 6.2 No query change needed — the existing query correctly counts pending reviews; stats refresh on page load

## 7. Cancel Invite — Frontend (MG-111)

- [x] 7.1 Add `cancelInvitation(id: string): Observable<void>` to `CandidateService` calling `DELETE /api/invitations/{id}`
- [x] 7.2 Add cancel button to history modal for PENDING invitations; added `CANCELLED` status badge styling
- [x] 7.3 Wire confirmation dialog before dispatch; on success updates invitation status to CANCELLED in the view

## 8. One-Active-Invite Error — Frontend (MG-112)

- [x] 8.1 In the invite form error handler, detect 409 with body `ACTIVE_INVITE_EXISTS` and display: "This candidate already has an active assessment link. Cancel it before sending a new one."
