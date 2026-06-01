## Why

Candidates can now submit assessments (EP-06), but the platform has no way for recruiters to see those submissions, score them, or view an aggregate result. This epic closes the evaluation loop — from submission through individual answer scoring to a final per-candidate result that supports hiring decisions.

## What Changes

- New read endpoint: list all candidate submissions for an assessment (MG-36)
- New `AnswerScore` entity persists a numeric score and optional free-text feedback against each `CandidateAnswer` (MG-39)
- MCQ answers are auto-marked at submission time — scores written immediately without recruiter action (MG-38)
- Recruiter can manually score text and code answers with a score + feedback, recording who marked and when (MG-37)
- Result summary endpoint aggregates per-answer scores into a total, shows marking status, and surfaces assessor feedback at the candidate level (MG-40)
- **Assessment submission flow extended**: `POST /api/take/submit` now triggers MCQ auto-marking within the same transaction

## Capabilities

### New Capabilities
- `submission-listing`: A recruiter can retrieve all candidate submissions for a given assessment, showing candidate name, submission status, and timestamp — the entry point to the marking workflow (MG-36)
- `answer-scoring`: The system can persist a numeric score and written feedback against an individual `CandidateAnswer`; supports both auto-written (MCQ) and manually-written (text/code) scores; tracks marker identity and timestamp for auditable evaluation (MG-39)
- `mcq-auto-marking`: On assessment submission, the system automatically compares each MCQ `CandidateAnswer` against the correct `QuestionOption(s)` and writes an `AnswerScore`; handles both single-correct and multiple-correct formats (MG-38)
- `manual-marking`: An authenticated recruiter or admin can submit a score and feedback for a text or code `CandidateAnswer`; the endpoint records the marking user and timestamp; a previously scored answer can be revised (MG-37)
- `result-summary`: A recruiter can retrieve an overall result for a candidate submission — total score, per-answer breakdown, marking completeness status, and any assessor feedback — ready for comparison across candidates (MG-40)

### Modified Capabilities
- `assessment-submission`: The submit endpoint must now trigger MCQ auto-marking immediately after locking the submission; this is a new post-lock side-effect and changes the contract of `POST /api/take/submit`

## Impact

- **Backend — new entity**: `AnswerScore` linking `CandidateAnswer` → numeric score, feedback text, marker user ID, and marked timestamp
- **Backend — new controllers/services**: `SubmissionController` (listing + result summary), `MarkingController` (manual score endpoint)
- **Backend — new endpoints**: `GET /api/assessments/{id}/submissions`, `GET /api/submissions/{id}/result`, `PUT /api/submissions/{submissionId}/answers/{answerId}/score`
- **Backend — modified**: `CandidateTakeServiceImpl.submitAssessment()` extended to call the MCQ auto-marking service after locking
- **Database**: One new table (`answer_scores`); migration script required
- **Frontend**: `ResultsComponent` (already scaffolded with mock data from MG-55) wired to real listing and result APIs; marking interface for text/code answers
- **Dependencies**: Builds directly on `answer-scoring`, `assessment-submission`, and `candidate-answer-draft` from EP-06
