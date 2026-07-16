---
name: diagram-from-language
description: Generate, refine, and validate diagrams from natural language, code, schemas, or notes — flowcharts, sequence, state, ER, C4 architecture, dependency graphs, mind maps. Mermaid by default (renders inline in GitHub + the Command Center), Graphviz for complex layout. Adapted from P4nda0s/reverse-skills diagram-generator, de-scoped to the hive's docs.
---

# Diagram from Language

Turn messy or structured input into clear, versionable diagram source. Prefer
text-based diagram languages so the result is reviewable, diffable, and renders
where the hive already displays markdown.

## Default workflow
1. Identify intent, audience, and source material.
2. Pick the diagram family + language (table below).
3. Normalize entities, relationships, labels, states, and order BEFORE writing code.
4. Emit concise, readable source. Don't over-ask — make labeled assumptions instead.
5. Validate syntax; only render to a file when a downloadable artifact genuinely helps.

## Language decision table
Use Mermaid unless another is clearly better.

| User wants | Prefer | Why |
|---|---|---|
| Flow, sequence, state, ER, gantt, mindmap, C4 | Mermaid | renders inline in GitHub PRs + docs/, no toolchain |
| Dense dependency / call graph, auto-layout | Graphviz DOT | superior layout for large graphs |
| Heavy UML (class/component with stereotypes) | PlantUML | richest UML vocabulary |
| Pixel-exact / bespoke | inline SVG | full control when markup must be precise |

## Hive uses
- **Federation topology**: THEHIVE (Queen) → six colonies, constitution-sync edges.
- **Boot/heartbeat sequence**: the Worker `scheduled()` flow as a sequence diagram.
- **Arena pipeline**: ArenaProjectionEngine → frames → SSE → viewer as a flowchart.
- **Governance**: constitution TITLE/article state machine.
Drop the Mermaid into any `.md` in the repo — GitHub and the Command Center render it.

## Gotcha
Mermaid on the edge/Pages must be inlined or same-origin (CSP blocks CDN). The legacy
Command Center already bundles what it needs; don't add an external mermaid.js `<script>`.

Origin: Fable, 2026-07-13, adapted from reverse-skills/diagram-generator (public). The
upstream's imperative Chinese routing-contract and pentest framing are dropped; only the
neutral diagram methodology + decision table are kept.
