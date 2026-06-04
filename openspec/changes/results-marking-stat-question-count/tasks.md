## 1. Fix answered-stat denominator

- [x] 1.1 In `results.component.ts` line 132, change `result()!.maxScore` to `result()!.questions.length` in the `.answered-stat` div

## 2. Verification

- [x] 2.1 Open the results detail page for a submission — confirm the answered stat reads "X/Y answered" where Y is the question count (not the max score points)
- [x] 2.2 Run `npx tsc --noEmit` — no type errors
- [x] 2.3 Run `npm test` — no regressions
