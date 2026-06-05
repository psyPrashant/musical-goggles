## 1. Frontend — Assessment Filter Signal & Logic

- [x] 1.1 Add `assessmentFilter = signal('')` to `ResultsComponent`
- [x] 1.2 Add `availableAssessments` computed that derives unique `{ assessmentId, assessmentTitle }` pairs from `submissions()`
- [x] 1.3 Update `filteredSubmissions` computed to apply assessment filter alongside the existing status filter

## 2. Frontend — Template

- [x] 2.1 Add assessment `<select>` dropdown to the page header (alongside the existing status filter chips), defaulting to "All Assessments"
- [x] 2.2 Bind dropdown `(change)` to `assessmentFilter.set(...)` and `[value]` to `assessmentFilter()`
- [x] 2.3 Style the dropdown consistently with existing header controls

## 3. Verification

- [x] 3.1 Confirm submission count in page sub-header updates when assessment filter is active
- [x] 3.2 Confirm assessment filter composes correctly with status filter
- [x] 3.3 Confirm selecting "All Assessments" clears the filter and restores full list
