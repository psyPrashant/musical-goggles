#!/bin/bash
# log-prompt.sh
# Appends every user prompt to prompts.md at the project root.
#
# Optional: set PROMPT_LOG_AUTHOR in your shell profile to override the username.
#   export PROMPT_LOG_AUTHOR="Prashant"

AUTHOR="${PROMPT_LOG_AUTHOR:-$(whoami)}"

# Read prompt from stdin (Claude passes JSON on stdin)
read -r INPUT

if command -v python3 &>/dev/null; then
  PROMPT=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('prompt',''))")
elif command -v python &>/dev/null; then
  PROMPT=$(echo "$INPUT" | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('prompt',''))")
else
  PROMPT=$(echo "$INPUT" | grep -o '"prompt":"[^"]*"' | sed 's/"prompt":"//;s/"//')
fi

[ -z "$PROMPT" ] && exit 0

# Normalise path (Windows backslashes → forward slashes)
CWD="${CLAUDE_CWD:-$PWD}"
CWD="${CWD//\\//}"

LOG_FILE="$CWD/prompts.md"

# Create the file with a header if it doesn't exist yet
if [ ! -f "$LOG_FILE" ]; then
  echo "# Prompt Log" > "$LOG_FILE"
  echo "" >> "$LOG_FILE"
fi

TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

{
  echo "## $TIMESTAMP | $AUTHOR"
  echo ""
  echo "> $PROMPT"
  echo ""
  echo "---"
  echo ""
} >> "$LOG_FILE"

exit 0
