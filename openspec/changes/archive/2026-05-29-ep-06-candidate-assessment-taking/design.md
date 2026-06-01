## Context

The invitation and token-auth system (EP-04, EP-05) delivers a session JWT to a candidate. That JWT contains `candidateId`, `assessmentId`, and `role=CANDIDATE`. Until now, nothing in the backend consumes those claims to serve assessment content or persist answers — candidates have a valid credential but nowhere to use it.

The frontend already has a scaffolded `AssessmentTakeComponent` (from the MG-55 design sprint) with mock data, a timer, and answer input stubs. Sprint 3 replaces those mocks with real API calls.

Current state of relevant domain:
- `CandidateInvitation` — exists, holds token + status + expiry
- `Assessment` + `AssessmentQuestion` — exist, hold the question content
- No `CandidateSubmission` or `CandidateAnswer` entities

## Goals / Non-Goals

**Goals:**
- Candidates can load their assigned assessment content through the JWT-secured API
- Answers (MCQ selections, free text, inline code) are persisted incrementally as drafts
- A final submission locks the attempt and prevents further edits
- Timer expiry triggers the same lock path as an explicit submission
- The data model is queryable by the marking epic (EP-07) that follows

**Non-Goals:**
- Binary file uploads (code answers stored as inline text; binary file storage deferred)
- Proctoring, tab-switch detection, or anti-cheating features
- Real-time collaboration or multi-device sync
- Email confirmation to the candidate post-submission (potential future story)

## Decisions

### 1. Submission created lazily on first assessment load, not at invitation time

**Decision:** `CandidateSubmission` is created when the candidate hits `GET /api/take/assessment`, not when the invitation token is validated.

**Rationale:** Candidates may click the invitation link, see the assessment intro screen, and close the browser without starting. Creating the submission at token validation time would produce orphaned `IN_PROGRESS` records with no answers, polluting the recruiter's submissions view. Lazy creation ties "started" to the candidate's intentional decision to begin.

**Alternative considered:** Create submission at token validation. Simpler state machine, but produces noise in submission lists and marks candidates as "in progress" who never actually started.

### 2. Single `candidate_answer` table with discriminated columns for answer types

**Decision:** One `CandidateAnswer` entity with `selectedOptionIds` (JSON text), `textContent` (text), and a unique `(submissionId, questionId)` constraint. MCQ answers use `selectedOptionIds`; text and code answers use `textContent`. Both columns are nullable.

**Rationale:** Consistent with the existing `Question` hierarchy (McqQuestion, TextQuestion, CodeSubmissionQuestion are separate JPA entities but all in one `question` table via `DTYPE`). A single answer table keeps the draft-upsert query simple and avoids join complexity in the marking layer. JSON array text for MCQ option IDs is lightweight and sufficient for list-of-UUIDs.

**Alternative considered:** Separate tables per answer type (`candidate_mcq_answer`, `candidate_text_answer`). Cleaner OO model but requires unions in marking queries and separate upsert paths.

**Alternative considered:** JSONB blob for all answer content. Flexible but loses column-level constraints and makes SQL queries in marking harder.

### 3. Server-side deadline derived from `startedAt` + `timeLimitMinutes`, not JWT expiry

**Decision:** `CandidateSubmission.startedAt` is recorded at creation time. The deadline returned in the `GET /api/take/assessment` response is `startedAt + assessment.timeLimitMinutes`. The backend validates this deadline on submit.

**Rationale:** The candidate session JWT has a 2-hour expiry, which is independent of the assessment's time limit (could be 30 min or 3 hours). Deadline enforcement must be based on when the candidate started, not on JWT expiry. The FE timer is initialized from the server-returned deadline so it is accurate after page refresh.

**Alternative considered:** Trust the FE to call submit before the timer ends, with no server-side deadline check. Insecure — a candidate could manipulate the client to delay submission indefinitely.

### 4. Auto-submit and manual submit use the same `POST /api/take/submit` endpoint

**Decision:** When the FE timer expires, it calls `POST /api/take/submit` with a flag `autoSubmitted: true`. The server treats this identically to a manual submission and locks the attempt.

**Rationale:** Unifies the submission path. The backend also enforces: if the deadline has passed and the submission is still `IN_PROGRESS`, any subsequent draft-save (`PUT /api/take/answers`) returns 409 — the server will not silently accept late draft saves.

**Alternative considered:** A separate `POST /api/take/auto-submit` endpoint. Duplication without benefit.

### 5. MCQ correct answers withheld from GET /api/take/assessment response

**Decision:** The assessment loading endpoint returns question text and MCQ options but omits `isCorrect` flags from the option objects.

**Rationale:** Security requirement — candidates must not be able to inspect the API response to find correct answers. Auto-marking (EP-07) reads correct answers server-side at marking time.

## Risks / Trade-offs

- **Race condition on timer expiry**: If the FE auto-submits while a draft-save request is in-flight, the draft-save may arrive after the submission is locked and get a 409. Mitigation: the FE should cancel any in-flight autosave before calling submit; the 409 is a safe rejection, not data loss.

- **Inline code size**: Storing code answers as `TEXT` is unbounded. A malicious candidate could submit very large payloads. Mitigation: validate `textContent` length server-side (e.g., max 64 KB) and return 400 on violation.

- **Single-use constraint**: The `CandidateInvitation` already tracks `status`. Once a submission reaches `SUBMITTED` or `AUTO_SUBMITTED`, the invitation should be transitioned to `COMPLETED` to prevent the candidate from re-entering via the same link. Mitigation: the submit endpoint updates `CandidateInvitation.status` to `COMPLETED` transactionally with locking the submission.

- **Page refresh timer accuracy**: If the candidate refreshes, the FE must re-derive the countdown from the server-returned `deadline` timestamp — not restart from full time. The design handles this by returning `deadline` (absolute timestamp) from `GET /api/take/assessment`.

## Migration Plan

1. Add Liquibase migration: create `candidate_submission` table
2. Add Liquibase migration: create `candidate_answer` table
3. Deploy backend (no changes to existing tables — purely additive)
4. Frontend: replace mock service calls in `AssessmentTakeComponent` with real API calls

Rollback: drop the two new tables — no existing tables are altered.

## Open Questions

- Should `GET /api/take/assessment` return questions in a fixed order (as stored) or randomised per submission? Current assumption: fixed order. Randomisation would require storing question order on `CandidateSubmission`.
- File/binary upload for code submission: accept base64 in `textContent` for now, or block file-type questions entirely until a file storage solution is in place? Current assumption: inline text only; `SUBMISSION` question type answers are stored as `textContent`.
