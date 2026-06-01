## 1. State & Signals

- [x] 1.1 Add `readonly allQuestions = signal<Question[]>([])` — populated from the bank when GROUP type is selected
- [x] 1.2 Add `readonly memberQuestions = signal<Question[]>([])` — ordered list of selected sub-questions
- [x] 1.3 Add `readonly bankSearch = signal('')` — drives the picker search filter
- [x] 1.4 Add `readonly bankLoading = signal(false)` — shows loading state while the bank is fetched
- [x] 1.5 Add `readonly memberError = signal<string | null>(null)` — validation message for the member list
- [x] 1.6 Add `readonly filteredBank = computed(...)` — returns `allQuestions` excluding GROUP-type entries, already-selected members, and questions not matching `bankSearch`

## 2. Type Selector

- [x] 2.1 Add `{ value: 'GROUP', label: 'Group / Scenario' }` to the `typeOptions` array
- [x] 2.2 Update `setType()`: add a `GROUP` branch that resets `memberQuestions` and `bankSearch`, sets `bankLoading(true)`, calls `svc.listQuestions()`, populates `allQuestions`, then sets `bankLoading(false)`; handle API errors gracefully

## 3. Template — GROUP Section

- [x] 3.1 Add `@if (form.get('type')?.value === 'GROUP')` block in the template, below the CODE_SUBMISSION section
- [x] 3.2 Inside the block: render a search input bound to `bankSearch` signal
- [x] 3.3 Show a loading message while `bankLoading()` is true
- [x] 3.4 Render `filteredBank()` results as a list of clickable rows — each showing the question's type badge and title with an "Add" button calling `addMember(q)`
- [x] 3.5 Show an empty-state message ("No matching questions" or "No more questions available") when `filteredBank()` is empty and `bankLoading()` is false
- [x] 3.6 Render `memberQuestions()` as an ordered member list — each row shows position number, type badge, title, and a remove button calling `removeMember(q.id)`
- [x] 3.7 Show `memberError()` below the member list (consistent with `mcqError()` placement)

## 4. Methods

- [x] 4.1 Add `addMember(q: Question)` — appends `q` to `memberQuestions`
- [x] 4.2 Add `removeMember(id: string)` — filters `q.id !== id` from `memberQuestions`
- [x] 4.3 Add `typeLabel(type: string): string` helper (or reuse existing pattern) for rendering type badges in the picker

## 5. Form Submission

- [x] 5.1 In `submit()`, add a GROUP validation block: if `memberQuestions().length < 2`, set `memberError` and return early
- [x] 5.2 In the `payload` spread, add `...(type === 'GROUP' && { memberQuestionIds: this.memberQuestions().map(q => q.id) })`
- [x] 5.3 Clear `memberError` on a valid GROUP submission attempt (before the API call)

## 6. Edit Mode Guard

- [x] 6.1 In `ngOnInit()`, after loading the existing question, check if `q.type === 'GROUP'`; if so, set a `readonly groupEditBlocked = signal(false)` flag to `true`
- [x] 6.2 In the template, add an `@if (groupEditBlocked())` block above the form that renders an informational banner: "Group questions cannot be edited. Delete this question and recreate it if changes are needed."
- [x] 6.3 Hide the submit button when `groupEditBlocked()` is true

## 7. Styles

- [x] 7.1 Add `.bank-picker` wrapper styles: border, border-radius, max-height with overflow-y scroll for the results list
- [x] 7.2 Add `.bank-row` styles: flex row with type badge, title, and add button aligned
- [x] 7.3 Add `.member-row` styles: flex row with position number, type badge, title, and remove button; slightly different background to distinguish from the picker

## 8. TypeScript & Tests

- [x] 8.1 Run `npx tsc --noEmit` — zero errors
- [x] 8.2 Run `npm test` — all existing tests pass
