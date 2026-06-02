## Why

Candidates frequently miss their assessment deadlines because a single invitation email gets lost or forgotten. Adding configurable automated reminders and a recruiter-triggered manual nudge reduces drop-off without requiring recruiters to track deadlines manually.

## What Changes

- Add `reminder_days_before` configuration field to `Assessment` so each assessment can define its own reminder window (null = disabled)
- Introduce a `reminder_send_log` table to persist every reminder sent (automated or manual) against an invitation
- Add a `ReminderService` with a scheduled daily job that fires reminder emails to candidates with incomplete submissions within the configured window
- Add a "Send Reminder" action on the submission detail view for recruiters to trigger a manual reminder
- Extend `EmailServiceImpl` with a `sendReminder()` method using the candidate's original invitation token
- Expose `POST /api/invitations/{id}/reminders` (send) and `GET /api/invitations/{id}/reminders` (history) REST endpoints
- Display read-only reminder send history on the submission detail view

## Capabilities

### New Capabilities

- `assessment-reminder`: Automated and manual reminder email sending for incomplete assessment submissions — includes configurable trigger window on Assessment, ReminderService (scheduled + manual), email template, and REST endpoints
- `reminder-send-history`: Logging every reminder sent (type, sender, timestamp) and exposing that history on the submission detail view in the frontend

### Modified Capabilities

<!-- No existing spec-level requirements are changing -->

## Impact

- **Backend**: `Assessment` entity/table, `CandidateInvitation` repository (new query), new `ReminderSendLog` entity/repository, `EmailServiceImpl`, new `ReminderService`/`ReminderController`, `RecruitmentApplication` (add `@EnableScheduling`)
- **Database**: Flyway migration V13 (new column + new table)
- **Frontend**: `results.component.ts` (Send Reminder button + confirmation dialog + history section), API service
- **Dependencies**: Spring Scheduling (already on classpath via Spring Boot)
