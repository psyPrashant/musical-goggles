## MODIFIED Requirements

### Requirement: Activity events include submission reference
The `ActivityEvent` response object SHALL include a nullable `submissionId` field (UUID) so the frontend can deep-link to the corresponding result.

- For events of type `SUBMISSION_STARTED` and `SUBMISSION_COMPLETED`, the `submissionId` field SHALL be populated with the UUID of the relevant `CandidateSubmission`.
- For events of type `INVITATION_SENT`, the `submissionId` field SHALL be `null`.

#### Scenario: Submission event includes submissionId
- **WHEN** the dashboard stats endpoint returns a recent activity event of type SUBMISSION_STARTED or SUBMISSION_COMPLETED
- **THEN** the event's submissionId field is a non-null UUID matching the candidate's submission

#### Scenario: Invitation event has null submissionId
- **WHEN** the dashboard stats endpoint returns a recent activity event of type INVITATION_SENT
- **THEN** the event's submissionId field is null
