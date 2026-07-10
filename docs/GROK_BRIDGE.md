# Grok Bridge — Setup Guide

**Purpose:** Enable Grok's isolated sandbox to push files to THEHIVE without direct git remote access.
**Mechanism:** Cloudflare Worker token relay → GitHub `repository_dispatch` → `grok-bridge.yml` → commit to `grok-strategist-main`

---

## Architecture

```
Grok's Sandbox                   Cloudflare Worker            GitHub
─────────────────                ─────────────────────        ─────────────────────────────
export GROK_BRIDGE_KEY=...       thehive.workers.dev          THEHIVE repository
                                                                    │
python3 scripts/grok_push.py     GET /v11/bridge/grok-token        │
  │                              (hash-protected)                   │
  │──── fetch GITHUB_TOKEN ─────►  D1: grok_bridge_tokens    (populated by workflow below)
  │◄─── returns github_token ───                                    │
  │                                                                  │
  └──── POST /repos/.../dispatches ─────────────────────────►  grok-bridge.yml (Actions)
                                                                    │
                                                    Checkout grok-strategist-main
                                                    Write files from payload
                                                    git commit + git push
                                                                    │
                                                                    ▼
                                                        Branch: grok-strategist-main
```

**How the token gets into the Worker:** The `grok-pat-distribute.yml` GitHub Actions workflow
(trigger: manual) reads `secrets.PAT` + `secrets.WORKER_ADMIN_KEY` + `secrets.GROK_BRIDGE_KEY`
and POSTs them to the Worker. The Worker stores a SHA-256 hash of `GROK_BRIDGE_KEY` as the
lookup key and the PAT as the value in D1. The raw `GROK_BRIDGE_KEY` is never stored — only its hash.

**Key property:** Grok only needs ONE env var (`GROK_BRIDGE_KEY`). No GitHub PAT needed in
their sandbox. Rotation is done by re-triggering the workflow — zero manual PAT management.

---

## One-Time Setup (User Action Required — do this once)

### Step 0 — Find Your Cloudflare Worker URL and Set It as a Secret

The workflow needs the actual deployed URL of the `thehive` Cloudflare Worker. The URL format
is `https://thehive.{account-subdomain}.workers.dev` — the account subdomain is required and
is unique to your Cloudflare account.

**Find the URL:**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Click on **thehive**
3. Copy the URL shown under the worker name (e.g. `https://thehive.abc123def.workers.dev`)

**If the Worker shows "Not deployed":**
- Option A: In the Cloudflare Dashboard, connect the THEHIVE GitHub repo under **Workers & Pages → thehive → Deployments → Connect Git** — Cloudflare will auto-deploy on every push to `main`
- Option B (one-shot): Run locally from the THEHIVE root: `npx wrangler deploy` (requires `wrangler` and `wrangler login` first)

**Add `WORKER_URL` as a GitHub Actions secret:**
1. Go to: THEHIVE → Settings → Secrets and variables → Actions → **New repository secret**
2. Name: `WORKER_URL` | Value: the full base URL, no trailing slash (e.g. `https://thehive.abc123def.workers.dev`)

**Also share with Grok** (Grok sets this alongside `GROK_BRIDGE_KEY`):
```bash
export WORKER_URL=https://thehive.abc123def.workers.dev
```

### Step 1 — Set Cloudflare Worker Secret

In the Cloudflare Dashboard:
1. Go to: Workers → `thehive` → Settings → Variables
2. Under **Environment Variables**, click **Add variable**
3. Name: `WORKER_ADMIN_KEY` | Type: **Secret** | Value: any 32+ char random string
4. Click **Save**

> This secret authenticates the GitHub Actions workflow writing to the Worker.
> The `thehive` Worker connects to GitHub via Workers Builds (not via Actions CI) —
> you cannot inject this via GitHub; it must be set in the Cloudflare dashboard.

### Step 2 — Set GitHub Actions Secrets in THEHIVE

Go to THEHIVE → Settings → Secrets and variables → Actions → New repository secret:

| Secret name | Value |
|-------------|-------|
| `WORKER_URL` | Full base URL from Step 0 (e.g. `https://thehive.abc123def.workers.dev`) |
| `WORKER_ADMIN_KEY` | Same value you set in Cloudflare (Step 1) |
| `GROK_BRIDGE_KEY` | Any memorable passphrase, e.g. `sovereign-hive-grok-2026` |

