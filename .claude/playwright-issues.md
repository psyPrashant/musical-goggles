# Playwright Issue Log

## 2026-06-03 15:05:27

### Session: EP-18 Playwright testing (2026-06-03)

**Issue 1: browser_click with quoted button labels fails**
- Tool: mcp__playwright__browser_click
- Input: target='button "Sign In"'
- Error: Unexpected token while parsing CSS selector
- Fix: Use browser_evaluate to call .click() on the button via querySelector, or use the ref= selector from a fresh snapshot.

**Issue 2: ref= selectors not supported by browser_click**
- Tool: mcp__playwright__browser_click  
- Input: target='ref=e23'
- Error: Unknown engine "ref" while parsing selector
- Fix: Always use browser_evaluate with querySelector, or extract a valid CSS selector from the snapshot (e.g. 'button[type="submit"]').

**Issue 3: Playwright MCP tools do not trigger PostToolUse or PreToolUse hooks**
- Confirmed: Neither Pre/PostToolUse hook fires for mcp__playwright__* tools
- Only native Claude Code tools (Edit, Write, Bash, etc.) trigger these hook events
- Workaround: Write issues to pw-pending.txt explicitly; Stop hook aggregates on turn end.

**Reliable patterns discovered:**
- Login: browser_fill_form for fields + browser_evaluate(() => document.querySelector('form button').click())
- Verify DOM state: browser_evaluate() with querySelector/querySelectorAll
- Screenshots: save to .playwright-mcp/ folder for review
- Snapshots: use depth parameter to limit output size

---

## 2026-06-04 10:05:05

### Session: MG-118 dashboard pipeline feature verification (2026-06-04)

### Port conflict: npm dev server and Docker frontend both bind to 4200
- **Type**: Docker / environment issue
- **Tool / Command**: `docker compose up -d frontend`, `npm start`
- **Input**: Both services configured for port 4200
- **Error**: Playwright hits the local Vite dev server (recognisable by `@ng/component` in resource URLs) instead of the Docker/Nginx container. The old Docker image is served when Playwright should be testing the newly built one.
- **Fix**: Kill the npm dev server before running Playwright against Docker, OR test via the dev server only (skip Docker rebuild). Confirm which server is active by checking resource URLs in `browser_evaluate(() => performance.getEntriesByType('resource')[0].name)` — Vite URLs contain `@ng/` or `.angular/cache`; Nginx URLs do not.

### Pattern: Detect which server Playwright is hitting (dev vs Docker/Nginx)
- **Context**: When port 4200 is shared between `npm start` and Docker frontend
- **Pattern**: `browser_evaluate(() => performance.getEntriesByType('resource').find(e => e.initiatorType === 'script')?.name ?? 'none')` — if the URL contains `@ng/` or `.angular/cache`, you are on the Vite dev server; a plain `/main.js` path means Nginx/Docker.

### Login 500 immediately after docker compose up
- **Type**: Docker health-check / timing issue
- **Tool / Command**: `curl -X POST http://localhost:8080/api/auth/login`
- **Input**: `{"email":"admin@recruitment.dev","password":"admin123"}`
- **Error**: HTTP 500 from `/api/auth/login` when called within ~30s of `docker compose up` completing
- **Fix**: Wait for backend to be fully ready before attempting login. Confirm with `curl -s http://localhost:8080/actuator/health` returning `{"status":"UP"}` before navigating in Playwright.

### Killing npm dev server on WSL2 disconnects Docker Desktop pipe
- **Type**: Docker / WSL2 environment issue
- **Tool / Command**: `kill <npm-pid>` / `Stop-Process`
- **Input**: PIDs of `npm start` process tree
- **Error**: Terminating npm process tree on WSL2 drops `//./pipe/dockerDesktopLinuxEngine`, making all `docker` commands fail with connection refused
- **Fix**: Do not kill npm via PID on WSL2. Instead, stop it by closing the terminal or sending Ctrl+C to the process. If Docker pipe is lost, restart Docker Desktop from the system tray, then `docker compose up -d`.

### Backend health check polling loop times out despite backend being UP
- **Type**: Spring Security / polling logic issue
- **Tool / Command**: PowerShell `Invoke-RestMethod` loop polling `/actuator/health`
- **Error**: Loop reports "Timed out" even though backend started successfully. Spring Boot auto-secures `/actuator/**` when Spring Security is on the classpath, returning 401. `Invoke-RestMethod` throws on 4xx, so the `catch` block treats 401 the same as connection refused — the loop never sees "UP".
- **Fix**: Poll a secured endpoint and treat HTTP 401 as "backend ready". Use a POST to `/api/auth/login` — connection refused means not up yet, any HTTP response (including 401/400) means the server is accepting connections. Example: `try { Invoke-WebRequest -Uri "http://localhost:8080/api/auth/login" -Method POST -ErrorAction Stop } catch [System.Net.WebException] { if ($_.Exception.Response) { "ready" } else { "not up" } }`. Alternatively, expose the health endpoint unauthenticated in `application-dev.yaml`: `management.endpoint.health.probes.enabled=true` and configure security to permit `/actuator/health`.

### window.location.href navigation inside browser_evaluate gives unreliable Page URL in response
- **Type**: Playwright MCP / Angular SPA routing issue
- **Tool / Command**: `mcp__playwright__browser_evaluate`
- **Input**: `() => { window.location.href = '/dashboard'; }`
- **Error**: The "Page URL" reported in the tool response can be stale (shows the previous URL, e.g. `/candidates`) while the DOM already reflects the new route. Angular's client-side router processes the navigation asynchronously; Playwright captures the URL at an unpredictable point.
- **Fix**: Always use `mcp__playwright__browser_navigate` for explicit page transitions — it waits for navigation to settle before returning. Reserve `window.location.href` inside `browser_evaluate` for cases where you do not need a reliable post-navigation URL in the same call.

