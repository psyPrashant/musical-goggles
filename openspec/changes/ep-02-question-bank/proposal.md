## Why

The Question Bank is the central content repository of the platform — every assessment is built from questions that live here. Getting the domain model right in Sprint 1 is critical: questions must support three types (MCQ, Text, Code Submission), be organizable into groups, and be taggable for reuse. A weak model here ripples through every downstream epic.

## What Changes

- **Question CRUD** (MG-19): Admins and Recruiters can create, read, update, and delete questions of type MCQ (with answer options), Text, and Code Submission. Each question type has its own structure.
- **Question Groups** (MG-20): Questions can be collected into named groups for organisational purposes. A group is a flat, unordered collection of questions.
- **Structured Question Groups** (MG-21): Groups can be optionally marked as "structured", enforcing an explicit display order on their questions. This is required for assessments that need a specific question sequence.
- **Tags & categorisation** (MG-22): Questions can be tagged with one or more labels (e.g., "Java", "Algorithms", "Senior"). Tags enable filtering when building assessments. Tags are free-form strings — no predefined taxonomy.

## Capabilities

### New Capabilities

- `question-crud`: Full lifecycle management of questions across three types (MCQ, Text, Code Submission) via REST API and Angular UI.
- `question-groups`: Grouping questions into named, reusable collections with optional display ordering.
- `question-tags`: Tagging questions with free-form labels and filtering the question bank by tag.

### Modified Capabilities

*(none — this is the initial question bank implementation)*

## Impact

- `recruitment-be/`: New entities `Question`, `QuestionOption` (MCQ), `QuestionGroup`, `QuestionGroupItem`, `Tag`, `QuestionTag`; new REST controllers; new Flyway migrations; all endpoints require `ADMIN` or `RECRUITER` role.
- `recruitment-fe/`: New feature module/routes for question management; question list, create/edit form, group management, tag filter UI.
- Depends on EP-01 (role-based access control) being in place.
- Forms the data foundation for EP-03 Assessment Builder.
