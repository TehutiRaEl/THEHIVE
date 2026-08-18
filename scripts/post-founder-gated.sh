#!/usr/bin/env bash
# scripts/post-founder-gated.sh
#
# Single shared implementation of "POST a JSON payload to a founder-gated
# /v11 endpoint" — previously reimplemented independently in three workflows
# (roadmap-digest.yml, task-digest.yml, campaign-roadmap-digest.yml), which is
# exactly how they drifted apart once already (PR #163: one workflow's
# secrets.FOUNDER_KEY reference got renamed to FOUNDERS_KEY and the other two
# didn't, because there was no single place to change). One script means one
# place to fix a bug, and no future drift between the three call sites.
#
# 2026-08-09: also the fix for a real incident — a pasted secret carrying a
# trailing newline/CR corrupted the Authorization header enough that curl
# refused to send the request at all (exit 43), which read nothing like an
# auth failure and cost real debugging time before the cause was found.
# Stripping control characters here means that mistake can never again
# produce that failure mode, for any current or future caller of this script.
#
# Usage:
#   FOUNDER_KEY=... post-founder-gated.sh <url> <payload-file> [response-file]
#
# Exits 0 on HTTP 200, prints status + response body either way, exits 1 on
# any non-200 (matching every existing caller's behavior). Exits 0 with a
# ::warning:: (not a failure) when FOUNDER_KEY is unset, since an unbound key
# is an expected, honest state during setup — not a workflow bug.
set -euo pipefail

url="${1:?usage: post-founder-gated.sh <url> <payload-file> [response-file]}"
payload_file="${2:?usage: post-founder-gated.sh <url> <payload-file> [response-file]}"
resp_file="${3:-/tmp/post-founder-gated-resp.json}"

if [ -z "${FOUNDER_KEY:-}" ]; then
  echo "::warning::FOUNDER_KEY not set — this endpoint is founder-gated, so an anonymous caller must not be able to write to it. Skipping the post; whatever was built before this step still ran correctly."
  exit 0
fi

# See header comment: strips whatever whitespace a copy-paste mistake adds,
# so it can never again masquerade as a wrong-key failure.
clean_key=$(printf '%s' "$FOUNDER_KEY" | tr -d '\r\n')

code=$(curl -sS -m 25 -o "$resp_file" -w '%{http_code}' \
    -X POST "$url" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $clean_key" \
    --data-binary "@${payload_file}")

echo "status=$code"; cat "$resp_file"; echo
[ "$code" = "200" ] || { echo "::error::POST to ${url} failed (${code})"; exit 1; }
