## 1. Backend — ResultQuestionDto (add subQuestions)

- [x] 1.1 Add `List<ResultQuestionDto> subQuestions` field to `ResultQuestionDto.java` (nullable; null for non-GROUP questions)

## 2. Backend — getResult() GROUP expansion

- [x] 2.1 In `SubmissionServiceImpl.getResult()`, detect GROUP questions (`rawQ.getType() == QuestionType.GROUP`) and cast to `GroupQuestion`
- [x] 2.2 For each GROUP, iterate `gq.getMembers()` ordered by `displayOrder`; for each member question look up its `CandidateAnswer` and `AnswerScore` from the existing maps; build a child `ResultQuestionDto` (with `subQuestions = null`)
- [x] 2.3 Add the GROUP entry to `questionDtos` with its preamble title, null answer/score, and the list of child DTOs as `subQuestions`
- [x] 2.4 Ensure `GroupQuestion.members` and each member's `question` are loaded (use `Hibernate.unproxy` or verify eager fetch to avoid LazyInitializationException)

## 3. Backend — fix totalAnswers in buildSummaries()

- [x] 3.1 In `SubmissionServiceImpl.buildSummaries()`, compute `totalAnswerableByAssessment`: for each distinct `assessmentId` in the submission batch, count non-GROUP assessment questions + sum of each GROUP's member count
- [x] 3.2 Replace the second `answered` argument in `new SubmissionSummaryResponse(...)` with the assessment's total answerable count from the map above

## 4. Frontend — marking.model.ts

- [x] 4.1 Add `'GROUP'` to the `QuestionType` union type
- [x] 4.2 Add `subQuestions?: ResultQuestion[]` field to the `ResultQuestion` interface

## 5. Frontend — results.component.ts rendering

- [x] 5.1 In the question list loop (`@for (q of result()!.questions...)`), add a `@if (q.questionType === 'GROUP')` branch that renders the GROUP preamble title as a section header followed by `@for (sub of q.subQuestions...)` rendering each sub-question with its answer, score, and feedback
- [x] 5.2 Keep the existing non-GROUP rendering path unchanged (`@else` branch)
- [x] 5.3 Add a `totalQuestionCount()` computed helper (or inline signal) that sums `subQuestions.length` for GROUP questions and 1 for all others
- [x] 5.4 Replace `result()!.questions.length` in the answered-stat div with the new total count

## 6. Verification

- [x] 6.1 Rebuild Docker frontend + backend; open results detail for a submission with a GROUP question — confirm GROUP preamble and each sub-question row appear with answer and score
- [x] 6.2 Confirm the answered stat reads "X/Y answered" where Y counts sub-questions
- [x] 6.3 Confirm the submission list "x/x marked" denominator counts sub-questions
- [x] 6.4 Run `npx tsc --noEmit` — no type errors
- [x] 6.5 Run `npm test` — no regressions
