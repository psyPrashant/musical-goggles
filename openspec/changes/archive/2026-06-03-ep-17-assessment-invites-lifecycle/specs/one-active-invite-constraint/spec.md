## ADDED Requirements

### Requirement: A candidate may hold only one active invitation at a time
The system SHALL prevent sending a new assessment invitation to a candidate who already has an invitation with status PENDING or SENT for any assessment. The constraint is global across all assessments.

#### Scenario: New invite blocked when candidate has a SENT invitation
- **WHEN** a staff member attempts to invite a candidate who already has a SENT invitation to any assessment
- **THEN** the response is HTTP 409 Conflict with error code `ACTIVE_INVITE_EXISTS`

#### Scenario: New invite blocked when candidate has a PENDING invitation
- **WHEN** a staff member attempts to invite a candidate who already has a PENDING invitation to any assessment
- **THEN** the response is HTTP 409 Conflict with error code `ACTIVE_INVITE_EXISTS`

#### Scenario: New invite allowed after previous invite is cancelled
- **WHEN** a candidate's active invitation is cancelled and a staff member invites that candidate again
- **THEN** the new invitation is created successfully

#### Scenario: New invite allowed after previous invite is completed
- **WHEN** a candidate's previous invitation has status COMPLETED and a staff member invites that candidate
- **THEN** the new invitation is created successfully

#### Scenario: New invite allowed after previous invite is expired
- **WHEN** a candidate's previous invitation has status EXPIRED and a staff member invites that candidate
- **THEN** the new invitation is created successfully

### Requirement: Frontend surfaces the ACTIVE_INVITE_EXISTS error
When the invite API returns `409 ACTIVE_INVITE_EXISTS`, the frontend SHALL display a user-friendly error message indicating the candidate already has an active link.

#### Scenario: Error toast shown for ACTIVE_INVITE_EXISTS
- **WHEN** the invite call returns 409 with error code `ACTIVE_INVITE_EXISTS`
- **THEN** the frontend displays an error message: "This candidate already has an active assessment link. Cancel it before sending a new one."
