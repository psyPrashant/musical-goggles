## Purpose
Automated and manual reminder emails for candidates with outstanding assessment invitations, reducing drop-off by prompting candidates before their deadline expires.
## Requirements
### Requirement: Assessment has configurable reminder window
An assessment SHALL have an optional `reminderDaysBeforeDeadline` field (integer, nullable). When null, automated reminders are disabled for that assessment. When set, it defines how many days before `expiresAt` the automated reminder is triggered.

#### Scenario: Reminder window is null by default
- **WHEN** an assessment is created without specifying `reminderDaysBeforeDeadline`
- **THEN** the field is null and no automated reminders will be sent for that assessment

#### Scenario: Reminder window is set to a positive integer
- **WHEN** a recruiter sets `reminderDaysBeforeDeadline` to N on an assessment
- **THEN** candidates with incomplete submissions will receive an automated reminder N days before their invitation expires

---

### Requirement: Automated reminder job runs daily
The system SHALL run a scheduled job once per day (08:00 server time) that identifies and emails all candidates whose invitations meet the reminder criteria.

#### Scenario: Candidate with incomplete submission within reminder window
- **WHEN** it is 08:00 and a candidate's invitation has status=SENT, `expiresAt` is within `reminderDaysBeforeDeadline` days from now, and their submission is not SUBMITTED or AUTO_SUBMITTED
- **THEN** the system sends a reminder email to the candidate and records the send in `reminder_send_log` with `send_type = AUTOMATED`

#### Scenario: Candidate has already submitted
- **WHEN** it is 08:00 and a candidate's submission status is SUBMITTED or AUTO_SUBMITTED
- **THEN** no reminder email is sent to that candidate

#### Scenario: Assessment has no reminder window configured
- **WHEN** an assessment's `reminderDaysBeforeDeadline` is null
- **THEN** no automated reminders are sent for any invitations under that assessment

---

### Requirement: Recruiter can manually send a reminder
A recruiter or admin SHALL be able to trigger a reminder email for an individual candidate from the submission detail view.

#### Scenario: Manual reminder for incomplete submission
- **WHEN** a recruiter clicks "Send Reminder" for a candidate whose submission is not SUBMITTED or AUTO_SUBMITTED and confirms the dialog
- **THEN** the system sends a reminder email to the candidate and records the send in `reminder_send_log` with `send_type = MANUAL` and `sent_by` set to the recruiter's user ID

#### Scenario: Manual reminder blocked for completed submission
- **WHEN** a candidate's submission status is SUBMITTED or AUTO_SUBMITTED
- **THEN** the "Send Reminder" action SHALL NOT be available (button hidden or disabled)

#### Scenario: Reminder confirmation dialog
- **WHEN** a recruiter clicks "Send Reminder"
- **THEN** a confirmation dialog is shown before the email is dispatched

---

### Requirement: Reminder email contains required information
The reminder email SHALL include the candidate's name, assessment name, deadline (date and time), and a secure direct access link. The link SHALL be constructed using the configurable `app.frontend.base-url` property and the candidate's existing invitation token.

#### Scenario: Email link uses frontend base URL
- **WHEN** a reminder email is sent (automated or manual)
- **THEN** the access link in the email is constructed from `app.frontend.base-url` (e.g., `http://localhost:4200/assessment/{id}/take?token={token}`), NOT the backend server address

#### Scenario: Email content
- **WHEN** a reminder email is sent (automated or manual)
- **THEN** the email body contains the candidate's first and last name, the assessment title, the `expiresAt` formatted as a readable date-time, and a clickable link constructed from the invitation token
- **AND** the link resolves to the candidate's assessment access page without requiring a new token

#### Scenario: Expired invitation not reminded
- **WHEN** an invitation has status=EXPIRED
- **THEN** no reminder email is sent for it

