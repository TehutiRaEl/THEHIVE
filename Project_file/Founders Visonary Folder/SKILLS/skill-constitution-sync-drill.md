# SKILL: Constitution sync drill (Queen → six colonies)
Origin: Fable 5, 2026-07-06 22:14Z — first all-green propagation in hive history
Use when: soul.md changed, after PAT rotation, or monthly health drill.
Steps:
1. THEHIVE Actions → 'Constitution Sync' → Run workflow (or just push a soul.md edit to main).
2. Watch each colony's 'Constitution Receive' run: downloads THEHIVE/main/soul.md with backoff, verifies sha256 against dispatch payload, commits `[skip ci]`.
3. Success = six green runs within ~1 minute; colony soul.md hashes all match the Queen's.
Gotchas: receive runs use the workflow file on each colony's DEFAULT branch — unmerged fixes don't count; the sync PAT-gates itself and skips politely if `secrets.PAT` is missing (check the step summary, not just the green check).
