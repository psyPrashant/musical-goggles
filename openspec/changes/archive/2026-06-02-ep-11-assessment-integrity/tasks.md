## 1. Database Migration

- [x] 1.1 Write Flyway migration `V11__submission_flags.sql` — create `submission_flags` table (id, submission_id FK, reason, status, resolution_notes, created_by, created_at)
- [x] 1.2 Add `submission_flag_audit` table (id, flag_id FK, action, from_status, to_status, actor_user_id, actor_username, occurred_at)
- [x] 1.3 Add unique partial index on `submission_flags(submission_id)` WHERE `status IN ('FLAGGED','UNDER_REVIEW')`

## 2. Backend Domain & Repository

- [x] 2.1 Create `SubmissionFlag` JPA entity with `FlagStatus` enum (`FLAGGED`, `UNDER_REVIEW`, `RESOLVED`, `DISMISSED`) and `FlagReason` enum
- [x] 2.2 Create `SubmissionFlagAudit` JPA entity
- [x] 2.3 Create `SubmissionFlagRepository` and `SubmissionFlagAuditRepository` (Spring Data JPA)
- [x] 2.4 Add `flagStatus` projection field to `SubmissionListItem` DTO (nullable, open flag status)

## 3. Backend Service

- [x] 3.1 Create `SubmissionFlagService` with `createFlag(submissionId, reason, actor)` — enforces single open flag constraint (409 on duplicate)
- [x] 3.2 Implement `transitionFlag(submissionId, flagId, newStatus, resolutionNotes, actor)` — validates allowed transitions, requires `resolutionNotes` for RESOLVED/DISMISSED
- [x] 3.3 Implement `getAuditTrail(submissionId, flagId)` — returns audit entries ordered by `occurredAt` ASC
- [x] 3.4 Implement `getFlagsForCandidate(candidateId)` — returns all flags across submissions ordered by `createdAt` DESC
- [x] 3.5 Implement `getAllFlags(reason, assessmentId, fromDate, toDate)` — filterable listing ordered by `createdAt` DESC
- [x] 3.6 Write audit entry on every flag creation and status transition inside service

## 4. Backend REST Controllers

- [x] 4.1 `POST /api/submissions/{id}/flags` — create flag, secured to ADMIN/RECRUITER
- [x] 4.2 `PATCH /api/submissions/{id}/flags/{flagId}` — transition flag status
- [x] 4.3 `GET /api/submissions/{id}/flags/{flagId}/audit` — retrieve audit trail
- [x] 4.4 `GET /api/candidates/{id}/flags` — candidate flag history
- [x] 4.5 `GET /api/flags` — all flags with optional filter params (`reason`, `assessmentId`, `fromDate`, `toDate`)
- [x] 4.6 Update `GET /api/assessments/{id}/submissions` to include `flagStatus` field in each submission item

## 5. Backend Tests

- [x] 5.1 Unit test `SubmissionFlagService` — duplicate flag, invalid transition, missing resolution notes
- [x] 5.2 Integration test `POST /api/submissions/{id}/flags` — happy path, 409, 400 blank reason, 403 candidate
- [x] 5.3 Integration test flag status transitions — valid and invalid paths
- [x] 5.4 Integration test `GET /api/flags` with and without filters

## 6. Frontend — Submission Flagging

- [x] 6.1 Create `SubmissionFlagService` (Angular) calling the flag REST endpoints
- [x] 6.2 Add "Flag Submission" button + reason-input dialog on submission detail view
- [x] 6.3 Add flag status transition controls (Under Review / Resolve / Dismiss) with resolution notes input on submission detail
- [x] 6.4 Show "Flagged" badge on submission detail view when `flagStatus` is `FLAGGED` or `UNDER_REVIEW`
- [x] 6.5 Show "Flagged" badge on submission list rows when `flagStatus` is not null/open

## 7. Frontend — Flagged Submissions List Page

- [x] 7.1 Create `FlaggedSubmissionsComponent` at route `/flagged-submissions`
- [x] 7.2 Wire to `GET /api/flags` with filter controls (reason dropdown, assessment dropdown, date range)
- [x] 7.3 Add navigation link to flagged submissions page in sidebar/nav

## 8. Frontend — Audit Trail & Candidate Flag History

- [x] 8.1 Add read-only "Flag History" section to submission detail view (calls `GET /api/submissions/{id}/flags/{flagId}/audit`)
- [x] 8.2 Add "Flag History" section to candidate profile page (calls `GET /api/candidates/{id}/flags`)
- [x] 8.3 Show "No flags recorded" when list is empty on candidate profile

## 9. Frontend Tests

- [x] 9.1 Unit test `SubmissionFlagService` — verify HTTP calls and error handling
- [x] 9.2 Component test for flag dialog — reason required validation
- [x] 9.3 Component test for flagged submissions list — filter behaviour
