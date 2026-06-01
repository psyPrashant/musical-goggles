## 1. Database Migration V10 (MG-66)

- [ ] 1.1 Create `V10__group_question_type.sql`: drop `questions_type_check` constraint and re-add it with `GROUP` included (`CHECK (type IN ('MCQ', 'TEXT', 'CODE_SUBMISSION', 'GROUP'))`)
- [ ] 1.2 Create `group_questions` table: `id UUID PRIMARY KEY REFERENCES questions(id) ON DELETE CASCADE`
- [ ] 1.3 Create `group_question_members` table: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `group_question_id UUID REFERENCES questions(id) ON DELETE CASCADE`, `question_id UUID REFERENCES questions(id) ON DELETE CASCADE`, `display_order INT NOT NULL DEFAULT 0`, `UNIQUE (group_question_id, question_id)`
- [ ] 1.4 Drop `question_group_items` table
- [ ] 1.5 Drop `question_groups` table
- [ ] 1.6 Verify migration applies cleanly on a fresh DB (run `./mvnw spring-boot:run` and confirm Flyway runs V10 without error)

## 2. Backend Domain Entities (MG-67)

- [ ] 2.1 Create `GroupQuestionMember.java` entity: `@Table("group_question_members")`, fields `id`, `groupQuestion` (ManyToOne FK to `GroupQuestion`), `question` (ManyToOne FK to `Question`), `displayOrder`
- [ ] 2.2 Create `GroupQuestion.java`: `@Entity @Table("group_questions") @DiscriminatorValue("GROUP") extends Question`; `@OneToMany(mappedBy="groupQuestion", cascade=ALL, orphanRemoval=true) @OrderColumn("display_order") List<GroupQuestionMember> members`; `getType()` returns `QuestionType.GROUP`
- [ ] 2.3 Add `GROUP` to `QuestionType.java` enum
- [ ] 2.4 Add `GroupQuestionRepository.java` extending `JpaRepository<GroupQuestion, UUID>` (optional, may not be needed if base `QuestionRepository` suffices)
- [ ] 2.5 Confirm app starts with no Hibernate validation errors

## 3. Remove Old Question-Groups Code (MG-69)

- [ ] 3.1 Delete `domain/QuestionGroup.java`
- [ ] 3.2 Delete `domain/QuestionGroupItem.java`
- [ ] 3.3 Delete `QuestionGroupRepository.java`
- [ ] 3.4 Delete `QuestionGroupService.java`, `QuestionGroupServiceImpl.java`
- [ ] 3.5 Delete `QuestionGroupController.java` and any related DTOs/request classes
- [ ] 3.6 Remove any `@Autowired` / injection references to `QuestionGroupRepository` or service from other classes
- [ ] 3.7 Confirm the project compiles cleanly (`./mvnw clean package -DskipTests`)

## 4. Backend Services: Create and List GROUP Questions (MG-68)

- [ ] 4.1 Add `List<UUID> memberQuestionIds` field to `QuestionRequest.java`
- [ ] 4.2 In `QuestionServiceImpl.buildEntity()`, add `case GROUP`: load each member question by id (throw 404 if any missing), build `GroupQuestionMember` list in order, set on `GroupQuestion`
- [ ] 4.3 Add validation: if `type == GROUP` and `memberQuestionIds` has fewer than 2 entries, throw 400
- [ ] 4.4 Ensure `GET /api/questions` and `GET /api/questions/{id}` return GROUP questions with their members (update any `toDto()` / `toSummary()` methods to handle `GroupQuestion` instanceof)

## 5. Backend Services: Assessment Preview with Sub-Questions (MG-68)

- [ ] 5.1 Add `List<PreviewQuestionDto> subQuestions` field (nullable) to the assessment preview question DTO
- [ ] 5.2 In `AssessmentServiceImpl.toPreviewQuestion()`, add `instanceof GroupQuestion` branch: map `body` as preamble, map `members` to a list of `PreviewQuestionDto` using the existing per-type mapping logic; set `subQuestions`
- [ ] 5.3 Update the CODE_SUBMISSION-per-assessment limit check: only count top-level questions (i.e. exclude questions whose id appears as a member in a GROUP); add a comment explaining the decision
- [ ] 5.4 Verify the existing `SubmissionServiceImpl` and `MarkingServiceImpl` work correctly with sub-question ids (they query by `question_id` which is the sub-question's own id — no change needed, but add a test to confirm)

## 6. Remove Old Question-Groups FE (MG-69)

- [ ] 6.1 Remove question-groups UI section from the question bank feature component (any `@if` blocks, template, styles, and methods referencing QuestionGroup)
- [ ] 6.2 Remove `QuestionGroup`-related models from `question.model.ts` if present
- [ ] 6.3 Remove any `questionGroupService` calls or imports from the question bank feature
- [ ] 6.4 Confirm no broken template bindings or TypeScript compilation errors (`npx tsc --noEmit`)

## 7. Frontend: GROUP Type in Assessment Builder (MG-70)

- [ ] 7.1 Add `'GROUP'` to the `QuestionType` union in `question.model.ts`; add `memberQuestionIds?: string[]` field
- [ ] 7.2 Add `'GROUP'` to the `QuestionType` union in `assessment.model.ts`; add `subQuestions?: PreviewQuestion[]` to the preview question interface
- [ ] 7.3 In `assessment-builder.component.ts`: add `{ value: 'GROUP', label: 'Group' }` to the bank type filter chips array
- [ ] 7.4 Add `'type-group'` CSS class (teal, matching existing `type-mcq`, `type-text`, `type-code_submission` pattern) for the GROUP type badge
- [ ] 7.5 In the selected-questions list template, for GROUP questions show the sub-question count as additional info (e.g. "3 sub-questions")
- [ ] 7.6 Confirm GROUP questions can be added and removed from an assessment via the builder UI

## 8. Frontend: GROUP Rendering in Assessment Take (MG-71)

- [ ] 8.1 Add `subQuestions?: TakeQuestionDto[]` to `TakeQuestionDto` in `candidate-take.model.ts`
- [ ] 8.2 In `assessment-take.component.ts`, add `@if (q.type === 'GROUP')` branch in the question render area: render `q.body` as a preamble block, then `@for (sub of q.subQuestions; track sub.id)` rendering each sub-question using the existing MCQ/TEXT/CODE_SUBMISSION type-switch logic
- [ ] 8.3 Answer map (`answers` signal or equivalent) is keyed by question id — sub-question answers are already naturally keyed by `sub.id`; verify the submit payload sends one `AnswerInput` per sub-question id (not the group id)
- [ ] 8.4 Navigation panel "answered" logic: GROUP question is "answered" only when all sub-questions have a non-empty answer; update the `isAnswered(q)` helper accordingly
- [ ] 8.5 Confirm "unanswered questions" warning on submit counts sub-questions correctly

## 9. Verification

- [ ] 9.1 Run `./mvnw test` — all backend tests pass
- [ ] 9.2 Run `npm test` — all frontend tests pass
- [ ] 9.3 Manual: create a GROUP question (1 MCQ + 1 TEXT sub-question) via the question bank
- [ ] 9.4 Manual: add the GROUP question to a PUBLISHED assessment via the builder; confirm it appears in the question list
- [ ] 9.5 Manual: take the assessment as a candidate; GROUP shows preamble + both sub-questions; answer both; submit
- [ ] 9.6 Manual: open the results view for the submission; both sub-questions appear as separate marking items; score each; confirm result summary shows the combined score
- [ ] 9.7 Manual: confirm `GET /api/questions?type=GROUP` returns the group; `GET /api/questions?type=MCQ` does not return it
