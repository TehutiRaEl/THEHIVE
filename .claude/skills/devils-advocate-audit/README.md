# devils-advocate-audit

Re-checks work already marked "done" by actually running it, not by re-reading it. Built after `backend/core/wallet.py`'s `credit()` turned out to be completely broken — every SOUL grant, tip, and arena payout raised an unhandled `sqlite3.ProgrammingError` — despite having passed review and merge. Nobody had ever actually invoked it; every prior look was a read.

## What it does

Hybridizes two things this repo already had, pointed at a job neither was built for:

- **`memory/philosophy/devils-advocate.md`** — the ten-question interrogation this hive already applies to architectural decisions ("what's the single point of failure," "what hidden assumptions are baked in") — repurposed here to pick *which already-shipped code* deserves suspicion.
- **`.claude/skills/fable-debugger/SKILL.md`** — the reproduce/contrast/root-cause/coupled-bug/verify-real discipline this hive already uses to debug a *reported* symptom — repurposed here to actually re-verify a target instead of just reading it.

fable-debugger waits for a symptom. This skill manufactures the skepticism that goes looking for one, on a schedule, across everything already claimed as working.

## The one rule that matters most

**"Could not verify" is a real, required outcome.** If a target needs a connector, credential, or environment this session doesn't have, the ledger says so plainly — it never gets silently counted as a pass. This is the direct answer to "how many bugs like wallet.py might already be sitting there unverified": the ledger makes that count honest and visible instead of hidden.

## Where the actual findings live

See [`AUDIT_LEDGER.md`](./AUDIT_LEDGER.md) — every module actually re-run (not just read), its verdict, and what's still owed a real pass. Check it before auditing anything, so the sweep doesn't repeat ground or silently skip something that only *looks* already handled.

## See also

- [`SKILL.md`](./SKILL.md) — full loop and target-selection priority
- [`fable-debugger`](../fable-debugger/) — the reactive half of this skill's parentage
- `memory/philosophy/devils-advocate.md` — the interrogation half
