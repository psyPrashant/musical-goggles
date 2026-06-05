## Context

`InvitationServiceImpl.invite()` already has two conflict guards:
1. **Global active-invite constraint** — blocks any candidate who has any PENDING/SENT invitation (across all assessments) → `ACTIVE_INVITE_EXISTS`
2. **Duplicate-invite check** — blocks same candidate + same assessment if a PENDING/SENT invitation already exists → `DUPLICATE_INVITE`

Neither checks whether the candidate has a completed submission. A completed submission means the candidate finished the assessment; there is no valid reason to re-invite them.

## Goals / Non-Goals

**Goals:**
- Block invite creation when candidate already has a SUBMITTED or AUTO_SUBMITTED submission for the same assessment
- Surface a clear error code (`ASSESSMENT_ALREADY_COMPLETED`) to the frontend
- Disable completed assessments in the FE invite picker so recruiters can't even attempt the action

**Non-Goals:**
- Blocking re-invite for IN_PROGRESS or NOT_STARTED submissions (those are already handled by the active-invite constraint)
- Changing any existing error codes or flows

## Decisions

### Decision: Check CandidateSubmission status, not CandidateInvitation status

**Rationale:** Invitation status reflects the invite lifecycle (PENDING → SENT → COMPLETED/CANCELLED/EXPIRED). A completed submission is the ground truth that the assessment was taken. Checking `CandidateSubmission` directly is explicit, avoids ambiguity around invitation status transitions, and matches how the rest of the system treats completion.

### Decision: New error code `ASSESSMENT_ALREADY_COMPLETED`

**Rationale:** Distinct from `DUPLICATE_INVITE` so the FE can show a specific message ("This candidate has already completed this assessment") rather than a generic duplicate-invite message. Keeps error handling extensible.

### Decision: Add `existsCompletedSubmission(UUID candidateId, UUID assessmentId)` to CandidateSubmissionRepository

**Rationale:** Minimal, targeted query. No service layer changes required beyond the single guard in `InvitationServiceImpl`.

### Decision: FE — disable completed assessments in picker; show toast on 409 ASSESSMENT_ALREADY_COMPLETED

**Rationale:** The invite modal fetches candidate history before the recruiter picks an assessment. We can use the loaded history to mark any `assessmentId` with status `SUBMITTED` or `AUTO_SUBMITTED` as disabled in the dropdown/list. This prevents the error entirely. The BE guard remains as the authoritative check.

## Risks / Trade-offs

- [Risk] History fetch adds a round-trip before the invite modal — Mitigation: history is already fetched when opening the modal; no extra call needed
- [Risk] `existsCompletedSubmission` query is called on every invite attempt — Mitigation: trivial indexed EXISTS query on candidateId + assessmentId + status; negligible cost

## Migration Plan

- No schema changes; `candidate_submissions` table already exists with a `status` column
- Deploy is backward-compatible; new error code is purely additive
