# Dual Lens — Integration notes

## Adaptations from the compound package

1. **Founder path:** `Project_file/Founders Visonary Folder/voice-of-the-hive/` (repo canonical), not a top-level `founder/`.
2. **index.js:** Not wired in this PR. Packages land first so CI stays green.
3. **spec.md:** Full G-POS on PR #211; port after packages-only is green.
4. **Seer / gate:** Modules present; wire deferred until Worker tests are understood.

## Founder remaining steps (after green merge)

1. Port full Dual Lens G-POS into `worker/src/lens/spec.md`.
2. Run first VOICE.md compression from the founder directory.
3. Optionally mirror VOICE.md to R2 key `founder/voice-of-the-hive/VOICE.md`.
4. Land create-gate + surgical index.js wire in a follow-up PR once tests are fixed.
