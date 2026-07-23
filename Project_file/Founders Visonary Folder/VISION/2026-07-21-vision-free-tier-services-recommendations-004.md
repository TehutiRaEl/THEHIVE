# Free-tier services still on the table (2026-07-21)

Written alongside the Phase 8 implementation pass (PR #129: CORS scoping, pagination, Cache
API, KV, Queues). The founder asked for a plain accounting of what that pass actually built,
plus a survey of other free software/services offered by the platforms already in use
(Cloudflare, GitHub) that the hive hasn't picked up yet. This doc is the survey; the "what it
does" explanation went to the founder directly in-session (and is summarized in the Phase 8
section of `memory/planning/2026-07-19-unified-forward-plan.md`).

## Already adopted (for contrast — do not re-recommend these)

D1, Workers AI, R2 (code-ready, awaiting bucket creation), Vectorize (code-ready, awaiting
index creation), Cron Triggers (the 30-min heartbeat), Cloudflare Workers Builds (CI/CD from
`main`), the Cache API, KV, and Queues (all landed in PR #129, KV/Queues awaiting a namespace/
queue creation each — see `FLIP_THE_SWITCHES.md`).

## Cloudflare — real candidates, not yet used

- **Turnstile** (free CAPTCHA replacement, no tracking/friction). The strongest single
  recommendation here: `/v11/auth/token` currently issues a token to anyone who asks, and the
  only anti-abuse layer downstream is the 30-req/min IP rate limit. Turnstile would let a
  write-heavy endpoint (or token issuance itself) require a passed challenge before D1 ever
  gets touched, at zero cost and without the privacy cost of a tracking CAPTCHA.
- **Durable Objects** (now on the free plan, with limits). Relevant specifically because the
  new KV-backed rate limiter (PR #129) trades strict correctness for speed — KV reads are
  eventually consistent across edge locations, so a determined burst could briefly exceed
  30/min. A Durable Object per-IP would give a genuinely atomic counter if that gap ever
  matters more than it does today (current traffic doesn't justify the added complexity yet —
  flagging for later, not recommending now).
- **Workers Analytics Engine** (free, generous cardinality). A better fit than the `hive_pulse`
  D1 table for high-frequency, low-value-per-row telemetry (per-request latency, per-provider
  LLM call counts) — write-only, queryable via SQL, doesn't compete with D1 for the actual
  hive-state reads. Worth adopting once there's real traffic to analyze; premature today.
- **Web Analytics** (free, cookieless, no client-side JS beacon needed on `docs/`). Real
  visitor counts for the Command Center itself — currently the hive has zero visibility into
  how many people actually load it. Lowest-effort item on this list: it's a script tag or a
  proxy-based zero-JS mode, no backend change.
- **Email Workers** (free, route inbound mail to a Worker / send outbound via a Workers binding).
  Would let the hive receive founder directives by email, or send the Updates-channel digest
  as an actual email instead of only living in the UI panel — a real second channel for the
  hive→founder relationship FABLE_DNA already describes, not built yet.
- **D1 Time Travel** — already on by default (30-day point-in-time recovery), no action needed.
  Noting it here only so it's known to exist rather than assumed absent.
- **Browser Rendering API** (Puppeteer-on-Workers, free tier). Could let the Worker itself take
  a screenshot or generate a PDF (e.g. a rendered Scribe-Pro/copywriting deliverable, or a
  visual Arena snapshot) without a separate service. Lower priority: the existing
  GitHub-Actions-runner-as-eyes-on-production pattern already solves the "the sandbox can't
  reach `*.workers.dev`" problem for verification purposes; this would be for a genuinely new
  feature (rendered output), not a fix to anything broken.

## GitHub — real candidates, not yet used

- **Dependabot alerts + version updates** (free for all repos). No dependency-vulnerability
  scanning currently runs anywhere in the 10-repo federation. Turning this on is a one-click
  repo setting, zero code change, and directly closes a real security gap.
- **CodeQL / code scanning** (free for public repos, which several of the 10 are). Static
  analysis for the JS/Python across the federation — nothing currently runs this. Would catch
  a class of bug (injection, unsafe eval, etc.) that manual review and `fable-debugger` don't
  systematically sweep for.
- **Branch protection rules** (free). Not yet configured on `main` for THEHIVE per the repo
  settings observed this session — required-status-checks-before-merge would make the
  `ui-live-probe`/`CI`/`edge-health-probe` checks actually gate merges instead of being purely
  informational.

## Deliberately not recommended (checked, real reason to skip)

- Cloudflare Pages — redundant; the Worker already serves `docs/` as static assets via the
  `assets` binding in `wrangler.jsonc`, same origin as the API. Moving to Pages would add a
  second deploy target for no benefit.
- Cloudflare Access / Zero Trust — real free tier exists (up to 50 users), but the current
  admin surface (`WORKER_ADMIN_KEY`, `FOUNDER_KEY`) is a one-person operation; Access solves a
  multi-user-team access problem the hive doesn't have yet. Revisit if/when the founder adds
  collaborators.

## Sequencing note

None of these are scheduled into a Phase yet — this is a catalogue, same honest treatment as
the Commercial Hive blueprint's deferred items and Phase 8's JWT-auth catalogue entry. Turnstile
and Dependabot are the two with the best cost/benefit (real gap closed, ~zero implementation
cost) if the founder wants either picked up next.
