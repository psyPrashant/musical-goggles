# candidate-invitation Specification

## Purpose
TBD - created by archiving change ep-17-assessment-invites-lifecycle. Update Purpose after archive.
## Requirements
### Requirement: Assessment invitation link uses configurable frontend URL
The system SHALL construct the assessment access link in invitation emails using the value of `app.base-url` configuration property, not the backend server address derived from the HTTP request.

#### Scenario: Invite email link uses frontend base URL
- **WHEN** a staff member sends an assessment invitation
- **THEN** the access link in the invitation email is constructed as `{app.base-url}/assessment/{assessmentId}/take?token={token}`

#### Scenario: Frontend base URL is configurable
- **WHEN** `app.base-url` is set to `https://app.example.com` in application configuration
- **THEN** invitation emails contain links starting with `https://app.example.com`

### Requirement: Dashboard Pending Review count reflects submissions awaiting scoring
The system SHALL count as "Pending Review" only SUBMITTED or AUTO_SUBMITTED submissions that have at least one answer without a corresponding score entry. It SHALL NOT count invitations without submissions.

#### Scenario: Pending Review increments when submission is awaiting scoring
- **WHEN** a candidate submits an assessment and not all answers have been scored
- **THEN** the dashboard "Pending Review" counter increments by one

#### Scenario: Pending Review decrements when all answers are scored
- **WHEN** a recruiter marks all answers in a submission
- **THEN** the dashboard "Pending Review" counter decrements for that submission

#### Scenario: Pending Review is zero when no unscored submissions exist
- **WHEN** all submitted assessments have been fully scored
- **THEN** the dashboard "Pending Review" counter shows 0

