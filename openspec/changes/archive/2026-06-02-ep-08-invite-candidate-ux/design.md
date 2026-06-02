## Context

EP-05 shipped the candidate invitation flow. Four rough edges were left unaddressed:

1. `InvitationServiceImpl.invite()` does not check whether a PENDING/SENT invitation already exists for the candidate + assessment pair. `InvitationRepository.findByCandidate_IdAndAssessment_Id()` exists but is never called, so duplicate rows can accumulate silently.
2. When the invite form email belongs to an existing candidate, `POST /api/candidates` returns HTTP 409. The frontend treats this as a dead-end error instead of routing to the existing candidate record.
3. Inviting to a DRAFT assessment fails silently in the UI (the backend correctly returns 400 but the frontend shows a generic error). Recruiters have no path forward without leaving the page.
4. Candidates cannot be corrected after creation — no `PUT /api/candidates/{id}` endpoint exists.

Stack: Spring Boot 4, Angular 21 signals, PostgreSQL. No external state management or shared component library.

## Goals / Non-Goals

**Goals:**
- Surface duplicate-invite conflicts as user-facing feedback (toast), not silent duplicates
- Recover gracefully from a known-email conflict by pre-populating the invite form
- Let recruiters publish a DRAFT assessment inline, without leaving the invite modal
- Allow name and email edits on existing candidates with conflict detection

**Non-Goals:**
- Bulk invite or CSV import
- Resending/cancelling existing invitations (future scope)
- Invite expiry management
- Role-level visibility restrictions on candidate data

## Decisions

**Decision 1: Duplicate check on the backend, not just the frontend**

The duplicate guard lives in `InvitationServiceImpl`, not solely as a FE check. Rationale: the FE state could be stale (another recruiter sent an invite in a different tab); a backend check is the authoritative source of truth. The existing repository method makes the implementation trivial.

*Alternatives considered:* FE-only check (stale-state risk), unique DB constraint on `(candidate_id, assessment_id)` (would require a migration and catches only the DB layer, not business logic around PENDING vs SENT status).

**Decision 2: Dedicated `GET /api/candidates/by-email` endpoint for known-email recovery**

Rather than returning the candidate in the 409 body of `POST /api/candidates`, a separate lookup endpoint is added. Rationale: keeps `POST` semantics clean (409 = conflict, no body payload to parse); the FE can call the lookup only when it needs to. Endpoint is secured (ADMIN/RECRUITER) — candidates are not publicly searchable by email.

*Alternatives considered:* Return candidate data in the 409 response body — non-standard and couples error handling to resource representation.

**Decision 3: DRAFT assessment guard is frontend-only**

The backend already returns 400 when inviting to a DRAFT assessment. No backend change is needed. The FE checks `assessment.status === 'DRAFT'` before the HTTP call and presents the confirmation dialog. The "Publish & Send" action calls the existing `PUT /api/assessments/{id}/publish` endpoint, then retries the invite.

*Alternatives considered:* New backend endpoint `POST /api/invitations/publish-and-invite` — unnecessary coupling; the two-step FE flow is transparent and auditable.

**Decision 4: Inline edit in the candidates table row (not a separate modal)**

Editing in-place keeps the recruiter oriented in the list. An `editingId` signal controls which row shows input fields; only one row edits at a time. The pattern matches common table-edit conventions and avoids an additional route or modal component.

*Alternatives considered:* Edit modal — adds an extra interaction layer for a simple name/email change. Separate edit page — unnecessary for three fields.

**Decision 5: Shared ToastService (minimal implementation)**

A lightweight `ToastService` injectable with `show(message, type)` is added to `src/app/core/toast/`. It manages a `signal<Toast[]>` and auto-dismisses after 4 seconds. This avoids installing a third-party library for one use case while remaining extensible.

*Alternatives considered:* Inline error banners only — inconsistent UX across different error types. Angular CDK snack bar — external dependency heavier than needed.

## Risks / Trade-offs

- **Race condition on duplicate check:** Two simultaneous invite calls for the same candidate + assessment could both pass the guard and create duplicates. Mitigation: add a `UNIQUE` constraint on `(candidate_id, assessment_id)` in a follow-up migration (V10+ scope); the current guard covers the common case.
- **DRAFT publish side-effect:** Clicking "Publish & Send" publishes the assessment for all future candidates. Recruiters should understand the consequence. Mitigation: confirmation dialog copy is explicit ("This will publish the assessment and make it visible to all recruiter actions").
- **Email as lookup key:** `GET /api/candidates/by-email` is a data exposure endpoint. Mitigation: secured behind ADMIN/RECRUITER role; email must be typed by the recruiter who already knows it.

## Migration Plan

1. Deploy backend changes (`InvitationServiceImpl` duplicate check + `CandidateController` new endpoints) — backward compatible.
2. Deploy frontend changes (toast, form recovery, DRAFT guard, inline edit) — no DB migrations required.
3. Verify: E2E tests for each new scenario before merging to main.
