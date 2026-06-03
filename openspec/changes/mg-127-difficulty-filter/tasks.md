## 1. Question bank — difficulty filter (`QuestionsComponent`)

- [ ] 1.1 Add `selectedDifficulty` signal (`signal<Difficulty | ''>('')`) to `QuestionsComponent`
- [ ] 1.2 Extend the `filtered` computed to also filter by `selectedDifficulty`
- [ ] 1.3 Add `setDifficulty(d: Difficulty | '')` method
- [ ] 1.4 Add difficulty filter chip row (All / Easy / Medium / Hard) to the template, above or below the type chips, with `active` class bound to `selectedDifficulty()`
- [ ] 1.5 Add Vitest tests: selecting Easy shows only Easy questions; selecting All clears filter; difficulty + type compose correctly

## 2. Assessment builder — difficulty filter + badges (`AssessmentDetailComponent`)

- [ ] 2.1 Add `filterDifficulty = ''` property alongside `filterType` and call `filterQuestions()` on change
- [ ] 2.2 Extend `filterQuestions()` to also filter by `filterDifficulty`
- [ ] 2.3 Add difficulty filter `<select>` (All / Easy / Medium / Hard) to the `add-controls` row in the template
- [ ] 2.4 Add a difficulty badge to each row in the available-questions picker list
- [ ] 2.5 Add a difficulty badge to each row in the existing-questions table
- [ ] 2.6 Remove `codeSubmissionLimitReached` signal, its setter calls, and the limit-warning paragraph
- [ ] 2.7 Import `Difficulty` type where needed
- [ ] 2.8 Add Vitest tests: picker filters by difficulty; badges render; All clears filter

## 3. Housekeeping

- [ ] 3.1 Append prompt to `prompts.md`
- [ ] 3.2 Commit with conventional commit message
