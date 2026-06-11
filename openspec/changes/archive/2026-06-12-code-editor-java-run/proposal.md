# Proposal: code-editor-java-run

## Why

Candidates currently answer `CODE_SUBMISSION` questions in a plain `<textarea>` — no syntax highlighting, no indentation support, and no way to compile or run their code. This is a poor experience for what is the centerpiece question type of a technical assessment. We want a LeetCode-style experience: a real in-browser editor plus a Run button so candidates can verify their Java solution compiles and produces the expected output before submitting.

## What Changes

- Replace the plain textarea for `CODE_SUBMISSION` questions (both top-level and inside GROUP questions) with the Monaco editor (the VS Code editor), lazily loaded so non-code assessments pay no bundle cost.
- Add a Run panel below the editor: candidates run their Java program (with optional stdin) and see stdout, stderr, and compile errors. Ctrl/Cmd+Enter runs.
- Add a new backend endpoint `POST /api/take/run` that proxies execution to a self-hosted Piston sandbox engine (Docker, `localhost:2000` by default; base URL configurable via `PISTON_BASE_URL`). Untrusted code never runs on our server and the browser never calls Piston directly. (Piston's public API became whitelist-only in Feb 2026, so self-hosting is required.)
- Serialize/rate-limit upstream Piston calls with a friendly "engine busy" response when saturated.
- Prefill empty code answers with a `public class Main` starter template (not autosaved until edited).
- Marking view renders submitted code read-only with syntax highlighting instead of plain text.
- Simple run model only: full-program execution, no test cases, no auto-grading — marking remains manual. No database changes (code persists via existing `CandidateAnswer.textContent`).

## Capabilities

### New Capabilities
- `code-editor`: In-browser Monaco editor for CODE_SUBMISSION questions during assessment taking — Java syntax highlighting, theme-aware, lazy-loaded, textarea fallback, starter template, integrates with existing autosave.
- `code-execution`: Candidate-triggered execution of Java code via a backend proxy to the Piston engine — request/response contract, status classification (OK / compile error / runtime error / timed out), rate limiting, and failure handling.

### Modified Capabilities
- `manual-marking`: Code submission answers in the marking/results view must render as read-only syntax-highlighted code rather than plain text.

## Impact

- **Backend** (`recruitment-be`): new `com.psybergate.recruitment.execution` package (controller, service, Piston client, DTOs, config properties); `application.yaml` gains a `piston:` block. Existing `/api/take/**` security rule covers the new endpoint — no security config changes. New outbound dependency on the Piston HTTP API at runtime (none at build time; uses Spring's built-in `RestClient`).
- **Frontend** (`recruitment-fe`): new `shared/code-editor/` (Monaco wrapper + loader service), `shared/code-runner/` (run panel), `core/execution/` (HTTP service + model); edits to `assessment-take.component.ts` and `results.component.ts`; `monaco-editor` added as a dev dependency with its `min/vs` build served via `angular.json` assets.
- **Ops**: every environment needs a self-hosted Piston container (Docker, port 2000) with the Java package installed; the backend finds it via `PISTON_BASE_URL` (defaults to `http://localhost:2000/api/v2`).
