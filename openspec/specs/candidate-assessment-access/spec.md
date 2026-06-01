## ADDED Requirements

### Requirement: Candidate loads their assigned assessment via session JWT
The system SHALL expose a `GET /api/take/assessment` endpoint secured by the candidate session JWT. On first call, it SHALL create a `CandidateSubmission` record with status `IN_PROGRESS` and record `startedAt`. On subsequent calls (page refresh), it SHALL return the same submission state without re-creating it. The response SHALL include the assessment title, instructions, time limit, ordered question list, any previously saved draft answers, and an absolute `deadline` timestamp (`startedAt + timeLimitMinutes`).

#### Scenario: First load creates submission and returns assessment
- **WHEN** a candidate with a valid session JWT calls `GET /api/take/assessment` for the first time
- **THEN** the response is HTTP 200 with assessment metadata, the ordered question list, an empty `answers` list, `startedAt`, and `deadline` (absolute UTC timestamp)
- **AND** a `CandidateSubmission` record with status `IN_PROGRESS` is persisted in the database

#### Scenario: Subsequent load returns existing submission state
- **WHEN** a candidate calls `GET /api/take/assessment` after already having started (e.g., page refresh)
- **THEN** the response is HTTP 200 with the same assessment content and all previously saved draft answers populated in `answers`
- **AND** no new `CandidateSubmission` record is created

#### Scenario: Correct answers are withheld from MCQ options
- **WHEN** the assessment contains MCQ questions
- **THEN** the response options for each MCQ question SHALL NOT include any `isCorrect` field or equivalent

#### Scenario: Expired invitation is rejected
- **WHEN** the candidate's invitation token has expired and the session JWT is therefore invalid
- **THEN** the response is HTTP 401

#### Scenario: Already-submitted assessment is rejected
- **WHEN** a candidate whose `CandidateSubmission` has status `SUBMITTED` or `AUTO_SUBMITTED` calls `GET /api/take/assessment`
- **THEN** the response is HTTP 409 with a message indicating the assessment has already been submitted

### Requirement: Assessment questions are returned in deterministic display order
The `GET /api/take/assessment` response SHALL return questions ordered by their `displayOrder` field on `AssessmentQuestion`. The candidate's `answers` list in the response SHALL be keyed by `questionId` so the frontend can map saved drafts to questions without relying on list index.

#### Scenario: Questions appear in defined order
- **WHEN** an assessment has questions with explicit display orders
- **THEN** the response question list follows ascending `displayOrder` with no gaps or reordering
