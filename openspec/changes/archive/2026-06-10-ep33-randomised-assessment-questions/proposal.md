## Why

Candidates taking the same assessment can share answers with each other because every candidate receives an identical, deterministic question set. Randomising the questions each candidate sees — while keeping the structural balance (e.g. 5 MCQ, 2 Code, 3 Text) — reduces answer-sharing and improves assessment integrity without changing the difficulty profile.

## What Changes

- Staff can enable a **randomise questions** toggle on any assessment and configure a **per-type quota** (how many questions of each type to draw).
- On assessment start, the backend draws the configured quota for each question type at random, snapshots the selection to the submission, and serves only those questions to the candidate.
- Resuming an in-progress attempt returns the same snapshotted questions (not a new random draw).
- The assessment preview shows the randomisation quota breakdown so staff can verify the configuration before publishing.
- Assessments with `randomiseQuestions = false` behave identically to today.

## Capabilities

### New Capabilities

- `assessment-randomisation`: Staff configure a randomise-questions toggle and per-type quotas on the assessment; backend draws and snapshots a random question subset per candidate at attempt start.
- `randomised-question-preview`: Assessment preview displays the per-type quota breakdown when randomisation is enabled.

### Modified Capabilities

- `assessment-crud`: `AssessmentRequest` and `AssessmentDetail` DTOs gain `randomiseQuestions` and `randomisationQuotas` fields.
- `assessment-submission`: `loadAssessment` must respect the snapshotted question set when randomisation is enabled.

## Impact

- **Backend**: `Assessment.java`, new `RandomisationQuota.java` entity, `AssessmentServiceImpl`, `CandidateTakeServiceImpl`, two new Flyway migrations (V21, V22), updated request/response DTOs.
- **Frontend**: `assessment.model.ts`, `assessment-builder.component.ts`, `assessment-preview.component.ts`.
- **Database**: New column `assessments.randomise_questions`, new table `assessment_randomisation_quotas`, new table `submission_question_snapshots`.
- **No breaking changes** to existing assessments — default is `false`.
