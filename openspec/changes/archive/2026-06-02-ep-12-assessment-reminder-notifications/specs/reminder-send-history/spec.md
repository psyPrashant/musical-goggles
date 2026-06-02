## ADDED Requirements

### Requirement: Reminder sends are logged
Every reminder email sent (automated or manual) SHALL be recorded in `reminder_send_log` with: invitation ID, `sent_at` timestamp, `send_type` (AUTOMATED or MANUAL), and `sent_by` (user ID for manual sends, null for automated).

#### Scenario: Automated reminder logged
- **WHEN** the scheduled job sends a reminder email
- **THEN** a `reminder_send_log` row is inserted with `send_type = AUTOMATED` and `sent_by = null`

#### Scenario: Manual reminder logged
- **WHEN** a recruiter triggers a manual reminder
- **THEN** a `reminder_send_log` row is inserted with `send_type = MANUAL` and `sent_by` equal to the authenticated user's ID

---

### Requirement: Recruiter can view reminder history for a submission
The submission detail view SHALL display a read-only list of all reminders sent for that submission's invitation, ordered by most recent first.

#### Scenario: History shows all reminder sends
- **WHEN** a recruiter opens the submission detail view
- **THEN** they see a "Reminder History" section listing each reminder with send type badge (Automated / Manual), sender name (or "System" for automated), and sent-at timestamp

#### Scenario: Empty history
- **WHEN** no reminders have been sent for the submission
- **THEN** the Reminder History section shows an empty state (e.g., "No reminders sent yet")

#### Scenario: History is read-only
- **WHEN** a recruiter views the Reminder History section
- **THEN** there are no edit, delete, or modify controls — the list is purely informational

---

### Requirement: Reminder history endpoint is available via REST API
The system SHALL expose `GET /api/invitations/{invitationId}/reminders` returning an ordered list of reminder log entries for authenticated recruiters and admins.

#### Scenario: Successful history retrieval
- **WHEN** an authenticated recruiter calls `GET /api/invitations/{id}/reminders`
- **THEN** the response is HTTP 200 with a JSON array of `{ id, sentAt, sendType, sentBy }` objects ordered by `sentAt` descending

#### Scenario: Unauthenticated access denied
- **WHEN** an unauthenticated caller requests the reminder history
- **THEN** the response is HTTP 401
