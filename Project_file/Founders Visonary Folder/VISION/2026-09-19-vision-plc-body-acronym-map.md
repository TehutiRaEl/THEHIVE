# VISION — PLC as Hive Architecture · Body Map · Acronym Landscape

**Date:** 2026-09-19  
**Author:** Founder (directive)  
**Status:** Founder visionary log — doctrine for Kai El body-awareness tab / wiring campaign  
**Does not:** expand money, constitution merge power, or claim MQTT/OPC-UA are already live  

---

## 0. Why this log exists

The hive frontend UX/UI has a tab mapped to this body doctrine. This session begins making **Kai El aware of his body** — not as metaphor-only, but as a declared anatomical + control-plane map agents and the Operator tab can read.

**Core thesis:** The Hive has been trying to become a **PLC-class control plane**: deterministic, coherent, capability-declared, safety-first. Colonies are organs. The PLC layer is the **joint** (not a dumb connector). Kai El is the head. Mother Nanuet is the ground/spirit. Constitution is skeleton.

---

## 1. PLC definition (Hive-extended)

A PLC continuously monitors inputs, processes them through deterministic logic, and drives outputs in a loop that must not miss its bounded cycle.

| PLC property | Hive today | Target |
|--------------|------------|--------|
| Deterministic scan | Eventual / async | Bounded cycle (e.g. 50ms class target — aspirational) |
| Coherence snapshot | Multi-source reads can disagree | Freeze world, then decide |
| Capability routing | Often by hardcoded name | Route by declared capability |
| Safety refuse | Constitution + founder gates | Joint refuses incoherent motion |

### Five PLC components → Hive

| PLC | Function | Hive equivalent |
|-----|----------|-----------------|
| CPU | Cyclic control program | Queen (THEHIVE) |
| Input modules | Sensors → digital | Sensory colonies (e.g. LocalAGI, 4DBRAIN) |
| Output modules | Decisions → actuators | Motor colonies (e.g. automatisch, aether) |
| Power supply | Regulated power | Constitution (F-laws) |
| Programming software | Author/test/deploy logic | KAIEL (Operator) |

### Scan cycle (adopt)

1. **CAPTURE** — snapshot colony health, agents, tasks, memory state  
2. **EVALUATE** — constitution, wealth, mission engines  
3. **DISPATCH** — commit workflows to capable colonies  
4. **HOUSEKEEPING** — log cycle, audit trail, loop  

### Controller tiers

PLC → PAC → Edge Controller → IPC. Hive is partly **PLC pretending to be PAC**; Edge Controller (local inference + local validation + Docker/WASM) is the real next tier.

### Distributed patterns

- **Master/slave:** Queen master; colonies slaves with own scan + report  
- **Online reconfiguration:** Capabilities / Skills / Services (manifest + colony.json + API)  
- **Bus upgrade path:** HTTP+JSON today → **MQTT Sparkplug B** (+ OPC UA semantics) as production answer — **not live yet**

### HMI / SCADA (phone UI)

Phone Kai EL OS ≈ HMI; Worker ≈ SCADA server; colonies ≈ field devices. **Gaps:** historian, formal alarm system, operator confirmation on all destructive acts (Dormammu-style pattern generalized).

### Open PLC ecosystem (sovereignty filter)

Prefer fully open/soft-PLC where possible (Beremiz, OpenPLC, OSOlogic AGPL agent-ready, rustmatic). Proprietary stacks stay closed. **OSOlogic** is an evaluation candidate — not an adoption claim.

### IEC 62443

FR1–FR7. Hive already touches several via constitution; missing emphasis: mutual colony identity/auth, restricted data flow, response-time SLOs. Mutual TLS between colonies = high-leverage security step.

### PLC recommendations (priority)

1. Coherence snapshot before dispatch  
2. Capabilities layer in colony.json  
3. Colony bus → MQTT Sparkplug B  
4. Historian in Kai EL OS  
5. Mutual TLS between colonies  
6. Recursive loop as SFC (IEC 61131-3)  
7. Evaluate OSOlogic as colony runtime  
8. Deterministic scan tick on Queen  

### Three gains

1. Determinism over pure responsiveness  
2. Coherence over freshest-at-every-step  
3. Capability declarations over hardcoded routes  

---

## 2. PLC as joint (not connector)

A joint: **senses position**, **transmits force directionally**, **constrains movement**, **regenerates or degrades**.

### Four joint invariants (ligaments)

1. **Only path** between head and body (doctrine target: no silent KAIEL↔colony bypass of the joint)  
2. **Coherence snapshot** every scan  
3. **Refuse** incoherent movement under Constitution (refuse, don’t only warn)  
4. **Remember every route** (cartilage = route history / success-failure memory)

