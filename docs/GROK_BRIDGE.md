# Grok Bridge — Setup Guide

**Purpose:** Enable Grok's isolated sandbox to push files to THEHIVE without direct git remote access.
**Mechanism:** GitHub `repository_dispatch` → `grok-bridge.yml` workflow → commit to `grok-strategist-main`

---

## Architecture

```
Grok's Sandbox                          GitHub
─────────────────                       ────────────────────────────────────
Local files                             THEHIVE repository
     │                                       │
     │  python3 scripts/grok_push.py         │
     │  GITHUB_TOKEN=<pat> ...               │
     │                                       │
     └──── POST /repos/TehutiRaEl/THEHIVE/dispatches ──►  grok-bridge.yml (Actions)
                                                                │
                                             (workflow runs)    │
                                                                ▼
                                                    Checkout grok-strategist-main
                                                    Write files from payload
                                                    git commit + git push
                                                                │
                                                                ▼
                                                    Branch: grok-strategist-main
```

**Key property:** Grok's PAT only makes the dispatch call. The actual repo write uses
`secrets.GITHUB_TOKEN` server-side — Grok never has direct push access.

---

## One-Time Setup (User Action Required)

### Step 1 — Create a GitHub Classic PAT for Grok

1. Go to: `https://github.com/settings/tokens/new`
2. Name: `grok-sandbox-bridge`
3. Expiration: 90 days (rotate quarterly)
4. **Required scope:** `repo` — *Full control of private repositories*
   - This scope is needed to send `repository_dispatch` events
5. Click "Generate token" — copy the token immediately (shown once only)

### Step 2 — Set the PAT in Grok's Sandbox

In Grok's terminal session:

```bash
export GITHUB_TOKEN=ghp_<your-token-here>
```

To persist across sessions (add to sandbox profile):
```bash
echo 'export GITHUB_TOKEN=ghp_<your-token-here>' >> ~/.bashrc
```

> **Security:** Never commit the PAT to any file. Always set it as an environment variable.

### Step 3 — Verify Setup

From Grok's sandbox:

```bash
# Verify Python is available (3.6+ required, no pip install needed)
python3 --version

# Dry-run the push script (no files yet — just check the help)
python3 scripts/grok_push.py --help
```

---

## Usage

### Push a Single File

```bash
GITHUB_TOKEN=<pat> python3 scripts/grok_push.py docs/GAP_ANALYSIS.md \
    --message "Phase 1 gap analysis update"
```

### Push Multiple Files at Once

```bash
GITHUB_TOKEN=<pat> python3 scripts/grok_push.py \
    docs/GAP_ANALYSIS.md \
    Project_file/Grok_memory.md \
    docs/STRATEGY.md \
    --message "Session 2 strategist work"
```

### Verify the Push Landed

After dispatch:
1. Go to: `https://github.com/TehutiRaEl/THEHIVE/actions`
2. Look for the `Grok Bridge — Sandbox Sync Receiver` workflow run
3. When green: check `grok-strategist-main` for the commit

```bash
# From THEHIVE checkout, verify files appeared:
git fetch origin grok-strategist-main
git log origin/grok-strategist-main --oneline | head -5
```

---

## File Path Rules

- Paths must be relative to the THEHIVE repo root (e.g., `docs/GAP_ANALYSIS.md`, not `/home/grok/docs/GAP_ANALYSIS.md`)
- No absolute paths (starting with `/`)
- No directory traversal (`../`)
- The workflow will skip unsafe paths with a warning, not fail

---

## Integration with git Workflow

Grok's `grok-strategist-main` branch is Grok's working branch.

The canonical cross-team branch is `claude/session-continuation-owj5wr`.

**Workflow for merging Grok's work into the team branch:**
1. Grok pushes to `grok-strategist-main` via this bridge
2. Claude or the user reviews the changes on that branch
3. Claude cherry-picks or merges relevant files into `claude/session-continuation-owj5wr`
4. PR #33 (or current open PR) gets updated

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `HTTP 401` | PAT invalid or expired | Regenerate PAT at github.com/settings/tokens |
| `HTTP 403` | PAT missing `repo` scope | Recreate PAT with `repo` scope checked |
| `HTTP 404` | Wrong repo URL or PAT has no access | Verify REPO constant in script is `TehutiRaEl/THEHIVE` |
| `Network error` | Sandbox has no outbound HTTPS | Check sandbox network policy |
| Workflow fails | `PAT` secret not set in THEHIVE | User must add `PAT` in THEHIVE Settings → Secrets |
| No commit made | Files already identical to branch | Not an error — workflow reports "No changes" |

---

## Rotating the PAT

1. Create a new PAT at github.com/settings/tokens
2. Update in Grok's sandbox: `export GITHUB_TOKEN=ghp_<new-token>`
3. Update in THEHIVE secrets if used there: Settings → Secrets and variables → Actions → PAT

---

*Bridge infrastructure maintained by Claude (System Architect). Questions → Project_file/Claude_memory.md.*
*Grok usage notes → Project_file/Grok_memory.md.*
