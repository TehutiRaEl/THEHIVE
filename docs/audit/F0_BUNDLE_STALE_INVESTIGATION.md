# F0 — Why the committed `docs/app/` bundle never rebuilt

**Status:** INVESTIGATION, 2026-11-11. Read-only. Nothing in this file edits,
builds, deploys, merges, triggers, or flips anything. It names the cause and
the fix; it does not implement the fix.

**Question:** why is the committed `docs/app/` bundle seven weeks stale
(last built 2026-09-24) when `frontend/src` changed 2026-11-11 and the
`pages.yml` workflow should have rebuilt it on the #228 (frontend rewire)
and #229 (biosystem B0) merges?

**Short answer:** the `pages.yml` workflow fails at its FIRST step —
`actions/checkout@v4` — in every run since ~2026-10-01–19. The build step
never runs, so `docs/app/` is never rebuilt and never committed. The checkout
step uses `token: ${{ secrets.PAT || secrets.GITHUB_TOKEN }}`; the strongest
explanation is that `secrets.PAT` is set but expired (or revoked), so checkout
fails with an authentication error and the `|| secrets.GITHUB_TOKEN` fallback
never engages (it only engages when PAT is empty, not when it is invalid).
There is a SECOND, separate failure — `Setup Pages` fails in every run where
checkout succeeds — but it does NOT cause the stale bundle (the commit step
runs before it).

---

## 1. What `pages.yml` does

