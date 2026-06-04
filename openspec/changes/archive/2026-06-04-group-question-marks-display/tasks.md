## 1. Question Bank — Sub-question Points Display

- [x] 1.1 In `questions.component.ts` GROUP preview, add `<span class="pts-label">` to each `.sub-q-header` after the type badge, showing `sub.maxScore`
- [x] 1.2 Add a `.group-pts-header` div before the `@for` loop showing `q.maxScore` as "X pts total"
- [x] 1.3 Add `.group-pts-header` CSS rule (flex, justify-end, bottom border)

## 2. Candidate Assessment — Sub-question Points Display

- [x] 2.1 In `assessment-take.component.ts` GROUP block, add `<span class="pts-badge">` to each `.sub-q-header` after the type badge, showing `sub.maxScore`

## 3. Verification

- [ ] 3.1 Run `npm start`, open question bank, expand a GROUP question preview — confirm each sub-question shows pts badge and header shows "X pts total"
- [ ] 3.2 As candidate, open an assessment with a GROUP question — confirm each sub-question shows its pts badge inline; GROUP meta bar total unchanged
- [ ] 3.3 Run `npx tsc --noEmit` — no type errors
- [ ] 3.4 Run `npm test` — no regressions
