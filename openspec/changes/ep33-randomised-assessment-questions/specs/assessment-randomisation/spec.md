## ADDED Requirements

### Requirement: Staff can enable randomisation and configure per-type quotas
An assessment SHALL have a `randomiseQuestions` boolean flag (default `false`) and an associated list of `RandomisationQuota` entries, each specifying a `questionType` and a `count`. When `randomiseQuestions` is `true`, the assessment MUST have at least one quota entry with `count ≥ 1`.

#### Scenario: Staff saves an assessment with randomisation enabled and valid quotas
- **WHEN** staff submits an assessment with `randomiseQuestions = true` and quotas `[{MCQ, 3}, {TEXT, 2}]`
- **THEN** the assessment is persisted with `randomise_questions = true` and two rows in `assessment_randomisation_quotas`

#### Scenario: Staff saves an assessment with randomisation disabled
- **WHEN** staff submits an assessment with `randomiseQuestions = false`
- **THEN** the assessment is persisted with `randomise_questions = false` and any existing quotas are cleared

#### Scenario: Staff submits randomisation enabled with no quotas
- **WHEN** staff submits an assessment with `randomiseQuestions = true` and an empty `randomisationQuotas` list
- **THEN** the API returns 400 with an error indicating at least one quota is required

### Requirement: Candidate receives a snapshotted random question subset on assessment start
When an assessment has `randomiseQuestions = true`, the system SHALL randomly select `quota.count` questions of each configured type from the assessment's question pool when the candidate's submission is first created, persist the selection in `submission_question_snapshots`, and return only those questions to the candidate.

#### Scenario: First load — random subset is drawn and snapshotted
- **WHEN** a candidate starts an assessment with `randomiseQuestions = true` and quotas `[{MCQ, 3}, {TEXT, 2}]`
- **THEN** exactly 5 questions are returned (3 MCQ + 2 TEXT), and their IDs are recorded in `submission_question_snapshots`

#### Scenario: Resume — snapshot is returned unchanged
- **WHEN** a candidate who has already started the assessment calls the take endpoint again
- **THEN** the same 5 questions from the snapshot are returned (no new random draw)

#### Scenario: Two candidates start the same randomised assessment
- **WHEN** two different candidates each start the same assessment
- **THEN** each receives an independently random subset (their selections may differ)

#### Scenario: Non-randomised assessment is unaffected
- **WHEN** a candidate starts an assessment with `randomiseQuestions = false`
- **THEN** all questions are returned in `displayOrder`, identical to current behaviour

### Requirement: Backend validates quota counts against available questions
The system SHALL reject an attempt start where a configured quota count exceeds the number of questions of that type present in the assessment.

#### Scenario: Quota exceeds available questions of a type
- **WHEN** an assessment has 2 MCQ questions but the quota requests 5 MCQ
- **THEN** the API returns 400 with an error indicating insufficient questions of that type
