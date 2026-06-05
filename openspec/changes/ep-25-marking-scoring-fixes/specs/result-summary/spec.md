## MODIFIED Requirements

### Requirement: Recruiter retrieves an overall result summary for a candidate submission
The system SHALL expose a `GET /api/submissions/{submissionId}/result` endpoint accessible to `ROLE_RECRUITER` and `ROLE_ADMIN`. The response SHALL aggregate all `AnswerScore` values for the submission into a total score, list each question with its answer, score, and feedback, indicate the marking completeness status (`FULLY_MARKED` or `PENDING_REVIEW`), and include submission metadata (candidate name, assessment title, submitted at).

The marking completeness status SHALL be computed as follows:
- `FULLY_MARKED`: every assessment question that has a `CandidateAnswer` also has an `AnswerScore`. Questions with no `CandidateAnswer` (unanswered, implicitly scored 0 on submission) do NOT block `FULLY_MARKED`.
- `PENDING_REVIEW`: at least one assessment question has a `CandidateAnswer` with no corresponding `AnswerScore`.

#### Scenario: Fully marked submission returns complete result
- **WHEN** every `CandidateAnswer` in the submission has an `AnswerScore`
- **THEN** the response is HTTP 200 with `markingStatus: "FULLY_MARKED"`, `totalScore` equal to the sum of all answer scores, and a `questions` list where every entry with a non-null `answerId` has a non-null `score`

#### Scenario: Partially marked submission returns pending result
- **WHEN** at least one `CandidateAnswer` in the submission has no `AnswerScore`
- **THEN** the response includes `markingStatus: "PENDING_REVIEW"` and that unscored question entry has `score: null`

#### Scenario: Unanswered questions do not block FULLY_MARKED
- **WHEN** a submission has questions with no `CandidateAnswer` (candidate left them unanswered)
- **AND** all other `CandidateAnswer` rows have an `AnswerScore`
- **THEN** the response is HTTP 200 with `markingStatus: "FULLY_MARKED"`
- **AND** the unanswered question entries appear in the result with `answerId: null` and `score: null`

#### Scenario: GROUP submission — all sub-questions scored after recruiter marks remaining
- **WHEN** a submission has a GROUP question where some sub-questions were answered and some were not
- **AND** the recruiter manually scores all sub-questions that have a `CandidateAnswer`
- **THEN** the response is HTTP 200 with `markingStatus: "FULLY_MARKED"`

#### Scenario: Non-existent submission returns 404
- **WHEN** the `submissionId` does not correspond to any `CandidateSubmission`
- **THEN** the response is HTTP 404

#### Scenario: Candidate cannot access the result summary
- **WHEN** a request with `role=CANDIDATE` JWT calls `GET /api/submissions/{id}/result`
- **THEN** the response is HTTP 403
