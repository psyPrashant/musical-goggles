## ADDED Requirements

### Requirement: Every flag action is recorded with actor and timestamp
The system SHALL write an audit entry to `submission_flag_audit` on every flag creation and every status transition. Each entry SHALL capture: `flagId`, `action` (CREATED, STATUS_CHANGED), `fromStatus` (null on creation), `toStatus`, `actorUserId`, `actorUsername`, and `occurredAt`.

#### Scenario: Flag creation generates an audit entry
- **WHEN** a recruiter creates a flag on a submission
- **THEN** an audit entry with `action: CREATED`, `toStatus: FLAGGED`, and the recruiter's user ID and timestamp is persisted

#### Scenario: Status transition generates an audit entry
- **WHEN** a recruiter transitions a flag from `FLAGGED` to `UNDER_REVIEW`
- **THEN** an audit entry with `action: STATUS_CHANGED`, `fromStatus: FLAGGED`, `toStatus: UNDER_REVIEW`, and the recruiter's details is persisted

### Requirement: Audit trail is visible on the submission detail view
The system SHALL expose `GET /api/submissions/{submissionId}/flags/{flagId}/audit` accessible to `ROLE_RECRUITER` and `ROLE_ADMIN`. The response SHALL list all audit entries for that flag ordered by `occurredAt` ascending. Entries SHALL be read-only — no create, update, or delete operations are permitted on audit entries.

#### Scenario: Recruiter retrieves audit trail for a flag
- **WHEN** a recruiter calls `GET /api/submissions/{id}/flags/{flagId}/audit`
- **THEN** HTTP 200 is returned with a list of audit entries in chronological order

#### Scenario: Audit entries cannot be deleted
- **WHEN** any user calls `DELETE /api/submissions/{id}/flags/{flagId}/audit/{entryId}`
- **THEN** the system returns HTTP 405

### Requirement: FE renders audit trail on submission detail view
The Angular submission detail view SHALL include a read-only "Flag History" section listing each audit entry: actor username, action, from/to status, and timestamp. The section SHALL only be shown when at least one flag exists for the submission.

#### Scenario: Submission detail shows flag history
- **WHEN** a recruiter views a submission with flag audit entries
- **THEN** each entry is displayed in chronological order with actor, action, and timestamp visible
