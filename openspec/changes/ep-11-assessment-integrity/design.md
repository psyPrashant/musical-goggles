## Context

Submissions currently have no integrity tracking. Recruiters who notice suspicious behaviour (e.g. identical answers across candidates, unnaturally fast completions, probable AI-generated text) have nowhere to record it. This design introduces a lightweight manual flagging layer on top of the existing `CandidateSubmission` entity, with an audit trail and candidate-level history view.

The platform runs Spring Boot 4 / PostgreSQL on the backend and Angular 21 on the frontend. Existing submission infrastructure (`CandidateSubmission`, `SubmissionController`, `SubmissionService`) is the natural anchor point.

## Goals / Non-Goals

**Goals:**
- Store flag records and audit entries in PostgreSQL with FK to `candidate_submissions`
- Expose REST endpoints for flag CRUD and audit retrieval under `/api/submissions/{id}/flags`
- Show flag status, audit trail, and candidate flag history in the Angular SPA
- Restrict write actions (flag, update status) to `ROLE_ADMIN` and `ROLE_RECRUITER`

**Non-Goals:**
- Automated cheating detection (similarity scoring, tab-switch monitoring, AI detection) — manual foundation only
- Email notifications to candidates when flagged
- Bulk-flag operations across multiple submissions
- Public API for flag data

## Decisions

### 1. Separate `submission_flags` table (not a column on `candidate_submissions`)
A dedicated table supports the full flag lifecycle (status transitions, notes, multi-field audit) without widening the already large `candidate_submissions` row. It also makes querying all flags across assessments straightforward.

**Alternatives considered:** Adding `flag_status` + `flag_reason` columns directly to `candidate_submissions` — rejected because it doesn't support the audit trail or resolution notes natively.

### 2. Flag lifecycle: `FLAGGED` → `UNDER_REVIEW` → `RESOLVED` / `DISMISSED`
Three forward-only states map cleanly to the recruiter workflow (raise → investigate → close). `RESOLVED` means confirmed cheating; `DISMISSED` means no further action. Re-opening a closed flag is out of scope for this epic.

### 3. Audit entries written on every state change (not via DB trigger)
Audit rows are written in the service layer (`SubmissionFlagService`) rather than a DB trigger so that the acting user (`SecurityContextHolder`) is available without additional plumbing.

### 4. Single active flag per submission
Only one open flag (status `FLAGGED` or `UNDER_REVIEW`) is allowed per submission at a time. Attempting to create a second flag on an already-flagged submission returns HTTP 409. Historical closed flags are preserved.

**Alternatives considered:** Allow multiple concurrent flags — rejected for simplicity; multiple open flags create ambiguity in the UI badge.

### 5. Flag history on candidate profile via dedicated endpoint
`GET /api/candidates/{id}/flags` returns all flags (across all submissions) for that candidate. This avoids over-fetching on the candidate list and keeps the candidate profile load lightweight.

## Risks / Trade-offs

- **Risk: Audit table grows large** → Mitigation: Index on `submission_flag_id`; consider archiving old resolved entries in a future epic.
- **Risk: Concurrent flag creation race condition** → Mitigation: Unique partial index on `submission_flags(submission_id)` WHERE `status IN ('FLAGGED','UNDER_REVIEW')`.
- **Trade-off: No re-open flow** → Accepted for now; resolved flags can be re-flagged as a new flag if needed.

## Migration Plan

1. Flyway migration `V11__submission_flags.sql` — creates `submission_flags` and `submission_flag_audit` tables, adds the unique partial index.
2. No changes to existing tables; fully additive.
3. Rollback: drop both new tables (no data migration required for rollback).

## Open Questions

- Should `DISMISSED` flags still show a badge on the submission list, or only `FLAGGED`/`UNDER_REVIEW`? — Propose: show badge for all non-resolved/non-dismissed states only; dismissed hides the badge.
