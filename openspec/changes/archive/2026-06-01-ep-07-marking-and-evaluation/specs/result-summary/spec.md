## ADDED Requirements

### Requirement: Recruiter retrieves an overall result summary for a candidate submission
The system SHALL expose a `GET /api/submissions/{submissionId}/result` endpoint accessible to `ROLE_RECRUITER` and `ROLE_ADMIN`. The response SHALL aggregate all `AnswerScore` values for the submission into a total score, list each question with its answer, score, and feedback, indicate the marking completeness status (`FULLY_MARKED` or `PENDING_REVIEW`), and include submission metadata (candidate name, assessment title, submitted at).

#### Scenario: Fully marked submission returns complete result
- **WHEN** every `CandidateAnswer` in the submission has an `AnswerScore`
- **THEN** the response is HTTP 200 with `markingStatus: "FULLY_MARKED"`, `totalScore` equal to the sum of all answer scores, and a `questions` list where every entry has a non-null `score`

#### Scenario: Partially marked submission returns pending result
- **WHEN** at least one `CandidateAnswer` in the submission has no `AnswerScore`
- **THEN** the response includes `markingStatus: "PENDING_REVIEW"` and unscored question entries have `score: null`

#### Scenario: Submission with no answers returns zero total
- **WHEN** a submission exists but the candidate answered no questions
- **THEN** the response is HTTP 200 with `totalScore: 0`, `markingStatus: "PENDING_REVIEW"`, and an empty `questions` list

#### Scenario: Non-existent submission returns 404
- **WHEN** the `submissionId` does not correspond to any `CandidateSubmission`
- **THEN** the response is HTTP 404

#### Scenario: Candidate cannot access the result summary
- **WHEN** a request with `role=CANDIDATE` JWT calls `GET /api/submissions/{id}/result`
- **THEN** the response is HTTP 403

### Requirement: Result summary includes per-question detail sufficient for comparison
Each entry in the `questions` list of the result summary SHALL include: `questionId`, `questionTitle`, `questionType`, `candidateAnswer` (the submitted text or selected option text, not raw IDs), `score` (nullable), `feedback` (nullable), `isAutoMarked` (boolean), `markedBy` (nullable user ID), and `markedAt` (nullable timestamp).

#### Scenario: MCQ answer displays selected option text, not raw UUID
- **WHEN** the result summary is fetched for a submission with an MCQ answer
- **THEN** `candidateAnswer` in that question entry contains the text of the selected option, not the UUID

#### Scenario: Unanswered question shows null candidate answer
- **WHEN** a question was not answered by the candidate
- **THEN** `candidateAnswer` is null in that question entry