File: `.github/workflows/pages.yml` on main (SHA
`3dfc4c9ae58995ad0dd25ff4ddc1c03aca2e1099`). Last changed 2026-08-18
(commit `0bdd87b`, "Fix stale docs/app + make pages.yml rebuild it
automatically"). Not changed since.

- **Trigger:** push to `main` with paths `docs/**` (excluding `!docs/app/**`),
  `frontend/**`, `README.md`; plus `workflow_dispatch`. The `docs/app/**`
  exclusion is deliberate (a job must never watch the path it commits to, or
  its own commit re-fires it). Real source changes come in via `frontend/**`.
- **Permissions:** `contents: write`, `pages: write`, `id-token: write`.
- **Concurrency:** group `pages`, `cancel-in-progress: false`.
- **Steps (in order):** checkout → Set up Python → Regenerate memory vault
  → Copy memory graph into docs → Set up Node → **Build Command Center
  (`frontend/` → `docs/app/`, `npm ci` + `npm run build:app`)** → **Commit
  and push `docs/app` only if the build actually changed** (git add
  `docs/app`; if no diff, exit 0; else commit + push) → Setup Pages →
  Upload `docs/` as Pages artifact → Deploy to GitHub Pages.
- **The mechanism exists and is correct in design.** The workflow DOES build
  `docs/app/` from `frontend/` and DOES commit it back to main when it
  changes. The committed `docs/app/` is a checked-in build artifact, not
  source. If the workflow ran and the build changed, the bundle would be
  current. It is not, because the workflow never gets to the build step.

## 2. Run history (pages.yml, "Deploy GitHub Pages")

Source: GitHub Actions API (public repo, unauthenticated read). 93 total
runs. The most recent 30 are listed; every one concluded `failure` except
the latest, which is still `queued`.

| Run | Date (UTC) | Head (merge) | Status / conclusion |
|-----|-----------|--------------|---------------------|
| #93 | 2026-11-11 20:39:30 | `37651d9` (#232, truth hierarchy) | **queued** (not started; ~5.5h queued at time of writing) |
| #92 | 2026-11-11 20:11:30 | `5b3f72a` (#231, vision v1.1) | completed / **failure** |
| #91 | 2026-11-11 20:09:26 | `088eb76` (#229, biosystem B0) | completed / **failure** |
| #90 | 2026-11-11 20:08:30 | `7665aff` (#228, frontend rewire) | completed / **failure** |
| #89 | 2026-11-10 04:14:19 | `b4ebd6d` (#224) | completed / **failure** |
| #88 | 2026-11-07 18:36:36 | `7af242d` | completed / **failure** |
| #87 | 2026-11-07 03:44:54 | `90612a3` | completed / **failure** |
| #86 | 2026-11-06 00:48:20 | `278f4df` | completed / **failure** |
| #85 | 2026-11-05 23:30:07 | `62ebdaa` | completed / **failure** |
| #84–#73 | 2026-11-05 → 2026-11-04 | various | completed / **failure** (all) |
| #72–#69 | 2026-10-19 | `fa28603`, `56c5281`, `02cec2b`, `8543445` | completed / **failure** (all) |
| #68 | 2026-10-01 01:24:54 | `997f609` | completed / **failure** |
| #67 | 2026-09-29 02:27:19 | `08df6b3` | completed / **failure** |
| #66 | 2026-09-26 03:36:59 | `32fb9d0` | completed / **failure** |
| #65 | 2026-09-24 01:03:13 | `21086b2` | completed / **failure** |
| #64 | 2026-09-24 01:02:56 | `8555195` | completed / **failure** |

**Every pages.yml run since at least 2026-09-24 has concluded `failure`.**
That alone does not explain the stale bundle — a run can conclude `failure`
and still have committed the rebuilt bundle (see §3). The step-level
breakdown is what matters.

## 3. Step-level breakdown — where each run actually failed

Source: GitHub Actions API, per-run job/step listing (public, unauthenticated
read). One job per run ("Deploy to GitHub Pages").

| Run | Date | checkout@v4 | Build | Commit docs/app | Setup Pages | Job |
|-----|------|-------------|-------|-----------------|-------------|-----|
| #65 | 2026-09-24 | **success** | success | **success** (committed `c1e4c55e`) | **failure** | failure |
| #66 | 2026-09-26 | **success** | success | success (no change, no commit) | **failure** | failure |
| #68 | 2026-10-01 | **success** | success | success (no change, no commit) | **failure** | failure |
| #67 | 2026-09-29 | (no steps listed — see note) | — | — | — | failure |
| #70 | 2026-10-19 | **failure** | skipped | skipped | skipped | failure |
| #73 | 2026-11-04 | **failure** | skipped | skipped | skipped | failure |
| #85 | 2026-11-05 | **failure** | skipped | skipped | skipped | failure |
| #88 | 2026-11-07 | **failure** | skipped | skipped | skipped | failure |
| #89 | 2026-11-10 | **failure** | skipped | skipped | skipped | failure |
| #90 | 2026-11-11 | **failure** | skipped | skipped | skipped | failure |
| #91 | 2026-11-11 | **failure** | skipped | skipped | skipped | failure |
| #92 | 2026-11-11 | **failure** | skipped | skipped | skipped | failure |

**Two separate failures, on different timelines:**

- **Failure A — `actions/checkout@v4` fails (the cause of the stale bundle).**
  Checkout succeeded on 2026-09-24, 2026-09-26, and 2026-10-01. It failed
  on 2026-10-19 and in every run since, including all three Nov 11 runs
  (#90/#91/#92 — the #228, #229, #231 merges). When checkout fails, every
  later step is skipped: no build, no commit, no deploy. **This is why
  `docs/app/` was never rebuilt after #228/#229.** The checkout failure began
  sometime between **2026-10-01 and 2026-10-19**. `pages.yml` was not changed
  in that window (last changed 2026-08-18), so the cause is not a workflow
  edit — it is something external to the file.
- **Failure B — `Setup Pages` (`actions/configure-pages@v4`) fails (NOT the
  cause of the stale bundle).** Setup Pages failed on 2026-09-24, 2026-09-26,
  and 2026-10-01 — every run where checkout succeeded. But the commit step
  runs BEFORE Setup Pages, so the bundle still got rebuilt and committed on
  2026-09-24 (commit `c1e4c55e`) even though the overall run concluded
  `failure`. Failure B prevents the GitHub Pages deployment; it does not
  prevent the bundle rebuild. It is a second, separate problem to fix.

Note on run #67 (2026-09-29): the job lists conclusion `failure` but no steps
in the API response. This is an unexplained data point (the job may have
failed at setup, before any step). It does not change the pattern: checkout
worked on Oct 1 and failed by Oct 19.

## 4. Last `docs/app/` commit (verified)

From `list_commits` on main, path `docs/app/`:

- **Last commit touching `docs/app/`: `c1e4c55e4f4f577f1649e68f2227e00d42718fcc`,
  2026-09-24T01:06:10Z**, by `github-actions[bot]` — "[ROLE: Federation
  Engineer] Rebuild docs/app from frontend/". This is the commit made by run
  #65 (2026-09-24), whose checkout/build/commit steps all succeeded before
  Setup Pages failed. **Claude's "last built 2026-09-24" is confirmed.**
- Previous: `ea89470f` (2026-09-20T23:52:29Z), same rebuild message.
- Before that: `0bdd87b` (2026-08-18), the commit that added the auto-rebuild
  to `pages.yml` (fixing the earlier 15-day stale bundle, 2026-08-03 →
  2026-08-18).

So the committed bundle is the 2026-09-24 build. `frontend/` has changed
since — including the #228 rewire (2026-11-11) and the #229 B0 retire
(2026-11-11) — and none of those changes reached the committed bundle,
because the workflow fails at checkout before it can build.

## 5. Conclusion — WHY the bundle is stale

**Cause (Failure A):** `actions/checkout@v4` fails in every `pages.yml` run
since ~2026-10-01–19. The build step never runs, so `docs/app/` is never
rebuilt and never committed. The workflow's trigger is correct (it fires on
`frontend/**` pushes to main — runs #90/#91/#92 DID trigger on the #228/#229
merges), and the build/commit mechanism is correct in design. The workflow
is not disabled, and its trigger is not the problem. The problem is the
checkout step itself.

