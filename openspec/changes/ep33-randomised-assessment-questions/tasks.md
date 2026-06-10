## 1. Database Migrations

- [x] 1.1 Write `V21__add_assessment_randomisation.sql`: add `randomise_questions BOOLEAN NOT NULL DEFAULT FALSE` to `assessments`; create `assessment_randomisation_quotas (id UUID PK, assessment_id UUID FK, question_type VARCHAR(50) NOT NULL, count INT NOT NULL)`
- [x] 1.2 Write `V22__add_submission_question_snapshot.sql`: create `submission_question_snapshots (id UUID PK, submission_id UUID FK NOT NULL, question_id UUID NOT NULL, display_order INT NOT NULL)`

## 2. Backend — Domain & DTOs

- [x] 2.1 Create `RandomisationQuota.java` entity with fields `id`, `questionType`, `count`, `assessment` (ManyToOne); table `assessment_randomisation_quotas`
- [x] 2.2 Add `randomiseQuestions` (boolean, default false) and `randomisationQuotas` (OneToMany, cascade ALL, orphanRemove) to `Assessment.java`
- [x] 2.3 Create `RandomisationQuotaDto.java` with `questionType` and `count`
- [x] 2.4 Add `randomiseQuestions` and `randomisationQuotas` fields to `AssessmentRequest.java`
- [x] 2.5 Expose `randomiseQuestions` and `randomisationQuotas` in `AssessmentDetailResponse` (and preview response if separate)
- [x] 2.6 Create `SubmissionQuestionSnapshot.java` entity (or `@Embeddable`) for the snapshot table

## 3. Backend — Assessment Service (MG-163)

- [x] 3.1 Update `AssessmentServiceImpl` create/update methods to persist `RandomisationQuota` entries from the request (clear existing, save new)
- [x] 3.2 Add validation: if `randomiseQuestions = true`, require at least one quota with `count ≥ 1`

## 4. Backend — Candidate Take Service (MG-164)

- [x] 4.1 In `CandidateTakeServiceImpl.loadAssessment()`, check for existing snapshot rows for the submission
- [x] 4.2 If no snapshot exists and `randomiseQuestions = true`: group questions by type, shuffle each group, take `quota.count` from each, validate count ≤ available, merge and persist snapshot rows
- [x] 4.3 If snapshot exists: load questions by snapshotted IDs (preserving display order)
- [x] 4.4 If `randomiseQuestions = false`: existing behaviour unchanged (fetch all by `displayOrder`)

## 5. Frontend — Models (assessment.model.ts)

- [x] 5.1 Add `RandomisationQuota` interface `{ questionType: QuestionType; count: number }`
- [x] 5.2 Add `randomiseQuestions: boolean` and `randomisationQuotas: RandomisationQuota[]` to `AssessmentDetail`, `AssessmentRequest`, and `AssessmentPreview` interfaces

## 6. Frontend — Assessment Builder (MG-163)

- [x] 6.1 Add `randomiseQuestions` signal (default `false`) and `randomisationQuotas` signal (map of QuestionType → count) to `assessment-builder.component.ts`
- [x] 6.2 In Step 3 (Settings), add a toggle for "Randomise questions"
- [x] 6.3 When toggle is on, render a quota row for each `QuestionType` present in the current question list (Step 2), with a number input bounded by `[0, count of that type]`
- [x] 6.4 Add validation: if randomisation is on, total quota must be ≥ 1
- [x] 6.5 Include `randomiseQuestions` and `randomisationQuotas` in the assessment save/update payload
- [x] 6.6 Populate signals from existing `AssessmentDetail` when editing an existing assessment

## 7. Frontend — Assessment Preview (MG-165)

- [x] 7.1 In `assessment-preview.component.ts`, conditionally render a quota summary block when `randomiseQuestions = true` (e.g. "Randomised: 5 MCQ · 2 Code · 3 Text")
- [x] 7.2 Map `QuestionType` enum values to readable labels (MCQ → "MCQ", TEXT → "Text", CODE_SUBMISSION → "Code", GROUP → "Group")
- [x] 7.3 Ensure no randomisation UI appears when `randomiseQuestions = false`

## 8. Verification

- [x] 8.1 Start backend and confirm V21 and V22 Flyway migrations run without error
- [ ] 8.2 Create an assessment with ≥5 MCQ and ≥3 TEXT questions; enable randomisation with quotas (3 MCQ, 2 TEXT); publish it
- [ ] 8.3 Start the assessment as a candidate; confirm exactly 5 questions returned (3 MCQ + 2 TEXT)
- [ ] 8.4 Refresh/resume; confirm the same 5 questions are returned
- [ ] 8.5 Start the same assessment as a second candidate; confirm a different random selection (run a few times to confirm variance)
- [ ] 8.6 View the assessment preview as staff; confirm "Randomised: 3 MCQ · 2 Text" is shown
- [ ] 8.7 Disable the toggle; confirm all questions are served and preview shows no randomisation info
- [x] 8.8 Run `./mvnw test` and confirm no regressions (35 unit tests pass; integration tests require Docker which is unavailable in this environment — pre-existing)
