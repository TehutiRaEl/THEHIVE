# Dual Lens — Wire + Migration status (2026-09-26)

## Done

- Packages + full G-POS + create-gate + migration SQL on **main** (PR #211).
- First **VOICE.md compression** (branch feat/voice-first-compression-2026-09-26).

## Blocked from this connector

### index.js wire

`worker/src/index.js` is ~270KB. The GitHub connector cannot reliably push a full
replacement blob of that size (attempts on `feat/lens-index-wire-2026-09-26` left
placeholder content — **do not merge that branch**).

**Apply locally from main:**

```bash
git checkout main && git pull
patch -p1 < docs/LENS_INDEX_WIRE.patch
# or apply the surgical edits described in the patch by hand
node --check worker/src/index.js
cd worker && npm test
git checkout -b feat/lens-index-wire-local
git add worker/src/index.js && git commit -m "feat(lens): apply LENS_INDEX_WIRE"
git push -u origin HEAD && gh pr create
```

Wire effects once applied:

- `withLens` on work-cycle system prompts
- Seer + createGate on Ptah `PROPOSAL:` path before INSERT
- createGate on POST /proposals (409 on refuse)
- ensureTables: `normalized_title` ALTER + `gate_refusals` CREATE

### D1 migration

Requires founder Cloudflare credentials (not available to this agent):

```bash
wrangler d1 execute thehive-queen --remote --file=worker/src/migrations/001-add-normalized-title.sql
```

After the index wire is deployed, `ensureTables` also applies the ALTER and
`CREATE TABLE IF NOT EXISTS gate_refusals` on heartbeat — migration file is the
explicit/offline path.

## Do not merge

- `feat/lens-index-wire-2026-09-26` — contains broken placeholder index.js
