# SKILL: Distribute a PAT / manage Actions secrets across the hive
Origin: Fable 5 + Founder, 2026-07-06 (three failure→fix cycles, then 6/6 green)
Use when: rotating the PAT, adding a secret to all colonies, or any secret 'not working'.
Steps:
1. Secret lives in THEHIVE → Settings → Secrets → Actions, named EXACTLY `PAT`.
2. Actions → 'Distribute PAT to Colonies' → Run workflow → expect 6 ✅ (uses `gh secret set` over stdin).
3. Then re-run any dependent workflow (Set Repo Descriptions, Constitution Sync).
Gotchas (each cost a run):
- Wrong NAME: workflows read `secrets.PAT`; GitHub can't rename — delete + recreate.
- Whitespace/newline pasted with token → `invalid header field value for Authorization`. Paste as ONE unbroken line; use GitHub's copy button.
- Empty env at runtime shows as `GH_TOKEN:` blank in the run log — that's your diagnostic.
- Secrets can't bootstrap themselves: the first PAT is always a human step.
