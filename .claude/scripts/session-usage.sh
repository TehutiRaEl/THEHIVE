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
# What TOKENS counts (founder decision 2026-08-08, CAMPAIGN.html task 51):
# real input + real output ONLY. Cache creation and cache reads are both
# excluded. Cache creation is still printed, labelled, at the end of the
# line — visible but never summable. See the comment at the `total = ...`
# line below for the two measurements that drove the change.
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

# Real reasoning total: input + output only. Founder decision, 2026-08-08
# (CAMPAIGN.html task 51) — this line previously also added
# total_cache_create, and that judgment call was explicitly flagged as
# revisable right here ('if that judgment turns out wrong, adjust here').
# It turned out wrong, and it was measured twice before being changed:
#   2026-08-07  ceiling total 10,125,486  — 96%   cache creation
#   2026-08-08  ceiling total 13,941,762  — 94.7% cache creation
# Both firings were stopped by the ceiling before doing any work, while the
# genuine reasoning underneath was 422,464 and 734,232 respectively — both
# comfortably under the 3,000,000 limit. Cache creation scales with how long
# and large this persistent, self-bound conversation has grown, NOT with how
# much work a firing does, so counting it made the rail fire on conversation
# age rather than on cost of work. Cache READS stay excluded as they always
# were (billed at a fraction of input price).
total = total_in + total_out

# Cache creation is still REPORTED, never silently dropped — it is real spend
# and the founder should be able to see it. It is deliberately kept off the
# TOKENS figure and labelled, because task 39 fixed a real bug caused
# by two different meanings sharing one summable label. Never add this number
# to a TOKENS total.

# Advance the checkpoint to the newest timestamp actually seen this run —
# NOT to 'now', so a transcript that hasn't grown since the last check
# never double-advances past real data.
if latest_ts:
    with open(checkpoint_file, 'w') as cf:
        cf.write(latest_ts)

basis = f'real input {total_in} + output {total_out}; cache-creation {total_cache_create} reported separately, NOT counted'

if since_ts is None:
    print(f'TOKENS: {total} (CUMULATIVE — no prior checkpoint for this transcript, this is the whole-session total, not one firing\'s delta; checkpoint now set for next run) [{basis}]')
else:
    print(f'TOKENS: {total} (delta since {since_ts}, {counted_lines} usage-bearing entries) [{basis}]')
"
