# EP-32 Tasks

## MG-161 — Token fields per entry

- [x] Modify `log-prompt.sh` to write prompt metadata to `/tmp/claude-pending-prompt.json`
- [x] Create `log-usage.sh` as Stop hook (reads pending file + usage payload, writes complete entry)
- [x] Register Stop hook in `.claude/settings.json`

## MG-162 — Summary section

- [x] `log-usage.sh` tallies existing token fields and writes/refreshes `## Summary` block at top of `prompts.md`
