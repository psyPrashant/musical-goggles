# EP-32: Prompt History — Token Usage Tracking

## Problem

`prompts.md` logs every user prompt but captures no cost or token data, making it impossible to track AI spend over time.

## Solution

Split the single `UserPromptSubmit` hook into a two-hook pipeline:

1. **`UserPromptSubmit` → `log-prompt.sh`**: Saves prompt metadata (prompt text, author, timestamp, cwd) to `/tmp/claude-pending-prompt.json`. Fires *before* the model responds, so token data is not yet available.

2. **`Stop` → `log-usage.sh`**: Fires *after* the model responds. Reads the pending file and the Stop hook's usage payload, calculates estimated cost, writes a complete entry to `prompts.md`, and refreshes the running summary section.

## Entry Format

```markdown
## 2026-06-09 11:41 | hendrik.muller

> fetch and pull

- inputTokens: 12345
- outputTokens: 678
- estimatedCostUSD: 0.047265

---
```

## Summary Section

Placed at the top of `prompts.md` (after the `# Prompt Log` header), updated on every Stop event. Only tallies entries that carry the new token fields — legacy entries without them are skipped.

```markdown
## Summary

- totalInputTokens: 123456
- totalOutputTokens: 7890
- totalEstimatedCostUSD: 0.489015

---
```

## Pricing Model

Claude Sonnet 4.6 (`claude-sonnet-4-6`):

| Token type                | Rate         |
|---------------------------|--------------|
| Input                     | $3.00 / 1M   |
| Output                    | $15.00 / 1M  |
| Cache creation (input)    | $3.75 / 1M   |
| Cache read (input)        | $0.30 / 1M   |

## Files Changed

| File | Change |
|------|--------|
| `.claude/hooks/log-prompt.sh` | Writes pending JSON to `/tmp/claude-pending-prompt.json` instead of directly appending to `prompts.md` |
| `.claude/hooks/log-usage.sh` | New — Stop hook that completes each entry with token data and refreshes the summary |
| `.claude/settings.json` | Adds the `Stop` hook entry |
