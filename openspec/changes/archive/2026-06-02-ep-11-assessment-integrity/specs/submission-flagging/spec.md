## ADDED Requirements

### Requirement: Recruiter can flag a submission as suspicious
The system SHALL expose `POST /api/submissions/{submissionId}/flags` accessible to `ROLE_RECRUITER` and `ROLE_ADMIN`. The request body SHALL include a `reason` field (non-blank string). The system SHALL create a `SubmissionFlag` with status `FLAGGED`, record the acting user and timestamp, and return HTTP 201 with the created flag. Only one flag with status `FLAGGED` or `UNDER_REVIEW` SHALL exist per submission at a time; attempting to create a duplicate SHALL return HTTP 409.

#### Scenario: Recruiter flags a submission with a valid reason
- **WHEN** a recruiter calls `POST /api/submissions/{id}/flags` with `{"reason": "copied answers"}`
- **THEN** the system returns HTTP 201 with `flagId`, `status: "FLAGGED"`, `reason`, `createdBy`, and `createdAt`

#### Scenario: Flag reason is blank
- **WHEN** a recruiter calls `POST /api/submissions/{id}/flags` with `{"reason": ""}`
- **THEN** the system returns HTTP 400

#### Scenario: Submission is already flagged
- **WHEN** a recruiter calls `POST /api/submissions/{id}/flags` and an open flag already exists
- **THEN** the system returns HTTP 409

#### Scenario: Submission not found
- **WHEN** a recruiter calls `POST /api/submissions/{id}/flags` for a non-existent submission ID
- **THEN** the system returns HTTP 404

#### Scenario: Candidate user cannot flag a submission
- **WHEN** a request with `role=CANDIDATE` calls `POST /api/submissions/{id}/flags`
- **THEN** the system returns HTTP 403

### Requirement: Recruiter can transition a flag status
The system SHALL expose `PATCH /api/submissions/{submissionId}/flags/{flagId}` accessible to `ROLE_RECRUITER` and `ROLE_ADMIN`. Valid transitions are `FLAGGED → UNDER_REVIEW`, `UNDER_REVIEW → RESOLVED`, and `UNDER_REVIEW → DISMISSED`. Transitioning to `RESOLVED` or `DISMISSED` SHALL require a non-blank `resolutionNotes` field. Invalid transitions SHALL return HTTP 422.

#### Scenario: Transition to UNDER_REVIEW
- **WHEN** a recruiter calls `PATCH /api/submissions/{id}/flags/{flagId}` with `{"status": "UNDER_REVIEW"}`
- **THEN** the system returns HTTP 200 with updated `status: "UNDER_REVIEW"` and records an audit entry

#### Scenario: Resolve a flag without notes
- **WHEN** a recruiter calls `PATCH` with `{"status": "RESOLVED"}` and no `resolutionNotes`
- **THEN** the system returns HTTP 400

#### Scenario: Invalid transition from FLAGGED to RESOLVED
- **WHEN** a recruiter calls `PATCH` with `{"status": "RESOLVED"}` while flag is `FLAGGED`
- **THEN** the system returns HTTP 422

#### Scenario: Resolve a flag with notes
- **WHEN** a recruiter calls `PATCH` with `{"status": "RESOLVED", "resolutionNotes": "Confirmed plagiarism"}`
- **THEN** the system returns HTTP 200 with `status: "RESOLVED"` and the notes stored

### Requirement: Flagged submission displays a visible badge
The FE submission detail view and submission list rows SHALL display a "Flagged" status badge when the submission has an open flag (status `FLAGGED` or `UNDER_REVIEW`). The badge SHALL not be shown for `RESOLVED` or `DISMISSED` flags.

#### Scenario: Submission with open flag shows badge
- **WHEN** a recruiter views a submission with flag status `FLAGGED`
- **THEN** a "Flagged" badge is visible on the submission detail and in the list row

#### Scenario: Submission with resolved flag hides badge
- **WHEN** a recruiter views a submission whose only flag is `RESOLVED`
- **THEN** no "Flagged" badge is shown