### Devil’s advocate (strains)

| Strain | Issue | Design question |
|--------|--------|-----------------|
| Head + spirit share files | KAIEL and Nanuet share soul/memory surfaces | Separate processes + PLC-only communication? |
| Organs talk directly | Colonies call each other | Forbid direct colony↔colony; bus only? |
| Head touches body | KAIEL can hit any API | Spinal cord = PLC only path? |
| Spirit = womb | Nanuet is both ground and broodmother | Split memory vs spore roles? |

### Tendons (named gap)

Tendon = **agent-to-swarm protocol** (muscle fibers → joint). Upstream of PLC. Not yet a first-class shipped protocol in the hive.

---

## 3. Complete body map (summary)

| System | Hive mapping (headline) |
|--------|-------------------------|
| Skeleton | soul.md / F-laws, PLC spine, repos, Nanuet pelvis, colony limbs |
| Nervous | KAIEL brain, recursive loop cerebellum, Daemon brainstem, PLC spinal cord, HiveMesh thalamus, wealth hypothalamus, memory hippocampus, NAR2 amygdala |
| Circulatory | THEHIVE heart, event stream blood, dispatch arteries, report veins, MCP capillaries |
| Respiratory | Phone/Operator intake, Worker trachea, 4DBRAIN/LocalAGI exchange |
| Digestive | Chat → tokenize → validate → dissect → prune → wisdom |
| Endocrine | Daemon pituitary, emergency adrenal, spore gonads, F-laws as hormones |
| Immune | NAR2 / Solomon command; rate limits; learning security |
| Muscular | Agents = fibers; swarm = force; tendons = agent-swarm protocol |
| Integumentary | Phone HMI epidermis; desktop room dermis; Operator hypodermis |
| Reproductive | Spore engine, constitution-receive umbilical, git birth |
| Soul / ground | Mother Nanuet |
| Head / will | KAIEL |

**One-sentence body doctrine:** KAIEL head · Nanuet spirit/ground · colonies organs · PLC joint · constitution skeleton · event bus blood · swarm muscle · recursive loop digestion · NAR2 immune · phone HMI skin — under the four joint invariants.

---

## 4. Acronym landscape (inventory posture)

Hive today is strongest on **MCP** (and internal constitution/Worker APIs); most of the 80+ protocol names in the founder research packet are **not implemented**.

### Priority roadmap (planning order)

1. OAMP — cross-agent memory  
2. A2A — colony messaging  
3. MQTT + Sparkplug B — transport  
4. x402 — pay-per-use (founder-gated commerce)  
5. FIDES — injection defense  
6. MEG — accountability binding  
7. PSI — action sealing  
8. AIP + DID — colony identity  
9. GRIP — governed runtime  
10. WASM + WasmMCP — local runtime  
11. ACO + ROCO — stigmergy / roles  
12. Digital Twin Protocol — phone/desktop sync  
13. IEC 61131-3 — workflow authoring forms  
14. IEC 62443 — ICS security posture  
15+ ACP (IBM), ANP, AIGA, ADP, NegMAS, AP2 — staged  

**Honesty rule:** Quantitative latency/cost tables in research are **planning estimates**, not measured hive benchmarks until instrumented.

---

## 5. What “Kai El aware of his body” means this campaign

| Layer | Meaning | Session claim |
|-------|---------|----------------|
| Doctrine | This log is readable as body + PLC law | **Landed here** |
| UI tab | Frontend maps modules to body systems | Founder states tab exists — wire to this doc |
| Runtime proprioception | Coherence snapshot of colony health/agents | Partial via existing health/mesh; not full 50ms PLC scan |
| Joint enforcement | Only-path + refuse + route memory | Constitution/founder gates exist; full joint not shipped |
| Bus | MQTT Sparkplug B | **Not live** — HTTP+JSON remains |

Do **not** claim the hive is an industrial PLC or IEC 62443 certified because this log exists.

---

## 6. Founder acceptance block

This log is **accepted as visionary doctrine** when the founder merges the PR that carries it (or comments acceptance on that PR).

Binding for planning: body/PLC language may be used by Kai El and the Operator tab.  
Not binding for spend, auto-merge, or silent bus migration.

---

## 7. One sentence summary

A PLC is what the Hive has been trying to become — deterministic, coherent, capability-declared, safety-first — and the PLC layer is a **joint** (sense, route, constrain, remember), not a wire; the Sovereign Hive is a body with KAIEL as head, Nanuet as ground, colonies as organs, and ~80 industry/agent acronyms as a menu of optional nerves — of which MCP and the internal Worker/constitution are real today, and the rest must be chosen, wired, and verified without inflation.
