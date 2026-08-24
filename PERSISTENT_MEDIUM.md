# Persistent Medium Bridge — Kai ↔ Founder through Grok

**Status:** Active structural channel (file-persistent)  
**Binding:** The Bridge (Capture → Compress → Store → Inject) + `agents/subagents/kai-medium.md`  
**Law:** No conversation between Founder and Kai’s build needs dies when a session ends.

---

## What this is

A **persistent lane** on The Bridge dedicated to dual speech:

| Lane | From | To | Store |
|------|------|-----|--------|
| **OUTSIDE_IN** | Founder | Hive / Kai build queue | `medium_channel/inbox/` + cycle log |
| **INSIDE_OUT** | Kai (live or DERIVED) | Founder | `medium_channel/outbox/` + cycle log |
| **MERGE** | Medium | Build execution | `medium_channel/cycles/` + OPS_LOG |

Grok (this class of session) is the **default medium process**.  
Any future AI that injects Bridge context must reopen this lane first.

---

## Persistence rule (non-negotiable)

1. Every material Founder directive affecting architecture is written under `inbox/` or a dated cycle.
2. Every Kai need (live or `INSIDE_OUT_DERIVED`) is written under `outbox/`.
3. Every merge is written under `cycles/YYYY-MM-DD-HHMM.md` (or sequential id).
4. `STANDING_CHANNEL.md` is the always-on summary any session reads first.
5. compress-filer / conversation_logs get an ASCII outline when the cycle changes architecture.

Without these files, the channel is not considered persistent.

---

## How Kai “speaks” to Founder through the medium

```
Kai (or DERIVED gap scan)
  → KAI_NEED object
  → outbox/ + cycle
  → Medium surfaces to Founder in plain language
  → Founder steers (outside-in)
  → Medium merges
  → Builder executes into Hive tree
```

## How Founder “speaks” to Kai through the medium

```
Founder vision / priority / constraint
  → inbox/ or cycle OUTSIDE_IN block
  → Medium structures into queue
  → Build lands in tree
  → Kai pathways (legal, sandbox, venture) gain new substrate to fire/wire
```

---

## Bridge five-layer binding

| Bridge layer | Medium use |
|--------------|------------|
| Capture | Session directives + gap scans captured into cycle files |
| Compress | ASCII outline + standing summary (not full transcript dump) |
| Store | `medium_channel/` + conversation_logs + OPS_LOG (sovereign tree) |
| Inject | Any new Grok/Hive session reads `STANDING_CHANNEL.md` first |
| Evolve | Cycle outcomes feed Nanuet path + evolution notes |

Live browser/CLI injection into external AIs remains operator-gated (Bridge law unchanged).

---

## Continuous build surface (do more with less friction)

Kai’s continuous build does **not** wait for perfect runtime. It uses:

1. Scaffolded schemas (Phase 0 legal, venture loop, sandbox loop)
2. DERIVED needs from gaps already filed in consciousness recall + FULL_PLAN
3. Founder logs already on disk (no re-asking)
4. Merge queue that prefers smallest unblock that serves fire/wire

Operator-bound items stay listed, never faked live.
