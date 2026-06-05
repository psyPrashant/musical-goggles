## Context

The `AssessmentQuestion` entity already has a `display_order` column. Questions are added via `POST /api/assessments/{id}/questions` with a `displayOrder` field; re-adding is idempotent and updates the order. The `PUT /api/assessments/{id}` endpoint only updates title/description/time/password — it does not accept question order.

The assessment builder UI (`assessment-builder.component.ts`) assigns `displayOrder = questions.length + 1` on add, but exposes no controls to change the order afterwards.

## Goals / Non-Goals

**Goals:**
- Allow recruiters to move questions up/down within the assessment builder
- Persist the new order when the assessment is saved

**Non-Goals:**
- Drag-and-drop (arrow buttons are sufficient; CDK DragDrop is not currently used in the project)
- Reordering questions in the question bank itself
- Auto-reordering when a question is removed

## Decisions

### Decision: New `PUT /api/assessments/{id}/questions/order` endpoint for batch reorder

**Rationale**: The existing idempotent-add approach (`POST /api/assessments/{id}/questions`) could be used to update display order, but it would require N round-trips (one per question) and carries unintended side effects (triggering add-question validation like the CODE_SUBMISSION limit check). A dedicated reorder endpoint is safer, atomic, and readable.

Alternative considered: Update `PUT /api/assessments/{id}` to accept `questions[]` — rejected because it mixes concerns and would require schema changes to `AssessmentRequest`.

### Decision: Up/down arrow buttons rather than drag-and-drop

**Rationale**: No drag-and-drop library is currently in use. Adding Angular CDK DragDrop would be disproportionate for this fix. Arrow buttons are accessible, consistent with the existing icon-button style, and trivially testable.

### Decision: Optimistic in-memory reorder; persist on explicit save

**Rationale**: Matches existing builder UX — nothing is auto-saved; the recruiter clicks Save. The FE tracks a dirty-order flag and calls the reorder endpoint as part of the save flow if order changed.

## Risks / Trade-offs

- [Risk] Concurrent edits could cause order conflicts → Mitigation: acceptable for MVP; no concurrent-edit protection exists elsewhere in the builder
- [Risk] Reorder endpoint called with stale IDs if a question was removed in the same session → Mitigation: FE derives the order from the current in-memory list at save time

## Migration Plan

- No DB migration needed (`display_order` column already exists)
- Existing assessments retain their current display order (unchanged)
- Deploy is backward-compatible — old clients that never call the reorder endpoint continue to work
