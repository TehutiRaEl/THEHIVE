# Council Protocols (C-0)

> **Status:** Protocol only. Runtime agents evolve from these rules (C-0 → later runtime).
> **Authority:** Founder-directed 2026-08-29. Council is a **separate body/colony**, head **RA**, not under Akosha's assign chain.

## Role

Council reviews work products that reach `council_queue` on TownHall (and high-alignment proposals that already use elderCouncilVeto). Protocols first; agents later.

## Hierarchy position

```
Nanuet (Queen) → Kai El → Akosha → specialists
                    ↑
              Council (RA)  ← separate colony, not in Akosha's assign tree
              Elders (Ma'at, Solomon, …) optionally back Council seats
```

## Protocol steps (human-readable, implementable later)

1. **Intake** — Item with `kind=council_queue` or `council_status=queued` appears on TownHall.
2. **Seat assignment** — RA (or protocol default) maps specialty to reviewer voice (balance / wisdom / …).
3. **Verdict shape** — Same discipline as ELDER_VOICES today: `VERDICT: CLEAR|OBJECT` + `REASON: …`.
4. **Write-back** — Update TownHall: `council_status`, `elder_note` / council note; status → `digested` path or stay open with object.
5. **Never** approve money, constitution changes, or merge to main.

## Elders

Elders return to rightful duties (Ma'at balance, Solomon wisdom, Sekhmet arena, etc.). They may **optionally** serve as Council backing agents when RA seats need a named voice. Existing `elderCouncilVeto()` / `consultElder()` stay the live pilot; C-0 does not replace them.

## Non-goals (C-0)

- No new Worker routes in this doc-only slice.
- No auto-merge, no spend, no secret writes.

## Next

Runtime: Council colony id + RA head agent row + optional TownHall write-back from consult path.
