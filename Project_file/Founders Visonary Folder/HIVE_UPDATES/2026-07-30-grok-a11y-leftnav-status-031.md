# HIVE UPDATE — A11y 1–2 (LeftNav + TopStatusBar)

**Date:** 2026-07-30  
**PR:** #132

## Changes

- `LeftNav.tsx`: `<nav>` landmark, primary/secondary groups, `aria-label` / `aria-current` on items, command input labels, decorative icons `aria-hidden`
- `TopStatusBar.tsx`: `<header role="banner">`, polite live status for LIVE/OFFLINE, button `aria-label`s
- `docs/A11Y_PERF_BASELINE.md` updated

## Security checklist

- Secrets handling changed? no
- New public write endpoint? no
- Keys/secrets in committed files? no
- Irreversible without founder? no

## Next

A11y-3 reduced-motion · a11y-4 focus traps · F1 fonts · S1 rate limits · DID-B/C · M2 tokens
