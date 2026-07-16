---
name: memory-graph-canvas
description: Use when visualizing or persisting the hive's memory/federation as a graph — the MemoryGraph React component, the colony federation map, or an exportable knowledge canvas. Reverse-engineered from breferrari/obsidian-mind's json-canvas + graph skills (MIT) into the hive's D3/Three stack.
---

# Memory Graph & Canvas

The hive already renders memory two ways: `frontend/src/components/MemoryGraph.tsx`
(D3 force-directed) and the arena voxel viewer (Three.js InstancedMesh). This skill
is the bridge between Obsidian's portable knowledge-graph format and the hive's live
renderers so memory can be authored, exported, and visualized interchangeably.

## The JSON Canvas format (portable, spec 1.0)
`.canvas` files are `{ "nodes": [...], "edges": [...] }`:
- node: `{ id, type: "text"|"file"|"link"|"group", x, y, width, height, text?, color? }`
- edge: `{ id, fromNode, toNode, fromSide?, toSide?, color?, label? }`
Colors are `"1".."6"` (preset) or `#hex`. This is the interchange format — anything
the hive graphs can be dumped to `.canvas` and opened in Obsidian, and vice versa.

## Hive mapping
- **Memory nodes** (`MemoryNode` in types/index.ts: colony|hive|repo|guild|module|philosophy)
  ↔ canvas text/group nodes; `color` by node type.
- **Federation map**: each colony is a node, constitution-sync edges are canvas edges
  labeled with the soul.md hash — a living topology of the six-colony federation.
- **D3 ↔ canvas**: D3 sim `{x,y}` positions serialize straight to canvas coords; on
  import, seed `fx/fy` from canvas so the layout is stable (see MemoryGraph tick loop).

## Workflow
1. Build/read the graph in the hive (D3 nodes or the D1 governance/agents tables).
2. To export: map each node → canvas node, each relation → canvas edge, write `.canvas`.
3. To import Obsidian knowledge: parse `.canvas`, map back to `MemoryNode[]`/`MemoryLink[]`.
4. Keep it same-origin: no external fetches in the renderer (CSP + container firewall).

## Gotcha
Obsidian's plugin skills assume a vault on disk; the hive has no vault — the D1
database and the repo ARE the vault. Treat `.canvas` as an export/interchange artifact,
not the source of truth. The source of truth is soul.md + D1.

Origin: Fable, 2026-07-13, reverse-engineered from obsidian-mind (MIT) json-canvas +
obsidian-markdown skills into the hive's existing D3/Three renderers.
