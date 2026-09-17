# Pocket Dimension prototypes (sandbox)

Full single-file HTML prototypes were built in the Grok sandbox conversation (2026-09-14/15).

Because of size limits on this automated land path, the complete files are stored in the project artifacts folder and must be copied into this tree on merge if desired:

| File | Size | Role |
|------|------|------|
| `kaiel-laboratory-v03.html` | ~30 KB | Two-tab Room + Operator; streaming `/v1/responses`; tools; citations; reasoning_effort; GitHub create-repo LIVE; honesty badges |
| `pocket-dimension-doctor-strange.html` | ~60 KB | Visual Room — Cyborg + Doctor Strange gifts, F-012, forensic v0.2 |

## How to land the binaries

From a machine that has the artifacts:

```bash
cp /path/to/artifacts/kaiel-laboratory-v03.html sandbox/pocket-dimension/
cp /path/to/artifacts/pocket-dimension-doctor-strange.html sandbox/pocket-dimension/
git add sandbox/pocket-dimension/*.html
git commit -m "sandbox: full pocket-dimension HTML prototypes"
```

Or open the files from the conversation deliverables and paste.

## Design docs already on this branch

- `sandbox/docs/memory-axes-cloudflare.md` — D1 + Vectorize schema for the six memory axes
- `sandbox/README.md` — inventory
