## MODIFIED Requirements

### Requirement: Assessment start respects randomisation snapshot
When `randomiseQuestions = true`, `loadAssessment` MUST check for an existing `submission_question_snapshots` record for this submission. If one exists, it MUST return those questions. If none exists (first load), it MUST draw the random subset, persist it, and return it. Existing non-randomised behaviour MUST be unchanged.

#### Scenario: First load creates snapshot and returns subset
- **WHEN** a candidate calls the take endpoint for a randomised assessment for the first time
- **THEN** a snapshot row is created in `submission_question_snapshots` and the subset is returned

#### Scenario: Subsequent load returns existing snapshot
- **WHEN** a candidate calls the take endpoint for a randomised assessment after a snapshot already exists
- **THEN** no new snapshot is created and the identical question set from the snapshot is returned

#### Scenario: Non-randomised assessment returns all questions
- **WHEN** a candidate calls the take endpoint for an assessment with `randomiseQuestions = false`
- **THEN** all questions are returned ordered by `displayOrder`, no snapshot logic runs
