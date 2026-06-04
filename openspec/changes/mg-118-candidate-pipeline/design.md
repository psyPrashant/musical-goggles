## Context

The dashboard component (`dashboard.component.ts`) currently renders in this order:
1. Page header (title, date, action buttons)
2. `<div class="stat-row">` — 4 summary stat cards
3. `<div class="mid-grid">` — Recent Assessments + Recent Activity (two-column)
4. Candidate Pipeline card (bottom)

MG-118 removes the stat-row and promotes the pipeline card to position 2. The mid-grid drops to position 3. No backend or data-layer changes are required — `GET /api/dashboard/stats` already returns all pipeline data.

## Goals / Non-Goals

**Goals:**
- Remove the 4 summary stat cards from the template
- Move the pipeline section to directly below the page header
- Clean up the `avgScoreDisplay` computed property (only consumer is the removed Average Score card)

**Non-Goals:**
- Changing pipeline data, colors, or stage definitions
- Removing the `assessmentService.listAssessments()` call — still needed by the Recent Assessments table
- Removing the `dashboardService.getStats()` call — still needed for pipeline + recent activity
- Removing the `assessments` or `stats` signals — both remain in use
- Any backend changes

## Decisions

**Keep the `assessments` signal as-is.**  
`assessments().length` appears in the stat-row (Total Assessments card — being removed) but also in the Recent Assessments table's empty-state check (`assessments().length === 0`). The signal and its service call must stay.

**Remove `avgScoreDisplay` computed.**  
It is used only by the Average Score stat card. Once that card is removed, the computed has no consumers and should be deleted to avoid dead code.

**No CSS class removals required.**  
The `.stat-row`, `.stat-card`, and related style rules can be left in the component styles — they are inlined and do not affect bundle size meaningfully. Removing them is a cleanup concern, not a correctness one.

## Risks / Trade-offs

- **Risk**: Tests asserting on `avgScoreDisplay` or stat-card DOM nodes will break.  
  → **Mitigation**: Update `dashboard.component.spec.ts` to remove affected assertions.

- **Trade-off**: The `activeCandidates`, `pendingReviews`, and `averageScore` fields continue to be fetched from the API but are no longer rendered. This is a minor over-fetch. The API contract is unchanged and the backend can prune those fields in a future cleanup ticket.
