## Why

The Question Bank (EP-02) gives the platform its raw content, but there is no way to assemble that content into a structured evaluation. EP-03 adds the Assessment Builder — the layer that lets Admins and Recruiters select questions from the bank, configure metadata, enforce business rules, and preview the result before publishing it to candidates.

## What Changes

- **Assessment CRUD** (MG-23): Admins and Recruiters can create, read, update, and delete assessments with a title, description, time limit (minutes), and lifecycle status (DRAFT / PUBLISHED). Assessments start in DRAFT and are published via an explicit publish action.
- **Question selection** (MG-24): Questions can be selectively added from the question bank into an assessment with a configurable display order. Not every question in the bank is included — only those chosen by the assessor.
- **Code submission limit** (MG-25): The system enforces a maximum of one `CODE_SUBMISSION` question per assessment. Attempts to add a second one are rejected at the API level (HTTP 422); the UI disables the add action once the limit is reached.
- **Candidate preview** (MG-26): Admins and Recruiters can view the assessment exactly as a candidate would see it — question order, types, instructions, and timer display — without creating a real submission.

## Capabilities

### New Capabilities

- `assessment-crud`: Full lifecycle management of assessments (create, read, update, delete, publish) via REST API and Angular UI.
- `assessment-questions`: Selective addition and removal of questions from the question bank into an assessment, with configurable display order and enforcement of the max-one-code-submission business rule.
- `assessment-preview`: Read-only candidate-perspective view of a published or draft assessment, accessible to Admins and Recruiters before the assessment is sent to candidates.

### Modified Capabilities

*(none — this is the initial assessment builder implementation)*

## Impact

- `recruitment-be/`: New entities `Assessment` and `AssessmentQuestion`; new REST controllers; new Flyway migrations V7 and V8; all endpoints require `ADMIN` or `RECRUITER` role.
- `recruitment-fe/`: New feature routes for assessment management (`/assessments`, `/assessments/new`, `/assessments/:id/edit`, `/assessments/:id`, `/assessments/:id/preview`); reuses existing `QuestionService` for the question picker panel.
- Depends on EP-01 (role-based access control) and EP-02 (Question Bank entities and API) being in place.
- Forms the content foundation for EP-04 (Candidate & Invitations) and EP-05 (Assessment Taking).
