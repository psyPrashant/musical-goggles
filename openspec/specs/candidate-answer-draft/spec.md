## ADDED Requirements

### Requirement: Candidate saves draft answers incrementally
The system SHALL expose a `PUT /api/take/answers` endpoint secured by the candidate session JWT. The endpoint SHALL accept a list of one or more answer objects and upsert each into `CandidateAnswer` using `(submissionId, questionId)` as the unique key. All saved answers have `isDraft = true` until the submission is locked. The endpoint SHALL return the persisted answer list with `savedAt` timestamps.

#### Scenario: New draft answer is persisted
- **WHEN** a candidate submits a `PUT /api/take/answers` request with an answer for a question that has no prior saved answer
- **THEN** the response is HTTP 200 and a new `CandidateAnswer` record is created with `isDraft = true` and the current `savedAt` timestamp

#### Scenario: Existing draft answer is updated (upsert)
- **WHEN** a candidate submits a `PUT /api/take/answers` request for a question already answered
- **THEN** the existing `CandidateAnswer` record is updated in place and `savedAt` is refreshed

#### Scenario: Multiple answers saved in one request
- **WHEN** a candidate submits a `PUT /api/take/answers` request containing answers for three questions
- **THEN** all three are upserted and the response contains all three updated answer objects

#### Scenario: Draft save rejected after submission is locked
- **WHEN** a candidate calls `PUT /api/take/answers` after their `CandidateSubmission` has status `SUBMITTED` or `AUTO_SUBMITTED`
- **THEN** the response is HTTP 409 with a message indicating the submission is already locked

### Requirement: MCQ answers store selected option IDs
For MCQ questions, the `CandidateAnswer` SHALL store the candidate's selection as a list of `QuestionOption` UUIDs in the `selectedOptionIds` field. Both single-correct and multiple-correct MCQ formats are stored identically (one or more IDs). The `textContent` field SHALL be null for MCQ answers.

#### Scenario: Single-correct MCQ answer stored
- **WHEN** a candidate saves an MCQ answer with one selected option ID
- **THEN** `selectedOptionIds` contains exactly one UUID and `textContent` is null

#### Scenario: Multiple-correct MCQ answer stored
- **WHEN** a candidate saves an MCQ answer with two selected option IDs
- **THEN** `selectedOptionIds` contains both UUIDs

#### Scenario: MCQ answer with invalid option ID is rejected
- **WHEN** a candidate submits an MCQ answer with an option ID that does not belong to the question
- **THEN** the response is HTTP 400

### Requirement: Text and code answers store inline content
For text and code/submission questions, the `CandidateAnswer` SHALL store the candidate's response in the `textContent` field. The `selectedOptionIds` field SHALL be null. The `textContent` field SHALL be validated to a maximum length of 65,535 characters.

#### Scenario: Text answer stored
- **WHEN** a candidate saves a text answer with non-empty `textContent`
- **THEN** the answer is persisted with `textContent` set and `selectedOptionIds` null

#### Scenario: Oversized text answer rejected
- **WHEN** a candidate submits a text answer with `textContent` exceeding 65,535 characters
- **THEN** the response is HTTP 400 with a message indicating the content exceeds the maximum allowed length

#### Scenario: Code answer stored as inline text
- **WHEN** a candidate saves an answer for a code submission question using the `textContent` field
- **THEN** the answer is persisted identically to a text answer

### Requirement: Candidate cannot submit an answer for a question not in their assessment
The `PUT /api/take/answers` endpoint SHALL validate that each `questionId` in the request belongs to the assessment identified in the candidate's session JWT. Answers for questions outside the candidate's assessment SHALL be rejected.

#### Scenario: Answer for out-of-scope question is rejected
- **WHEN** a candidate submits an answer with a `questionId` that exists in the system but is not part of their assigned assessment
- **THEN** the response is HTTP 403
