# HIVE_UPDATE 068: the AI route is founder-only and rate-limited (security item S-2)

**Date:** 2026-11-22 (founder's words, in chat); archived the same day
**Status:** RATIFICATION PENDING: becomes a recorded founder decision when the founder merges the PR that carries this file (see `docs/FOUNDER_ANSWERED` WS-002).
**Archive kind:** verbatim founder directive (`founder-directive-capture`). Typos are the founder's and are kept.

## The founder's words (verbatim)

> "A, and I don't think it does so check first"

## What it answered

Question 2 of 5 on the Worker security list. Option A (recommended): founder key required plus the 30/min/IP rate limit. Claude had said the automaton might not carry a founder key and would confirm it in code; the founder said he did not think it did and asked for the check first. The check confirmed it: no key was sent (see WS-002).

## Classification

| Part | Kind | Where it lives |
|---|---|---|
| "A" | **Ruling + go-ahead for this one back-end change** | `docs/FOUNDER_ANSWERED` WS-002; `worker/src/index.js`; `automaton/src/inference/thehive-provider.js`; `.github/workflows/kai-sandbox-run.yml` |
| "check first" | **Instruction** (verify before changing) | done; result recorded in WS-002 |
