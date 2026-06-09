## Context

The results detail header contains an `.answered-stat` div that shows how many questions the candidate answered out of the total. The current template reads `result()!.answeredCount / result()!.maxScore`, but `maxScore` is the total point value of the assessment (e.g. 34 pts), not the question count (e.g. 10 questions). This produces misleading output like "5/34 answered".

The `ResultSummary` model already includes `questions: ResultQuestion[]`, so `questions.length` gives the correct total without any API or model changes.

## Goals / Non-Goals

**Goals:**
- Answered stat denominator reflects question count, not point value

**Non-Goals:**
- Changes to the score display (`totalScore / maxScore pts`) — that line is correct
- Backend or model changes

## Decisions

**Use `result()!.questions.length` as the denominator** rather than adding a dedicated `totalQuestions` field to the model. The questions array is already present on the result object and its length is the authoritative question count for the submission. No extra field or API call is needed.
