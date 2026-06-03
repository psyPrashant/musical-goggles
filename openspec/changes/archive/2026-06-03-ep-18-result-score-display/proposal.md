## Why

Staff on the Results & Evaluation page see a candidate's raw total score (e.g. "6 pts") with no context — there is no denominator, no percentage, and no indication of how many questions the candidate actually attempted. This forces manual mental arithmetic and slows evaluation. EP-18 adds three additive display enrichments to give staff an at-a-glance picture of performance.

## What Changes

- Show score as a percentage on each submission in the results list, so staff can compare candidates without opening each result (MG-115)
- Show score as "X/Y" fraction in the result detail header, replacing the contextless "X pts" (MG-116)
- Show how many questions the candidate answered in the result detail view, so staff can understand engagement (MG-117)

## Capabilities

### New Capabilities

- `score-percentage-results-list`: Submission list items show the candidate's percentage score (rounded to nearest integer) when fully marked, or "—" when pending or not started.
- `questions-answered-result-detail`: Result detail header includes a stat showing "X/Y answered" where X is questions the candidate responded to and Y is the total question count.

### Modified Capabilities

- `score-fraction-result-detail`: Result detail header score block changes from "X pts" to "X/Y" where Y is the total question count.

## Impact

- **Backend**: `ResultSummaryResponse` and `SubmissionSummaryResponse` DTOs gain new fields (`maxScore`, `answeredCount`, `totalScore`); `SubmissionServiceImpl` computes them; `AssessmentQuestionRepository` gets a batch count query.
- **Frontend**: `marking.model.ts` interfaces extended; `results.component.ts` template and class updated for all three display changes.
- **Database**: No migration required — all data is derived from existing tables.
