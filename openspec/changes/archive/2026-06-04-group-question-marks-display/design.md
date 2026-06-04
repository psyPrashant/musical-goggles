## Problem

GROUP questions expose individual `maxScore` values on each sub-question at the API level (`TakeQuestionDto.subQuestions[].maxScore` and `Question.memberQuestions[].maxScore`), but neither the question bank preview nor the candidate assessment view renders these values. Only the GROUP-level total is shown.

## Solution

Pure template change in two components — no service or model modifications required.

### Question Bank (`questions.component.ts`)

Inside the expanded `.candidate-preview` for a GROUP question:

1. Add a `.group-pts-header` row immediately before the sub-question `@for` loop. It displays `q.maxScore` formatted as "X pts total" using the existing `.pts-label` class. Styled with `justify-content: flex-end` and a bottom border to visually separate it from the sub-question list.

2. Inside each `.sub-q-header`, add a `<span class="pts-label">` after the type badge, showing `sub.maxScore`.

### Candidate Assessment (`assessment-take.component.ts`)

Inside each `.sub-question-block > .sub-q-header`, add a `<span class="pts-badge">` after the type badge, showing `sub.maxScore`. The GROUP-level total on the `.question-meta` pts-badge (line 200) is already correct and unchanged.

## Alternatives Considered

**Compute total dynamically on the frontend** (sum of `sub.maxScore`) — rejected because the GROUP entity already stores its own `maxScore` which is the authoritative total; computing it differently would risk a discrepancy.
