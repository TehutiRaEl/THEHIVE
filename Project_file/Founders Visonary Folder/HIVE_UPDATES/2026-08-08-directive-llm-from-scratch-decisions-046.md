# Founder directive — 2026-08-08 — the LLM-from-scratch document, log-only

Session: THEHIVE, `claude/fable-5-handoff-setup-vefwlb`.

The founder pasted an old document from their visionary scope/vision archive — described as
*"the dream of what we're building now"* — and asked for it to be brought *"from the fourth
dimension down to the third dimension, metaphorically speaking."* Full text preserved at
`SOURCES/research-notes/2026-08-08-llm-from-scratch-course-integration-report.md`; the
atomization applying `research-to-dna` is at
`VISION/2026-08-08-vision-llm-from-scratch-atomization-008.md`.

## Provenance note — same rule as the last directive capture

The two decisions below were given by **selecting options** in a structured question prompt,
not as free-typed prose — recorded as selections, not promoted into quotes they were not. The
founder's own free-typed words in this exchange were the initial request quoted above, and
afterward the explanation of intent quoted in full under decision 2.

## The two decisions

### 1. Log it permanently

**Question asked:** save the document and the reality-check findings into permanent records,
same as the last big document, or treat this conversation as sufficient?

**Founder chose:** *"Yes, log it."*

**Consequence:** this file, the source preservation, and the atomization triage exist because
of this decision.

### 2. Build nothing yet — atomize, don't copy-paste

**Question asked:** build the one real, small, honest piece (a tiny CPU-trainable toy model,
just to prove the pipeline works), or leave it as ideas for later?

**Founder's own words, typed in full, not a selection:**

> *"No, don't build anything. The goal was to go over all of this and see what all we could
> utilize from the perspective, visionary scope of it meaning we're gonna break it down so
> it's very atoms and rebuild it into the hive instead of copying and pasting everything."*

**Consequence:** no code was written. The atomization document classifies every real element
against what the hive already has, rather than importing the document's proposed `llm/`
directory, agent roster, or constitutional articles wholesale. This is precisely
`research-to-dna`'s own step 3 — *"does the hive already do this, in its own infrastructure,
for free, with something already vetted?"* — applied on the founder's explicit instruction
rather than assumed.

## What the reality-check found, for the permanent record

Three fabrications, checked directly against the real repo rather than taken on trust:

1. **"Free GPU training on Oracle Cloud" is false.** The Oracle Always Free tier (the same one
   `deploy.yml`/task 53 already tracks) is ARM CPU only — no GPU. This container itself has no
   GPU either. The entire "$0 training cost" economics in the source document's Part VI rests
   on this false premise.
2. **"AYINE", "Tesseract QTN", "ACU" do not exist anywhere in this repository.** Grepped in
   full — `THE_CODEX.md`, `FABLE_DNA.md`, `soul.md`, `memory/`. Zero occurrences of any of the
   three. Not hive concepts.
3. **"NECROMANCER spawns DAEMONS" and "TITLE XXI/XXII"** both fail on inspection. "Daemon" is
   real, but only as one singular mythological character (`soul.md`'s 14-Layer Architecture,
   Layer 4) — the document turns it into a plural spawnable engineering role, the same mistake
   `MANDATE_TRIAGE.md` already caught once before on a different proposal. "TITLE XXI/XXII"
   does not match soul.md's real F-001–F-006 numbering or `docs/GOVERNANCE.md`'s real
   F-001–F-013 `ARTICLE` numbering — a citation format that was never real, attached to law
   changes that were never reviewed.

## Did

- Read the full document.
- Reality-checked the Oracle GPU claim, the AYINE/Tesseract QTN/ACU terms, the Necromancer/
  Daemon org-chart proposal, and the TITLE XXI/XXII numbering — all against the real repo, not
  from memory.
- Ran the full `research-to-dna` four-lens classification (VERIFIED-REAL / CATALOGUED-FOR-
  FUTURE / NARRATIVE-CANON / DECLINED) and distilled the real, useful ideas onto what the hive
  already has, rather than importing the document's proposed structure.
- Preserved the source, wrote the atomization, and captured this directive.

## Needs

Nothing new. This pass did not touch `CAMPAIGN.html` or the P0–P7 project ledger — the
catalogued-for-future items (a real toy-model demo; local quantized models via Ollama for
cost reduction) are recorded in the atomization file but not queued as tasks, per the
founder's standing "stop opening new tasks" instruction and because they are explicitly not
being built right now.

## Learned

The founder's framing — *"break it down to its very atoms and rebuild it into the hive
instead of copying and pasting"* — is itself worth keeping as a standing instruction for any
future visionary document, not just this one. It is a plainer restatement of
`research-to-dna`'s own step 3, and having the founder independently arrive at the same
principle is real confirmation the process is the right one, not just the hive's own
preference.
