## Context

Assessment passwords are currently stored only as a bcrypt hash (`access_password_hash`) — a one-way function. When a recruiter sends a candidate invite the system cannot recover the plain password from the hash, so the UI prompts the recruiter to re-enter it. This re-entered value is never validated against the hash, creating a window for human error: if the recruiter types the wrong password the candidate receives it in the invite email and cannot access the assessment.

The fix is to store the plain password at creation time so it can be retrieved automatically at invite time, removing the re-entry step entirely.

## Goals / Non-Goals

**Goals:**
- Store the plain-text assessment password at create/update time
- Automatically pass the stored plain password to the invite email — no recruiter re-entry
- Remove `plainPassword` from `InviteRequest` and the invite UI form

**Non-Goals:**
- Encrypting the stored plain password (deferred to a future security hardening ticket)
- Changing how the hash is used for access-gate verification at assessment start
- Migrating existing assessments to backfill `access_password` (existing assessments either have no password, or their hash remains valid for access; they simply will not include a password in future invite emails until updated)

## Decisions

**Decision: Store plain text, not an encrypted value**  
The simplest approach that unblocks the bug. Storing a symmetric-encrypted value would require key management infrastructure not yet in place. Since the password is already communicated to candidates in plain text via email, the confidentiality concern is about database exposure — acceptable for now, tracked as a follow-up.

**Decision: Add a new `access_password` column rather than reusing the hash column**  
The hash column is used by the assessment access-gate (`CandidateAssessmentAccess`) to verify passwords at runtime. Separating the plain storage from the hash keeps responsibilities clear and avoids any risk of confusing the two in queries.

**Decision: Drop `plainPassword` from `InviteRequest` entirely**  
Keeping it as an optional override would preserve the broken behaviour. Making the break clean ensures no existing caller can accidentally send the wrong password.

**Decision: No backfill migration**  
Existing assessments that have a password set will have a null `access_password` column. The invite service will pass `null` to `emailService.sendInvitation()` for those assessments — which already handles `null` gracefully (skips the password line in the email). Recruiters wishing to include the password in future emails can re-save the assessment, which will populate the column.

## Risks / Trade-offs

- **Plain-text storage**: The password sits unencrypted in the DB.  
  → Mitigation: Log a follow-up ticket for column-level encryption. Access is restricted by existing DB credentials.

- **Backfill gap**: Old password-protected assessments will omit the password from invite emails until re-saved.  
  → Mitigation: Document in release notes. Impact is low — only assessments created before this deploy are affected.

- **Breaking API change**: `POST /api/invitations` no longer accepts `plainPassword`.  
  → Mitigation: Frontend is updated atomically in the same change. No external consumers of this endpoint are known.

## Migration Plan

1. Deploy Flyway migration `V19__add_assessment_access_password.sql` — adds nullable column, no data loss.
2. Deploy backend — new column populated on next create/update of any assessment.
3. Deploy frontend — invite form no longer shows password input.
4. Rollback: drop `V19` migration column and revert code; `plainPassword` field returns to `InviteRequest`.
