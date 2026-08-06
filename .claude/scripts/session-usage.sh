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
#
# Checkpointed delta (added 2026-08-06, CAMPAIGN.html task 39): this script
# originally summed the WHOLE transcript every time, which is correct only
# if each firing starts a genuinely fresh session. THEHIVE's daily Routine
# self-binds to ONE persistent, multi-day conversation instead (by the
# founder's own design, so a firing can pick up mid-context) — summing the
# whole file there returns the whole multi-day conversation's cumulative
# cost, not one firing's delta (a real 71M-token misread was caught and
# logged 2026-08-06 before this fix). Every transcript line carries a real
# ISO8601 `timestamp` field, so the fix is a checkpoint: remember the
# timestamp of the last time this script ran (per transcript, in
# ~/.claude/session-usage-checkpoints/ — outside the git repo on purpose,
# a runtime marker has no business being committed), sum only entries
# strictly newer than that, then advance the checkpoint to now. First-ever
# run for a transcript has no checkpoint yet, so it falls back to the old
# whole-file behavior — labeled explicitly as cumulative, never silently
# presented as a delta.

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

CHECKPOINT_DIR="$HOME/.claude/session-usage-checkpoints"
mkdir -p "$CHECKPOINT_DIR"
CHECKPOINT_FILE="$CHECKPOINT_DIR/$(basename "$TRANSCRIPT").last_ts"

python3 -c "
import json, os

transcript = '$TRANSCRIPT'
checkpoint_file = '$CHECKPOINT_FILE'

since_ts = None
if os.path.isfile(checkpoint_file):
    with open(checkpoint_file) as cf:
        since_ts = cf.read().strip() or None

total_out = total_in = total_cache_create = 0
latest_ts = since_ts
counted_lines = 0

with open(transcript) as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        try:
            obj = json.loads(line)
        except Exception:
            continue
        ts = obj.get('timestamp')
        if ts and (latest_ts is None or ts > latest_ts):
            latest_ts = ts
        # Delta mode: skip anything at or before the last checkpoint.
        if since_ts is not None and ts is not None and ts <= since_ts:
            continue
        msg = obj.get('message')
        if not msg:
            continue
        usage = msg.get('usage')
        if not usage:
            continue
        counted_lines += 1
        total_in += usage.get('input_tokens', 0)
        total_out += usage.get('output_tokens', 0)
        total_cache_create += usage.get('cache_creation_input_tokens', 0)

# Billable-weight total: real input + real output + real cache writes.
# Cache READS are deliberately excluded from this sum — they're billed at a
# fraction of input price, and including them would make the ceiling
# massively overstate cost for a long, well-cached session. If that
# judgment call turns out wrong, adjust here — it's one line, documented.
total = total_in + total_out + total_cache_create

# Advance the checkpoint to the newest timestamp actually seen this run —
# NOT to 'now', so a transcript that hasn't grown since the last check
# never double-advances past real data.
if latest_ts:
    with open(checkpoint_file, 'w') as cf:
        cf.write(latest_ts)

if since_ts is None:
    print(f'TOKENS: {total} (CUMULATIVE — no prior checkpoint for this transcript, this is the whole-session total, not one firing\'s delta; checkpoint now set for next run)')
else:
    print(f'TOKENS: {total} (delta since {since_ts}, {counted_lines} usage-bearing entries)')
"
