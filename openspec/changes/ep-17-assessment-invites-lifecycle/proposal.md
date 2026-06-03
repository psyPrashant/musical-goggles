## Why

Once an assessment invitation is sent, there is currently no way to revoke it — candidates with stale or mistaken invites retain access until expiry. Additionally, the system allows sending multiple active invites to the same candidate, and the dashboard "Pending Review" counter is broken. The invite email link also hard-codes the backend port instead of pointing to the frontend, making it unusable in any deployment other than local.

## What Changes

- Add a `CANCELLED` invitation status and a `DELETE /api/invitations/{id}` endpoint so staff can revoke outstanding invites (MG-111)
- Enforce a one-active-invite-per-candidate constraint across all assessments, blocking new invites when any PENDING or SENT invite exists for that candidate (MG-112)
- Fix the dashboard "Pending Review" count to reflect SUBMITTED/AUTO_SUBMITTED submissions with at least one unscored answer, not invites without submissions (MG-113)
- Make the frontend base URL in invite emails configurable via `app.frontend.base-url` instead of deriving it from the HTTP request (MG-114)

## Capabilities

### New Capabilities

- `invitation-cancellation`: Staff can cancel any outstanding (PENDING or SENT) assessment invitation. The token is invalidated. Includes the new `CANCELLED` status, `DELETE /api/invitations/{id}` endpoint, and frontend cancel action with confirmation.
- `one-active-invite-constraint`: The system prevents sending a new invite to a candidate who already holds an active (PENDING or SENT) invitation to any assessment. Returns a distinct `409 ACTIVE_INVITE_EXISTS` error.

### Modified Capabilities

- `assessment-reminder`: The invite link building logic moves from request-derived URL to `app.frontend.base-url` config — ReminderServiceImpl uses the same property for reminder links.
- `candidate-invitation`: The invite endpoint now enforces the one-active-invite constraint (new error code) and the assessment link is built from the configurable frontend base URL.

## Impact

- **Backend**: `InvitationStatus` enum, `InvitationService`/`InvitationServiceImpl`, `InvitationController`, `InvitationRepository`, `DashboardService` (pending review query fix), `application.yaml`, Flyway migration V15
- **Frontend**: Invitation/candidate UI — cancel button with confirmation, new 409 error handling for `ACTIVE_INVITE_EXISTS`
- **Database**: V15 migration to add `CANCELLED` to the status check constraint
- **Config**: New `app.frontend.base-url` property (default `http://localhost:4200`)
