# Access — Build This Week (Founder Guide)
**Decision:** Q-002 option B — 2026-10-14  
**Goal:** Browser login as founder without pasting FOUNDER_KEY. FOUNDER_KEY stays for CI and fallback.  
**Done when:** `GET https://thehive.sovereignhive.workers.dev/v11/debug/env` shows `"ACCESS_CONFIGURED": true` and you can open a `/v11/founder/*` route after Access login.

---

## What you are building (plain language)

Cloudflare Access is a **doorbell**.  
Only your email can ring it. After you pass, the Worker trusts you as founder.  
Until the three settings below are filled, the Worker **ignores** Access and keeps using FOUNDER_KEY.

Three plain (non-secret) Worker variables — from `wrangler.jsonc` comments:

| Variable | What it is |
|----------|------------|
| `ACCESS_TEAM_DOMAIN` | Looks like `your-team.cloudflareaccess.com` |
| `ACCESS_AUD` | Audience tag from the Access Application |
| `FOUNDER_EMAIL` | The one email allowed in the policy |

Code treats Access as configured only when **FOUNDER_EMAIL and ACCESS_AUD** are both set (`ACCESS_CONFIGURED`).

---

## Step 0 — What you need

- Cloudflare account that owns the Worker `thehive`
- Your email (the only login you will allow)
- Worker hostname: `thehive.sovereignhive.workers.dev`  
  (If you use a custom domain for the Worker, protect that host instead.)

Phone is OK for dashboard; a second device helps for email one-time PIN.

---

## Step 1 — Open Zero Trust

1. Go to **https://one.dash.cloudflare.com**
2. Select the account that owns THEHIVE
3. If Zero Trust asks to pick a **team name**, set one and save it  
   - You will need: `https://<team-name>.cloudflareaccess.com` → that string is **ACCESS_TEAM_DOMAIN**

---

## Step 2 — Create Access Application

1. Zero Trust → **Access** → **Applications** → **Add an application**
2. Choose **Self-hosted**
3. Fill roughly:
   - **Application name:** `THEHIVE Founder`
   - **Session duration:** e.g. 24 hours (your choice)
   - **Application domain:**  
     - Subdomain / domain as Cloudflare shows for your Worker  
     - Path: protect founder API — prefer path **`/v11/founder`** or **`/v11/founder/*`** if the UI allows path  
     - Host: `thehive.sovereignhive.workers.dev` (or your custom domain)
4. If the UI **cannot** path-scope `workers.dev`, protect the whole Worker host only after you accept that all hits to that host go through Access — or attach a **custom domain** to the Worker and protect that. (Repo comment already warns about this.)

---

## Step 3 — Policy (only you)

1. Add a policy, name e.g. `Founder only`
2. **Action:** Allow  
3. **Include:** Emails → your exact founder email  
4. Save policy and application

**Copy now (write in notes app):**

- Team domain: `__________.cloudflareaccess.com`
- Application **AUD** (Audience): often under application → **Overview** / **Edit** / “Application Audience” / similar — long token string
- Email: the one you allow-listed

---

## Step 4 — Put the three values on the Worker

**Preferred (dashboard, phone-friendly):**

1. Cloudflare dashboard → **Workers & Pages** → **thehive**  
2. **Settings** → **Variables and Secrets** (wording may be “Environment variables”)  
3. For **Production**, add **plain text** variables (not encrypted secrets — repo says these three are plain vars):

| Name | Value |
|------|--------|
| `ACCESS_TEAM_DOMAIN` | `your-team.cloudflareaccess.com` |
| `ACCESS_AUD` | *(paste AUD)* |
| `FOUNDER_EMAIL` | *(your allow-listed email)* |

4. **Save** / **Deploy** so production picks them up

**Alternate (git):** uncomment the `vars` block in `wrangler.jsonc` (see comments near FOUNDER_KEY), fill values, deploy via your normal Worker deploy path. Same three names.

---

## Step 5 — Test

1. Wait ~30–60 seconds after deploy  
2. On phone browser, open a founder route (example pattern from Worker):  
   `https://thehive.sovereignhive.workers.dev/v11/founder/`  
   (If 404 on trailing path, try whatever founder UI path you already use.)
3. You should get **Access login** (email OTP), not only FOUNDER_KEY paste  
4. After login, page should **not** say Access is unrecognized  
5. Check:  
   `https://thehive.sovereignhive.workers.dev/v11/debug/env`  
   Look for `"ACCESS_CONFIGURED": true`

If Access lets you through but Worker shows “doesn’t recognize it yet,” AUD / team domain / email **do not match** the Application — re-copy AUD and FOUNDER_EMAIL carefully (email lowercased in code).

---

## Step 6 — Tell Grok “Access live”

When `ACCESS_CONFIGURED` is true and you logged in once, reply: **Access live**  
Then Q-002 moves fully to ANSWERED and drops off the open pressure list.

---

## What not to do

- Do not put FOUNDER_KEY into chat  
- Do not disable FOUNDER_KEY (CI / fallback)  
- Do not enable money / replication / Queen auto-approve as part of this task  
- Do not mark Q-002 complete until the env probe is true

---

## If stuck (common)

| Symptom | Likely cause |
|---------|----------------|
| Always FOUNDER_KEY only | Vars not deployed to **Production** |
| Access login works, Worker “doesn’t recognize” | Wrong AUD or FOUNDER_EMAIL mismatch |
| Cannot path-scope workers.dev | Use custom domain or accept host-wide Access |
| Team domain unclear | Zero Trust → Settings → team name |

---

*Derived from main `wrangler.jsonc` comments and Worker `ACCESS_CONFIGURED = !!(env.FOUNDER_EMAIL && env.ACCESS_AUD)`.*

