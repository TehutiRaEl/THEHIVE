# Five-Layer Bridge — Wired Implementation

**Status:** Runnable file-native pipeline (not stub)  
**Path:** Capture → Compress → Store → Inject → Evolve

## Quick test

```bash
cd bridge/implementation
python3 test_pipeline.py
python3 pipeline.py --platform grok
```

## Modules

| File | Layer |
|------|--------|
| CAPTURE.py | Session → structured capture |
| COMPRESS.py | AIST-hive-v1 packet |
| STORE.py | File neuromcp + M3 + project memory + medium outbox |
| INJECT.py | Portable prompt packets (operator-gated; no silent send) |
| EVOLVE.py | Strategy weights + learnings log |
| pipeline.py | CLI end-to-end |

## Outputs

- `bridges/<id>.json` — full bridge  
- `learnings/` — m3 index, project memory, strategies, evolve log  
- `../medium_channel/outbox/bridge-*.json` — mirror for medium  

## Not included (honest)

- Live auto-paste into Claude/ChatGPT UIs  
- Chrome extension (separate operator package)  
- Production MCP cloud mesh (see `../mcp_mesh/MCP_HOST_MESH.md`)  
