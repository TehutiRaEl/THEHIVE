# FLIP_THE_SWITCHES — everything built and waiting on a founder switch

> The pattern: the code ships live and degrades honestly (`available:false`, "key needed",
> `vectorize_bound:false`) until you provision the resource. Nothing pretends. Each switch
> below is one-time; the feature lights up on the next deploy/heartbeat with zero code changes.
> All of these run from the repo root with `npx wrangler …` logged into the hive's Cloudflare
> account (`npx wrangler login` once, in a terminal — not something the hive can or should do).

## 1 · Sovereign memory (Vectorize) → "Vectorize memory bound: true"

```bash
npx wrangler vectorize create hive-memory --dimensions=768 --metric=cosine
```
Then uncomment the `"vectorize"` block in `wrangler.jsonc`, commit, push.
**Proof it worked:** `GET /v11/memory/status` → `vectorize_bound: true`; memory fills on the
next heartbeat; Kai El starts recalling past exchanges in the commune.

## 2 · Files store (R2) → the Files panel uploads/lists for real

```bash
npx wrangler r2 bucket create hive-files
```
Then uncomment the `"r2_buckets"` block in `wrangler.jsonc`, commit, push.
**Proof:** `GET /v11/files` → `available: true`; the Files panel shows the Upload button
working (visitor-token gated, 10 MB cap).

## 3 · Extra model voices → Claude / Groq / Mistral read "online"

The Worker already routes the commune through a waterfall (Claude → Groq → Mistral →
Workers AI). Each provider activates the moment its key exists as a Worker secret:

```bash
npx wrangler secret put ANTHROPIC_API_KEY   # Claude — reasoning
npx wrangler secret put GROQ_API_KEY        # Groq — speed
npx wrangler secret put MISTRAL_API_KEY     # Mistral
```
No config edit needed — secrets bind on the next deploy.
**Proof:** `GET /v11/llm/status` → the provider's `bound: true`; the Connected Models panel
flips it from "key needed" to "online"; Kai El's replies return `provider: "claude"` (or
whichever is highest in the waterfall).

Keys live only as Cloudflare secrets — never in the repo, never echoed back (F-001: the
debug surface reports names/presence only).

## 4 · Founder key → the Proposals panel can actually approve/reject

The hive can now draft standing suggestions ("Proposals" in the left nav) — new
implementations, goals, changes it thinks are worth doing. Nothing is ever applied on its own;
every item waits for your explicit approve/reject. That decision endpoint is deliberately
**fail-closed**: with no key bound, nobody — not even you, from the UI — can decide anything,
rather than defaulting to "anyone can."

```bash
npx wrangler secret put FOUNDER_KEY   # pick any strong random value yourself
```
Then paste that same value into the Proposals panel's key field (stored only in your
browser's localStorage, never sent anywhere except the `Authorization` header on decide calls).
**Proof:** `GET /v11/proposals` → `founder_auth_bound: true`; Approve/Reject buttons work.

## Already flipped / no switch needed
- D1 database, Workers AI, assets, the 30-min heartbeat — live now.
- The UI (graph web, neon theme, Updates, Legal Learning, Files panel shell) — ships with
  the frontend build; no provisioning.

*2026-07-17 — written alongside the audit-driven Command Center update. When you flip one,
tell the hive and it will re-probe and confirm from the live surface, not assume.*
