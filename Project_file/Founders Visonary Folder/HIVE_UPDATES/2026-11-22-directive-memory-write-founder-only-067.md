# HIVE_UPDATE 067: writing to Kai El's memory is founder-only (security item S-1)

**Date:** 2026-11-22 (founder's words, in chat); archived the same day
**Status:** RATIFICATION PENDING: becomes a recorded founder decision when the founder merges the PR that carries this file (see `docs/FOUNDER_ANSWERED` WS-001).
**Archive kind:** verbatim founder directive (`founder-directive-capture`).

## The founder's words (verbatim)

> "A"

## What it answered

Question 1 of 5 on the Worker security list: who may write into Kai El's memory. Option A (recommended): only the founder key. Option B: keep it open but wrap recalled text as untrusted. Option C: leave it. The founder chose A.

## Classification

| Part | Kind | Where it lives |
|---|---|---|
| "A": founder key required for `POST /v11/memory/remember` | **Ruling + go-ahead for this one back-end change** | `docs/FOUNDER_ANSWERED` WS-001; `worker/src/index.js`; `.github/workflows/kai-el-bridge.yml`; `worker/test/memory-remember-gate.test.js` |
