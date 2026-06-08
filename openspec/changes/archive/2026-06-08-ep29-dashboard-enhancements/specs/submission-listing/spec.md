## MODIFIED Requirements

### Requirement: Submission summaries include assessment identity
The `SubmissionSummaryResponse` SHALL include `assessmentId` (UUID) and `assessmentTitle` (String) fields so consumers can filter or group submissions by assessment without a separate lookup.

#### Scenario: Assessment fields present in list response
- **WHEN** `GET /api/submissions` is called
- **THEN** each entry in the response includes a non-null `assessmentId` and `assessmentTitle`

## ADDED Requirements

### Requirement: Completed submissions endpoint
The system SHALL expose `GET /api/submissions/completed` returning only submissions with status SUBMITTED or AUTO_SUBMITTED, accessible to RECRUITER and ADMIN roles.

#### Scenario: Returns only submitted records
- **WHEN** `GET /api/submissions/completed` is called
- **THEN** the response contains only submissions with status SUBMITTED or AUTO_SUBMITTED

#### Scenario: Access control enforced
- **WHEN** an unauthenticated request is made to `GET /api/submissions/completed`
- **THEN** the response is 401 Unauthorized
