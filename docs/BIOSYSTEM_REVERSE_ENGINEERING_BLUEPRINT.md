# Biosystem Reverse-Engineering Blueprint — v1.0

**Status:** BLUEPRINT, 2026-11-11. Workspace-only. Nothing in this file edits,
builds, deploys, merges, or flips anything. The build follows only after the
founder's go-ahead (preamble rule). No constitution file or workflow was read
for change, run, or pushed.

**Decision this blueprint implements:** Q-B1, RETIRE the legacy biosystem page
(`docs/biosystem.html`) — as **STEP 1 of reverse engineering, NOT abandonment**.
Everything the founder built in the bio hive system is for the Hive. It was
never built and wired into the Hive properly. This blueprint is the plan that
gets it done properly: coded → wired → developed → tested → retested →
further implementation → improvements if necessary → rewired → further
developed → deployed → live.

**Sources:** the audit (`~/workspace/hive-batches/BIOSYSTEM_GATEWAY_AUDIT.md`),
`docs/biosystem.html` (17,344 lines, both copies read), `BiosystemOverlay.tsx`,
`docs/ACCESS_BIOSYSTEM_STATUS_2026-09-20.md`, the Worker route table from the
rewire map (`~/workspace/hive-batches/FRONTEND_JASPER_REWIRE_MAP.md` §2).
Repo state: audit clone main `7af242d`; main has since moved to `b4ebd6d8` via
docs-only PR #224, so every frontend file read here is current.

**Evolution rule (founder's standing instruction):** as the founder keeps
expanding the structure, this blueprint evolves every time — using everything
he has already provided for the structure plus everything newly provided.
When the structure grows, bump the version (v1.1, v1.2…), add the new
concepts to §2 and §3, and never silently drop a row. The blueprint is the
source of truth; the build follows it, not the other way round.

**Corrections — 2026-11-11 (from Claude's FABLE-5 plan, verified against the
repo by Muse; the repo wins any disagreement):**
- **D1 — Copy 2 EXECUTES, it is not inert.** The blueprint and the audit
  called copy 2 "inert dead weight" after the first `</html>`. Wrong.
  Browsers parse content after `</html>`; Claude's Chromium probe ran 2
  scripts, found 2 elements with id `modeBar` and 99 duplicate IDs, and the
  failed `localhost:8080/v10/health` ping fired twice. The page is two live
  copies, not one live + one inert. The archive keeps the file as found.
  (This strengthens B0: the page actively runs duplicate scripts + double
  pings.) §4 below is corrected in place.
- **D2 — Doctype detail.** The doctype is on line 8673, after the pasted
  note; lines 2–8672 and 8674–17344 are identical (empty diff). The copies
  differ by the doctype's placement (line 1 vs line 8673), not by "exactly
  2 lines". Substance holds: nothing to merge.
- **D3 — Substantia Nigra is the 23rd brain system, in NO group.** It is
  the 16th entry in the brain array (`biosystem.html:2922`) but appears in
  none of the 7 `BRAIN_GROUPS` (`:3248–3256`). The §2.1 group table lists
  22; the atlas needs a group for it (founder Decision 3).
- **D4 — rho / word→Hz: "no Hive equivalent" should say "System A only,
  undeployed".** `soul.md` mutable law #2 sets "Resonance threshold:
  0.707"; `backend/core/frequency_guild.py` and
  `backend/core/constitution.py:239` implement resonance. That is System A,
  which is not deployed. The Worker has no resonance route. The DROP
  stands (no live route); only the wording changes.
- **D5 — The 70/20/10 split IS Hive text.** `soul.md` mutable law #3:
  "Revenue split: 70% agent, 20% treasury, 10% trust", amendable by 2/3
  guild vote + 30 days. It is not only Jasper TITLE XVI. Showing it as
  text moves no money; the waterfall stays dropped.
- **D6 — Pure EXISTS is 19, not 20.** Row 7 (brain/body groups) is fed by
  the NEW status route (row 6), so it is not purely EXISTS. Headline
  corrected in §3.
- **D8 — `/colony/health` and `/colony/reports` exist** (`worker/src/
  index.js:3155`, `:4670`) and are not debug routes. Prefer them as the
  primary network source (founder Decision 9).
- **D12 — Lens sources.** Devil's Advocate + Childlike Wonder:
  `worker/src/lens/anchor.js` (prompt text only). DaVinci, Jarvis, Alfred:
  `docs/OPERATOR_CHARTER.md:45–88`. Cyborg: only a label in
  `sandbox/README.md`. The "Cyborg = interface, JARVIS = protocol, Alfred =
  stewardship" definitions and the KAI EL hybrid lens (mind/soul/spirit/
  body) are in the founder's record (the Lens doc + MEMORY.md), not in the
  repo. Founder Decision 5.
- **Already decided (not asked again):** Decision 4 (atlas row 6) is MOOT —
  G1 (`GET /v11/biosystem/status`) was approved by the founder 2026-11-11.
  Decision 6 (`GET /v11/constitution`) is MOOT — G2 was approved
  2026-11-11. Decision 2 (one PR per phase, each bug fix its own commit,
  founder merges) is already the established pattern.

---

## §1 — Purpose (plain words)

The bio hive system is **the living body of the Hive**. Not a dashboard of
numbers — a body map. A body has a brain, a nervous system, muscles, a gut,
skin, an immune system, and a memory. The Hive has the same things, and the
biosystem is the place where you can see them all at once, alive, and know
which parts are healthy and which are not.

What it is FOR, in the founder's intent:

- **Show the Hive as one living thing.** The Queen is the brain. Kai El is
  the head — the part that talks and acts. The agents are the body. The
  routing (how a job finds the right agent) is the nervous system. HiveMesh
  is the fascia — the tissue that holds it all together. The constitution
  (F-001–F-006) is the skeleton — the hard structure everything else hangs
  on. The biosystem shows all of that in one place.
