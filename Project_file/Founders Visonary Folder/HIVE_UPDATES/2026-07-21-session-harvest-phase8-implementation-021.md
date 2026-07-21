# 2026-07-21 — Session harvest: Phase 8 implementation (PR #129)

**Summary:** Applied the session-harvest ownership gate to this session's own verified work
(PR #129, branch `claude/fable-5-handoff-setup-vefwlb`): built out all four Phase 8 items
that PR #128's audit only planned — CORS scoping, list-endpoint pagination, Cache API, KV,
and Queues — plus resolved the `.env.example` discrepancy the founder raised directly. All
code, no external source copied in; the KV/Queues additions follow the exact commented-
binding pattern this session already established for Vectorize/R2, applied to two new
resource types rather than invented fresh.

## Did

- **Closed all four Phase 8 goals in `worker/src/index.js`**, each `node --check`-verified
  after every edit rather than batched to the end: CORS scoping (`corsHeadersFor()` replacing
  a wildcard, computed fresh per-request inside `fetch()`'s closure — deliberately avoiding a
  Workers-isolate shared-state leak), pagination (`pageParams()` across 7 list routes),
  Cache API (`cachedJson()` wrapping 3 rarely-changing GET routes, caching only the JSON body
  so a cached entry can never leak one origin's CORS header to another origin's request for
  the same URL), and Queues (`/v11/venture/plan` + `/v11/legal/research` gain an additive,
  opt-in `{"async": true}` path — the existing synchronous behavior is completely unchanged,
  so no frontend edit was required).
- **Migrated the rate limiter to prefer KV over D1** (`rateLimitOk()`) — a real architectural
  improvement (KV's textbook counter+TTL use case, skips a D1 round-trip) rather than KV
  adopted for its own sake; falls back to the original D1 implementation when unbound.
- **Resolved the founder's `.env.example` claim with live evidence, not a guess.** `git log`
  showed the file predates this session's entire Worker-era codebase (last touched
  2026-06-30) — directly contradicting "I just updated the file." Rather than silently
  editing it to *look* like it powers the live Worker, added an explicit scope header, created
  `.dev.vars.example` (the file that actually matters for Cloudflare Workers secrets), and
  proved via a live `edge-health-probe` GitHub Actions run that zero LLM provider secrets are
  currently bound (`secrets_present: []`) — the honest answer, delivered with evidence.
- **Extended `wrangler.jsonc` and `FLIP_THE_SWITCHES.md`** with two new founder-only
  activation switches (§5 KV, §6 Queues), matching the exact format of the existing four.
- **Surveyed unused free-tier services** on both platforms already in use (Cloudflare,
  GitHub) and wrote the recommendations to a new VISION entry
  (`2026-07-21-vision-free-tier-services-recommendations-004.md`), explicitly separating real
  candidates (Turnstile, Dependabot, Durable Objects, Analytics Engine, Web Analytics, Email
  Workers, CodeQL) from items deliberately ruled out with a stated reason (Pages, Access).

## Learned

- **"Additive, opt-in" is the right default when extending a working synchronous endpoint
  with an async capability.** Queues could have been wired as a wholesale replacement for the
  synchronous LLM call path in `/v11/venture/plan`/`/v11/legal/research`, but that would have
  broken the existing frontend contract (`VenturePlanner.tsx` and the Legal-Learning panel
  both expect an immediate answer) for a capability neither currently needs. Keeping the
  default path untouched and gating the new path behind an explicit `{"async": true}` opt-in
  got the real capability shipped with zero risk to what already works — worth generalizing
  as a standing preference whenever a new capability could plausibly replace, rather than
  extend, a path something already depends on.
- **Founder claims about local config files should be checked against `git log`/`git blame`
  before being taken as ground truth, especially across the System A/B boundary.** This is
  the second time this exact category of mismatch has surfaced (a file the founder believed
  was wired to the live system turned out to belong to the unprovisioned System A instead) —
  worth flagging explicitly rather than re-discovering from scratch next time a similar claim
  comes in.
- **The commented-binding "flip the switch" pattern generalizes cleanly to any Workers
  resource type**, not just the two (Vectorize, R2) it was first built for — applied here to
  KV and Queues with zero adaptation needed. Confirms it's a real reusable pattern, not a
  one-off.

## Needs

- Founder review + merge of PR #129 (subscribed to its activity; CI green as of this pass —
  `CI`, `Colony Health Matrix`, `Governance Advisory Check` all passed).
- Founder-only activation (Tier 3, requires Cloudflare account login this session doesn't
  have): `npx wrangler kv namespace create RATE_LIMIT_KV` and
  `npx wrangler queues create hive-llm-jobs`, then uncomment the matching block in
  `wrangler.jsonc` — see `FLIP_THE_SWITCHES.md` §5-6.
- Founder decision on which (if any) of the free-tier recommendations to schedule next —
  Turnstile and GitHub Dependabot are flagged as the best cost/benefit of the batch.
- The rest of the master plan (Phase 1 onward) remains open and untouched by this pass.
