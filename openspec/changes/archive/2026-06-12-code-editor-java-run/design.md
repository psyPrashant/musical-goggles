# Design: code-editor-java-run

## Context

`CODE_SUBMISSION` questions already exist end-to-end: `QuestionType.CODE_SUBMISSION`, `CodeSubmissionQuestion.languageHint`, answers persisted as `CandidateAnswer.textContent` (TEXT column, 65,535-char service limit), autosave with 1 s debounce in `assessment-take.component.ts`, and manual marking via `AnswerScore`. The only candidate-facing UI is a plain `<textarea>`; there is no execution capability anywhere. The frontend has no editor library; the backend has no outbound HTTP client usage. The take flow authenticates with a candidate session JWT passed as an explicit `Authorization: Bearer` header (see `candidate-take.service.ts`), and `SecurityConfig` guards `/api/take/**` with `hasRole("CANDIDATE")`.

## Goals / Non-Goals

**Goals:**
- Monaco-based editing for Java code questions, integrated with the existing answer/autosave path.
- Candidate-triggered "Run" with stdout/stderr/compile-error feedback, executed in a sandbox off our infrastructure.
- Configurable execution backend (public Piston API for dev, self-hosted for production).
- Read-only highlighted code in the marking view.

**Non-Goals:**
- Test cases, expected-output comparison, or auto-grading of code answers.
- Persisting run output or run history.
- Languages other than Java (the design keeps `language` parametric, but only Java is wired up).
- Marker-initiated re-execution of submissions.
- Database schema changes.

## Decisions

### D1: Execution via Piston, proxied through the backend
Candidate code is untrusted; it must run in a sandbox. Piston is a battle-tested open-source execution engine with a self-hostable Docker image (`docker run --privileged -p 2000:2000 ghcr.io/engineer-man/piston`, then install the Java package). The default base URL is the self-hosted instance at `http://localhost:2000/api/v2`, overridable via `PISTON_BASE_URL`. (Piston's public API at emkc.org became whitelist-only on 2026-02-15, discovered during implementation, so self-hosting is required in every environment.) The backend proxies all calls — the browser never talks to Piston — so we keep auth (candidate JWT), input validation, rate limiting, and the ability to change engines without a frontend change.
*Alternatives:* Judge0 (richer per-test-case verdicts but heavier — Redis + Postgres + known Docker Desktop on Windows friction, and we don't need test cases yet); own Docker runner (we'd own all sandbox/timeout/cleanup logic); in-process Java Compiler API (unsafe — candidate code would run with server privileges).

### D2: Endpoint lives at `POST /api/take/run`
The existing rule `.requestMatchers("/api/take/**").hasRole("CANDIDATE")` covers it with zero security changes, and semantically running code is part of taking an assessment. The endpoint is generic (no `questionId`): the candidate JWT already proves an active session, nothing is persisted, and validating the question type would add a DB round trip for no security benefit. Request size mirrors the existing answer limit (code ≤ 65,535 chars; stdin ≤ 10,000).

### D3: Serialized upstream calls with bounded queueing
The public Piston API allows ~1 req/s per IP. The execution service wraps the upstream call in a fair `ReentrantLock`: `tryLock(max-queue-wait-ms)` → 429 "Execution engine is busy" on timeout; inside the lock, enforce ≥1100 ms spacing since the previous upstream call. Simple, in-process, and sufficient for a single-instance deployment; a distributed limiter is out of scope.
*Alternatives:* Bucket4j/Resilience4j (new dependency for what one lock does); no limiting (public API would reject bursts with opaque errors).

### D4: Status classification in the backend
The backend maps Piston's raw response to a small contract the UI can render directly: `compile.code != 0` → `COMPILE_ERROR`, `run.signal == "SIGKILL"` → `TIMED_OUT`, `run.code != 0` → `RUNTIME_ERROR`, else `OK`. Transport failures translate to HTTP errors (`503` engine unreachable, `429` busy/upstream-limited, `502` other upstream errors) via `ResponseStatusException`, consistent with `CandidateTakeServiceImpl`.

### D5: Monaco via self-hosted AMD build, not bundled ESM and not CDN
`npm i -D monaco-editor`, then serve `node_modules/monaco-editor/min` as static assets through `angular.json` (`output: /monaco`). A loader service injects `loader.js` on first use and resolves `vs/editor/editor.api`. Rationale: bundling Monaco's ESM workers through `@angular/build` (esbuild) is a known friction point; a CDN loader is a runtime third-party dependency in the middle of a timed assessment. The AMD build is offline, lazy by construction (loads only when a code question renders), and leaves the initial bundle budget untouched.
*Fallback:* if the loader fails, the editor component renders a plain `<textarea>` wired to the same outputs — candidates are never blocked.

### D6: Run state lives in a separate run-panel component
`assessment-take.component.ts` is already ~1120 lines. The run panel (`shared/code-runner/`) owns its own signals (`running`, `stdin`, `result`, `errorMsg`) and exposes a public `run()` so the editor's Ctrl/Cmd+Enter binds via template ref. Run output is intentionally not persisted across question navigation (v1 trade-off). The HTTP service (`core/execution/`) follows `CandidateTakeService` exactly, passing the candidate session token as an explicit header.

### D7: Starter template prefilled, not autosaved until edited
Empty code answers display a `public class Main { public static void main(String[] args) { } }` template. Monaco fires change events only on real edits, so the untouched starter never reaches `setAnswer` — `isQuestionAnswered` stays correct. The `Main` class name is a hard contract: the backend submits the file to Piston as `Main.java`.

### D8: Marking view reuses Monaco read-only
`results.component.ts` renders `CODE_SUBMISSION` answers in the same editor component with `readOnly`. Monaco is already a self-hosted asset and lazy; adding a second highlighter library buys nothing.

## Risks / Trade-offs

- [Piston must be self-hosted everywhere (public API is whitelist-only)] → one Docker container with the Java package installed; clear 503 message when it's down.
- [Single-instance rate limiter] → acceptable now; revisit if the backend scales horizontally; self-hosted Piston tolerates a higher rate (the min-interval can be lowered via config).
- [Monaco is ~1 MB gz of assets] → loaded lazily only on code questions; initial bundle unaffected; textarea fallback if loading fails.
- [Run output not persisted] → candidates lose output when navigating questions; acceptable v1 trade-off, revisit with test-case support.
- [`public class Main` contract] → starter template plus hint text make it self-evident; compile error message surfaces the mismatch otherwise.
- [No per-candidate rate limit] → a hostile candidate can hog the shared lock; queue-wait 429 bounds the damage. Per-user quotas are a follow-up.

## Migration Plan

No DB migration. Deploy backend (new endpoint is additive) then frontend. Rollback = revert; no data implications. Every environment needs a Piston container with the Java package installed (`POST /api/v2/packages {"language":"java","version":"15.0.2"}`); point the backend at it via `PISTON_BASE_URL` if not on `localhost:2000`.

## Open Questions

- Pin the Piston Java package version (`piston.java-version: "*"` currently matches whatever is installed).
- Per-candidate run quotas — deferred until abuse is observed or test cases land.

(Resolved during implementation: the Piston container plus a one-shot Java-package installer are part of `docker-compose.yml`, and the backend service is wired to it via `PISTON_BASE_URL`.)