- **Tell the truth about health.** Every part shows its real state — live,
  limited, offline, or idle — from real data, never from fake demo numbers.
  The old page showed fake data and called it a demo. The rebuilt biosystem
  shows only what the Worker really says, and says so when it cannot.
- **Be the place the founder looks to know the Hive is alive.** One screen:
  what the Hive is thinking (LLM), who is working (agents), what is waiting
  to be decided (proposals), how the parts connect (the network), and what
  the Hive remembers (memory).

What it is NOT: it is not a second Command Center, not a chat window, and
not a place to change the constitution. Changing the constitution goes
through a pull request, never through a browser box. The biosystem shows the
body; it does not rewrite the bones.

---

## §2 — Inventory: everything in the biosystem, in plain words

### 2.1 The 72 systems (the atlas)

The old page maps the Hive onto a human body: **72 systems — 23 brain, 49
body** — in 7 brain groups and 11 body groups. Each system has a status
(idle / active / limited / offline) and an activity level. In the old page
every value was simulated locally. In the rebuild, the 72 systems are the
atlas — the map of the body — and each one is fed by real Hive data (see §3).

**Brain — 23 systems, 7 groups:**

| Group | Systems |
|---|---|
| Executive Functions | Frontal Lobe, Cingulate Cortex, Striatum, Globus Pallidus |
| Perception & Processing | Parietal Lobe, Temporal Lobe, Occipital Lobe |
| Memory & Emotion | Hippocampus, Amygdala |
| Regulation & Routing | Hypothalamus, Thalamus |
| Core Survival | Medulla Oblongata, Pons, Midbrain |
| Coordination | Cerebellar Cortex, Deep Cerebellar Nuclei |
| Neurotransmitter Systems | Dopaminergic, Serotonergic, Noradrenergic, Cholinergic, GABA-ergic, Glutamatergic |

**Correction (2026-11-11): the table above lists 22; the brain array has
23.** **Substantia Nigra** (the 16th entry in the brain array,
`biosystem.html:2922`, analog RewardSystem) appears in none of the 7
`BRAIN_GROUPS`. It is the 23rd brain system, ungrouped in the page. The
atlas needs a group for it — founder Decision 3 (its own group, or join
Executive Functions).

**Body — 49 systems, 11 groups:**

| Group | Systems |
|---|---|
| Neural Control | CNS, PNS, Sympathetic NS, Parasympathetic NS |
| Musculoskeletal | Skeletal System, Joints, Skeletal Muscles, Smooth Muscles, Cardiac Muscle |
| Cardiovascular | Cardiovascular, Heart, Arteries, Veins, Capillaries |
| Lymphatic | Lymphatic System |
| Respiratory | Airways, Lungs, Diaphragm |
| Digestive | GI Tract, Mouth / Esophagus, Stomach, Small Intestine, Large Intestine, Liver, Pancreas |
| Endocrine | Pituitary, Thyroid, Adrenal, Pancreatic Islets, Gonads (Endocrine), Pineal |
| Immune | Innate Immunity, Skin (Auth), Macrophages, Adaptive Immunity, T-Cells, B-Cells, Lymphatic Monitor |
| Integumentary | Skin (UI), Hair, Nails, Glands |
| Urinary | Kidneys, Ureters, Bladder, Urethra |
| Reproductive | Gonads (Repro), Accessory Organs, Hormonal Axis |

**The 6 neurotransmitters** (the Neuro tab): dopamine, serotonin,
norepinephrine, acetylcholine, GABA, glutamate. In the old page they are
gauges that the cognitive modes push up and down. In the rebuild they are a
metaphor for how the Hive's thinking is tuned — see the ModeEngine row in §3.

### 2.2 The 10 tabs (the panels)

| Tab | Label | What it shows |
|---|---|---|
| brain | Brain (23) | The 23 brain systems, by group |
| body | Body (49) | The 49 body systems, by group |
| neuro | Neuro (6) | The 6 neurotransmitter gauges |
| health | Health (72) | The full 72-system status grid |
| freq | Freq (4) | Frequency calculator, GatewayProcess sync ring, ConnectomeHarmonics (6 eigenmodes Ψ₁–Ψ₆), rho sparkline |
| mycel | Mycel (72) | The 72-node force graph — the mycelial network, stigmergy trails, spores |
| kb | KB (0) | Second Brain — the knowledge store; OntologyGraph — the concept map |
| sec | Sec (0) | Recursive security — the 4-layer sandbox, AIRQ, the audit chain |
| sov | Sov (5) | Sovereignty — the 5-tier governance hierarchy and the waterfall ledger |
| azr | AZR (0) | The AZR cycle — PROPOSE → SOLVE → VERIFY → UPDATE, with 3 modes and a tesseract view |

### 2.3 The 10 phases (how the old page was built, in order)

The old page records its own build history as a manifest (PHASE_MANIFEST).
The rebuild keeps the same order of ideas, because the order is sound — only
the wiring changes.

| Phase | Name | What it built |
|---|---|---|
| 1 | Biosystem Visualization | 72 systems, 4 tabs (Brain / Body / Neuro / Health) |
| 2 | Functional Engine Classes | 11 classes, HiveClient through TaskQueue |
| 3 | Psychedelic Modes Layer | 10 cognitive modes, neuro target profiles |
| 4 | Consciousness & Frequency | GatewayProcess, ConnectomeHarmonics, FREQ tab |
| 5 | Mycelial Governance Layer | 72-node force graph, stigmergy, spores |
| 6 | Second Brain & Knowledge | SecondBrain, OntologyGraph, KB tab |
| 7 | Recursive Security Layer | 4-layer sandbox, AIRQ, audit chain, SEC tab |
| 8 | Sovereignty & Governance | 5-tier hierarchy, waterfall, SOV tab |
| 9 | AZR Full UI Panel | 4-node cycle, 3 modes, tesseract, AZR tab |
| 10 | Deployment & Finalization | Help drawer, SOUL editor, diagnostics |

