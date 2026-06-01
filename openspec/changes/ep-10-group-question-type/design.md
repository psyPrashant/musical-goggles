## Context

The current question-groups feature (`question_groups`, `question_group_items` tables; `QuestionGroup`, `QuestionGroupItem` entities) provides a way to tag/collect questions in the bank but has no connection to the assessment delivery pipeline. Candidates never see groups; they exist only as an organizer for recruiters.

The replacement design makes GROUP a peer of MCQ, TEXT, and CODE_SUBMISSION via JPA JOINED inheritance. A `GroupQuestion` owns an ordered list of member `Question` rows. When added to an assessment, it appears as one entry in the question list but renders as a preamble + multiple sub-questions in the take view. Answers are stored per sub-question id — no new answer schema is needed.

The existing `questions.type` column has an inline PostgreSQL CHECK constraint (auto-named `questions_type_check`) that must be widened. The old tables have no production data (only the dev admin user is seeded) so they can be dropped cleanly.

## Goals / Non-Goals

**Goals:**
- GROUP is a first-class question type: created in the bank, added to assessments, answered by candidates
- Sub-questions are regular `Question` rows (MCQ, TEXT, or CODE_SUBMISSION) — not a new question category
- Existing question CRUD, assessment builder, and take flow continue to work without modification for non-GROUP types
- Old question-groups code is cleanly removed

**Non-Goals:**
- Nested groups (groups inside groups)
- Random sub-question selection from a pool (all members always shown)
- Partial scoring at the group level — scoring remains per-sub-question
- Migration of any existing `question_group` data (none exists in production or dev)

## Decisions

**Decision 1: JPA JOINED inheritance for GroupQuestion (not embedding group logic in a separate table)**

`GroupQuestion extends Question` with its own `group_questions` table (containing only `id`). This mirrors the existing `McqQuestion`, `TextQuestion`, `CodeSubmissionQuestion` pattern exactly. The discriminator column `type = 'GROUP'` lets `QuestionRepository.findAll()` return GROUP rows without any changes to list queries.

*Alternatives considered:* Separate `GroupQuestion` entity not in the inheritance hierarchy — breaks `AssessmentQuestion.question` FK which points to `questions.id`; the assessment service would need special-casing at every join.

**Decision 2: `group_question_members` as a separate join table (not reusing `question_group_items`)**

A new `group_question_members` table with `(group_question_id, question_id, display_order)` keeps the schema aligned with the new concept and avoids confusing column names from the old table. The old table is dropped.

*Alternatives considered:* Rename `question_group_items` — Flyway immutability means renaming requires a new migration anyway; creating a new table is cleaner.

**Decision 3: Sub-questions are answered by their own UUID (not the group's UUID)**

The `CandidateAnswer` table stores answers keyed by `question_id`. Sub-questions are regular `Question` rows with their own UUIDs. The submit payload from the FE sends one `AnswerInput` per sub-question id. The `AssessmentTakeResponse` includes sub-question ids via the `subQuestions` field in the preview. No schema changes to `candidate_answers` or `answer_scores` are required.

*Alternatives considered:* Answer keyed by `(group_id, sub_question_id)` — requires schema changes to `candidate_answers` and all downstream marking logic; unnecessary complexity.

**Decision 4: Remove the old question-groups feature entirely (not deprecate)**

No production data exists in `question_groups`. No API consumers depend on the endpoints (the FE is the only consumer). A clean removal avoids dead-code confusion. The migration drops both tables.

*Alternatives considered:* Keep old feature alongside — two overlapping concepts would confuse recruiters and developers.

**Decision 5: CODE_SUBMISSION-per-assessment limit applies to top-level questions only**

The current `AssessmentServiceImpl` limits one CODE_SUBMISSION per assessment. Sub-questions inside a GROUP are not top-level, so they do not count toward this limit. This is the most intuitive behaviour (a scenario group can have a coding sub-question without conflicting with a top-level coding question). Document this as a comment in `AssessmentServiceImpl`.

*Alternatives considered:* Count all CODE_SUBMISSION questions including sub-questions — overly restrictive for scenario-based assessments.

## Risks / Trade-offs

- **V10 migration drops tables:** If the migration is applied to a DB that has question-groups data (possible in a fork or QA environment), that data is lost. Mitigation: confirm no data exists before applying; add a pre-migration check comment.
- **FE assessment-take complexity:** GROUP questions require conditional rendering that is more complex than flat questions. Mitigation: keep GROUP rendering as an isolated `@if (q.type === 'GROUP')` block; sub-question rendering reuses existing type-switch logic.
- **Hibernate proxy issues:** `AssessmentServiceImpl.toPreviewQuestion()` uses `Hibernate.unproxy()` + `instanceof` chain. Adding `GroupQuestion` to the chain is mechanical but must not be missed. Mitigation: unit-test the preview response for GROUP questions explicitly.

## Migration Plan

1. Apply `V10__group_question_type.sql` — widens the type constraint, creates new tables, drops old tables.
2. Deploy backend changes (new entities, updated service, controller) — same deployment as V10.
3. Deploy frontend changes — assessment builder and take view updates.
4. Verify: create a GROUP question via the question bank, add it to an assessment, take the assessment as a candidate, mark the sub-question answers.
