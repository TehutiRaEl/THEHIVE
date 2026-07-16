# Hive Memory Skill

**Author:** Claude (System Architect & Backend Builder)
**Skill ID:** hive-memory
**Version:** 1.0.0
**Last Updated:** 2026-07-14

---

## Purpose

The Hive Memory skill activates THEHIVE's full second-brain stack — HDC neocortex,
Obsidian-style vault, and PARA workspace — as a cohesive, repeatable workflow. It
answers: *"How do I capture, connect, and retrieve knowledge in this system?"*

This skill is the primary tool for knowledge management within the Sovereign Hive.
It replaces LangGraph's state machine, Obsidian Copilot, and Meta's worker-based
second-brain with THEHIVE's own free infrastructure.

---

## Trigger Conditions

Invoke this skill when:
- Capturing a new architectural decision, concept, or event that should persist
- Needing to trace how two concepts relate across the federation
- Starting a new session and needing to orient quickly
- Running `/update-nav` after significant backend changes
- Answering "what does the hive know about X?" or "how does X connect to Y?"
- Before a major architectural change (to understand existing concept graph first)

---

## The Memory Cycle

```
CAPTURE → LINK → QUERY → RECALL → EVOLVE
```

### Step 1 — CAPTURE
*Add something new to the system's knowledge.*

```bash
# Via API (backend running)
curl -s -X POST "http://localhost:8080/v11/brain/remember" \
  -H "Content-Type: application/json" \
  -d '{"concept": "CONCEPT_NAME", "description": "what this is"}'

# Or via slash command
/remember CONCEPT_NAME description of what this is
```

If the description is substantive (>20 words), also create a dedicated Markdown note
in the appropriate `memory/` subfolder and add wiki-links to related notes.

Do NOT hand-edit `memory/backend/*.md` — those are AST-generated and will be overwritten.

---

### Step 2 — LINK
*Wire a new association between two concepts.*

```bash
# Via API
curl -s -X POST "http://localhost:8080/v11/brain/associate" \
  -H "Content-Type: application/json" \
  -d '{"concept_a": "CONCEPT_A", "concept_b": "CONCEPT_B"}'

# Or via slash command
/link-nodes CONCEPT_A CONCEPT_B
```

The HDC `bind()` operation creates a vector equidistant from both parents — the
association key `A:B` is stored in the in-process lexicon. Add a `[[wiki-link]]` in
both concepts' Markdown notes for the durable version.

---

### Step 3 — QUERY
*Ask: what is nearest to this concept?*

```bash
# Via API (no auth required)
curl -s "http://localhost:8080/v11/brain/query?q=SOUL&top_k=10"

# Or via slash command
/brain-query SOUL
```

The response is ranked by HDC cosine similarity (bipolar vectors). Cross-reference
with `memory/_graph.json` (key: `"links"`, not `"edges"`) to distinguish HDC-inferred
associations from explicitly confirmed graph edges.

---

### Step 4 — RECALL
*Trace the full context chain from a concept.*

```bash
# Via API
curl -s "http://localhost:8080/v11/brain/recall/SOUL?depth=2"
```

Returns the top `10 * depth` nearest concepts. Use depth=1 for quick orientation,
depth=3 for deep context mapping before a major architectural decision.

---

### Step 5 — EVOLVE
*After significant changes, regenerate the vault.*

```bash
# Rebuild _graph.json + memory/backend/*.md from AST scan
python3 scripts/generate_memory_vault.py

# Or via slash command
/update-nav
```

Run after: adding new backend modules, refactoring core/, adding new colony endpoints.
The auto-update workflow (`.github/workflows/memory-vault-update.yml`) runs this on
every push to `main` — so manual evolution is only needed within a session.

---

## Tool Selection Guide

| Situation | Use |
|---|---|
| Need to capture a concept permanently | `/remember` → vault Markdown note |
| Need to query concept relationships live | `/brain-query` → HDC API |
| Need to understand the full concept graph | `GET /v11/brain/map` → all nodes + edges |
| Need to trace one concept's context | `GET /v11/brain/recall/{concept}` |
| Need to wire two concepts together | `/link-nodes` → `hdc.bind()` |
| Need to rebuild the knowledge graph | `/update-nav` → `generate_memory_vault.py` |
| Need to navigate the vault structure | Read `memory/CLAUDE.md` + `memory/_index.md` |
| Need federation-wide knowledge scan | Invoke `knowledge-cartographer` sub-agent |

---

## Output Format

