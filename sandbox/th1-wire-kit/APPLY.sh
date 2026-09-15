#!/usr/bin/env bash
# TH-1 surgical apply helper
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PATCH="$(cd "$(dirname "$0")" && pwd)/docs/TH1_INDEX_WIRE.patch"
if [[ ! -f "$PATCH" ]]; then
  echo "Missing patch: $PATCH" >&2
  exit 1
fi
cd "$ROOT"
if [[ ! -f worker/src/index.js ]]; then
  echo "worker/src/index.js not found — run from THEHIVE repo root" >&2
  exit 1
fi
echo "Applying $PATCH ..."
git apply "$PATCH" || { echo "git apply failed"; exit 1; }
echo "OK. Review: git diff --stat worker/src/index.js"
