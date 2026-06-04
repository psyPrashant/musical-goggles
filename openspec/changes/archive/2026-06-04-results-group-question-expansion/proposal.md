## Why

GROUP question sub-questions are invisible in the results/evaluation marking view — the backend returns the GROUP as a single opaque entry with null answer and null score, so recruiters cannot see or mark individual sub-questions. The answered and marked question counts are also broken because `questions.length` counts a GROUP as 1 while `answeredCount` and `markedCount` count each sub-question individually.

## What Changes

- `ResultQuestionDto` gains an optional `subQuestions` list; when a GROUP question is encountered, the backend expands its members into nested DTOs (each with the candidate's actual answer and score)
- `SubmissionServiceImpl.getResult()` detects GROUP questions and builds nested sub-question entries from `GroupQuestion.getMembers()`
- `SubmissionServiceImpl.buildSummaries()` fixes `totalAnswers` to reflect total answerable questions (sub-questions counted) rather than duplicating `answeredCount`
- Frontend `marking.model.ts` adds `GROUP` to `QuestionType` and `subQuestions` to `ResultQuestion`
- Frontend `results.component.ts` renders GROUP questions as a preamble block followed by individually-markable sub-question rows; fixes the answered-stat denominator to sum sub-questions

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `results-group-question-expansion`: GROUP sub-questions are individually visible and markable in the results detail view; question counts correctly include sub-questions in both the detail header and the submission list

## Impact

- **Backend** — `ResultQuestionDto.java`, `SubmissionServiceImpl.java` (getResult + buildSummaries)
- **Frontend** — `marking.model.ts`, `results.component.ts`
- No database or API contract breaking changes — `subQuestions` is an additive nullable field
