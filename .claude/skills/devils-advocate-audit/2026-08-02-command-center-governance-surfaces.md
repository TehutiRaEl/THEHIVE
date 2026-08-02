# Command Center audit — governance/constitution surfaces (task 2d)

Part of the task-2 decomposition, the final chunk of tonight's 3-task batch run (2b/2c/2d).
Scope: ConstitutionViewer, ProposalsPanel, LegalLearning.

## Findings

- **ConstitutionViewer.tsx** — PASS. Fetches `/GOVERNANCE.md` directly as a static asset.
  Verified this isn't a latent 404: `worker/src/index.js` itself fetches the identical
  path (`env.ASSETS.fetch(new Request(new URL('/GOVERNANCE.md', requestUrl)))`) for its
  own constitution grounding — the Worker's own code depends on this path working, real
  confirmation, not assumed.
- **ProposalsPanel.tsx** — PASS. Real `/v11/proposals` fetch and `/v11/proposals/:id/decide`
  action. Honestly explains the current `FOUNDER_KEY`-not-bound state and the exact command
  to fix it — consistent with `SWITCHBOARD.md` switch #4, still unflipped per tonight's live
  probe (`secrets_present: []`).
- **LegalLearning.tsx** — PASS. Real `/v11/legal/research` fetch, correctly states real
  legal weight stays founder-only.

## Verdict

3 of 3: clean pass. Combined with 2a/2b/2c, task 2's full decomposition (23 of 33
components fully audited across the 4 sub-tasks run so far — 2e, the overlays/dashboards
group, is the one remaining piece) has found: 2 real bugs (one fixed same-session —
WorkflowsDrawer's stale merge-authority text; one cross-referenced to task 6 — SETTINGS.tsx's
alert()), 0 fake-data/dishonest patterns, and several examples of the hive's own honest-
degradation discipline being followed correctly and consistently.
