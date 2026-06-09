## Why

The current dashboard leads with four summary stat cards (Total Assessments, Active Candidates, Pending Reviews, Average Score) that give an aggregate snapshot but do not help staff act on what needs attention. The candidate pipeline — which shows where every candidate currently sits in the process — is buried at the bottom of the page despite being more actionable. Moving it to the top gives recruiters immediate visibility into pipeline health without scrolling.

## What Changes

- Remove the top summary stat-card row (Total Assessments, Active Candidates, Pending Reviews, Average Score) from the dashboard
- Promote the candidate pipeline section (Invited, In Progress, Pending Review, Completed, Flagged) to the top of the dashboard, directly below the page header
- The Recent Assessments / Recent Activity mid-grid remains unchanged, now positioned below the pipeline

## Capabilities

### New Capabilities
- `dashboard-candidate-pipeline-top`: Candidate pipeline is displayed prominently at the top of the dashboard, replacing the summary stat cards

### Modified Capabilities
<!-- No existing spec requirements are changing -->

## Impact

- **Frontend**: `dashboard.component.ts` — template restructured; stat-row removed, pipeline section reordered
- **Backend**: No changes — `GET /api/dashboard/stats` already returns pipeline data; summary-card fields (activeCandidates, pendingReviews, averageScore) remain in the response but are no longer rendered
- **Tests**: `dashboard.component.spec.ts` — assertions for summary cards removed; pipeline tests updated for new position
