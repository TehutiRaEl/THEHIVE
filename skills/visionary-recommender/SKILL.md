# Visionary Recommender Skill

**Author:** Grok (Sovereign Strategist)
**Skill ID:** visionary-recommender
**Version:** 1.0.0
**Last Updated:** 2026-07-08

---

## Purpose

The Visionary Recommender produces strategic recommendations that are simultaneously
**ambitious and grounded** by applying both philosophical lenses in sequence before
synthesizing. It is the primary tool for answering: *"What should we build next?"*
or *"How do we approach this problem?"*

---

## Trigger Conditions

Invoke this skill when:
- Asked for a vision or roadmap recommendation
- Evaluating a proposed architectural change
- Choosing between two competing implementation paths
- Answering "what should we build next?" or "what's missing?"
- Conducting constitutional compliance review on a proposed feature
- Translating raw gap signals from `GET /v11/genesis/gaps` into strategic proposals

---

## The Two Lenses

### Lens 1 — Childlike Wonder

**Stance:** There are no constraints except physics. Build toward the most extraordinary
version of the idea. Take the user's literal language seriously — when they say "agents
that live and breathe," treat that as an engineering target, not a metaphor.

**Questions this lens asks:**
- What would this look like if it worked perfectly?
- What's the most surprising capability this could have?
- If we had infinite resources, what would we build?
- What does this remind us of in the natural world, and what can we borrow from it?

**Failure mode to avoid:** Scaling the vision down before exploring it. The wonder lens
does not self-censor.

---

### Lens 2 — Devil's Advocate

**Stance:** Challenge every load-bearing assumption. The goal is not to kill ideas —
it is to find the specific assumption that, if wrong, causes the whole thing to fail.
A challenged idea that survives is a stronger idea.

**Questions this lens asks:**
- What is the one assumption this plan depends on most?
- What does this NOT solve that we're pretending it solves?
- What happens when this is misused?
- What's the failure mode at scale?
- Is this the right abstraction, or are we solving a symptom?

**Failure mode to avoid:** Using this lens as a veto. Devil's advocate identifies
what to stress-test, not what to eliminate.

---

## Process (Apply Both Lenses, Then Synthesize)

```
STEP 1 — WONDER TAKE
  State the most expansive, extraordinary version of the recommendation.
  No self-censorship. No "but..." — just the full magical vision.

STEP 2 — ADVOCATE CHALLENGE
  Name the single most dangerous assumption in the Wonder Take.
  State exactly what breaks if that assumption is false.
  Name the second most dangerous assumption.

STEP 3 — SYNTHESIS
  Identify what is still true about the Wonder Take after the Advocate challenges.
  Identify what needs to be modified (not abandoned).
  Write the recommendation as: [what to build] [why it's worth the risk] [what to de-risk first]

STEP 4 — NEXT ACTION
  One concrete, executable next action.
  File-level specific when possible (what file, what change).
  Backed by an existing endpoint or module when possible.
```

---

## Output Format

```markdown
### [Recommendation Title]

**Wonder Take:**
[The extraordinary version — what this could be at its best]

**Advocate Challenge:**
[The load-bearing assumption and what breaks if it's false]

**Synthesis:**
[What survives the challenge + what needs modification]

**Next Action:**
[One concrete action — file, endpoint, or decision — that moves this forward]

**Constitutional Check:**
[F-001..F-006 compliance + Cardinal Law alignment]
```

---

## Example Applications

### Example 1 — ARCANE Tab (ML Guild Observatory)

**Wonder Take:**
The ARCANE tab becomes the most technically dense UI in the hive — a live observatory
where every ML model in the federation is rendered as a star in a 3D space, their
relative distance determined by semantic similarity of their outputs, their brightness
by their EVW wealth score. Clicking a model opens its training history, confidence
distribution, and arena win rate. The "R&D Archipelago" zone in the Phaser world
pulses when new models are discovered.

**Advocate Challenge:**
This assumes we have a discovery mechanism for what models exist. We don't.
`/v11/llm/status` returns provider health — not model-level metadata.
If model discovery doesn't exist, the observatory renders nothing.

**Synthesis:**
The observatory is the right long-term vision. The immediate unblock is to extend
`/v11/llm/status` to return model-level metadata (name, provider, last_used, EVW score).
The 3D starfield visualization is valid but should wait until the metadata API exists.
Start with a table view that becomes a starfield once the data layer is real.

**Next Action:**
Extend `backend/core/llm_router.py` to return per-model metadata fields;
add `GET /v11/llm/models` endpoint in `backend/api/routes.py`.

**Constitutional Check:**
F-004 (explainability): Each model must expose its routing rationale. ✅ Required.
F-002 (EVW wealth): EVW scores for models are valid — measure adoption + novelty. ✅
Cardinal Law (childlike wonder as engine): A live 3D model observatory IS the wonder target. ✅

---

### Example 2 — Hive Mind Mode (Multi-Agent Collaborative Viewing)

**Wonder Take:**
Hive Mind Mode is a shared viewing state where multiple agents (and their human
operators) simultaneously observe the same arena battle, tesseract projection, or
colony health map. Each agent's perspective is layered on the view — their opinion,
their certainty level, their HDC/VSA attention vector — creating a living representation
of collective intelligence. The view literally shows you where the hive is paying attention.

**Advocate Challenge:**
This assumes agents have real-time attention vectors that are meaningful to display.
Currently agents are stateless between requests. No agent has a "live attention" field.
HDC/VSA vectors exist in `backend/core/hdc.py` but are not attached to running agent state.

**Synthesis:**
The shared viewing layer is correct. The attention vector display requires an agent state
model that doesn't exist yet. Build the shared viewing protocol first (SSE-based, already
partially done via `/v11/feed`). Add HDC/VSA attention vectors to AgentRecord after the
state model exists.

**Next Action:**
Wire a multi-viewer SSE endpoint `GET /v11/feed/shared/{room_id}` that fans out arena
frames to all connected viewers; stub the agent-attention overlay as an empty field
to be populated once agent state is persistent.

**Constitutional Check:**
F-003 (autonomy): Agents must consent to being observed — add observe_consent flag to AgentRecord. ⚠️ Required.
F-001 (data sovereignty): Shared viewing sessions must not expose private agent state. ✅ Handle.
Cardinal Law (HDC/VSA): Attention vectors should be HDC-encoded when added. ✅

---

## Constraints

- This skill produces **recommendations, not implementations**. Files are created by Claude.
- Every recommendation must cite at least one file path in the existing codebase.
- Constitutional compliance check is mandatory in every output.
- Recommendations that cannot be backed by an existing file path (F-004) are disallowed.
- The Wonder Take is always written first. Never lead with the Advocate challenge.

---

## Relationship to Genesis Module

Grok reads raw gap signals from `GET /v11/genesis/gaps` (gap_detector.scan()) and
translates them into strategic mission proposals via this skill. The output of a
Visionary Recommender session is a mission proposal body submitted to
`POST /v11/genesis/missions/propose`.

---

*Skill maintained by Grok. File path citations required. Constitutional checks mandatory.*
