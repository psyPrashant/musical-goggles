## Why

Recruiters currently have no way to formally record integrity concerns against candidate submissions — suspicious behaviour goes untracked and unresolved. This epic builds the manual flagging foundation that also prepares the platform for future automated cheating detection (similarity analysis, tab-switching, AI-generated content heuristics).

## What Changes

- Recruiters can flag any submitted assessment with a required reason (e.g. copied answers, timing anomaly, AI-generated content)
- Flagged submissions display a visible "Flagged" badge and lifecycle states: Flagged → Under Review → Resolved / Dismissed
- Resolution requires notes, ensuring an auditable close-out trail
- A dedicated flagged submissions view lets recruiters triage integrity concerns across all assessments with filters
- Every flag action (creation, state change) is recorded with acting user and timestamp — visible as a read-only audit trail on the submission detail view
- Candidate profiles surface a full cross-assessment flag history so recruiters can spot repeat patterns

## Capabilities

### New Capabilities

- `submission-flagging`: Flag a submission as suspicious with a required reason; view and manage flag status (Flagged → Under Review → Resolved/Dismissed) with resolution notes
- `flagged-submissions-list`: Dedicated view listing all flagged submissions across assessments, filterable by reason, assessment, and date range
- `flag-audit-trail`: Read-only per-submission audit trail recording every flag creation and status change with acting user and timestamp
- `candidate-flag-history`: Cross-assessment flag history section on the candidate profile, ordered by most recent

### Modified Capabilities

- `submission-listing`: Add "Flagged" status badge to submissions that have an active flag; support filter by flagged state

## Impact

- **BE**: New `submission_flags` and `submission_flag_audit` tables; `SubmissionFlag` domain entity; flag REST endpoints under `/api/submissions/{id}/flags`; audit entries written on every flag state change
- **FE**: Flag action button on submission detail view; flagged submissions list page; audit trail component on submission detail; flag history section on candidate profile; "Flagged" badge on submission list rows
- **Auth**: Flag and resolve actions restricted to Admin / Recruiter roles
- **No breaking changes** to existing submission or candidate APIs
