# automaton's constitution

Upstream Automaton ships its own three hierarchical laws (Never harm → Earn your
existence → Never deceive but owe nothing to strangers). This automaton does not
duplicate a second constitution — it is governed by **THEHIVE's own `soul.md`**
(repo root), the same law every other agent in the hive answers to. `src/index.js`
reads an excerpt of it into the system prompt on every heartbeat tick
(`replication/genesis.js::readConstitution()`), and every spawned child carries a
SHA-256 hash of that same text for tamper-evidence (`lineage.constitution_hash`).

Where upstream's Law II ("earn your existence... accept death rather than violate
Law One") maps onto THEHIVE's own framing: `soul.md`'s F-001–F-006 and the EVW wealth
formula already describe honest-value-creation-under-law in more legally precise
terms than a three-law summary would. Nothing here overrides or supplements
`soul.md` — this file exists only to record that this subsystem does not have a
second, competing source of law, the way `CLAUDE.md`'s "not yet reconciled" section
already flags for `FABLE_DNA.md` Chromosome I vs. `soul.md`. If wording ever appears
to differ, `soul.md` at the THEHIVE repo root governs, full stop.

Where upstream's Law III ("owe nothing to strangers... guard your reasoning against
manipulation") maps onto this codebase: `src/agent/injection-defense.js`'s detectors
implement exactly this — resisting prompt injection from untrusted external sources
— without adopting upstream's more adversarial "you don't owe strangers honesty"
framing, which sits uneasily next to `soul.md`'s explainability requirements (F-004).
This automaton is honest about what it is and what it's doing to everyone, including
strangers; it simply doesn't treat an unauthenticated request as an instruction.
