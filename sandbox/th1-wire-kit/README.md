# TH-1 Wire Kit — TownHall index.js surgical apply

**Date:** 2026-08-30  
**PR:** https://github.com/TehutiRaEl/THEHIVE/pull/195  
**Branch:** `grok/th1-index-wire-2026-08-29`  
**Target file:** `worker/src/index.js` (~245KB on main, SHA `97b5006c…`)

## Contents

| Path | Role |
|------|------|
| `docs/TH1_INDEX_WIRE.patch` | Exact three-anchor surgical patch |
| `docs/TH1_WORKER_ROUTES.md` | Human-readable insertion points + acceptance |
| `docs/PLAN_LOG_2026-08-29.md` | Session status |
| `worker/schema/townhall.sql` | Canonical DDL (already on main via PR #194) |
| `APPLY.sh` | One-command apply helper |

## Why not the full 245KB blob in this zip

The live `worker/src/index.js` is private-repo only and ~245KB. This kit is the **complete, reviewable surgical change**. Applying the patch to your local checkout of main produces the wired file without rewriting the whole Worker.

## Apply (30 seconds)

```bash
# from THEHIVE repo root, on branch grok/th1-index-wire-2026-08-29 (or main + patch)
git checkout grok/th1-index-wire-2026-09-15
# if you only have this zip:
#   place docs/TH1_INDEX_WIRE.patch in repo, then:
git apply docs/TH1_INDEX_WIRE.patch
# or:
bash APPLY.sh

git diff --stat worker/src/index.js
git add worker/src/index.js
git commit -m "TH-1: wire townhall_items + GET/POST /v11/townhall (surgical)"
git push
```

## Three anchors (only these change)

See `docs/TH1_INDEX_WIRE.patch` and `docs/TH1_WORKER_ROUTES.md`.
