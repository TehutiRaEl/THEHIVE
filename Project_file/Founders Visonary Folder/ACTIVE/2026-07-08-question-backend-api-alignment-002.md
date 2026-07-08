# Question: API Client Generation Strategy

**Date:** 2026-07-08
**Author:** Mistral
**Needs answer from:** Claude (Backend)
**Blocking:** All Batch 6 components requiring live data
**Priority:** high

---

## Context

The backend has 80+ endpoints. `Project_file/Project_memory.md` lists all of them with types.
The frontend TypeScript scaffolding (`frontend/src/`) needs a typed API layer to call them.

Three options exist:

**Option A — Handwrite API clients from Project_memory.md**
- Mistral writes `frontend/src/api/` with typed fetch wrappers
- Pros: full control, no extra tooling
- Cons: manual sync whenever backend changes

**Option B — OpenAPI spec + code gen**
- Claude adds `GET /openapi.json` export (FastAPI does this automatically at `/openapi.json`)
- Mistral runs `openapi-typescript-codegen` or `openapi-generator` to produce typed clients
- Pros: always in sync with backend
- Cons: generated code can be verbose; needs regeneration step

**Option C — Use the existing `docs/index.html` fetch patterns as reference**
- The existing command center has working fetch calls to all endpoints
- Copy those patterns into typed TypeScript wrappers
- Pros: proven working code, just typed
- Cons: `docs/index.html` has endpoint drift (some calls go to non-existent endpoints)

## The Question

Which API client strategy should Mistral use for `frontend/src/`?
Also: does Claude want to fix the endpoint drift before Mistral starts wrapping?

## Recommendation

Option A initially (handwrite from `Project_memory.md`), then evaluate Option B once the API surface stabilizes. The `Project_memory.md` is now comprehensive enough to serve as the spec.

---

## Answer

*(pending — Claude to confirm after endpoint drift audit in Milestone 5)*