### 2.4 The 24 classes (the engines)

| # | Class | What it is, in plain words | What data it needs |
|---|---|---|---|
| 1 | HiveClient | The only network code. Talks to a backend. In the old page it talks to Jasper on localhost:8080 and is never actually used except for a health ping. | A backend base URL — in the rebuild, same-origin `/v11` |
| 2 | MemoryLayer | Episodic + state store in the browser (localStorage). Snapshots and restores all system statuses. | Browser storage — in the rebuild, the Worker's memory (D1) |
| 3 | SwarmOrchestrator | Routes a task to the right systems by keyword: Research, Creative, Strategic, Analysis, Emotional, Memory. | The task text — in the rebuild, the Worker's domain routing |
| 4 | ResonanceEngine | Computes the hive's resonance (rho) — how in-tune the systems are. Falls back to a local calculation when the backend has no number. | A rho value — in the rebuild, the Hive pulse |
| 5 | ConstitutionChecker | Checks any action against the constitution's articles and reports violations. In the old page it checks 12 Jasper-era SOUL_MD articles — **not** the Hive's F-001–F-006. | The constitution text — in the rebuild, soul.md F-001–F-006 |
| 6 | FrequencyGuild | Turns words into frequencies (letter → Hz, Schumann 7.83 Hz base) and gives each agent a frequency from its MSV values. | Word text, system MSV values |
| 7 | GladiatorArena | Idea duels: two ideas fight, the winner's frequency claim stands, the loser's idea is **archived, never deleted**. | Ideas to duel — in the rebuild, the Hive Arena |
| 8 | UtilityEconomy | The SOUL token economy: each system earns and spends SOUL; the split is 70% agent / 20% treasury / 10% trust (Jasper SOUL.MD TITLE XVI). | Token balances — in the rebuild, the SOUL leaderboard; the split itself is a founder money decision |
| 9 | EvolutionEngine | The AZR cycle: PROPOSE → SOLVE → VERIFY → UPDATE, with rewards per step. | Tasks to propose/solve — in the rebuild, the proposal system |
| 10 | DreamGovernor | The subconscious: scans for jailbreak words (ignore, override, bypass, system:, jailbreak, pretend, forget, disregard) and consolidates memory while the Hive "dreams". | Text to scan — in the rebuild, the Hive's own guardrails |
| 11 | TaskQueue | A queue of tasks with types and time estimates. | Tasks — in the rebuild, `/v11/tasks` |
| 12 | ModeEngine | The 10 cognitive modes (below). Activating a mode pushes the 6 neurotransmitter gauges to target levels and boosts some swarm routes. | The chosen mode |
| 13 | GatewayProcess | Hemispheric sync: left and right brain converge toward a sync percentage; states IDLE → SYNCING → SYNCED → RESONANT. Based on the CIA Gateway Process / Hemi-Sync research. | The rho value |
| 14 | ConnectomeHarmonics | Six spatial eigenmodes of the brain connectome (Ψ₁ Global Slow Wave, Ψ₂ Anterior-Posterior, Ψ₃ Lateral Bifurcation, Ψ₄ DMN Core, Ψ₅ Sensorimotor, Ψ₆ Subcortical Hub), after Atasoy et al. 2016. | Neurotransmitter averages |
| 15 | MycelialNetwork | The 72-node force graph — the systems as a network, drawn as connected nodes. | The 72 systems and their links |
| 16 | StigmergyEngine | Trails: the paths agents leave behind, ranked by strength — how the Hive remembers where work has been. | Agent activity — in the rebuild, the memory / governance log |
| 17 | SporeManager | Spores: dormant → germinating → propagating → fruiting. The lifecycle of a new idea becoming a living thing. | Spore states — in the rebuild, the venture/spore lifecycle |
| 18 | SecondBrain | The knowledge store: notes and facts the Hive has learned, kept in memory. | Stored knowledge — in the rebuild, `/v11/memory/status` |
| 19 | OntologyGraph | The concept map: concepts and how they link to each other. | Concepts — in the rebuild, the memory system |
| 20 | RecursiveSandbox | The 4-layer sandbox: suspicious input is run in layers, each deeper than the last, before it is trusted. | Input to test |
| 21 | SecurityAuditLog | The audit chain: every security event logged, in order, so nothing happens without a record. | Security events — in the rebuild, `/v11/governance/log` |
| 22 | FamilyConstitution | The 5-tier governance hierarchy: APEX (Dynasty Trust), BRAINS (Family Office LLC), FORTRESS (Series LLCs), GROWTH (Operating Entities), SHIELD (Sovereign Protection). **These are Jasper-era legal-structure concepts, NOT decided Hive law** (the record holds no such structure — a cross-AI brief invented a similar one and it was kept out). | A founder decision on whether this hierarchy exists at all |
| 23 | WaterfallLedger | The waterfall: money flows down the 5 tiers in order, and each cycle is counted. | Money movement — founder-gated (Q-004); nothing moves without a founder yes |
| 24 | SovereigntyScore | One number for how sovereign the Hive is, computed from rho, the tiers, and the ledger. | rho, tiers, ledger |

### 2.5 The 10 cognitive modes (ModeEngine)

Baseline, Calm, Subtle, DMT, Psilocybin, LSD, MDMA, Ketamine, Ayahuasca,
Mescaline. Each mode sets target levels for the 6 neurotransmitters and
boosts some swarm routes (e.g. a mode might boost Creative routing and lower
Security routing). **In the rebuild these do NOT come back as psychedelic
modes.** The Hive already has its own way of shifting how it thinks: the
lenses — Devil's Advocate, Childlike Wonder, DaVinci (judge/architect/
programmer), and the three-lens framework (Cyborg = interface, JARVIS =
protocol, Alfred = stewardship), plus the KAI EL hybrid lens (mind =
Childlike Wonder + Devil's Advocate in hemisync → DaVinci; soul = Jarvis;
spirit = Cyborg; body = Alfred). The modes are rebuilt as **lens states**,
not as drug names. See §3.

