# Dual Lens — Integration notes (feat/lens-perception-layer)

## Adaptations from the compound package

1. **Founder path:** `Project_file/Founders Visonary Folder/voice-of-the-hive/` (repo canonical), not a top-level `founder/`.
2. **index.js:** ES module imports added; `generate()` used instead of fictional `callLLM`; existing INSERT column sets preserved (+ `normalized_title`).
3. **ensureTables:** `normalized_title` ALTER + `gate_refusals` CREATE on heartbeat (same pattern as other columns).
4. **spec.md:** Placeholder only — founder pastes full G-POS Dual Lens text.
5. **Seer LLM cost:** Runs on Ptah + chat `PROPOSAL:` paths inside `waitUntil`. Deterministic gate always runs even if Seer fails.
6. **Migration:** Prefer `worker/src/migrations/001-add-normalized-title.sql` via `wrangler d1 execute` before or with deploy; ensureTables also applies ALTERs harmlessly.

## Founder remaining steps

1. Paste Dual Lens full spec into `worker/src/lens/spec.md`.
2. Run first VOICE.md compression from the founder directory.
3. Optionally mirror VOICE.md to R2 key `founder/voice-of-the-hive/VOICE.md`.
4. Reject scientist probe proposals #88/#89 if still pending.
5. Optional: bulk-reject open F-007 clones after gate is live.
