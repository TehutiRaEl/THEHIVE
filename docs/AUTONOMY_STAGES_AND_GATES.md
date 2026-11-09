# Autonomy Stages and Gates — DRAFT (workspace-only, NOT ratified)

**Status:** Draft, 2026-11-09. Proposed repo design doc. Not Hive law, not a charter
change, not a ratification of anything. Nothing in this file authorizes a
switch flip, a merge, a deploy, a spend, or any build. It is a design Mac
asked for on the 2026-11-09 voice call: compress the ratified 20-rung
done ladder + FABLE-5 into stages and gates, so work can move through the
stages on its own as long as each stage's requirements are met.

**Sources it compresses (nothing added, nothing removed):**
- The ratified 20-rung ladder (`EXPANDED_DONE_LADDER_v1_DRAFT.md`, ratified
  2026-11-07): compiles → researches → confirm → abduct → deduce →
  tested → quantitative analysis → innovative compressive complex computing
  → reverse engineered if necessary → legally/lawfully sound → quantum
  compression → Devil's Advocate → Childlike Wonder → DaVinci → wired →
  tested → Fable pre-merge (16b, blocking) → merged → deployed →
  verified-live → Fable post-live (rung 20).
- FABLE-5 (`FABLE-5_SPEC.md`, founder-provided, not ratified; sits
  ALONGSIDE rung 20 by Mac's decision 2026-11-07): five levels L1 Disk /
  L2 Wired / L3 Tested / L4 Deployed / L5 Verified-Live; protocol loop
  INTAKE → PREMISE-CHECK → PROBE → COMPARE → CLASSIFY → ESCALATE →
  HANDOFF; mixed permission gate AUTONOMOUS L1–L2 / APPROVED L3–L4 /
  FOUNDER-ONLY L5; interpretation only inside the fixed 13-category
  List A taxonomy, only when Childlike Wonder + Devil's Advocate agree.

**Standing rules this design does NOT change:** Q-006 (switch 9 OFF until
the Queen passes the done ladder, and even then never skips the
action-request gate for money / deletion / publishing / constitution /
external); Q-007 (all Kai autonomy stages OFF); all six NANUET switches
off live; Mac merges Queen PRs himself; the Queen 100% rule (nothing else
gets built until the Queen is 100%, chronological Q-A → Q-B → Q-C, and the
Kai El chatbot is 100% inside that build — Mac, 2026-11-09); the Q2 risk
table (LOW read/summarize/log/research, NORMAL draft-then-approve, HIGH
explicit-invoke-only).

**ELI5:** a stage is a room. A gate is the door out of the room. The door
only opens when the checklist on the wall is done, with proof. Nobody
props the door open. If the checklist fails, you go back to the earliest
room that failed — you do not walk around it.

---

## The 7 stages (20 rungs + 5 FABLE-5 levels, compressed)

### Stage 1 — THINK (rungs 1–5; FABLE-5 L1 Disk)
*What it is:* understand the work before touching anything.
- Entry prerequisites: a defined task in a batch row; the question written down.
- Exit checklist (evidence, not vibes):
  - [ ] It compiles / runs without error (build log cited).
  - [ ] Research log exists: what exists, what was tried, what sources say.
  - [ ] Confirmation written: what is true / what is claimed / what is unverified.
  - [ ] Abduction written: the best explanation from the confirmed evidence.
  - [ ] Deduction written: what necessarily follows from the abduction.
- Verified by: automated build + the author. FABLE-5 L1: every claim in the
  work checked against the file's own content; doc-hallucinations flagged.

### Stage 2 — PROVE (rungs 6–11; FABLE-5 L3 Tested, in part)
*What it is:* test it, measure it, check it is lawful, compress it.
- Entry prerequisites: Stage 1 gate passed.
- Exit checklist:
  - [ ] First test run against the code/case — suite green, counts cited.
  - [ ] Quantitative analysis recorded: counts, rates, totals, reproduction.
  - [ ] Compressed into its most innovative, compact, computable form (rung 8).
  - [ ] Reverse-engineered only if the step required it; if not, say so (rung 9).
  - [ ] Legally/lawfully sound check RECORDED — a claim of soundness is not
        proof; the check itself must be on file (rung 10).
  - [ ] Second compression pass done (rung 11, "quantum compression").
- Verified by: automated suite + recorded measurements. FABLE-5 L3:
  mutation-test where the suite allows it; a test that passes on broken
  code is [theater], not proof.

### Stage 3 — JUDGE (rungs 12–14; the lens discipline)
*What it is:* three lenses, in order, fully immersed, standalone.
- Entry prerequisites: Stage 2 gate passed.
- Exit checklist:
  - [ ] Devil's Advocate verdict recorded (first): what fails, costs, can be
        abused, is coupled, has no evidence.
  - [ ] Childlike Wonder verdict recorded (second): what else is possible,
        what was missed, what a fresh eye sees.
  - [ ] DaVinci verdict recorded (third): judge / architect / programmer.
        DaVinci activates ONLY when Devil's Advocate and Childlike Wonder
        synchronize in duality. If they do not synchronize, there is NO
        DaVinci verdict — the finding escalates (see Lens discipline).
  - [ ] If the founder's gut disagrees with a lens verdict, the reference is
        the founder's vision as held by Nanuet (decided 2026-11-05).
- Verified by: the lens pair + DaVinci. No verdict, no gate.

### Stage 4 — WIRE (rungs 15–16; FABLE-5 L2 Wired + L3)
*What it is:* connect it to the live system and test the connection.
- Entry prerequisites: Stage 3 gate passed.
- Exit checklist:
  - [ ] Wired: reachable from a real runtime path — real callers traced by
        grep/import graph, not comments, not tests that only test themselves.
        Zero real callers = [orphan]; test-only callers = [test-only].
  - [ ] Tested again AFTER wiring, on the live/staged wiring (rung 16).
- Verified by: call trace + staging test. FABLE-5 L2 classifies every
  artifact [wired] / [orphan] / [test-only] / [documented-only].

### Stage 5 — FABLE GATE (rung 16b, pre-merge, BLOCKING)
*What it is:* the 7-step Fable debugger, run through both lenses at once,
over the entire PR, as additional comments in that open PR.
- Entry prerequisites: Stage 4 gate passed; PR open.
- Exit checklist:
  - [ ] All 7 steps run: REPRODUCE → CONTRAST → ROOT-CAUSE → COUPLED-BUG →
        FIX-MINIMAL → VERIFY-REAL → CLOSE/ESCALATE.
  - [ ] Run through Childlike Wonder + Devil's Advocate SIMULTANEOUSLY
        (Mac's addition, not in the skill text).
  - [ ] Run recorded as comments in the open PR.
  - [ ] NO failing finding. A failing finding BLOCKS merge; the chain
        returns to the earliest failed rung.
- Verified by: the Fable run + both lenses. This gate is the merge blocker.

### Stage 6 — SHIP (rungs 17–18; FABLE-5 L4 Deployed)
*What it is:* merge, then deploy from main.
- Entry prerequisites: Stage 5 gate passed.
- Exit checklist:
  - [ ] Merged to main. Where founder-gated (all Queen PRs), merged BY MAC
        himself — no one else merges for him.
  - [ ] Deployed from main (deploy log / build id cited).
  - [ ] Deploy-identity check: the endpoint returns REAL build metadata,
        not a hardcoded string. A hardcoded answer is [lying], not deployed.
  - [ ] Bindings live, migrations applied to production (not staging only).
- Verified by: founder merge + deploy log + FABLE-5 L4 checks.

### Stage 7 — VERIFY LIVE (rungs 19–20; FABLE-5 L5 Verified-Live)
*What it is:* prove it works live, then run Fable again over the live result.
- Entry prerequisites: Stage 6 gate passed.
- Exit checklist:
  - [ ] Live probe run against production, with a citable run ID.
  - [ ] Evidence cited: endpoint + timestamp (+ SHA where the system
        provides one; the live Worker provides none — content, not SHA).
  - [ ] Live behavior matches tested behavior. Deployed-but-never-probed =
        [deployed-unverified], not done.
  - [ ] Fable post-live second pass run (rung 20): same 7 steps, same two
        lenses, over the PR / live result.
- Verified by: live probe + Fable post-live. **Only this stage counts as
  DONE.** Everything before it is "in progress."

---

## The gates — one per stage, all fail closed

| Gate | Opens | Condition (all must hold) | If it fails |
|---|---|---|---|
| G1 | Stage 2 | Stage 1 checklist complete, evidence cited | Stay in Stage 1; log the missing item |
| G2 | Stage 3 | Stage 2 checklist complete, measurements + legal check on file | Stay in Stage 2; log |
| G3 | Stage 4 | All three lens verdicts recorded; DA + CW synchronized | Stay in Stage 3; escalate, do not invent a DaVinci verdict |
| G4 | Stage 5 | Real callers traced; tested after wiring on staging | Stay in Stage 4; [orphan]/[test-only] logged |
| G5 | Stage 6 | Fable pre-merge run, no failing finding | Merge BLOCKED; return to earliest failed rung |
| G6 | Stage 7 | Merged by founder where gated; deployed; deploy identity real | Stay in Stage 6; [lying]/[half-deployed] logged |
| G7 | DONE | Live probe cited; live matches tested; Fable post-live run | Not done. [deployed-unverified] / [stale-verification] logged |

**Fail-closed rule:** an unmet prerequisite means the stage does not open.
The failure is LOGGED (batch ledger + FABLE-5 register), not worked around.
No rung is skipped; a rung fails, the chain stops and returns to the
earliest failed rung (ratified ladder rule).

**FABLE-5 runs alongside every stage** as the standing debugger: per stage,
INTAKE → PREMISE-CHECK → PROBE → COMPARE → CLASSIFY → ESCALATE →
HANDOFF. Starting level per domain (decided 2026-11-07): L3 Worker,
L2 plan docs, L1 federation. A level is a grant, not a rank: if its
forward checks stop running, the level is suspended and work falls back
to the previous level.

---

## The proof taxonomy — what each gate's evidence must prove

A checklist item is not proof until it proves one of these. The taxonomy is
the list of questions every evidence pack must answer. Eleven were named on
the 2026-11-09 call; Mac added five more the same day — marked [Mac].
Total: 16.

| # | Proof | Question it answers | Produced at |
|---|---|---|---|
| 1 | Identity | Who is asking, and who said yes — attributable, with a timestamp and the evidence pack they saw? | Stage 1 entry + Stage 7 pack + Founder Gate |
| 2 | Work | Did it actually run — suite green, live probe with a citable run ID? | Stage 2 + Stage 7 |
| 3 | Wiring | Is it connected to the live system — real callers traced, not comments? | Stage 4 |
| 4 | Necessity [Mac] | Is there a need only this switch satisfies? If nothing would change after the flip, there is no necessity and the switch stays off. Necessity is the reason to flip; change is the result after. | Before any switch proposal (Gate 0) |
| 5 | Change | After the flip, what measurably changed — before/after, in the thing the switch governs? | Stage 7 |
| 6 | Value | Does it pay for itself — revenue covers cost over a measured window, not projected? | Stage 7, ongoing |
| 7 | Lawfulness | Is there a recorded legal check on file — not a claim of soundness? | Stage 2 |
| 8 | Independence | Was it verified by a different agent than the one who built it? Same source twice is not corroboration. | Stage 3 + Stage 5 |
| 9 | Deploy identity | Is the live system provably the code that was tested — real build metadata, not a hardcoded string? (The live Worker provides no SHA today; content, not SHA.) | Stage 6 |
| 10 | Over time | Does it hold across N consecutive clean runs — not one green run? N is Mac's to set. | Stage 7, repeated |
| 11 | Reversibility | How does it turn off, and what happens to work in flight? Defined before any switch is proposed. | Switch proposal prerequisites |
| 12 | Memory | Was completed work written back into Nanuet's brain as learned wisdom — or will the same work be re-proven forever? (Queen Digest runtime — the missing keystone.) | Stage 7 |
| 13 | Reliability [Mac] | Does it behave consistently under real conditions — error rates, failure modes, recovery — measured, not asserted? Is it reliable to switch this on now? | Stage 2 + Stage 7 |
| 14 | Evolution [Mac] | Has it measurably improved across cycles and versions — learning and adapting, not just changing? | Across stages, over time |
| 15 | Scalability [Mac] | Does it hold under load and growth — more proposals, agents, traffic — without degrading or breaking the gates? Proven by measured load or staged rollout, not projection. | Stage 2 (load test) + Stage 7 |
| 16 | Founder alignment [Mac] | Is it measured against the founder's vision (FOUNDERS_VISION.md / Nanuet's scoring) — and confirmed by the founder himself? This one cannot be automated away: the Queen scores it, the founder decides it. | Stage 3 + Founder Gate |

**How the taxonomy is used:** a stage's exit checklist is complete only
when every item on it proves the proof type it belongs to. An evidence pack
for a switch proposal must contain all 16 — a pack missing one is
incomplete, and the gate does not open. The auto-flip evidence list in the
Founder Gate section below is a pack of these 16, not a separate list.

---

## Switch map — which stage each switch requires before it can even be PROPOSED

"Proposed" means: the evidence pack exists and Mac is asked. It never means
the switch flips itself (see Founder gate below).

| Switch | Queen batch | Requires before proposal | State today (2026-11-09) |
|---|---|---|---|
| `NANUET_BRAIN_WRITE` (stage 1) | Q-A built; QB-8 proves | Stages 1–5 passed for the write path (done: PR #221 merged) | OFF live. Blocked on Mac enabling it in his own browser + FOUNDER_KEY |
| `NANUET_REVIEW_LOG` (stage 2) | Q-B | Stages 1–5 passed for the review-log path | OFF live. Gates only `logQueenReview()` |
| `NANUET_DOMAIN_ROUTING` (stage 3) | Q-B | Stages 1–6 passed (done: PR #222 merged, deployed, suite 370/370) | OFF live. QB-8 is its Stage 7 proof run |
| `NANUET_CAMPAIGN_OBSERVE` (stage 4) | Q-C | Q-C design + build through Stages 1–5 | NOT BUILT. Stages 4–6 are documented destinations only |
| `NANUET_CAMPAIGN_ADVISE` (stage 5) | Q-C | Q-C design + build through Stages 1–5 | NOT BUILT |
| `NANUET_DELEGATE_AKOSHA` (stage 6) | Q-C | Q-C design + build through Stages 1–5 | NOT BUILT |
| Switch 9 `QUEEN_AUTONOMOUS_APPROVAL` | After QZ | Queen 100%: Q-A + Q-B + Q-C + QZ ALL through Stage 7, PLUS a separate founder yes after BATCH-QZ, PLUS the truthiness bug fixed (audit 2026-11-09 confirmed it at
`worker/src/index.js:2756` — bare `env.QUEEN_AUTONOMOUS_APPROVAL` read;
the code's own comment admits the string `"off"` would silently enable
auto-approve), PLUS the action-request gate intact — it never skips that gate for money / deletion / publishing / constitution / external | OFF. Must be fixed before switch 9 is ever touched |

**Kai El chatbot (Commune with Kai El path + real terminal):** 100% inside
the Queen build (Mac, 2026-11-09), not a parallel track. The Commune chat
path is verified LIVE (audit 2026-11-09: `POST /v11/command_text` answers
from live Hive state — agents, proposals, governance, provider health —
but injects NO Nanuet-brain / autonomy / campaign state, and the Queen is
consulted only on `PROPOSAL:` filings). It is also UNAUTHENTICATED today
— only a 30/min/IP rate limit, no founder auth — so founder-gating it is
Queen work, inside the sequence. The real terminal Kai El can use is Q-C
work — the operator's tool for the campaign queue — so it moves through
Q-C's stages, in order, like everything else. The Command Center terminal
today is display-only; no terminal endpoint exists.

## A0–A5 ladder map

- **A0 / A1 — founder approves every action:** the standing posture for ALL
  stages today. Every stage's work is drafted; Mac approves each step.
- **A2 — bounded envelope:** earned per domain only AFTER that domain has
  passed Stage 7 once with a clean Fable post-live — and the envelope
  itself is a founder decision naming exactly what is inside it. No
  envelope exists today.
- **A3–A5:** NOT defined in the record. This draft does not invent them.
  Defining them is an open founder decision.

## Lens discipline (applies at every stage where judgment is needed)

- Order is fixed: Devil's Advocate first, Childlike Wonder second, DaVinci
  third — and only when the first two synchronize in duality.
- **Hemisync (FABLE-5 interpretation):** Kai interprets a finding only
  inside the fixed 13-category List A taxonomy, and only when Childlike
  Wonder (right brain) and Devil's Advocate (left brain) reach the same
  reading. Then the DaVinci judgment emerges as coherent awareness.
- **Disagreement = re-ruling, not a new category** (decided 2026-11-07):
  a [wonder-da-disagree] escalation is resolved as a re-ruling of the
  existing finding under an existing List A category. The taxonomy grows
  slow and stays tight. New List A categories come only from
  [unclassified] / [new-class] escalations the founder explicitly names.
- **Safety-signal bypass:** a finding touching security, money,
  constitution, or irreversibility bypasses hemisync entirely and
  escalates to the founder immediately.
- **Gut vs lenses:** the founder's vision as held by Nanuet is the
  reference (decided 2026-11-05); Kai El works the disagreement.

## FOUNDER GATE — the hard rule (read this first)

**NO switch flips automatically. Not now, not under this draft.**

Mac's idea on the 2026-11-09 call — "if it does it by itself, it can
automatically flip certain switches as long as it has met the
prerequisites" — is recorded here as a **PROPOSAL REQUIRING A FOUNDER
DECISION, not as a rule.** It is not adopted by this draft.

It contradicts the standing rule until Mac explicitly changes that rule:
Q-006 (switch 9 OFF until the Queen passes the done ladder, and even then
never skips the action-request gate) and Q-007 (all Kai autonomy stages
OFF). Nothing in this draft overrides Q-006 or Q-007. Only Mac can, in
words, on the record.

**What the autonomy in this design actually grants:** work progresses
through Stages 1–7 on its own, gathering the evidence at each gate, and
PRESENTS the completed evidence pack for Mac's yes. It never flips
anything itself. The checklist does the work; the founder does the
deciding.

**What evidence would have to exist before Mac could even consider the
automatic-flip proposal:**
1. A complete Stage 7 evidence pack for the specific switch — built,
   wired, tested, merged, deployed, verified-live, Fable post-live clean —
   containing all 16 proof types in the taxonomy above.
2. A written envelope, decided by Mac, naming the exact switch, its bounds,
   what it may and may not touch, and its rollback (how it turns off).
3. The switch-9 truthiness bug fixed (for any switch in the same code path).
4. A dry-run record: N consecutive founder approvals of the same switch
   class, each on a full evidence pack — the number N is Mac's to set.
5. An explicit amendment of Q-006/Q-007, recorded on main like any other
   founder decision — the old rule is not silently replaced.
6. The proposal itself ratified as a new rule, in its own decision — not
   folded into this draft.

Until all six exist, automatic flipping is an idea on the table, not a
capability of the Hive.

## What this does NOT do

- No money. No deletion. No publishing. No constitution change. No
  external contact. No switch flip. All founder-gated, always — the Q2
  risk table (HIGH = explicit-invoke-only) stands over every stage.
- Does not change the ratified 20-rung ladder or rung 20. This is a
  compression for working through them, not a replacement.
- Does not ratify FABLE-5. It sits alongside rung 20, as decided.
- Does not authorize any build. The Queen 100% rule stands: nothing else
  gets built until the Queen is 100%.
- Does not define A3–A5. Does not set the auto-flip number N. Does not
  name any envelope. Those are founder decisions, still open.
- Does not let Kai dismiss a real finding: Kai acts only on
  coherent-and-real or coherent-and-false hemisync states; everything else
  escalates, and every dismissal is logged in the register with the
  Advocate's evidence.

---

*End of draft. Sources: `EXPANDED_DONE_LADDER_v1_DRAFT.md` (ratified
2026-11-07), `FABLE-5_SPEC.md` (founder-provided 2026-11-07), MEMORY.md
record as of 2026-11-09. Next step if Mac wants it: his decision on the
automatic-flip proposal (the six evidence items above), and on defining
A3–A5. Until then this file is a working map, not a rule.*
