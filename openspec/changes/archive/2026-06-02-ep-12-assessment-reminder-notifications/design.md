## Context

The platform already sends invitation emails via `EmailServiceImpl` (plain-text, Spring Mail). Invitations have an `expiresAt` timestamp on `CandidateInvitation`. There is no scheduler infrastructure today — `@EnableScheduling` has not been enabled. The submission detail view (`results.component.ts`) already has a flag action with confirmation dialog that can be reused as a UI pattern.

## Goals / Non-Goals

**Goals:**
- Automated daily reminder to candidates with SENT invitations expiring within a configurable window (per assessment)
- Recruiter-triggered manual reminder from the submission detail view
- Reminder email reusing the candidate's existing invitation token (no new token generation)
- Persisted log of every reminder sent, visible on the submission detail view

**Non-Goals:**
- SMS or push notifications
- Recruiter-configurable email body/subject customisation
- Bulk reminder sending from a list view
- Retry logic for failed email sends

## Decisions

### 1. Reminder window configured on Assessment, not Invitation

**Decision**: Add `reminder_days_before` (INTEGER, nullable) to the `assessments` table.

**Rationale**: The window is a policy decision made when creating an assessment — it applies to all invitations for that assessment. Storing it per-invitation would require copying it at invite time and keeping it in sync. A null value means reminders are disabled for that assessment.

**Alternative considered**: Global application property — rejected because different assessments have different urgency levels.

### 2. Scheduler uses Spring `@Scheduled` (cron), not a job queue

**Decision**: A single `@Scheduled(cron = "0 0 8 * * *")` method in `ReminderServiceImpl`.

**Rationale**: The volume of reminders is low (one per pending candidate per day), Spring Scheduling is already on the classpath, and there is no existing job queue infrastructure. Adding Quartz or a queue would be over-engineering.

**Risk**: If the app restarts at exactly 8am the job may be skipped. Acceptable for this stage.

### 3. Reminder log (`reminder_send_log`) is append-only

**Decision**: Each call to `sendManualReminder` or `sendAutomatedReminders` inserts a new row; there is no update/delete.

**Rationale**: Audit log — recruiters need to see all communication history, including duplicates. Append-only prevents accidental data loss.

### 4. Manual reminder blocked for completed submissions, not for SENT invitations

**Decision**: Guard is on submission status (SUBMITTED or AUTO_SUBMITTED), not invitation status.

**Rationale**: A SENT invitation with no submission yet should still allow a reminder. The invitation may not have a submission record until the candidate starts. Blocking on submission completion is the correct semantic guard ("don't email someone who already finished").

### 5. Reminder email reuses existing invitation token

**Decision**: Build the assessment link using `invitation.invitationToken` — same as the original invitation email.

**Rationale**: Generating a new token would invalidate or complicate the existing token lifecycle. The original token is still valid until `expiresAt`.

## Risks / Trade-offs

- **Risk**: Automated job sends a reminder the same day as expiry → candidate gets email with very little time left.  
  **Mitigation**: `reminderDaysBeforeDeadline` is typically set to 1–3; recruiters configure this consciously.

- **Risk**: No deduplication guard on automated reminders — if the app crashes mid-run, it could send duplicates on restart.  
  **Mitigation**: Acceptable for now. A future improvement could check `reminder_send_log` for sends within the last 24h before sending again.

- **Risk**: `@EnableScheduling` affects all Spring beans — unintended side-effects if other scheduled tasks are added carelessly later.  
  **Mitigation**: Documented in code; `@Scheduled` methods are clearly isolated in `ReminderServiceImpl`.

## Migration Plan

1. Deploy V13 migration (`reminder_days_before` on assessments, `reminder_send_log` table)
2. Existing assessments get `reminder_days_before = null` (reminders disabled by default — no change in behaviour)
3. No rollback complexity — new table/column, no data transforms
