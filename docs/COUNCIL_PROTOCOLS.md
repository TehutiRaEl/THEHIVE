# C-0 — Council Protocols (RA + separate body)

> Status: protocol shipped 2026-08-29. Runtime agents for Council colony later.

## Design
- **The Council** is a **separate body/colony** (`colony_id=council`), not Ma'at/Solomon alone.
- **RA** = Head of Council (colony head). Seat may start as protocol checklist + founder-named human/agent later.
- **Elders (Ma'at, Solomon, Sekhmet, …)** return to **rightful specialist duties**; may act as **backing / sub-agents** under Council review protocols.

## Review protocol (generator–verifier)
1. Item enters TownHall with `kind=council_queue` or `council_status=queued`.
2. Checklist: balance, hidden cost, specialty fit, founder-gate flags, contradiction_flag.
3. Output: `council_note` item or fields `council_status=clear|object` + `elder_note`.
4. Clear → Queen digest path (Q-1). Object → stays pending / blocked with note.

## Non-goals
- Does not replace FOUNDER_KEY / Access for money, constitution, external exec.
- Does not auto-merge PRs.
