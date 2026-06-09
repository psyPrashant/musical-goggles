#!/bin/bash
# log-prompt.sh
# Saves prompt metadata to a pending temp file; log-usage.sh (Stop hook) completes the entry.
#
# Optional: set PROMPT_LOG_AUTHOR in your shell profile to override the username.
#   export PROMPT_LOG_AUTHOR="Prashant"

AUTHOR="${PROMPT_LOG_AUTHOR:-$(whoami)}"

read -r INPUT

if command -v python3 &>/dev/null; then
  PROMPT=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('prompt',''))")
elif command -v python &>/dev/null; then
  PROMPT=$(echo "$INPUT" | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('prompt',''))")
else
  PROMPT=$(echo "$INPUT" | grep -o '"prompt":"[^"]*"' | sed 's/"prompt":"//;s/"//')
fi

[ -z "$PROMPT" ] && exit 0

CWD="${CLAUDE_CWD:-$PWD}"
CWD="${CWD//\\//}"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

if command -v python3 &>/dev/null; then
  CLAUDE_PENDING_PROMPT="$PROMPT" \
  CLAUDE_PENDING_AUTHOR="$AUTHOR" \
  CLAUDE_PENDING_TIMESTAMP="$TIMESTAMP" \
  CLAUDE_PENDING_CWD="$CWD" \
  python3 -c "
import os, json
data = {
    'prompt': os.environ['CLAUDE_PENDING_PROMPT'],
    'author': os.environ['CLAUDE_PENDING_AUTHOR'],
    'timestamp': os.environ['CLAUDE_PENDING_TIMESTAMP'],
    'cwd': os.environ['CLAUDE_PENDING_CWD'],
}
with open('/tmp/claude-pending-prompt.json', 'w') as f:
    json.dump(data, f)
"
elif command -v python &>/dev/null; then
  CLAUDE_PENDING_PROMPT="$PROMPT" \
  CLAUDE_PENDING_AUTHOR="$AUTHOR" \
  CLAUDE_PENDING_TIMESTAMP="$TIMESTAMP" \
  CLAUDE_PENDING_CWD="$CWD" \
  python -c "
import os, json
data = {
    'prompt': os.environ['CLAUDE_PENDING_PROMPT'],
    'author': os.environ['CLAUDE_PENDING_AUTHOR'],
    'timestamp': os.environ['CLAUDE_PENDING_TIMESTAMP'],
    'cwd': os.environ['CLAUDE_PENDING_CWD'],
}
with open('/tmp/claude-pending-prompt.json', 'w') as f:
    json.dump(data, f)
"
fi

exit 0
