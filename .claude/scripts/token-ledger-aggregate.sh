#!/usr/bin/env bash
# Cross-session token-savings aggregate (CAMPAIGN.html task 8, 2026-08-02).
#
# Extends session-usage.sh rather than rebuilding it: session-usage.sh reads
# ONE firing's real per-session total straight from that firing's own Claude
# Code transcript. This script does not re-solve that per-session read — it
# sums the *already-logged* per-firing `TOKENS: <n>` lines that
# CAMPAIGN.html's own protocol already mandates every firing write to its
# Campaign Log (see CAMPAIGN.html's ceiling-check rule). That log is git-
# tracked, human-readable, and grows by one real line per firing — the
# lightest real cross-session source available without a new D1 schema
# decision (TOKEN_ECONOMY_LEDGER.md flagged that as a macro item; the
# founder's Q17 "worth it" approved building tracking, not a new schema).
#
# Usage: token-ledger-aggregate.sh [path-to-CAMPAIGN.html]
# Prints: total firings counted, total tokens summed, min/max/avg per firing.
# Never estimates — a line that isn't the literal `TOKENS: <int>` format is
# not counted, same "don't fake it" discipline as session-usage.sh itself.

set -euo pipefail

CAMPAIGN="${1:-.claude/tasks/CAMPAIGN.html}"

if [ ! -f "$CAMPAIGN" ]; then
  echo "AGGREGATE: UNKNOWN (CAMPAIGN.html not found at $CAMPAIGN)" >&2
  exit 1
fi

# Same unanchored-grep fix CAMPAIGN.html's own ceiling check already needed
# (the anchored ^TOKENS: form found nothing, ever, because the log line
# doesn't start with it) — reuse the proven-working form here too.
python3 -c "
import re, sys

path = '$CAMPAIGN'
with open(path) as f:
    text = f.read()

matches = re.findall(r'TOKENS: (\d+)', text)
values = [int(m) for m in matches]

if not values:
    print('AGGREGATE: 0 firings logged, 0 tokens summed (no genuine TOKENS: lines found yet)')
    sys.exit(0)

total = sum(values)
n = len(values)
avg = total / n
print(f'AGGREGATE: firings={n} total_tokens={total} avg_per_firing={avg:.0f} min={min(values)} max={max(values)}')
"