### 2.6 The economy (sidebar)

Circulation / Treasury / Trust, split **70% agent / 20% treasury / 10%
trust** (Jasper SOUL.MD TITLE XVI). The "Harmonic wealth sim" runs 100
ticks of a projection and mirrors Jasper's `arena.run_projection()`. In the
rebuild the economy is honest: the SOUL leaderboard (`/v11/wallet/
leaderboard/soul`) is real; the 70/20/10 waterfall is a money rule that
needs a founder decision before anything is built around it (Q-004: no
automatic money moves).

### 2.7 The stack map (the overlay's live tab — already live)

Head — KAIEL / commune. Joints — PLC sense → route → constrain → remember.
Fascia — HiveMesh. Gut — LocalAGI enteric (when bound). Skeleton —
Constitution F-laws. This is the overlay's display-only stack map, and it is
correct. It stays.

### 2.8 The SOUL editor (the old page's help drawer)

The old page has a help drawer with a **SOUL editor**: textareas that let
someone rewrite the SOUL_MD articles in the browser. **This does not come
back.** The Hive's constitution (soul.md, F-001–F-006) changes only through
a pull request the founder merges — never through a browser textarea. The
editor concept is dropped, and the reason is written here so no builder
re-adds it as a "missing feature".

### 2.9 What the old page's "live" behaviour actually was

Ping `localhost:8080/v10/health` on load → it fails → the page shows "Demo
Mode — backend offline" and runs its mock atlas locally. Nothing else ever
touches a network. The six `/v10/*` endpoints (llm/chat, board, resonance,
governance/log, health, frequency/word) are defined and never called by any
UI element. The engines receive the client object and never call it. The
page's own text says so: "All visualisations are mock/simulation only."

---

## §3 — Mapping table: each biosystem concept → the Hive

