## MODIFIED Requirements

### Requirement: Click-through to submission detail
The system SHALL allow a recruiter to navigate directly to the full submission detail from a completed history entry. Navigation SHALL use SPA router navigation (not a full page reload via `href`). The Results page SHALL be opened at `/results?submission={submissionId}`.

#### Scenario: Click-through on completed entry
- **WHEN** recruiter clicks a history entry that has a submission (status SUBMITTED or AUTO_SUBMITTED)
- **THEN** the system navigates via the Angular router to `/results?submission={submissionId}` without a full page reload

#### Scenario: No click-through for pending entries
- **WHEN** a history entry has no submission (status=PENDING or EXPIRED)
- **THEN** no navigation action is available for that entry
