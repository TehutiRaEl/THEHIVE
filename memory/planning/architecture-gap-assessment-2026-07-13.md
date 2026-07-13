# Architecture Gap Assessment — the research dump, triaged
**Author:** Fable (Harness) · 2026-07-13 · in response to the founder's AI-research briefing

The founder shared an extensive research briefing (Sovereign Hive master prompt + MCP-harness
+ enterprise-agentic + memory-core material). Much of it is *directionally excellent* and matches
where we're already heading. But it was produced by an AI and contains **unverified and some
fabricated package names**. This doc separates real from unreal, and maps the good ideas onto
what the hive already has. **Standing rule: probe before claim, verify before install.**

## Package reality check (verified against live registries 2026-07-13)
| Named in briefing | Claimed as | Registry | Verdict |
|---|---|---|---|
| `neuromcp` / `npx neuromcp` | "Sovereign Memory MCP, hybrid vector+BM25+graph" | PyPI **404**, no npm | **DOES NOT EXIST as named.** Likely hallucinated. Do NOT run. |
| `uga-cli` / UGA HOST | "PaaS wrapping Cloudflare deploy" | npm **404** | **DOES NOT EXIST as named.** Likely hallucinated. Do NOT run. |
| `m3-memory` | "25 MCP memory tools" | PyPI 200 | Exists under the name — **unverified** it's the described tool. Do not install until inspected. |
| `kestrel-sovereign` | "crypto identity + governance" | PyPI 200 | Exists — **unverified**. Same caution. |
| `imara` | "runtime policy enforcement" | npm 200 | Generic name; **almost certainly not** the described governance tool. Do not install blind. |
| `pywrangler` | "Cloudflare Python Workers deploy" | PyPI 200 | Exists, but our Worker already deploys via Workers Builds + `wrangler.jsonc`. Not needed. |
| `arifOS`, `Microsoft AGT`, `Kept` | various | not checked / not packages | Treat as concepts, not installs. |

**Conclusion:** the "memory core" and "constitutional enforcement" install lists are NOT
actionable as written — two core packages don't exist, the rest are unverified same-name hits.
Installing arbitrary registry packages by an AI-suggested name is a supply-chain attack vector.
We build these capabilities ourselves or adopt *named, inspected* open-source projects.

## The GOOD ideas (real, and mostly already ours)
The briefing's *architecture* is sound and largely matches the hive:

| Briefing concept | Hive reality | Gap → action |
|---|---|---|
| Multi-level MCP harness (Master → sub-harnesses: security, dev, orchestration) | Fable = harness/lead; per-member charters; ACTIVE/ bus | **Formalize** with the real `agent-harness` skill now in `skills-library/engineering/agent-harness/` (goal→plan→verify→loop, per-domain manifests). Promote it when building the "Hive Conductor." |
| Three-level harness (atomic → suites → quality gates) | advisory CI + governance-check workflows | Real pattern; adopt the eval-harness shape (`judge → suite → gate`) for our own gates. |
| Constitutional governance (F-001…F-006) enforced pre/during/post | soul.md canonical + constitution-sync to 6 colonies (green) + governance_log in D1 | **Strong already.** Add: a real policy-check step (reuse `compliance-os/` + `standards/security/` from the library), not the fictional `imara`/`arifOS`. |
| Memory core (hybrid retrieval, local-first) | D1 (agents/tasks/governance/pulse) + MemoryGraph.tsx + per-member memory files | Real gap: no vector/semantic recall yet. **Action:** use Cloudflare **Vectorize** (already on our account, free tier) — a real, named service — not `neuromcp`. |
| Multi-agent orchestration (Mistral/Claude/Grok + Scribe) | team seats + Grok bridge (D1 token relay) | Real. Formalize routing with the library's `orchestration/` + `agents/` skills. |
| MCP as universal connector | GitHub MCP, Cloudflare MCP, Zapier MCP already wired this session | Already living it. |
| Observability | edge-health-probe (6h) + Worker observability=on | Add Grafana JSON (Sonnet's P7, shipped) + tracing later. |
| Deploy the backend | **already done** — edge Queen live, `/v11` + `/v11/pulse` green, heartbeat firing | The briefing's "IMMEDIATE: deploy backend today" is **already complete**; it predates our current state. |

## What we actually took from this pass (real, safe, MIT/Apache)
- **Official Anthropic skills** (13, Apache-2.0) → `.claude/skills/` incl. `mcp-builder` (build real MCP servers), `frontend-design`, `webapp-testing`, `skill-creator`, `web-artifacts-builder`.
- **Community library** (357 MIT skills) → `skills-library/` on-demand, incl. the **real `agent-harness`** — the concrete implementation of the briefing's multi-level-harness vision.
- **`skill-harvester`** active skill — the repeatable discovery→vet→import process.

## Next real steps (founder-gated, no fictional installs)
1. Promote `agent-harness` from the library and shape the "Hive Conductor" (Master harness) around it.
2. Semantic memory via Cloudflare **Vectorize** (real, on-account) — index D1 governance/agents/pulse.
3. Formalize agent routing with the library's `orchestration/` skills + the existing Grok bridge.
4. Governance policy-check step from `compliance-os/` (real) — retire any reference to `imara`/`arifOS`.

The vision in the briefing is right. The *shopping list* in it is half-fictional. We build the
vision on verified ground.
