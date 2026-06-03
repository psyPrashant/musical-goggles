## ADDED Requirements

### Requirement: Staff can cancel an outstanding invitation
The system SHALL allow an ADMIN or RECRUITER to cancel a PENDING or SENT invitation via `DELETE /api/invitations/{id}`. The invitation status SHALL be set to `CANCELLED`. The candidate's token SHALL no longer grant assessment access after cancellation.

#### Scenario: Successful cancellation of a SENT invitation
- **WHEN** an authenticated staff member calls `DELETE /api/invitations/{id}` for an invitation with status SENT
- **THEN** the response is HTTP 204 No Content and the invitation status is updated to CANCELLED

#### Scenario: Successful cancellation of a PENDING invitation
- **WHEN** an authenticated staff member calls `DELETE /api/invitations/{id}` for an invitation with status PENDING
- **THEN** the response is HTTP 204 No Content and the invitation status is updated to CANCELLED

#### Scenario: Cannot cancel a COMPLETED invitation
- **WHEN** a staff member calls `DELETE /api/invitations/{id}` for an invitation with status COMPLETED
- **THEN** the response is HTTP 400 Bad Request

#### Scenario: Cannot cancel an already-CANCELLED invitation
- **WHEN** a staff member calls `DELETE /api/invitations/{id}` for an invitation with status CANCELLED
- **THEN** the response is HTTP 400 Bad Request

#### Scenario: Cannot cancel an EXPIRED invitation
- **WHEN** a staff member calls `DELETE /api/invitations/{id}` for an invitation with status EXPIRED
- **THEN** the response is HTTP 400 Bad Request

#### Scenario: Invitation not found
- **WHEN** a staff member calls `DELETE /api/invitations/{id}` with a non-existent ID
- **THEN** the response is HTTP 404 Not Found

#### Scenario: Unauthenticated cancel attempt
- **WHEN** an unauthenticated caller calls `DELETE /api/invitations/{id}`
- **THEN** the response is HTTP 401 Unauthorized

#### Scenario: Candidate uses a cancelled token
- **WHEN** a candidate attempts to access their assessment using a token from a CANCELLED invitation
- **THEN** the system SHALL deny access (HTTP 403 or 404)

### Requirement: CANCELLED is a valid invitation status
The `InvitationStatus` enum SHALL include `CANCELLED` as a valid status alongside PENDING, SENT, EXPIRED, and COMPLETED.

#### Scenario: CANCELLED persisted in database
- **WHEN** an invitation is cancelled
- **THEN** the `status` column in `candidate_invitations` stores the value `CANCELLED`

### Requirement: Candidate receives a cancellation email
When an invitation is cancelled, the system SHALL send a plain-text notification email to the candidate informing them that their invitation has been cancelled and they should contact the recruiter if this was in error.

#### Scenario: Cancellation email sent on cancel
- **WHEN** a staff member successfully cancels a PENDING or SENT invitation
- **THEN** the system sends an email to the candidate's registered address with subject "Assessment Invitation Cancelled: {assessment title}" and a message identifying the assessment

#### Scenario: No email sent for non-cancellable statuses
- **WHEN** a cancel request is rejected (invitation is COMPLETED, EXPIRED, or already CANCELLED)
- **THEN** no cancellation email is sent

### Requirement: Frontend displays a cancel action for active invitations
The invitation list or candidate view SHALL display a cancel button for each invitation with status PENDING or SENT.

#### Scenario: Cancel button visible for active invitations
- **WHEN** a staff member views the invitation list and an invitation has status PENDING or SENT
- **THEN** a cancel button is visible for that invitation

#### Scenario: Confirmation required before cancel
- **WHEN** a staff member clicks the cancel button
- **THEN** a confirmation dialog is shown before the API call is made

#### Scenario: Invitation removed from active list after cancellation
- **WHEN** the staff member confirms cancellation
- **THEN** the invitation is removed from the active invitations view (or its status updates to reflect CANCELLED)
