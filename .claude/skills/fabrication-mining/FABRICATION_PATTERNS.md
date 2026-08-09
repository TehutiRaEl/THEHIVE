# Fabrication pattern registry

Append-only. Each entry names a recurring **shape** of fabrication — not one instance, but a
shape seen more than once, cited both times — and states why the shape recurring is itself
predictive. A shape seen exactly once belongs in the relevant VISION/audit file, not here;
promote it to this registry the moment a second real instance is found.

Companion to `SKILL.md`, same directory. See that file's "Producing a usable report" section
for how a shape earns a place here.

---

## Pattern 001 — mythology promoted to spec

**Shape:** a real, singular, narrative figure from the hive's own mythology (`THE_CODEX.md`,
`soul.md`'s creation-myth layers) gets read by an external document as if it were an
engineering role, then pluralised or given a mechanism it never had in the source myth.

**Instances:**
1. `MANDATE_TRIAGE.md` directive #7 (pre-2026-08-08): *"Daemon breathes each generation into a
   new format"* read as a literal spawning mechanism. Real value extracted was narrower and
   already correct: *"each generation builds on the last generation's distilled lessons"* —
   adopted as the Recall→Harvest loop, Chromosome VI. The literal breathing mechanism and the
   rigid caste ordering were declined.
2. `VISION/2026-08-08-vision-llm-from-scratch-atomization-008.md`, "DECLINED" section:
   *"'NECROMANCER spawns DAEMONS' as an engineering org chart"* — `soul.md`'s real Daemon is
   singular, *"the firstborn architect"* (14-Layer Architecture, Layer 4). The source document
   pluralised one mythological being into a spawnable software role. VISION-008 names this
   itself as *"the exact pattern `MANDATE_TRIAGE.md` already warned about once before,
   verbatim… Same mistake, recurring."*

**Why it recurs, predictively:** narrative naming is memorable and specific-sounding, which
makes it attractive raw material for an external document trying to sound native to the hive
without having read `FABLE_DNA.md` Chromosome V's actual boundary (mythology is honored,
never engineering law). Any future document that name-checks a real Codex figure and then
assigns it mechanism or multiplicity should be checked against this shape **first**, before a
full fabrication-mining pass — it is very likely the same move a third time.

**Real value under the shape, both times:** "later work builds on distilled earlier work" is
sound and already adopted. The recurring fabrication is not the underlying idea; it is
smuggling a spec through a name that was never meant to carry one.

---

## Pattern 002 — fabricated precision riding on a real decomposition

**Shape:** a genuinely sound structural idea (break a claim into its evidentiary components —
proven physics, proven domain knowledge, empirical measurement, stated uncertainty) gets
undermined by attaching an unearned numeric confidence figure to the whole, with no method
producing that number.

**Instances:**
1. The Arithmancer PDF (`a76ad0ab-Ai.pdf`), every response block: `"TRUTH PERCENTAGE 96.9% ±
   1.8%"` through `"98.3% ± 1.5%"`. The decomposition underneath each figure (which claims are
   proven physics vs. speculation) is real and legible. The number stapled on top has no
   method — `±1.8%` on *"consciousness is the rate of entropy production"* is not a
   measurable quantity. See `VISION/2026-08-08-vision-arithmancer-thermodynamics-audit-010.md`
   §1.3.

**Not yet a confirmed pattern — one real instance.** Recorded here as a watch item: if a
second external document is found attaching a confident numeric score to an otherwise sound
qualitative decomposition, promote this to a full pattern entry and cross-reference both.
Kept in the registry now (rather than only in VISION-010) because the *mechanism* — a real
structure wearing an unearned number — is exactly the failure `wired-or-not` and
`scripts/check-claims.py` were built to catch in the hive's own claims, so a second instance
would be immediately actionable, not merely interesting.

---

## Pattern 003 — real vendor, real mechanism, invented number, no locator

**Shape:** a citation names a real organization and a plausible mechanism, attaches a specific
number, and supplies no title, date, DOI, or link a reader could use to verify it.

**Instances:**
1. The Arithmancer PDF: *"Oil cooling reduces soft-error rates in overclocked GPUs (documented
   in HPC whitepapers by Intel/AMD, ~25% reduction in bit-flips at 70°C vs 30°C)"* — Intel and
   AMD are real, dielectric-immersion EMI damping is a real and plausible mechanism, `~25%` is
   stated with no source that could confirm or refute it.

**One real instance so far — recorded because the hive already has a countermeasure for
exactly this shape, unbuilt:** CAMPAIGN task 17 ("Legal-research citation verification") exists
precisely to catch a citation with this signature and was filed before this pattern had a
name. This instance is filed as a `LIVE-FIXTURE` verdict in
`VISION/2026-08-08-vision-arithmancer-thermodynamics-audit-010.md` for that reason — it is a
ready-made adversarial test case for task 17 whenever that task is picked up.

---

## Pattern 004 — unearned performance multiplier vs. honest complexity statement

**Shape:** a specific performance claim (a speedup multiplier, a latency figure, a loss target)
is stated with no unit, no dataset, no measurement method, and no benchmark behind it — as
opposed to a complexity-class statement (`O(√N)` vs. `O(N)`) or a real, run, cited benchmark.

**Instances:**
1. `Fable_memory.md`, 2026-08-02 dissertation pass: *"an unbacked '500x speedup' claim in pasted
   `qhdc.py`"* — never merged; grepped across the current repo, zero occurrences.
2. `VISION/2026-08-08-vision-llm-from-scratch-atomization-008.md`, "DECLINED" section: *"`Loss <
   1.0` with no units or dataset named… `< 100ms per token` inference on the very same GPU-less
   free tier the training claim already fell apart on."*

**Why it recurs, predictively:** a confident-sounding number is cheap to write and expensive to
falsify without independently re-running the work — the same economics that make fabricated
precision (Pattern 002) attractive apply here, one level more concrete (a specific multiplier
instead of a confidence percentage). Any future document proposing a performance number without
a stated method should be checked against this shape first.

**The hive's own correct countermodel, found by this same sweep:**
`backend/tier3/quantum_bridge.py` states its real speedup claim as
`"speedup": f"O(√{N}) vs O({N})"` — a complexity-class relationship, not a bare multiplier. Worth
citing as the concrete "state it like this instead" reference the next time a performance claim
needs writing anywhere in this repo. Full mining trace for both instances:
`VISION/2026-08-08-vision-decline-retro-sweep-012.md`, source 2e and source 3.