> `secrets.PAT` should already exist (Claude's GitHub token). If not, add it too.

### Step 3 — Trigger the Distribution Workflow

1. Go to: THEHIVE → Actions → **"Distribute PAT to Grok Bridge"**
2. Click **Run workflow** → **Run workflow**
3. Wait for the green checkmark

This stores the PAT in the Cloudflare Worker's D1 database, keyed by `GROK_BRIDGE_KEY`.

### Step 4 — Share `GROK_BRIDGE_KEY` with Grok

Tell Grok to set this ONE env var in their sandbox:

```bash
export GROK_BRIDGE_KEY=sovereign-hive-grok-2026   # (or whatever value you chose)
```

To persist across sessions:
```bash
echo 'export GROK_BRIDGE_KEY=sovereign-hive-grok-2026' >> ~/.bashrc
```

Setup is complete. Grok can now push files without any GitHub PAT.

---

## Usage (Grok's Push Workflow — after setup)

### Push a Single File

```bash
# Only GROK_BRIDGE_KEY needed — script auto-fetches the GitHub token
python3 scripts/grok_push.py docs/GAP_ANALYSIS.md \
    --message "Phase 2 gap analysis update"
```

### Push Multiple Files at Once

```bash
python3 scripts/grok_push.py \
    docs/GAP_ANALYSIS.md \
    Project_file/Grok_memory.md \
    docs/STRATEGY.md \
    --message "Session 3 strategist work"
```

### Alternative — Direct PAT (if GROK_BRIDGE_KEY not available)

```bash
GITHUB_TOKEN=ghp_<pat> python3 scripts/grok_push.py docs/GAP_ANALYSIS.md \
    --message "direct push"
```

### Verify the Push Landed

After dispatch:
1. Go to: `https://github.com/TehutiRaEl/THEHIVE/actions`
2. Look for the `Grok Bridge — Sandbox Sync Receiver` workflow run
3. When green: check `grok-strategist-main` for the commit

```bash
# From THEHIVE checkout:
git fetch origin grok-strategist-main
git log origin/grok-strategist-main --oneline | head -5
```

---

## File Path Rules

- Paths must be relative to the THEHIVE repo root (e.g., `docs/GAP_ANALYSIS.md`)
- No absolute paths (starting with `/`)
- No directory traversal (`../`)
- The workflow will skip unsafe paths with a warning, not fail

---

## Rotating the PAT

1. Re-trigger **"Distribute PAT to Grok Bridge"** workflow in THEHIVE Actions
2. That's it — new PAT is stored in Worker D1; Grok's `GROK_BRIDGE_KEY` doesn't change

---

## Integration with git Workflow

Grok's `grok-strategist-main` is Grok's working branch.
The canonical cross-team branch is `claude/session-continuation-owj5wr`.

**Merge workflow:**
1. Grok pushes to `grok-strategist-main` via this bridge
2. Claude or the user reviews changes on that branch
3. Claude cherry-picks or merges relevant files into `claude/session-continuation-owj5wr`

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| Workflow step 1 fails: `secrets.WORKER_URL` missing | `WORKER_URL` secret not set in GitHub | Follow Step 0 above to find deployed URL and add secret |
| `curl exit code 6` (DNS resolution failure) | Wrong Worker URL or Worker not deployed | Verify URL in Cloudflare Dashboard; deploy Worker if needed |
| `GROK_BRIDGE_KEY not registered in Worker` | Workflow hasn't run yet, or wrong key | Trigger `grok-pat-distribute.yml` from THEHIVE Actions |
| `Worker returned HTTP 403` | `WORKER_ADMIN_KEY` mismatch | Verify both Cloudflare secret and GitHub secret use same value |
| `Worker returned HTTP 401` | `X-Grok-Key` missing | Ensure `GROK_BRIDGE_KEY` env var is set |
| `HTTP 401` on dispatch | PAT invalid or expired | Re-trigger distribution workflow to refresh |
| `HTTP 403` on dispatch | PAT missing `repo` scope | Add `repo` scope to PAT, re-trigger workflow |
| `HTTP 404` on dispatch | Wrong repo URL | Verify REPO constant in script is `TehutiRaEl/THEHIVE` |
| `Network error` | Sandbox has no outbound HTTPS | Check sandbox network policy |
| No commit made | Files already identical to branch | Not an error — workflow reports "No changes" |

---

## Security Model

| Concern | Mitigation |
|---------|------------|
| PAT never committed to git | Stored in D1 only; written via HTTPS in CI |
| D1 write protected | `WORKER_ADMIN_KEY` required (Cloudflare secret, never in code) |
| D1 read protected | SHA-256 hash of `GROK_BRIDGE_KEY` as lookup key; raw key never stored |
| Token in transit | HTTPS only — Cloudflare Workers enforce TLS |
| Compromised `GROK_BRIDGE_KEY` | Only exposes GitHub PAT; rotate by re-triggering workflow |

---

*Bridge infrastructure maintained by Claude (System Architect). Questions → Project_file/Claude_memory.md.*
*Grok usage notes → Project_file/Grok_memory.md.*
