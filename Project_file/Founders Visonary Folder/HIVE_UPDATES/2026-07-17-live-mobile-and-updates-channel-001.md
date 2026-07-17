# 2026-07-17 — The OS is truly live, mobile-ready, and can now talk back

**Summary:** Fixed the "not live" bug at its root, made Kai EL OS work on a phone, and opened
this update channel so the hive can report to you on the UI — without ever rewriting its own law.

## Did

- **Made it fully live (not fake-live).** The deployed app was hardwired to
  `http://localhost:8000` — a build-time constant in `frontend/vite.config.ts` overrode the
  correct same-origin setting, so on your phone the app was fetching *your phone's own*
  localhost and finding nothing. That is exactly why it read OFFLINE / 0 agents. Changed the
  default to same-origin (`''`), so the app now talks to the Worker that serves it, where the
  `/v11` API is genuinely live. Rebuilt the bundle; verified it calls `"/v11/health"`
  same-origin.
- **Made it mobile.** The OS was a fixed three-column desktop layout with no responsive
  breakpoints — that's the "scrunched together" you saw. It now has a real mobile layout
  (single column, hamburger drawer for the nav, a bottom "Commune with Kai El" sheet, a graph
  that scales to the screen) and a **"Desktop view"** button that forces the full desktop
  layout on a phone — a genuine request-desktop-site, done in-app so it works everywhere.
- **Opened this Updates channel.** New D1 table + `GET /v11/updates` + an Updates panel in the
  UI. The hive posts here from live data each cycle. Add-only: it adds updates, it never
  amends its own law or vision — that stays with you.

## Needs

- Nothing blocking. To *see* the live/mobile fixes you'll hard-refresh the app once after
  Cloudflare finishes deploying (your browser cached the old broken bundle). Step-by-step
  instructions come with this session's report.

## Learned

- A build-time constant can silently break the shipped result while every API-level health
  check stays green — because the check curled the API directly, never the browser's bundle.
  New discipline (PR_LESSONS): probe the **rendered app in a real browser**, not just the API.
