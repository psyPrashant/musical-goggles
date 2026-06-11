## ADDED Requirements

### Requirement: Candidate can execute Java code via the backend
The system SHALL expose `POST /api/take/run` accessible only to `ROLE_CANDIDATE` (covered by the existing `/api/take/**` security rule). The request SHALL accept `code` (required, max 65,535 characters) and optional `stdin` (max 10,000 characters). The backend SHALL execute the code by calling the Piston engine's `/execute` API with language `java`, submitting the code as a file named `Main.java`, and SHALL return `status`, `stdout`, `stderr`, `compileOutput`, and `exitCode`. The browser MUST NOT call the Piston API directly.

#### Scenario: Successful run returns stdout
- **WHEN** a candidate posts a valid Java program printing "hi" to `/api/take/run`
- **THEN** the response is HTTP 200 with `status: "OK"`, `stdout` containing "hi", and `exitCode: 0`

#### Scenario: Stdin is passed to the program
- **WHEN** a candidate posts code reading from `System.in` together with a `stdin` value
- **THEN** the program receives the provided stdin and its output reflects it

#### Scenario: Blank code is rejected
- **WHEN** the request `code` is blank or missing
- **THEN** the response is HTTP 400

#### Scenario: Oversized code is rejected
- **WHEN** the request `code` exceeds 65,535 characters
- **THEN** the response is HTTP 400

#### Scenario: Staff cannot use the run endpoint
- **WHEN** a request with a recruiter/admin JWT calls `POST /api/take/run`
- **THEN** the response is HTTP 403

#### Scenario: Unauthenticated request is rejected
- **WHEN** a request without a JWT calls `POST /api/take/run`
- **THEN** the response is HTTP 401

### Requirement: Run results are classified by outcome
The backend SHALL classify the Piston result into exactly one status: `COMPILE_ERROR` when compilation fails (with compiler output in `compileOutput`), `TIMED_OUT` when the run is killed for exceeding the configured time limit, `RUNTIME_ERROR` when the program exits non-zero, and `OK` otherwise.

#### Scenario: Compile error is reported with compiler output
- **WHEN** a candidate runs Java code with a syntax error
- **THEN** the response has `status: "COMPILE_ERROR"` and `compileOutput` contains the javac error message

#### Scenario: Infinite loop times out
- **WHEN** a candidate runs code that never terminates
- **THEN** the response has `status: "TIMED_OUT"` within the configured run timeout

#### Scenario: Uncaught exception is a runtime error
- **WHEN** a candidate runs code that throws an uncaught exception
- **THEN** the response has `status: "RUNTIME_ERROR"` and `stderr` contains the stack trace

### Requirement: Upstream Piston calls are serialized and rate-limited
The backend SHALL serialize calls to the Piston engine, enforcing a configurable minimum spacing between upstream requests so a burst of candidates cannot overload the engine. Requests that cannot acquire the execution slot within the configured maximum queue wait SHALL receive HTTP 429 with a message indicating the engine is busy.

#### Scenario: Concurrent runs are queued or rejected
- **WHEN** multiple run requests arrive concurrently
- **THEN** upstream Piston calls are spaced at least the configured interval apart, and requests waiting longer than the configured maximum receive HTTP 429

### Requirement: Piston failures translate to meaningful HTTP errors
When the Piston engine is unreachable the backend SHALL respond HTTP 503; when Piston itself returns a rate-limit error the backend SHALL respond HTTP 429; other upstream errors SHALL map to HTTP 502. The Piston base URL, Java version, timeouts, and queue wait SHALL be configurable via `application.yaml` (`piston.*`), with the base URL overridable by the `PISTON_BASE_URL` environment variable.

#### Scenario: Engine unreachable
- **WHEN** the Piston base URL cannot be reached
- **THEN** the response is HTTP 503 with a message that the code execution service is unavailable

#### Scenario: Base URL is configurable
- **WHEN** `PISTON_BASE_URL` is set to a self-hosted Piston instance
- **THEN** run requests execute against that instance with no code changes

### Requirement: Candidate can run code from the assessment UI
The assessment-taking UI SHALL show a Run panel for `CODE_SUBMISSION` questions with a Run button, a collapsible stdin input, and an output area that visually distinguishes stdout, stderr, and compile output, plus a status line (e.g., exit code, "Timed out", "Compile error"). While a run is in flight the Run button SHALL be disabled with a progress indicator. Ctrl/Cmd+Enter in the editor SHALL trigger a run. HTTP 429 and 503 responses SHALL surface as friendly messages ("engine busy" / "service unavailable").

#### Scenario: Run shows program output
- **WHEN** a candidate clicks Run with a valid program
- **THEN** the output panel shows the program's stdout and an "exit code 0" status

#### Scenario: Keyboard shortcut runs the code
- **WHEN** a candidate presses Ctrl+Enter (or Cmd+Enter on macOS) inside the editor
- **THEN** a run is triggered exactly as if the Run button were clicked

#### Scenario: Busy engine shows a friendly message
- **WHEN** the run request returns HTTP 429
- **THEN** the panel shows a message asking the candidate to wait a moment and try again
