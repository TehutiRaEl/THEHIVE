# Dual Lens — Wire + Migration status (2026-09-30)

## Done

- Packages + full G-POS + create-gate + migration SQL on **main** (PR #211).
- First **VOICE.md compression** (PR #213).
- **DEPLOY_WIRE_LEDGER.md** — disk vs wire vs live after last 12 PRs.
- **Complete wire patch** `docs/LENS_INDEX_WIRE_COMPLETE.patch` — applied locally to a
  checkout of main; `node --check` OK; **worker tests 324/324 pass**.

## Wire contents (verified)

- Imports: `withLens`, `loadVoice`, `SEER`, `createGate`, `logGateRefusal`
- Helpers: `reviewProposal`, `safeCreateProposal`
- `ensureTables`: `normalized_title` ALTER + `gate_refusals` CREATE
- Work-cycle system prompt wrapped in `withLens(...)`
- Ptah `PROPOSAL:` path: Seer → createGate → INSERT with `normalized_title`
- `POST /proposals`: createGate first; **409** on refuse; INSERT with `normalized_title`

## How to land index.js on this branch (founder or agent with full git push)

Connector payload limits still make a full ~273KB `index.js` replace unreliable from
some sessions. Prefer either:

```bash
git fetch origin && git checkout feat/lens-index-wire-local-2026-09-30
git pull
patch -p1 < docs/LENS_INDEX_WIRE_COMPLETE.patch
node --check worker/src/index.js
cd worker && npm test
git add worker/src/index.js
git commit -m "feat(lens): apply Dual Lens wire to index.js"
git push
```

Or copy a locally verified `worker/src/index.js` from a machine that already applied
the patch (tests green).

**Do not merge** `feat/lens-index-wire-2026-09-26` (broken placeholder).

## D1 migration (founder — staging first)

```bash
# staging / local binding first — founder 2026-09-30
wrangler d1 execute thehive-queen --file=worker/src/migrations/001-add-normalized-title.sql
# production only after additive proof:
# wrangler d1 execute thehive-queen --remote --file=worker/src/migrations/001-add-normalized-title.sql
```

After the index wire is **deployed**, `ensureTables` also applies ALTER +
`CREATE TABLE IF NOT EXISTS gate_refusals` on heartbeat.

## Body tab (item 4 forensic)

- Source: `BodyLineagePanel` imported in `KaiElOS.tsx`; panel id `body` — **wired**.
- Static build: `docs/app/assets/index-q6uB6Sru.js` **contains** `BodyLineage` /
  Body & Lineage strings — **included in committed Pages build** (not missing from disk).
- Live URL still depends on whatever hosts `docs/app` / Worker assets being up to date
  with this commit; no further rebuild required for Body to be *in* the tree.
