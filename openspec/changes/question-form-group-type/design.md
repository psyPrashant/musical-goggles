## Context

`QuestionFormComponent` is a reactive-forms component with a type selector (currently three buttons) and conditional field sections per type. MCQ shows an options `FormArray`; CODE_SUBMISSION shows a language hint input; TEXT shows only title/body/tags.

GROUP requires a fundamentally different input pattern — instead of direct field inputs, the recruiter picks from *existing* questions. The member list is ordered (display order = insertion order) and must contain at least 2 items.

Current state of relevant code:
- `typeOptions` array: 3 entries (MCQ, TEXT, CODE_SUBMISSION)
- `submit()`: no GROUP branch, payload never includes `memberQuestionIds`
- `setType()`: resets MCQ options on type switch; no GROUP case
- `QuestionService.listQuestions()`: already exists, accepts optional `type` filter

## Goals / Non-Goals

**Goals:**
- Recruiter can create a GROUP question with an ordered list of ≥ 2 sub-questions
- The member picker shows a live-filtered list from the question bank
- Already-selected members are hidden from the picker to avoid duplicates
- GROUP questions are excluded from being members (no nesting)
- Existing types are unchanged
- Edit mode shows a read-only notice for GROUP questions (backend has no GROUP update path)

**Non-Goals:**
- Drag-to-reorder sub-questions (insertion order is sufficient for v1)
- Creating new sub-questions inline (they must already exist in the bank)
- Editing an existing GROUP question's member list
- Multiple-correct MCQ support (pre-existing out-of-scope)

## Decisions

### 1. Signal-based member list, not FormArray

The member list is a `signal<Question[]>` rather than a `FormArray`. Reasons: members are full `Question` objects (needed for display), not primitive form values; the "add" and "remove" operations are list mutations not form field edits; validation is a single count check rather than per-field validators. A `memberError` signal holds the validation message, consistent with the existing `mcqError` pattern.

**Alternative considered:** FormArray of UUID controls — more idiomatic reactive forms, but adds complexity (mapping Question→UUID on add, UUID→Question for display) for no real gain.

### 2. Load the full question bank on GROUP type selection, filter client-side

When the recruiter selects GROUP type, `svc.listQuestions()` is called once to populate `allQuestions`. Subsequent search filtering is computed client-side from a `bankSearch` signal. This avoids debounced HTTP calls per keystroke and keeps the UX snappy for the typical bank size (< 500 questions).

**Alternative considered:** Server-side search on each keystroke — unnecessary complexity, higher latency for small datasets.

### 3. Edit mode: read-only notice for GROUP

`QuestionServiceImpl.update()` has no GROUP case and would throw 400. Rather than silently failing, when `editId()` is set and the loaded question type is GROUP, the form renders a notice: *"Group questions cannot be edited via this form. To change the sub-questions, delete and recreate the group."* The save button is hidden.

**Alternative considered:** Disable the form entirely — confusing, because the recruiter can still see the group details. A visible notice is clearer.

## Risks / Trade-offs

- **Bank load on type switch**: If the question bank is empty or the API call fails, the bank picker shows nothing. Mitigation: show a loading state and an error message if the API call fails.
- **No reorder support**: Members are added in the order clicked. If a recruiter wants a different order they must remove and re-add. Acceptable for v1 given the small member counts expected.

## Migration Plan

Frontend-only change; no DB migrations, no backend deploy needed. Deploy the frontend bundle.
