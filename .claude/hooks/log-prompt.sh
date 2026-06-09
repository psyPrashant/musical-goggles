#!/bin/bash
# log-prompt.sh
# Saves prompt metadata to a pending temp file; log-usage.sh (Stop hook) completes the entry.
#
# Optional: set PROMPT_LOG_AUTHOR in your shell profile to override the username.
#   export PROMPT_LOG_AUTHOR="Prashant"

AUTHOR="${PROMPT_LOG_AUTHOR:-$(whoami)}"

# On Windows, 'python3' is a broken Store redirect; use the 'py' launcher instead.
if command -v py &>/dev/null && py -3 --version &>/dev/null 2>&1; then
  PYTHON="py -3"
elif command -v python3 &>/dev/null && python3 --version &>/dev/null 2>&1; then
  PYTHON=python3
elif command -v python &>/dev/null; then
  PYTHON=python
else
  exit 0
fi

read -r INPUT

PROMPT=$(echo "$INPUT" | $PYTHON -c "import sys,json; d=json.load(sys.stdin); print(d.get('prompt',''))")

[ -z "$PROMPT" ] && exit 0

CWD="${CLAUDE_CWD:-$PWD}"
CWD="${CWD//\\//}"

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

CLAUDE_PENDING_PROMPT="$PROMPT" \
CLAUDE_PENDING_AUTHOR="$AUTHOR" \
CLAUDE_PENDING_TIMESTAMP="$TIMESTAMP" \
CLAUDE_PENDING_CWD="$CWD" \
$PYTHON -c "
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

exit 0