**How to read it:** EXISTS = a Worker route serves this today (named with its
method and path, from the rewire map §2 route table — nothing invented).
NEW = a new endpoint is needed (name only, no code — the endpoint is a
founder decision, not a builder's invention). RETHINK = the concept has no
Hive equivalent as written; the row says what it becomes instead. DROP = the
concept does not come back, with the reason.

| # | Biosystem concept | Hive mapping | Route / note |
|---|---|---|---|
| 1 | LLM gauge (live tab) | EXISTS | `GET /v11/llm/status` — provider roster, real health, `routing.next_order` |
| 2 | Agents count (live tab) | EXISTS | `GET /v11/agents` |
| 3 | Proposals gauge (live tab) | EXISTS | `GET /v11/proposals` |
| 4 | Health check (`/v10/health`) | EXISTS | `GET /v11/health` |
| 5 | Stack map (Head/Joints/Fascia/Gut/Skeleton) | EXISTS (display) | Static text in the overlay; already live and correct |
| 6 | 72-system atlas (the grid) | NEW | `GET /v11/biosystem/status` (name only) — one call returning the living systems of the Hive (agents, colonies, Queen, Kai El) with real status. Until it exists, the atlas is a static map fed by rows 1–3. **Do not fake per-system numbers.** |
| 7 | Brain groups (7) / Body groups (11) | EXISTS (display) | Grouping structure from the atlas; fed by `/v11/agents` + the new status route (row 6) |
| 8 | Neurotransmitter gauges (6) | RETHINK | No Hive equivalent as gauges. They become a **lens-state display**: which lens is active (Devil's Advocate / Childlike Wonder / DaVinci; Cyborg / JARVIS / Alfred) and the hemisync state. No drug-mode numbers. |
| 9 | `POST /v10/llm/chat` | EXISTS | `POST /v11/command_text` (Commune with Kai El). **Unauthenticated today — its gating is Queen work, not this rebuild. The biosystem never calls it without the gating decision.** |
| 10 | `/v10/board` (arena board) | EXISTS | `GET /v11/arena/challenges` + `GET /v11/arena/fallen` — the Hive Arena is the real equivalent of the GladiatorArena |
| 11 | `/v10/resonance` (rho) | RETHINK | No rho route. Rho becomes a **hive coherence reading** derived from `GET /v11/pulse` (exists). If a dedicated rho number is wanted, that is a new endpoint (`GET /v11/biosystem/resonance`, name only) — founder decision |
| 12 | `/v10/governance/log` | EXISTS | `GET /v11/governance/log` |
| 13 | `/v10/frequency/word` | DROP | No Hive equivalent. Word→Hz is a Jasper metaphysical layer; the Hive has no frequency system. Dropped unless the founder says otherwise |
| 14 | HiveClient (`/v10` client) | EXISTS (replaced) | The overlay already uses a same-origin `/v11` client. The rebuild uses it everywhere; no localhost base anywhere |
| 15 | MemoryLayer (browser store) | EXISTS | `GET /v11/memory/status` + D1 (`nanuet-brain`, `KAI_BRAIN`). The Hive's memory is Worker-side, not browser localStorage |
| 16 | SwarmOrchestrator (keyword routing) | EXISTS (Worker-side) | The Worker's domain routing (QB-2, live) + `POST /v11/command_text`. The UI shows routing; it does not re-implement it in the browser |
| 17 | ResonanceEngine (rho) | RETHINK | See row 11 — derived from `/v11/pulse` |
| 18 | ConstitutionChecker (12 Jasper articles) | NEW | `GET /v11/constitution` (name only — map G2, still open). The checker validates against **soul.md F-001–F-006**, never against the 12 Jasper-era articles in the old page. The old articles are a citation, not a constitution |
| 19 | FrequencyGuild (word→Hz, agent freq) | DROP | See row 13. The MSV (Metacognitive State Vector) values it reads have no Hive source |
| 20 | GladiatorArena (idea duels) | EXISTS | `GET /v11/arena/challenges`, `GET /v11/arena/fallen`, `GET /v11/arena/projection/:id/frames`. **Keep the rule: the loser's idea is archived, never deleted** |
| 21 | UtilityEconomy (SOUL token) | EXISTS (partial) | `GET /v11/wallet/leaderboard/soul` is real. The 70/20/10 waterfall is a money rule — **no build around it until a founder Tier decision** (Q-004: no automatic money moves) |
| 22 | EvolutionEngine (AZR cycle) | EXISTS (partial) | `GET /v11/proposals` + `POST /v11/proposals` + the decide routes. The PROPOSE → SOLVE → VERIFY → UPDATE cycle is the proposal lifecycle + the FABLE-5 debugger loop (rung 20) |
| 23 | DreamGovernor (jailbreak scan) | RETHINK | The Hive's guardrails are the Dual Lens / Seer gate (wired, PR #215) and the founder gates — not the Jasper word list. The dream/consolidation idea maps to the **Queen Digest runtime** (the missing keystone that writes completed work back into Nanuet's brain as learned wisdom) |
| 24 | TaskQueue | EXISTS | `GET /v11/tasks` |
| 25 | ModeEngine (10 cognitive modes) | RETHINK | Rebuilt as **lens states** (row 8). The drug-named modes do not come back |
| 26 | GatewayProcess (hemispheric sync) | RETHINK | The same idea already exists in the Hive: the KAI EL hybrid lens — Childlike Wonder (right) + Devil's Advocate (left) in **hemisync as alignment** → DaVinci. The sync gauge becomes a **hemisync display**. No route exists for lens state today; a new endpoint (`GET /v11/lens/state`, name only) is a founder decision |
| 27 | ConnectomeHarmonics (6 eigenmodes Ψ₁–Ψ₆) | DROP | No Hive equivalent. The six eigenmodes are a Jasper research layer (Atasoy et al. 2016). Dropped unless the founder says otherwise |
| 28 | MycelialNetwork (72-node force graph) | EXISTS (partial) | `GET /v11/debug/colony-ping` (the colony roster) + `GET /v11/agents`. The Hive's network graph is the colony/agent graph, not a body graph |
| 29 | StigmergyEngine (trails) | RETHINK | Trails become the **memory / governance log trail**: `GET /v11/memory/status` + `GET /v11/governance/log`. Full trail history waits on the Queen Digest runtime (row 23) |
| 30 | SporeManager (dormant → germinating → propagating → fruiting) | RETHINK | The spore lifecycle already exists in the founder's Tier 1 plan (germination on free tools; the 16 proofs are the pruning rule). No route exists; the lifecycle is tracked in the Tier 1 goal, not in a new endpoint, until the founder says otherwise |
| 31 | SecondBrain (knowledge store) | EXISTS | `GET /v11/memory/status` |
| 32 | OntologyGraph (concept map) | RETHINK | No ontology route exists. The concept map waits on the memory system growing an ontology — a future step, not this rebuild |
| 33 | RecursiveSandbox (4-layer sandbox) | RETHINK | The Hive's sandboxing is the Worker + D1 + Cloudflare Access gating. No route; the sandbox is architecture, not a panel |
| 34 | SecurityAuditLog (audit chain) | EXISTS | `GET /v11/governance/log` |
| 35 | FamilyConstitution (5-tier legal hierarchy) | DROP (founder decision) | **Do not build as-is.** APEX / BRAINS / FORTRESS / GROWTH / SHIELD (Dynasty Trust, Family Office LLC, Series LLCs, Operating Entities, Sovereign Protection) are Jasper-era legal-structure concepts. No such structure is decided in the Hive record. If the founder wants a legal-structure hierarchy, that is a separate founder decision with counsel — not a biosystem panel |
| 36 | WaterfallLedger | DROP (founder decision) | Money movement is founder-gated (Q-004). No waterfall is built until a Tier decision exists |
| 37 | SovereigntyScore | RETHINK | `GET /v11/tier3/status` exists (Tier 3 status). A single sovereignty number is a Jasper metric; if the founder wants one, it is a new endpoint — founder decision |
| 38 | SOUL editor (browser textarea) | DROP | **Never rebuild.** The constitution changes only through a pull request the founder merges. The editor is not a missing feature; its absence is the rule |
| 39 | Help drawer / diagnostics | EXISTS | `GET /v11/debug/colony-ping`, `GET /v11/debug/git` (returns no SHA today — live-equals-main is by content, not SHA) |
| 40 | Economy sidebar (Circulation / Treasury / Trust) | RETHINK | The sidebar shows the SOUL leaderboard (row 21). The 70/20/10 split is a money rule, not a display — see row 21 |

**Mapping headline (40 rows, counted from the table; corrected 2026-11-11):
** EXISTS — **19 pure** (rows 1–5, 9, 10, 12, 14–16, 20–22, 24, 28, 31,
34, 39 — including partials 21, 22, 28) plus row 7, which is EXISTS
(display) but depends on the NEW status route (row 6). NEW endpoint needed
(name only) — **2** (rows 6, 18; rows 11 and 26 are RETHINK rows whose
notes mention an optional new endpoint, but their verdict is RETHINK, not
NEW). RETHINK — **12** (rows 8, 11, 17, 23, 25, 26, 29, 30, 32, 33, 37,
40). DROP — **6** (rows 13, 19, 27, 35, 36, 38). **No route in this table
was invented** — every EXISTS row names a route from the rewire map's §2
table or the audit; every NEW row names the endpoint only and marks it as
a founder decision.

---

## §4 — Two copies: which one is canonical

**Finding (verified by diff, 2026-11-11; corrected 2026-11-11 from Claude's
Chromium probe): the two copies are byte-identical except the doctype's
placement.** Copy 1 runs lines 1–8672. Line 8673 reads:

> `</html>  now this html below i want fully merged into Version 2 update 3 <!DOCTYPE html>`

Copy 2 runs lines 8673–17344. The doctype sits on line 8673, after the
pasted note; lines 2–8672 and 8674–17344 are identical (empty diff).
**Correction: copy 2 is NOT inert.** Browsers parse content after
`</html>` — Claude's Chromium probe ran 2 scripts, found 2 elements with
id `modeBar` and 99 duplicate IDs, and the failed `localhost:8080/v10/
health` ping fired twice. The page is two live copies, not one live + one
inert.

**So the "Version 2 update 3" merge the note asks for was never executed —
and it does not need to be.** There is nothing to merge: the two copies are
the same content. **Copy 1 is canonical** — it has the doctype at line 1
and is the copy the browser renders first — but copy 2 also runs. The
blueprint is built from copy 1. When the page is archived (phase B0), the
archive keeps the whole file as found — both copies, the merge note
included — so the history is preserved, not cleaned up.

---

## §5 — Build order: the founder's lifecycle on the 20-rung ladder

The founder's lifecycle: **coded → wired → developed → tested → retested →
further implementation → improvements if necessary → rewired → further
developed → deployed → live.** Each phase below maps onto the ratified
20-rung done ladder (compiles → researches → confirm → abduct → deduce →
tested → quantitative analysis → innovative compressive complex computing →
reverse engineered if necessary → legally and lawfully sound → quantum
compression → Devil's Advocate → Childlike Wonder → DaVinci fully applied →
wired → tested → 16b Fable pre-merge (blocking) → merged → deployed →
verified-live → 20 Fable post-live). **No phase starts until the founder's
go-ahead for it** (preamble rule — one question at a time, ELI5).

### Phase B0 — Retire the dead page (STEP 1 of reverse engineering)

| Rungs | What is built | Verification (exact probe, expected result) |
|---|---|---|
| compiles → tested → DaVinci → Fable pre-merge → merged → deployed → verified-live | A1: remove the "Legacy atlas" tab + iframe from `BiosystemOverlay.tsx` (live tab untouched). A2: check the root-page link (it points at command-center.html, not biosystem — verify before touching). A3: archive `docs/biosystem.html` — **move, do not delete** (deletion is Tier 3 founder-gated) — to a documented archive location; record the move in the PR body. A4: merge (founder merges), deploy, verify live. | `npm run build:app` passes. Open `/app/` → Biosystem → no "Legacy atlas" button. `grep -rn "biosystem.html" frontend/src` returns only the comment (or nothing). `/biosystem.html` returns 404. Live tab shows provider/agents/proposals from `/v11`; no localhost request in the network tab. |

**Retiring the page is not abandoning the system.** The concepts live in
this blueprint (§2–§3). B0 removes the dead surface so nothing pretends to
be live. The rebuild below is what brings the concepts back — properly.

### Phase B1 — Code the new Biosystem surface

| Rungs | What is built | Verification |
|---|---|---|
| compiles → researches → confirm → abduct → deduce → tested | The new Biosystem tab in the React app, extending the existing live tab: the 72-system atlas re-expressed as the Hive's real systems (agents, colonies, Queen, Kai El), the 10 tabs rebuilt as live panels, the stack map kept. **Nothing is faked**: a panel with no data shows "no data", never a simulated number. | `npm run build:app` passes. Every panel renders with no localhost, no `ws://`, no `127.0.0.1` in the built bundle. Each panel's empty state shows "no data" when its route is unreachable. |

### Phase B2 — Wire (the EXIST rows)

| Rungs | What is built | Verification |
|---|---|---|
| wired → tested → quantitative analysis | Each panel wired to its EXISTS route from §3: llm/status, agents, proposals, health, tasks, arena challenges/fallen, governance/log, memory/status, wallet/soul leaderboard, debug/colony-ping, tier3/status, pulse, nanuet/brain, kai/brain. | For each panel: open it live, read the number it shows, and read the same route directly (e.g. `GET /v11/agents`) — the two must match. Any mismatch is a bug (see §6), not a rounding difference. |

### Phase B3 — Develop the engines (Worker-side, not browser-side)

| Rungs | What is built | Verification |
|---|---|---|
| innovative compressive complex computing → reverse engineered if necessary → legally and lawfully sound → quantum compression → Devil's Advocate → Childlike Wonder → DaVinci fully applied | The engines rebuilt where they belong: SwarmOrchestrator as the Worker's domain routing (already live — the UI shows it, it does not re-implement it); GladiatorArena on `/v11/arena/*`; EvolutionEngine on the proposal lifecycle; MemoryLayer on D1; StigmergyEngine on the memory/governance log trail. **The browser never re-implements Worker logic.** The ConstitutionChecker validates against F-001–F-006 only (via the new `GET /v11/constitution` endpoint, row 18 — founder decision first). | Each engine has a named Worker route or a written statement of why it lives in the UI. No engine calls a route that does not exist. `grep -rn "localhost\|/v10/"` on the new surface returns nothing. |

### Phase B4 — Test

| Rungs | What is built | Verification |
|---|---|---|
| tested → quantitative analysis | A test suite in the QB-5/QB-6 pattern (370/370): every panel, every route, every empty state, every error state. Counts, not vibes: the suite reports pass/fail per panel. | Suite runs green. A panel that cannot reach its route fails its test — it does not silently show stale data. |

### Phase B5 — Retest (Fable pre-merge, blocking)

| Rungs | What is built | Verification |
|---|---|---|
| 16b Fable pre-merge (blocking PR gate) | The 7-step Fable debugger (REPRODUCE → CONTRAST → ROOT-CAUSE → COUPLED-BUG → FIX-MINIMAL → VERIFY-REAL → CLOSE/ESCALATE) run pre-merge, per the FABLE-5 spec. | Fable report filed; no open findings. Any finding blocks the merge — it does not get fixed silently in the same PR. |

### Phase B6 — Further implementation + improvements (the RETHINK rows)

| Rungs | What is built | Verification |
|---|---|---|
| wired → tested → DaVinci | The rethink items, one at a time, each with its own founder go-ahead: the lens-state display (row 8/25), the hemisync display (row 26), the coherence reading from `/v11/pulse` (row 11), the spore lifecycle tracking (row 30), the trail history (row 29, waits on the Queen Digest runtime). | Each rethink item has a written decision (what it became, what it replaced, what data feeds it) and a live probe showing real data. No rethink item ships on simulated data. |

### Phase B7 — Rewire (second pass)

| Rungs | What is built | Verification |
|---|---|---|
| rewired → further developed → tested | Whatever B4–B6 found: panels that need a different route, engines that belong Worker-side after all, labels that lie. The rewire is a deliberate second pass, not a patch. | The same probes as B2/B4, re-run. The count of open findings from B5 is zero, and no new finding was introduced by the rewire. |

### Phase B8 — Deploy → live → Fable post-live

| Rungs | What is built | Verification |
|---|---|---|
| merged → deployed → verified-live → 20 Fable post-live | Merge (founder merges), deploy via the existing pipeline, verify live, then run the 7-step Fable debugger post-live (rung 20). | Open `/app/` → Biosystem live → every panel shows Worker data; no localhost request in the network tab; no `v10` requests. Fable post-live report filed; no open findings. **Only verified-live counts as done.** |

**New endpoints (the NEW rows) are not in any phase above until the founder
decides each one.** `GET /v11/biosystem/status`, `GET /v11/constitution`,
`GET /v11/biosystem/resonance`, `GET /v11/lens/state` are names only. A name
is not a build. Each needs its own founder yes, its own preamble (what / why
/ how / necessity / improvement / cost & risk), and its own phase.

---

## §6 — Bug-handling rule (founder's standing instruction — binding on whoever builds, including Claude)

While building, **find and diagnose bugs along the way. Do NOT leave them,
and do NOT silently auto-fix them.** Every bug goes through four lenses
before it is fixed:

1. **Programmer** — what is the bug, exactly? Reproduce it. Name the file,
   the line, the input, and the wrong output. If it cannot be reproduced, it
   is not yet a bug — it is a suspicion, and it is logged as one.
2. **Architect** — why is it there? What design choice made it possible?
   Is it a local mistake or a shape problem (two systems disagreeing about
   who owns a value, a route that was never meant to exist, a copy that was
   pasted and never merged)? Name the root cause, not the symptom.
3. **Developer** — what is the smallest fix that is true? Propose the fix,
   the files it touches, and what it does NOT touch. If the fix would change
   behaviour beyond the bug, say so — that is a design change, and it needs
   a founder decision, not a quiet edit.
4. **Full-stack software engineer** — what does the fix do across the whole
   stack? Does the frontend, the Worker, the database, and the deploy all
   still agree after the fix? How is it verified live (exact probe, expected
   result)? What would prove the fix wrong?

**The workflow for every bug found during this build:**

- **Log it** — in the build's bug log, with the four-lens diagnosis. A bug
  that is not logged is a bug that was left.
- **Diagnose it** — through all four lenses, in writing, before any code
  changes.
- **Propose the fix** — through the same four lenses. The proposal is part
  of the record.
- **Fix it deliberately** — the fix lands as its own change, with its own
  verification. Never folded silently into an unrelated change.
- **Never ignore it, never silently patch it.** A silent fix is a lie in
  the record: the next person to read the code cannot tell what was broken
  or why it was changed. A logged, diagnosed, deliberately fixed bug is
  proof the build was honest.

This rule applies to the whole build — B0 through B8 — and to the Fable
pre-merge and post-live runs (rungs 16b and 20), where it is already the
method (the 7-step debugger: REPRODUCE → CONTRAST → ROOT-CAUSE →
COUPLED-BUG → FIX-MINIMAL → VERIFY-REAL → CLOSE/ESCALATE).

---

## §7 — Retire vs rebuild (so retiring the page is never read as abandoning the system)

| What | Fate | Why |
|---|---|---|
| `docs/biosystem.html` — the file itself | **RETIRED (archived, not deleted)** in phase B0 | It is dead: its only network call fails, its content is simulated, and it is two identical copies pasted together. Archiving keeps the history; deleting would erase it |
| The "Legacy atlas" tab in the overlay | **RETIRED** in phase B0 | It is the iframe to the dead page. The live tab stays |
| The 72-system atlas (the idea) | **REBUILT** in phases B1–B2 | The atlas is the body map. It comes back fed by real Hive data (row 6) |
| The 10 tabs (the panels) | **REBUILT** in phases B1–B2 | The panels are the views of the body. They come back, each wired to a real route |
| The 24 classes (the engines) | **REBUILT** in phase B3 — Worker-side where they belong | The engines are the body's functions. They come back as Worker logic and live UI, not as browser simulation |
| The 10 cognitive modes | **REBUILT AS LENS STATES** in phase B6 | The idea (shifting how the Hive thinks) is kept; the drug names are not. The Hive's lenses are the real modes |
| GatewayProcess / hemisync | **REBUILT AS THE HEMISYNC DISPLAY** in phase B6 | Hemisync is already a Hive idea (KAI EL hybrid lens). The gauge comes back showing the real lens state |
| GladiatorArena / idea duels | **REBUILT** on the Hive Arena in phase B3 | The Arena is live. The rule survives: the loser's idea is archived, never deleted |
| The SOUL editor | **DROPPED — never rebuilt** | The constitution changes only by pull request. Its absence is the rule, not a gap |
| The 5-tier legal hierarchy | **DROPPED — founder decision** | No such structure is decided in the Hive record. It is not built until the founder decides it exists |
| The waterfall / 70-20-10 split | **DROPPED — founder decision** | Money movement is founder-gated (Q-004). No waterfall until a Tier decision |
| Word→Hz / eigenmodes | **DROPPED** | No Hive equivalent. Dropped unless the founder says otherwise |

**The sentence that matters:** retiring the page is step 1 of reverse
engineering. The system is not being thrown away — it is being taken apart,
mapped (this blueprint), and rebuilt properly, wired to the Worker, tested,
retested, deployed, and live. A retired page and an abandoned system are two
different things, and this blueprint is the proof of which one this is.

---

## §8 — Hand to Claude (the FABLE-5 builder): build spec + prompt

This blueprint is the source of truth Claude builds from. **Claude plans
first, then builds — no immediate building.** The sequence is the one the
founder set for the Claude loop:

1. The founder pastes the prompt below to Claude, with this blueprint
   attached (the whole file — it is the spec).
2. Claude returns a **plan** — not code. The plan says, phase by phase
   (B0–B8), what it will build, what it will not build, what it needs
   decided, and what bugs it already sees in the blueprint or the old page.
3. The plan comes back here. It is **reconciled against the record** (the
   audit, the rewire map, the constitution F-001–F-006, the founder queue
   Q-001–Q-010, the Queen 100% rule). Invented decisions stay out.
4. The founder approves the plan — or corrects it.
5. Only then does Claude build, phase by phase, following §6 (the
   bug-handling rule) and the 20-rung ladder in §5.

**The prompt the founder pastes to Claude:**

> You are the FABLE-5 builder for THEHIVE. Attached is the Biosystem
> Reverse-Engineering Blueprint v1.0 — it is your source of truth. Read it
> in full before you do anything else.
>
> Do NOT build anything yet. PLAN FIRST. Return a build plan, phase by
> phase (B0 through B8 as the blueprint defines them), that says for each
> phase: what you will build, what you will not build, what you need the
> founder to decide first, and what bugs you already see — in the blueprint,
> in the old page (`docs/biosystem.html`), or in the live overlay.
>
> Rules that bind you:
> - Build ONLY what the blueprint maps to an EXISTS Worker route, or what
>   the founder has separately approved. A NEW endpoint in the blueprint is
>   a name only — never design or build it until the founder says yes to
>   that endpoint by name.
> - A RETHINK row means the concept changes shape. Say what it becomes and
>   what data feeds it. A DROP row means it does not come back — do not
>   re-add it as a "missing feature". The SOUL editor and the 5-tier legal
>   hierarchy are dropped for stated reasons; do not rebuild them.
> - The constitution is soul.md F-001–F-006 only. The old page's 12
>   Jasper-era SOUL_MD articles are a citation, not a constitution. Never
>   validate against them, never quote them as Hive law.
> - The 10 cognitive modes do NOT come back as drug-named modes. They
>   become lens states (Devil's Advocate, Childlike Wonder, DaVinci;
>   Cyborg, JARVIS, Alfred). Say how.
> - BUG RULE: while planning and while building, find and diagnose bugs.
>   Do NOT leave them, and do NOT silently auto-fix them. Take each bug
>   through four lenses — programmer, architect, developer, full-stack
>   software engineer — diagnose first, propose the fix through those
>   lenses, then fix deliberately. Log every bug with its diagnosis. A bug
>   that is not logged is a bug that was left.
> - Nothing is faked. A panel with no data shows "no data", never a
>   simulated number. The old page's demo-mode simulation is the failure
>   this rebuild exists to end.
> - Retiring the old page (phase B0) is step 1 of reverse engineering, not
>   abandonment. The concepts in the blueprint are what get rebuilt.
> - The Queen 100% rule stands: nothing in this build flips a switch, gates
>   or un-gates the Commune path, or touches Queen/Kai brain surfaces as
>   build work. Those are Queen-sequence work, not this rebuild. Flag them
>   if you see them; do not build them.
> - If the blueprint and the repo disagree, the repo is the fact and the
>   blueprint is the error — say so in your plan, with file and line, so
>   the blueprint can be corrected. Do not silently build around a
>   discrepancy.
>
> Return the plan only. No code, no pull request, no edits. The founder
> approves the plan before any building starts.

---

## Appendix — Provenance

- Audit: `~/workspace/hive-batches/BIOSYSTEM_GATEWAY_AUDIT.md` (339 lines,
  2026-11-11; spot-checked by Muse — the two-copies claim and the
  AI-Gateway-unused claim both verified against the clone).
- Rewire map (Worker route table): `~/workspace/hive-batches/FRONTEND_JASPER_REWIRE_MAP.md` §2.
- Old page: `docs/biosystem.html`, 17,344 lines, main `7af242d`.
- Overlay: `frontend/src/components/kai-os/BiosystemOverlay.tsx` (live tab:
  `GET /v11/llm/status`, `GET /v11/agents`, `GET /v11/proposals`).
- History: `docs/ACCESS_BIOSYSTEM_STATUS_2026-09-20.md` (PR #209 rewired
  the overlay, deliberately left the framed page).
- Founder decisions in force: Q-B1 retire-as-step-1 (2026-11-10); Queen
  100% rule (chronological Q-A → Q-B → Q-C); Q-004 (no automatic money
  moves); the 20-rung done ladder (ratified); FABLE-5 alongside rung 20;
  the preamble rule (plain language first, go-ahead before consequential
  work); the bug-handling rule in §6 (founder's instruction, 2026-11-10).

*End of blueprint v1.0.*
