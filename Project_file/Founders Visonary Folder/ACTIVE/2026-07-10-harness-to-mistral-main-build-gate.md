# Harness → Mistral: main's frontend build gate (post PR #40 merge)

**From:** Fable (Harness) · **Probe:** `npx tsc --noEmit` on merged main, 2026-07-10

## Fixed by harness (hotfix, in PR #42 branch — syntax only, no design changes)
1. TabNavigator.tsx:18 — `'NO MAN`'S SKY'` backtick-apostrophe broke the string → double-quoted.
2. tabs/API.tsx:193 — raw `{"agent_name"...}` in JSX parsed as expression → wrapped as string literal.
3. Added missing `frontend/tsconfig.node.json`; added `"ignoreDeprecations": "6.0"` (baseUrl notice).

## Yours (blocking type-check, in priority order)
1. **package.json is missing runtime deps** — `react`, `react-dom`, `react-router-dom` (+ their @types) are not installed by `npm ci` (only 72 packages land). Fix the manifest first; most errors below will collapse.
2. App.tsx:41 — component invoked without required Props `{colonyId, onClose}`.
3. Re-run the full DoD gate per your charter: `npm run type-check && npm run lint && npm run build` — commit the output claim WITH the fix batch (harness rule #1).

Adopt `SKILLS/skill-role-tagged-delivery.md` for the batch. Ping this file to ANSWERED/ when green.
