## 1. Backend — Piston execution endpoint

- [x] 1.1 Add `piston:` config block to `recruitment-be/src/main/resources/application.yaml` (base-url with `PISTON_BASE_URL` override, java-version, connect/read timeouts, run/compile timeouts, max-queue-wait) and create `execution/PistonProperties.java` (`@ConfigurationProperties(prefix = "piston")` record, enabled via `@ConfigurationPropertiesScan` or `@EnableConfigurationProperties`)
- [x] 1.2 Create DTOs in `execution/dto/`: `RunCodeRequest` (`@NotBlank @Size(max=65535) code`, `@Size(max=10000) stdin`), `RunCodeResponse` (status, stdout, stderr, compileOutput, exitCode), and Piston wire DTOs (`PistonExecuteRequest`/`PistonExecuteResponse`/`PistonFile` with snake_case fields `compile_timeout`, `run_timeout`)
- [x] 1.3 Create `execution/PistonClient.java` — `RestClient` built from injected builder with connect/read timeouts; POSTs to `/execute` with language `java`, file named `Main.java`, stdin, and configured timeouts
- [x] 1.4 Create `execution/CodeExecutionService(Impl).java` — fair `ReentrantLock` serialization (`tryLock(maxQueueWait)` → 429 "Execution engine is busy"; ≥1100 ms spacing between upstream calls), status mapping (compile.code≠0 → COMPILE_ERROR, run.signal SIGKILL → TIMED_OUT, run.code≠0 → RUNTIME_ERROR, else OK), error translation via `ResponseStatusException` (unreachable → 503, upstream 429 → 429, other upstream → 502)
- [x] 1.5 Create `execution/CodeExecutionController.java` — `POST /api/take/run`, `@Valid` request body, `@PreAuthorize("hasRole('CANDIDATE')")` mirroring `CandidateTakeController` (existing `/api/take/**` security rule applies; no SecurityConfig changes)
- [x] 1.6 Unit tests `CodeExecutionServiceTest` — mocked `PistonClient`; all four status mappings, 429 on lock contention, 503/502 translation
- [x] 1.7 Integration test `CodeExecutionControllerIntegrationTest` — same pattern as `CandidateTakeControllerIntegrationTest` (TestContainers base, MockMvc, `@MockitoBean PistonClient`); asserts 200 OK, 400 blank code, 400 oversized code, 401 no JWT, 403 staff JWT
- [x] 1.8 Verify backend: `./mvnw test -Dtest='CodeExecution*'`, then run live and curl `/api/take/run` with a candidate JWT — hello-world → OK, syntax error → COMPILE_ERROR, `while(true);` → TIMED_OUT

## 2. Frontend — Monaco code editor component

- [x] 2.1 `npm i -D monaco-editor` in `recruitment-fe/` and add asset glob to `angular.json` build options: `{ "glob": "**/*", "input": "node_modules/monaco-editor/min", "output": "/monaco" }`
- [x] 2.2 Create `src/app/shared/code-editor/monaco-loader.service.ts` — singleton promise injecting `/monaco/vs/loader.js`, AMD `require.config({paths:{vs:'/monaco/vs'}})`, resolves `vs/editor/editor.api`; rejects cleanly on failure
- [x] 2.3 Create `src/app/shared/code-editor/code-editor.component.ts` — standalone, signal inputs (`value`, `language='java'`, `readOnly`, `height`), outputs (`valueChange`, `runRequested`); editor created in `ngAfterViewInit` (minimap off, `automaticLayout: true`); theme effect bound to `ThemeService` (vs/vs-dark); echo-guard between `setValue` and `onDidChangeModelContent`; Ctrl/Cmd+Enter → `runRequested`; dispose on destroy; textarea fallback when loader fails
- [x] 2.4 Vitest spec for `CodeEditorComponent` (fallback rendering, valueChange wiring — mock the loader service)
- [x] 2.5 Integrate into `assessment-take.component.ts`: add `javaStarter` template constant; replace both CODE_SUBMISSION textarea blocks (top-level and GROUP sub-question) with `<app-code-editor [value]="answers()[q.id] ?? javaStarter" ...>` wired to existing `setAnswer`; update code-hint text to state the `public class Main` contract; verify untouched starter does not autosave and saved code restores on navigation

## 3. Frontend — Run panel

- [x] 3.1 Create `src/app/core/execution/code-execution.model.ts` (RunCodeRequest/RunCodeResponse/status types) and `code-execution.service.ts` — `POST /api/take/run` with explicit `Authorization: Bearer ${sessionToken}` header, mirroring `CandidateTakeService`
- [x] 3.2 Create `src/app/shared/code-runner/code-runner-panel.component.ts` — inputs `code`, `sessionToken`; signals `running`, `stdin`, `showStdin`, `result`, `errorMsg`; public `run()`; Run button with spinner/disabled state; collapsible stdin; output panel visually distinguishing stdout / stderr (red) / compileOutput (amber) with status line; friendly 429 ("engine busy") and 503 ("service unavailable") messages
- [x] 3.3 Vitest spec for the run panel (status rendering, running state, error mapping — mock the execution service)
- [x] 3.4 Place the run panel under the editor for both CODE_SUBMISSION spots in `assessment-take.component.ts` and wire `(runRequested)="runner.run()"` via template ref

## 4. Marking view

- [x] 4.1 In `results.component.ts`, render CODE_SUBMISSION answers (both top-level and GROUP sub-question answer spots) with `<app-code-editor [readOnly]="true" language="java">` when an answer exists; keep existing empty-answer display otherwise

## 5. Verification & polish

- [x] 5.1 Full backend suite: `./mvnw test`
- [x] 5.2 Frontend checks: `npx tsc --noEmit`, `npm test`, `npm run build` (initial bundle budget unaffected — Monaco is assets-only)
- [x] 5.3 Manual E2E: take an assessment with a top-level and a GROUP code question — Monaco renders with starter, `/monaco/*` loads only on code questions, theme toggle works, typing autosaves after ~1 s, untouched starter does not autosave, Run shows stdout, syntax error shows compile output, Ctrl+Enter runs, stdin feeds `Scanner`, backend down shows friendly message, navigation restores saved code; submit and verify read-only highlighted code in marking view
- [x] 5.4 Prettier on touched frontend files
