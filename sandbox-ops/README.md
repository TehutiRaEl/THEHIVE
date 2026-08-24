# sandbox-ops — full land from Grok unshipped zip

**PR target:** THEHIVE `agent/sandbox-full-land-2026-08-24`

This tree is the complete coded work from `/home/workdir/artifacts/TheCopy-ops` (183 text files),
placed under `sandbox-ops/` so THEHIVE Queen root README is **not** overwritten (unlike flat upload PR #190).

## Contents

| Path | Role |
|------|------|
| `bridge/implementation/` | Five-layer Bridge engines + pipeline + tests |
| `bridge/medium_channel/` | Persistent medium + daemon |
| `bridge/mcp_mesh/` | MCP stdio server (10 tools) |
| `bridge/sandbox/` | recursive_pulse |
| `kaiel/operator/` | Tier 4 grant, MV3 extension, tests |
| `nanuet/runtime/` | File-native memory core |
| `conversation_logs/` | Founder session outlines |
| `OPS_LOG.md` / `FULL_PLAN.md` | Ops + master plan |

## Run (from this prefix)

```bash
cd sandbox-ops/bridge/implementation && python3 test_pipeline.py
cd ../medium_channel && python3 daemon.py
cd ../mcp_mesh && python3 test_mcp.py
```

Review before merge. Do not flatten to repo root.
