## Why

Building a GROUP/Scenario question today requires every sub-question to already exist in the question bank — recruiters must leave the form, create each sub-question separately, then come back and pick them. The GROUP question's points also have to be entered manually and kept in sync with its sub-questions by hand, which drifts from reality. This change lets recruiters author sub-questions inline while building a GROUP question, and makes the GROUP's total points an automatically-derived sum instead of a manually-entered number.

## What Changes

- The GROUP/Scenario question form gains a "Create new sub-question" mini-form (type: MCQ / TEXT / CODE_SUBMISSION, title, body, points, MCQ options, language hint) that appends a new sub-question to the ordered sub-question list, alongside the existing bank-search picker.
- Newly-authored sub-questions are visually marked (e.g. "New" badge) in the sub-question list but are reorderable/removable like bank-picked ones.
- On submit, newly-authored sub-questions are persisted as standalone questions first (becoming normal, reusable bank questions), then linked as GROUP members in display order together with any bank-picked members.
- The "at least 2 sub-questions" validation applies to the combined (bank + new) list.
- **BREAKING**: The "Points (max score)" field is removed from the form for GROUP questions and replaced with a read-only, live-computed "Total points" value (sum of all sub-questions' points).
- The backend always computes a GROUP question's `maxScore` as the sum of its members' `maxScore` at save time, ignoring any client-supplied `maxScore` for `type=GROUP`. This applies to both create and update.

## Capabilities

### New Capabilities
- `group-question-inline-authoring`: Recruiters can create new sub-questions directly within the GROUP question form, in addition to picking existing questions from the bank.

### Modified Capabilities
- `group-question-type`: GROUP question `maxScore` is always server-computed as the sum of its members' `maxScore`, for both create and update — not a client-supplied value.
- `question-crud`: The question form removes the editable "Points" field for GROUP questions and shows a read-only computed total instead; the GROUP creation flow now supports a mixed list of bank-picked and newly-authored sub-questions.

## Impact

- **Frontend**: `recruitment-fe/src/app/features/questions/question-form.component.ts` — add inline sub-question mini-form, "New" badges, computed total points display, conditional Points field, multi-step submit (create new sub-questions then create the GROUP).
- **Backend**: `recruitment-be/src/main/java/com/psybergate/recruitment/question/QuestionServiceImpl.java` — `buildGroup()` and `update()` compute `maxScore` from members for GROUP questions instead of trusting `req.maxScore()`.
- No database schema changes — `V16.2__fix_group_max_scores.sql` already established the sum as the correct historical value; this change makes it the standing invariant going forward.