**Strongest explanation for the checkout failure:** the checkout step uses
`token: ${{ secrets.PAT || secrets.GITHUB_TOKEN }}`. In GitHub expressions,
`||` returns the left side when it is non-empty. So if `secrets.PAT` is set
(non-empty) but expired or revoked, checkout tries to use the invalid PAT
and fails with an authentication error — and the `|| secrets.GITHUB_TOKEN`
fallback never engages, because the fallback only applies when PAT is empty,
not when it is invalid. The timing fits: the PAT was set up when the Pages
workflow and PAT support were added (2026-06-29, commit `fadd469`) and the
repo's keys were created in late July / early August 2026; a PAT expiring
after ~90 days would lapse in early-to-mid October 2026 — the exact window
(Oct 1–19) when checkout started failing. No workflow file changed in that
window, so the cause is an external credential, not a code change.

**What could NOT be determined (stated plainly):**
- The exact checkout error message. The job logs require admin rights to
  the repo (the logs endpoint returns 403, "Must have admin rights to
  Repository"), and unauthenticated access cannot read them. So I cannot
  confirm the error is "Bad credentials" vs another checkout failure.
- The `secrets.PAT` status (whether it is set, expired, or revoked). Secrets
  cannot be read, and I did not try. The PAT hypothesis is the strongest
  explanation from the timing + the `||` semantics + the fact that no code
  changed, but it is a hypothesis, not a verified fact. It needs the founder
  (or someone with repo admin / secret access) to check the secret's status
  in GitHub → Settings → Secrets and variables → Actions.
- Why run #93 (head `37651d9`, the #232 merge) has been `queued` for ~5.5
  hours without starting. This may be a runner-queue backup or a stuck run;
  it is a separate observation, not part of the stale-bundle cause.

## 6. What the fix would need to be (named, NOT implemented)

**Fix A (the stale bundle — the F0 fix):** restore the checkout step so the
workflow can run. Two options (the founder decides; do not implement here):
- (a) **Rotate `secrets.PAT`:** replace the expired/revoked PAT with a fresh
  one (with the scopes the workflow needs: repo contents read/write, so the
  bot can push the rebuilt `docs/app/` back to main). Then confirm the next
  `pages.yml` run gets past checkout.
- (b) **Drop the custom token:** remove the `token:` line from the checkout
  step so it uses the default `secrets.GITHUB_TOKEN` (automatic, does not
  expire). Note the trade-off: the PAT may have been added for a reason
  (e.g. so the bot's push triggers downstream workflows, or to satisfy
  branch protection). Before choosing (b), confirm why the PAT was introduced
  (commit `fadd469`, 2026-06-29, "add GitHub Pages site, deploy workflow, and
  PAT support") and whether the default token suffices for the push.
- After either fix: confirm by the next `pages.yml` run (or a manual
  `workflow_dispatch`) that checkout, build, and commit all succeed, that
  `docs/app/` gets a new commit, and that the served bundle no longer
  contains "Legacy atlas" or `localhost:8080`. Only then is F0 done.

**Fix B (the Pages deployment — separate, not the stale-bundle cause):**
`Setup Pages` (`actions/configure-pages@v4`) fails in every run where
checkout succeeds. The fix needs the Setup Pages error (from the job logs,
which need admin access). It does not block the bundle rebuild, but it does
block the GitHub Pages deployment. Fix it after Fix A, or alongside it, with
the logs in hand.

**Verification after fixing:** the next `pages.yml` run should show
checkout=success, build=success, commit=success (with a new `docs/app/`
commit), and the served `/app/` bundle should be current. Until that run
succeeds, the frontend is not verified-live (the committed bundle is still
the 2026-09-24 build).

---

## Evidence index

- `.github/workflows/pages.yml` on main (SHA
  `3dfc4c9ae58995ad0dd25ff4ddc1c03aca2e1099`): trigger, build, commit-back,
  deploy steps; checkout uses `token: ${{ secrets.PAT ||
  secrets.GITHUB_TOKEN }}`; last changed 2026-08-18 (`0bdd87b`).
- Run history (GitHub Actions API, `pages.yml` runs, 93 total): runs #90
  (`7665aff`, #228), #91 (`088eb76`, #229), #92 (`5b3f72a`, #231) all
  completed/failure on 2026-11-11; run #93 (`37651d9`, #232) queued.
- Step breakdown (GitHub Actions API, per-run jobs): checkout=success on
  2026-09-24 (#65), 2026-09-26 (#66), 2026-10-01 (#68); checkout=failure on
  2026-10-19 (#70) and every run since. Setup Pages=failure on 2026-09-24,
  2026-09-26, 2026-10-01.
- Last `docs/app/` commit: `c1e4c55e4f4f577f1649e68f2227e00d42718fcc`,
  2026-09-24T01:06:10Z, github-actions[bot], "Rebuild docs/app from
  frontend/".
- Job logs: NOT accessible (403, "Must have admin rights to Repository") —
  the exact checkout error message could not be read.
