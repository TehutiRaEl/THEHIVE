# HIVE_UPDATE 071: files are never served as pages, and uploading is founder-only (security item S-5)

**Date:** 2026-11-22 (founder's words, in chat); archived the same day
**Status:** RATIFICATION PENDING: becomes a recorded founder decision when the founder merges the PR that carries this file (see `docs/FOUNDER_ANSWERED` WS-005).
**Archive kind:** verbatim founder directive (`founder-directive-capture`).

## The founder's words (verbatim)

> "A"

## What it answered

Question 5 of 5 on the Worker security list (item S-5, found while checking S-4): uploaded files were served inline from the Command Center's own origin, with the uploader's chosen content type, and anyone could upload; with the founder key now kept in the browser, an uploaded HTML page could have read it. Option A (recommended): safe serving plus founder-key upload. Option B: safe serving only. Option C: leave it.

## Classification

| Part | Kind | Where it lives |
|---|---|---|
| "A" | **Ruling + go-ahead for this one back-end and front-end change** | `docs/FOUNDER_ANSWERED` WS-005; `worker/src/index.js`; `frontend/src/components/kai-os/FilesPanel.tsx`; `worker/test/files-safety.test.js` |
