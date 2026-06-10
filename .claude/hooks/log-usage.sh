#!/bin/bash
# log-usage.sh
# Stop hook: reads transcript JSONL for token usage (the stop payload does NOT include usage
# data — it only provides session_id, stop_hook_active, and transcript_path), then writes a
# complete entry to prompts.md and refreshes the running Summary block.
#
# Pricing: Claude Sonnet 4.6 — $3.00/1M input, $15.00/1M output,
#          $3.75/1M cache-creation, $0.30/1M cache-read

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

# Resolve temp dir via Python so it matches where log-prompt.sh writes on Windows.
TMPDIR=$($PYTHON -c "import tempfile; print(tempfile.gettempdir())" 2>/dev/null)
POSIX_TMPDIR=$(cygpath -u "$TMPDIR" 2>/dev/null || echo "$TMPDIR")
PENDING_FILE="$POSIX_TMPDIR/claude-pending-prompt.json"
[ ! -f "$PENDING_FILE" ] && exit 0

STOP_INPUT_FILE="$POSIX_TMPDIR/claude-stop-input.json"
cat > "$STOP_INPUT_FILE"

$PYTHON - "$STOP_INPUT_FILE" "$PENDING_FILE" << 'PYEOF'
import sys, json, os, time

stop_input_file = sys.argv[1]
pending_file = sys.argv[2]

# Resolve Windows-safe paths in case bash passed POSIX paths Python can't open.
def to_native(p):
    if os.name == 'nt' and p.startswith('/'):
        try:
            import subprocess
            result = subprocess.run(['cygpath', '-w', p], capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip()
        except Exception:
            pass
    return p

stop_input_file = to_native(stop_input_file)
pending_file = to_native(pending_file)

try:
    with open(stop_input_file, encoding='utf-8') as f:
        stop_data = json.load(f)
    os.remove(stop_input_file)
except Exception:
    try:
        os.remove(stop_input_file)
    except Exception:
        pass
    sys.exit(0)

# The stop hook payload contains transcript_path (not usage data).
# Read token usage from the JSONL transcript instead.
transcript_path = stop_data.get('transcript_path', '')


def is_real_user_prompt(entry):
    """True for an actual user message, as opposed to a tool_result
    (tool results are also logged with type=='user')."""
    if entry.get('type') != 'user':
        return False
    content = entry.get('message', {}).get('content')
    if isinstance(content, str):
        return True
    if isinstance(content, list):
        return not any(isinstance(c, dict) and c.get('type') == 'tool_result' for c in content)
    return False


def compute_usage():
    input_tokens = output_tokens = cache_creation_tokens = cache_read_tokens = 0
    if not transcript_path or not os.path.exists(transcript_path):
        return input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens

    try:
        with open(transcript_path, encoding='utf-8') as f:
            raw_lines = [line.strip() for line in f if line.strip()]
    except Exception:
        return input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens

    entries = []
    for line in raw_lines:
        try:
            entries.append(json.loads(line))
        except Exception:
            entries.append(None)

    # Find the last real user prompt (not a tool_result) -- that marks the
    # start of the current turn, even if the turn paused on an interactive
    # tool (e.g. AskUserQuestion) that logged its answer as type=='user' too.
    last_user_idx = -1
    for i, entry in enumerate(entries):
        if entry is not None and is_real_user_prompt(entry):
            last_user_idx = i

    # A single API response can be split across multiple JSONL lines (one per
    # content block), all carrying the same message usage -- count each
    # response only once.
    seen_message_ids = set()
    for entry in entries[last_user_idx + 1:]:
        if entry is None or entry.get('type') != 'assistant':
            continue
        message = entry.get('message', {})
        msg_id = message.get('id')
        if msg_id is not None:
            if msg_id in seen_message_ids:
                continue
            seen_message_ids.add(msg_id)
        usage = message.get('usage', {})
        input_tokens += usage.get('input_tokens', 0)
        output_tokens += usage.get('output_tokens', 0)
        cache_creation_tokens += usage.get('cache_creation_input_tokens', 0)
        cache_read_tokens += usage.get('cache_read_input_tokens', 0)

    return input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens


# The transcript line for the turn's final assistant message can be flushed to
# disk slightly after the Stop hook fires, so retry briefly and keep whichever
# read captured the most usage.
input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens = compute_usage()
for _ in range(3):
    time.sleep(0.3)
    candidate = compute_usage()
    if sum(candidate) > sum((input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens)):
        input_tokens, output_tokens, cache_creation_tokens, cache_read_tokens = candidate

try:
    with open(pending_file, encoding='utf-8') as f:
        pending = json.load(f)
    prompt = pending['prompt']
    author = pending['author']
    timestamp = pending['timestamp']
    cwd = pending['cwd']
    os.remove(pending_file)
except Exception:
    try:
        os.remove(pending_file)
    except Exception:
        pass
    sys.exit(0)

# Claude Sonnet 4.6 pricing
INPUT_RATE = 3.00 / 1_000_000
OUTPUT_RATE = 15.00 / 1_000_000
CACHE_CREATE_RATE = 3.75 / 1_000_000
CACHE_READ_RATE = 0.30 / 1_000_000

cost = (
    input_tokens * INPUT_RATE
    + output_tokens * OUTPUT_RATE
    + cache_creation_tokens * CACHE_CREATE_RATE
    + cache_read_tokens * CACHE_READ_RATE
)

log_file = os.path.join(cwd, 'prompts.md')

if not os.path.exists(log_file):
    with open(log_file, 'w', encoding='utf-8') as f:
        f.write('# Prompt Log\n\n')

with open(log_file, 'r', encoding='utf-8') as f:
    content = f.read()

entry = (
    f"## {timestamp} | {author} | in: {input_tokens} out: {output_tokens} | cache_read: {cache_read_tokens} cache_write: {cache_creation_tokens}\n\n"
    f"> {prompt}\n\n"
    f"---\n\n"
)

with open(log_file, 'a', encoding='utf-8') as f:
    f.write(entry)

PYEOF

exit 0
