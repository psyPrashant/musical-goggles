#!/bin/bash
# log-prompt.sh
# Logs prompts to prompts.md inside the active OpenSpec change folder.
# Falls back to the project root if no active change is found.

# ── Config ────────────────────────────────────────────────────────────────────
# Set PROMPT_LOG_AUTHOR in your shell profile (~/.zshrc or ~/.bashrc):
#   export PROMPT_LOG_AUTHOR="Sara"
# If not set, falls back to your system username.
AUTHOR="${PROMPT_LOG_AUTHOR:-$(whoami)}"

# ── Read the prompt from stdin ─────────────────────────────────────────────────
read -r INPUT

# Extract the prompt value using python (available on all systems) or perl fallback.
# Avoids a hard dependency on jq.
if command -v python3 &>/dev/null; then
  PROMPT=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('prompt',''))")
elif command -v python &>/dev/null; then
  PROMPT=$(echo "$INPUT" | python -c "import sys,json; d=json.load(sys.stdin); print(d.get('prompt',''))")
else
  PROMPT=$(echo "$INPUT" | grep -o '"prompt":"[^"]*"' | sed 's/"prompt":"//;s/"//')
fi

# Skip empty prompts
if [ -z "$PROMPT" ]; then
  exit 0
fi

# ── Resolve project root ───────────────────────────────────────────────────────
# CLAUDE_CWD on Windows uses backslashes — normalise to forward slashes for bash.
CWD="${CLAUDE_CWD:-$PWD}"
CWD="${CWD//\\//}"

# ── Detect the active OpenSpec change ─────────────────────────────────────────
# OpenSpec stores changes at <project-root>/openspec/changes/<name>/
CHANGES_DIR="$CWD/openspec/changes"
FEATURE_DIR=""

if [ -d "$CHANGES_DIR" ]; then
  # List change folders, excluding the reserved 'archive' folder
  CHANGE_COUNT=$(ls -1 "$CHANGES_DIR" 2>/dev/null | grep -v '^archive$' | wc -l | tr -d ' ')

  if [ "$CHANGE_COUNT" -eq 1 ]; then
    ACTIVE_CHANGE=$(ls -1 "$CHANGES_DIR" | grep -v '^archive$')
    FEATURE_DIR="$CHANGES_DIR/$ACTIVE_CHANGE"
  elif [ "$CHANGE_COUNT" -gt 1 ]; then
    # Multiple active changes — pick the most recently modified one
    ACTIVE_CHANGE=$(ls -1t "$CHANGES_DIR" 2>/dev/null | grep -v '^archive$' | head -1)
    FEATURE_DIR="$CHANGES_DIR/$ACTIVE_CHANGE"
  fi
fi

# ── Resolve the log file path ──────────────────────────────────────────────────
if [ -n "$FEATURE_DIR" ]; then
  LOG_FILE="$FEATURE_DIR/prompts.md"
else
  LOG_FILE="$CWD/prompts.md"
  echo "[prompt-log] No active OpenSpec change found. Logging to project root." >&2
fi

# ── Write the entry ────────────────────────────────────────────────────────────
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

if [ ! -f "$LOG_FILE" ]; then
  CHANGE_NAME=$(basename "$FEATURE_DIR")
  echo "# Prompt Log — ${CHANGE_NAME:-project-root}" > "$LOG_FILE"
  echo "" >> "$LOG_FILE"
fi

{
  echo "## $TIMESTAMP | $AUTHOR"
  echo ""
  echo "> $PROMPT"
  echo ""
  echo "---"
  echo ""
} >> "$LOG_FILE"

exit 0
