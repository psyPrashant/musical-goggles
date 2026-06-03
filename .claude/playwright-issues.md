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

