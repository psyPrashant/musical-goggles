## Why

GROUP questions show a total point value on the question card and heading, but individual sub-questions have no visible mark allocation. Admin users browsing the question bank cannot see how marks are distributed across sub-questions, and candidates taking an assessment cannot see how many points each sub-question is worth while answering it.

## What Changes

- In the question bank preview for a GROUP question, a "X pts total" label is displayed above the sub-question list and each sub-question shows its individual mark allocation inline
- In the candidate assessment view, each sub-question within a GROUP shows its individual mark allocation next to its type badge; the GROUP-level total in the question meta bar is unchanged

## Capabilities

### Modified Capabilities

- `group-question-marks-display`: Sub-question mark allocations are now visible in both the question bank GROUP preview and the candidate assessment GROUP question view

## Impact

- **FE only** — no backend or API changes; `maxScore` is already present on sub-questions in both data sources
- `recruitment-fe/src/app/features/questions/questions.component.ts`: Add `pts-label` badge to each sub-question header; add `group-pts-header` total line above sub-question list
- `recruitment-fe/src/app/features/assessments/assessment-take.component.ts`: Add `pts-badge` to each sub-question header in the GROUP block