```markdown
### Memory Operation: <operation type>

**Concept(s):** <concept name(s)>
**Action taken:** <what was done>
**HDC result:** <similarity scores or association key>
**Vault update:** <what Markdown was created/updated, or "none">
**Next associations to explore:** <top 2-3 nearest concepts worth following>
```

---

## Example Applications

### Example 1 — Capturing a New Architecture Decision

A new `consensus_engine.py` module was added to `backend/core/`. It needs to exist
in the memory system.

**CAPTURE:**
```bash
curl -X POST "http://localhost:8080/v11/brain/remember" \
  -d '{"concept":"CONSENSUS","description":"Multi-colony vote aggregation for governance decisions"}'
```
Create `memory/backend/core/consensus_engine.md` with the module description and
wiki-links: `[[CONSTITUTION]]`, `[[GOVERNANCE]]`, `[[COLONY]]`.

**LINK:**
```bash
curl -X POST "http://localhost:8080/v11/brain/associate" \
  -d '{"concept_a":"CONSENSUS","concept_b":"CONSTITUTION"}'
# → {"association":"CONSENSUS:CONSTITUTION","similarity_to_a":0.39,"similarity_to_b":0.41}
```

**OUTPUT:**
```
Memory Operation: capture + link
Concept(s): CONSENSUS, CONSTITUTION
Action taken: encoded CONSENSUS into HDC lexicon; bound to CONSTITUTION
HDC result: association key "CONSENSUS:CONSTITUTION" (sim 0.39/0.41)
Vault update: memory/backend/core/consensus_engine.md created with wiki-links
Next associations to explore: GOVERNANCE (0.44), LAW (0.38), COLONY (0.35)
```

---

### Example 2 — Session Start Orientation

New session, need to understand what the hive knows about the ARENA system.

**RECALL:**
```bash
curl -s "http://localhost:8080/v11/brain/recall/ARENA?depth=2"
```

**QUERY cross-reference:**
```python
import json
g = json.load(open('memory/_graph.json'))
# NOTE: key is "links" not "edges"
arena_links = [l for l in g['links'] if 'arena' in l.get('source','').lower() or 'arena' in l.get('target','').lower()]
```

**OUTPUT:**
```
Memory Operation: recall + graph cross-reference
Concept: ARENA
HDC nearest (top 10): CHALLENGE (0.47), VOXEL (0.44), BATTLE (0.41), ELO (0.39),
  CONFLICT (0.37), FREQUENCY (0.34), SCHUMANN (0.33), RESOLUTION (0.31)...
Graph links (explicit): arena_renderer.py ↔ backend/tier3/, arena.py ↔ backend/core/
Vault docs: memory/guilds/arena.md, memory/backend/core/arena.md
Next associations to explore: DREAM (cross-guild), FREQUENCY (Schumann modulation)
```

---

## Constitutional Check

**F-001 (Data Sovereignty):** All knowledge stays in the hive — vault in git, HDC in-process,
no calls to external embedding APIs. ✅

**F-004 (Explainability):** Every brain API call returns explicit similarity scores and
operation records. ✅

**Cardinal Law (HDC/VSA):** This skill exclusively uses `backend/core/hdc.py` for
agent-to-agent concept representation. ✅

---

## Constraints

- Never hand-edit `memory/backend/*.md` — AST-generated, overwritten on vault regeneration
- Never commit `soul.md` changes directly — requires 2/3 guild vote + 30-day review
- HDC lexicon bindings (`hdc.lexicon`) are **in-process ephemeral** — the Markdown wiki-links
  in `memory/` are the durable record; both should be updated together
- `_graph.json` uses `"links"` as the edge key (D3 convention), NOT `"edges"`
- The memory vault auto-update workflow (`memory-vault-update.yml`) skips `memory/` changes
  to prevent infinite loops — manual trigger required if vault itself needs updating
- Maximum `top_k` for brain/query is bounded by `concept_count()` (~150 at boot)

---

## Relationship to Other Skills / Agents

| System | Relationship |
|---|---|
| `memory-librarian` sub-agent | Executes the Evolve step; this skill defines when/why to invoke it |
| `knowledge-cartographer` sub-agent | Executes deep Query + Recall chains; use for complex concept mapping |
| `visionary-recommender` skill | Consumes memory output as input to strategic recommendations |
| `/soul-check` command | Run after capturing a concept that touches economy, agency, or governance |
| `generate_memory_vault.py` | The underlying engine for the Evolve step |

---

*Skill maintained by Claude (Backend). HDC operations only. No paid embedding APIs.*
