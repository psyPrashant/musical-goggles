## Why

The answered-count stat under the marking badge on the results detail page uses `maxScore` (total available points) as the denominator, producing nonsensical output like "5/34 answered" when the assessment has 10 questions worth 34 pts total. The denominator should be the number of questions, not the point value.

## What Changes

- The `.answered-stat` line in the results detail header changes its denominator from `result()!.maxScore` to `result()!.questions.length`, so it reads e.g. "5/10 answered" instead of "5/34 answered"

## Capabilities

### New Capabilities

<!-- none -->

### Modified Capabilities

- `results-marking-stat-question-count`: The answered-count stat in the results detail header now uses question count as the denominator instead of max score

## Impact

- **FE only** — one-line template change
- `recruitment-fe/src/app/features/results/results.component.ts` line 132: change `result()!.maxScore` → `result()!.questions.length` in the `.answered-stat` div
