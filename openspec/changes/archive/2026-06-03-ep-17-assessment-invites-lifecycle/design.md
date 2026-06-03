## Context

The invitation lifecycle currently has no revocation path. Once sent, a token is valid until `expiresAt` (48 hours). The `InvitationStatus` enum has `PENDING`, `SENT`, `EXPIRED`, `COMPLETED` — no `CANCELLED`. The duplicate check in `InvitationServiceImpl` only guards against re-inviting for the same assessment, not any active invite globally. The dashboard `pendingReviews` stat calls a query counting invites without submissions instead of SUBMITTED answers without scores. The invite link is built from the servlet request (backend port 8080), not the frontend URL.

## Goals / Non-Goals

**Goals:**
- Allow staff to cancel PENDING or SENT invitations so the token is effectively invalidated
- Block sending a new invite to any candidate who already has a PENDING or SENT invite (any assessment)
- Correct the dashboard "Pending Review" count
- Decouple the invite link URL from the backend request — use a configurable frontend base URL

**Non-Goals:**
- Automated expiry job (EXPIRED status is set at read-time, not by scheduler — out of scope)
- Reissuing/extending a cancelled invitation
- Bulk cancel operations
- Notifying the candidate on cancellation

## Decisions

### 1. CANCELLED added to InvitationStatus; V15 migration widens the CHECK constraint

**Decision**: Add `CANCELLED` to the Java enum and widen the DB `CHECK` constraint in V15.

**Rationale**: The DB constraint explicitly lists allowed values. Adding a new status without widening it would fail at runtime when Hibernate tries to persist `CANCELLED`. A migration is the correct, versioned path.

**Alternative considered**: Use a soft-delete (`deleted_at` column). Rejected — the existing status field already encodes lifecycle state; a new value is semantically clear and consistent.

### 2. Cancel endpoint is `DELETE /api/invitations/{id}` → 204

**Decision**: HTTP DELETE returning 204 No Content.

**Rationale**: REST convention for cancellation/removal. 204 avoids needing a response body. The invitation record is retained in the DB (status=CANCELLED), so data is not destroyed.

**Guard**: Only PENDING or SENT can be cancelled; COMPLETED/EXPIRED/CANCELLED invitations return 400.

### 3. One-active-invite constraint checked globally, not per-assessment

**Decision**: A new repository query `countActiveInvitationsByCandidate` counts PENDING+SENT rows for the candidate across all assessments. If > 0, invite is rejected with `409 ACTIVE_INVITE_EXISTS`.

**Rationale**: The Jira story reads "a new assessment can only be sent after the previous one has been evaluated" — this is a global constraint. The existing per-assessment duplicate check (`DUPLICATE_INVITE`) is kept in addition for the case where the same assessment is re-invited after the first is resolved.

**Order of guards in `invite()`**:
1. Global active-invite check → `ACTIVE_INVITE_EXISTS`
2. Per-assessment duplicate check → `DUPLICATE_INVITE`
3. Assessment must be PUBLISHED

### 4. Frontend base URL via `app.frontend.base-url` config

**Decision**: Inject `@Value("${app.frontend.base-url}")` into `InvitationController` and remove the request-derived URL. Same property used by `ReminderServiceImpl`.

**Rationale**: The invite link points to the Angular SPA (port 4200 locally), not the Spring backend (port 8080). Deriving from `HttpServletRequest` always yields the backend port. A config property allows environment-specific overrides without code change.

**Default**: `http://localhost:4200` — matches local dev setup.

### 5. Pending Review count fix — query against submissions + answers

**Decision**: Replace the dashboard `pendingReviews` query with one that counts distinct SUBMITTED/AUTO_SUBMITTED submissions that have at least one `CandidateAnswer` with no corresponding `AnswerScore`.

**Rationale**: "Pending Review" semantically means "submitted work that a human still needs to mark." The current query counts invitations with no submission — completely different concept.

## Risks / Trade-offs

- **[Risk]** Cancelling an invitation while a candidate is mid-assessment: the candidate's in-progress submission still exists; when they try to save/submit, the token validation will fail (invitation is CANCELLED). → **Mitigation**: Acceptable behaviour — the recruiter deliberately revoked access. The in-progress submission is orphaned but not deleted.
- **[Risk]** The one-active-invite constraint blocks valid scenarios (e.g., recruiter accidentally sends, wants to cancel and re-send to different assessment). → **Mitigation**: Staff must first cancel the active invite, then send a new one. Sequence is: cancel → invite. This is the desired flow per MG-111 + MG-112 together.
- **[Risk]** V15 migration on existing DBs with a `CHECK` constraint using a string list. → **Mitigation**: The migration drops and re-adds the constraint — standard pattern used by V5.

## Migration Plan

1. Deploy V15 migration (`ALTER TABLE candidate_invitations` — drop/re-add CHECK constraint with CANCELLED)
2. Existing rows are unaffected (no CANCELLED rows yet)
3. No rollback complexity — additive constraint change; old code ignores the CANCELLED enum value if rolled back (rows stay CANCELLED in DB but are never written by old code)
