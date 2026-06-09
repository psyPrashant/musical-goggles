## ADDED Requirements

### Requirement: Recruiter retrieves all submissions for an assessment
The system SHALL expose a `GET /api/assessments/{assessmentId}/submissions` endpoint accessible to `ROLE_RECRUITER` and `ROLE_ADMIN`. The response SHALL list every `CandidateSubmission` for the given assessment, including the candidate's name, submission status, and submission timestamp. Results SHALL be ordered by `submittedAt` descending (most recent first), with `IN_PROGRESS` submissions listed last. Each submission object SHALL include a `flagStatus` field set to the current open flag's status (`FLAGGED`, `UNDER_REVIEW`) or `null` if no open flag exists.

#### Scenario: Assessment has multiple submissions
- **WHEN** a recruiter calls `GET /api/assessments/{id}/submissions` for an assessment with three candidates who have submitted
- **THEN** the response is HTTP 200 with a list of three submission objects, each containing `submissionId`, `candidateId`, `candidateName`, `status`, `submittedAt`, `answeredCount`, and `flagStatus`

#### Scenario: Assessment has no submissions
- **WHEN** a recruiter calls `GET /api/assessments/{id}/submissions` for an assessment with no submissions
- **THEN** the response is HTTP 200 with an empty list

#### Scenario: Assessment not found
- **WHEN** a recruiter calls `GET /api/assessments/{id}/submissions` for a non-existent assessment ID
- **THEN** the response is HTTP 404

#### Scenario: Candidate user cannot access submission listing
- **WHEN** a request with `role=CANDIDATE` JWT calls `GET /api/assessments/{id}/submissions`
- **THEN** the response is HTTP 403

#### Scenario: Flagged submission includes flag status in listing
- **WHEN** a recruiter retrieves submissions and one submission has an open flag with status `FLAGGED`
- **THEN** that submission object contains `flagStatus: "FLAGGED"` and the FE renders a "Flagged" badge on the row

### Requirement: Submission list includes marking progress per candidate
Each submission object in the listing SHALL include a `markedCount` (number of answers with an `AnswerScore`) and `totalAnswers` (total `CandidateAnswer` count) so the recruiter can see marking progress at a glance without fetching each result individually.

#### Scenario: Partially marked submission shows correct counts
- **WHEN** a submission has 3 answers and only 1 has been scored
- **THEN** the submission listing entry shows `markedCount: 1` and `totalAnswers: 3`

### Requirement: Submission summaries include assessment identity
The `SubmissionSummaryResponse` SHALL include `assessmentId` (UUID) and `assessmentTitle` (String) fields so consumers can filter or group submissions by assessment without a separate lookup.

#### Scenario: Assessment fields present in list response
- **WHEN** `GET /api/submissions` is called
- **THEN** each entry in the response includes a non-null `assessmentId` and `assessmentTitle`

### Requirement: Completed submissions endpoint
The system SHALL expose `GET /api/submissions/completed` returning only submissions with status SUBMITTED or AUTO_SUBMITTED, accessible to RECRUITER and ADMIN roles.

#### Scenario: Returns only submitted records
- **WHEN** `GET /api/submissions/completed` is called
- **THEN** the response contains only submissions with status SUBMITTED or AUTO_SUBMITTED

#### Scenario: Access control enforced
- **WHEN** an unauthenticated request is made to `GET /api/submissions/completed`
- **THEN** the response is 401 Unauthorized
