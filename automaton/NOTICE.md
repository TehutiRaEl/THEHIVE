# Provenance & License Notice

This directory (`automaton/`) is a from-scratch reimplementation, reverse-engineered from
the architecture and mechanism of **Conway-Research/automaton**
(https://github.com/Conway-Research/automaton), MIT licensed:

```
MIT License
Copyright (c) 2026 Conway
```

Per the MIT license's sole condition, that notice is preserved here. No source files were
copied verbatim — this is an independent implementation of the same *mechanism* (ReAct
agent loop, policy-gated tool execution, credit-based survival tiers, self-authored SOUL.md
identity document, self-modification with an audit log, self-replication with lineage
tracking), adapted to THEHIVE's own stack (Node's built-in `node:sqlite` and `node:test`
instead of `better-sqlite3`/`vitest`, THEHIVE's own LLM provider waterfall instead of
Conway Cloud, a simulated ledger instead of real on-chain wallets) and to THEHIVE's own
constitution (`soul.md`, `PERMISSIONS.md`) rather than Conway's three laws.

**Why a rebuild rather than a fork:** a session-level architecture review
(`Project_file/Founders Visonary Folder/VISION/2026-07-21-vision-automaton-devils-advocate-005.md`)
found five concrete gaps between what upstream's safety mechanisms claim to do and what the
code actually enforces — see that document for the full devil's-advocate pass and direct
code citations. This rebuild exists specifically to close those gaps while preserving the
genuinely good parts of the design (the policy-engine architecture, survival-tier economics,
self-authored identity document, lineage-tracked replication) — see `ARCHITECTURE.md` in
this directory for what changed and why.

If you redistribute this directory on its own (outside THEHIVE), keep this file — it is
THEHIVE's compliance with the MIT license's attribution requirement for the upstream work
this design is derived from.
