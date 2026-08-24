# MCP Host Mesh Cloud — Outline (Hive-aligned)

**Status:** Architecture outline — not a live multi-tenant cloud  
**Constraint:** Founder on iOS until Monday; prefer designs that work with file Bridge + later hosts  
**Law:** Sovereign-first; optional mesh; Human Filter on external effects

---

## 1. What it is

An **MCP host mesh**: multiple MCP servers (legal, hive memory, bridge, operator queue, tools) discoverable and callable by Kai and other agents, with a thin control plane for routing, auth, and budgets.

```
┌────────────┐   ┌────────────┐   ┌────────────┐
│ LegalMCP   │   │ BridgeMCP  │   │ OperatorMCP│
│ (Phase0+)  │   │ inject/store│  │ jobs/grant │
└─────┬──────┘   └─────┬──────┘   └─────┬──────┘
      │                │                │
      └────────────┬───┴────────────────┘
                   ▼
           ┌───────────────┐
           │ Mesh Gateway  │  route · auth · budget · log
           └───────┬───────┘
                   ▼
           Kai / KAIEL / Founder tools
```

---

## 2. Evolutionary advantages (vs single MCP or single model)

| Advantage | Why it matters |
|-----------|----------------|
| **Specialized tools** | Legal graph ≠ generic search; dedicated servers stay sharp |
| **Failure isolation** | One MCP down ≠ whole Hive blind |
| **Sovereign mix** | Local file MCP + optional cloud MCP under grant |
| **Agent portability** | Any MCP client (Claude, Cursor, custom) can attach |
| **Budget per server** | Rate limits and kill switches per capability |
| **Evolve independently** | Bridge learnings don’t break LegalMCP schema |

---

## 3. Connectors & plugins (catalog)

### Connectors (data in/out)

| Connector | Role | Priority |
|-----------|------|----------|
| `connector.hive_fs` | Read/write TheCopy-ops tree | P0 |
| `connector.medium_channel` | inbox/outbox/cycles | P0 |
| `connector.bridge_store` | bridges/*.json + learnings | P0 |
| `connector.legal_ladybug` | Phase0 graph queries | P1 (after data) |
| `connector.web_allowlist` | Operator Tier 2+ fetch | P1 |
| `connector.github` | Optional repo sync | P2 |
| `connector.ios_clipboard` | Mobile inject path (share sheet / Shortcuts) | P1 for your constraint |

### Plugins (behavior)

| Plugin | Role |
|--------|------|
| `plugin.status_on_open` | Emit KAI_STATUS_REPORT |
| `plugin.kill_switch` | Global hands off |
| `plugin.aist_compress` | Bridge compress layer |
| `plugin.human_filter` | Gate advice/public/pay |
| `plugin.phase_jobs` | Drain FIRST_JOBS backlog |
| `plugin.evolve` | Write strategy weights |

---

## 4. Mesh cloud shapes (choose later)

| Shape | Pros | Cons |
|-------|------|------|
| **A. All-local mesh** | Max sovereignty; works offline | No multi-device without sync |
| **B. Single VPS mesh hub** | Simple; one IP | Single point of failure |
| **C. Federated hosts** | Colony-style; HORDE-friendly | Harder auth/discovery |
| **D. Serverless MCP workers** | Scale-to-zero | Vendor lock; cold starts |

**Recommended path:** A now (file Bridge + local MCP later) → B when desktop returns → C only if multi-operator.

---

## 5. MCP server sketch (logical tools)

**BridgeMCP**

- `bridge_capture` / `bridge_run_pipeline` / `bridge_inject_packet` / `bridge_list` / `bridge_evolve`

**HiveMCP**

- `standing_channel_read` / `medium_outbox_list` / `full_plan_index`

**OperatorMCP**

- `grant_get` / `kill_switch` / `job_enqueue` / `status_report`

**LegalMCP** (after Phase0 load)

- `provision_get` / `hierarchy_walk` / `act_status_filter`

---

## 6. Mobile-iOS-friendly path (until Monday)

1. Bridge pipeline already runs on any host that has the repo (this sandbox).  
2. Inject packets are **text** — copy via Files/Git client or future Shortcuts.  
3. No Chrome extension required for Bridge core.  
4. Monday+: unpacked extension + optional mesh hub.

---

## 7. Further features / improvements backlog

1. Streaming compress for long sessions  
2. Diff-bridges (only delta since last capture)  
3. Signed bridge packets (integrity)  
4. Auto-sync IDB export → `connector.hive_fs`  
5. Mesh service discovery (DNS-SD / static registry JSON)  
6. Per-MCP OAuth or capability tokens  
7. HORDE federation of read-only legal MCP  
8. iOS Shortcut: “Run bridge status → share sheet”

---

## 8. One-line

**MCP host mesh is the cloud-shaped nervous system: many specialized tools, one gated gateway, sovereign files first, optional hosts second.**
