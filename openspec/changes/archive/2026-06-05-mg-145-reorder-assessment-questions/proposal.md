## Why

Recruiters cannot reorder questions once added to an assessment builder, forcing them to remove and re-add questions to achieve a desired order. The backend `assessment_questions` table already tracks `displayOrder`, but the assessment builder UI exposes no controls to change it.

## What Changes

- Add move-up / move-down arrow buttons to each question card in the assessment builder (`assessment-builder.component.ts`)
- When a question is moved, update the in-memory `displayOrder` values immediately (optimistic UI)
- On assessment save (`PUT /api/assessments/{id}`), submit questions with their updated `displayOrder` values
- The backend already stores and sorts by `displayOrder`; no BE schema changes are required
- Existing assessments retain their current order (insertion order becomes displayOrder)

## Capabilities

### New Capabilities

- `assessment-question-reorder`: UI controls in the assessment builder allowing recruiters to move questions up or down; order is persisted via existing `displayOrder` field on save

### Modified Capabilities

- `assessment-questions`: The requirement "Question order within an assessment is configurable" already exists — adding the scenario where a recruiter reorders via UI controls in the builder (not just via re-add with a different displayOrder)

## Impact

- **Frontend**: `assessment-builder.component.ts` and its template — add reorder buttons; update save logic to include `displayOrder` per question
- **Backend**: No entity or migration changes needed — `displayOrder` is already stored; verify `PUT /api/assessments/{id}` accepts and persists updated `displayOrder` values
- **No breaking changes**
