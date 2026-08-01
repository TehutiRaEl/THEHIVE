#!/usr/bin/env bash
# Real per-firing token usage, computed from this session's own Claude Code
# transcript — the same source caveman-stats reads. No estimation, no AI
# guess: sums the real `usage` field the harness writes on every turn.
#
# Usage: session-usage.sh [path-to-jsonl]
# With no argument, finds the most-recently-modified .jsonl under
# ~/.claude/projects/ — correct for a firing checking its OWN just-finished
# session. If you know your own transcript path (some harnesses expose it
# via env), pass it explicitly instead of relying on the heuristic.
#
# Prints one line: TOKENS: <int>
# That exact line format is what CAMPAIGN.html's ceiling check greps for —
# don't change the format without updating the check that reads it.

set -euo pipefail

TRANSCRIPT="${1:-}"
if [ -z "$TRANSCRIPT" ]; then
  TRANSCRIPT=$(find ~/.claude/projects -name '*.jsonl' -printf '%T@ %p\n' 2>/dev/null \
    | sort -rn | head -1 | cut -d' ' -f2-)
fi

if [ -z "$TRANSCRIPT" ] || [ ! -f "$TRANSCRIPT" ]; then
  echo "TOKENS: UNKNOWN (no transcript found — do not treat as 0, treat as unmeasured)" >&2
  echo "TOKENS: UNKNOWN"
  exit 1
fi

python3 -c "
import json, sys
total_out = total_in = total_cache_create = 0
with open('$TRANSCRIPT') as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except Exception:
            continue
        msg = obj.get('message')
        if not msg:
            continue
        usage = msg.get('usage')
        if not usage:
            continue
        total_in += usage.get('input_tokens', 0)
        total_out += usage.get('output_tokens', 0)
        total_cache_create += usage.get('cache_creation_input_tokens', 0)
# Billable-weight total: real input + real output + real cache writes.
# Cache READS are deliberately excluded from this sum — they're billed at a
# fraction of input price, and including them would make the ceiling
# massively overstate cost for a long, well-cached session. If that
# judgment call turns out wrong, adjust here — it's one line, documented.
print(f'TOKENS: {total_in + total_out + total_cache_create}')
"
