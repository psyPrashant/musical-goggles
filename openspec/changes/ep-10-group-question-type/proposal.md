## Why

Question groups currently exist as a separate organizational concept (a folder/collection in the question bank) with no connection to assessments. This makes them invisible to candidates and useless for constructing scenario-based assessments. By replacing the separate concept with a first-class GROUP question type — treated identically to MCQ, TEXT, and CODE_SUBMISSION — recruiters can build assessments that present a preamble text followed by multiple related sub-questions, which is standard practice for technical scenario assessments.

## What Changes

- **BREAKING**: Remove the `question_groups` and `question_group_items` tables and all associated domain, service, repository, and controller code.
- Add `GROUP` to `QuestionType`; add `group_questions` (JPA joined-inheritance sub-table) and `group_question_members` (ordered sub-question join table) via DB migration V10.
- Add `GroupQuestion` and `GroupQuestionMember` JPA entities; update `QuestionServiceImpl` to create and list GROUP questions.
- Update `AssessmentServiceImpl` to include GROUP questions in assessment previews with nested `subQuestions`.
- Update the assessment builder FE to show GROUP as a filter chip and type badge.
- Update the assessment take FE to render GROUP questions as a preamble + individual sub-questions, with answers stored per sub-question id.

## Capabilities

### New Capabilities

- `group-question-type`: A GROUP question type that can be created in the question bank with ordered sub-questions, added to an assessment, and taken by candidates as a scenario block with individually answerable sub-questions.

### Modified Capabilities

- `question-crud`: The `POST /api/questions` endpoint now accepts `type: GROUP` with a `memberQuestionIds` list. The `GET /api/questions` list now returns GROUP questions. The question-groups feature is removed.
- `assessment-questions`: The assessment preview response now includes a `subQuestions` list on GROUP-type questions. Assessment builder supports adding GROUP questions.

## Impact

**Backend — new files:**
- `domain/GroupQuestion.java`, `domain/GroupQuestionMember.java`
- `dashboard/` package (separate EP-09 concern — not part of EP-10)

**Backend — modified files:**
- `domain/QuestionType.java`
- `QuestionRequest.java`, `QuestionServiceImpl.java`
- `AssessmentServiceImpl.java` — `toPreviewQuestion()` and preview DTOs
- `db/migration/V10__group_question_type.sql`

**Backend — deleted files:**
- `domain/QuestionGroup.java`, `domain/QuestionGroupItem.java`
- `QuestionGroupController.java`, `QuestionGroupService.java`, `QuestionGroupServiceImpl.java`, `QuestionGroupRepository.java`
- Related DTOs

**Frontend — modified files:**
- `question.model.ts`, `assessment.model.ts`
- `assessment-builder.component.ts`
- `assessment-take.component.ts`, `candidate-take.model.ts`

**Frontend — deleted:**
- Question-groups UI in question bank feature
