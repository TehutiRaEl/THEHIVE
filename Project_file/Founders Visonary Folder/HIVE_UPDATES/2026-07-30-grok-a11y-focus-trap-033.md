# HIVE UPDATE — A11y-4 focus traps

**Date:** 2026-07-30  
**PR:** #132

## Changes

- New `frontend/src/hooks/useFocusTrap.ts`
- Observatory, BiosystemOverlay, GatewayConsoleOverlay: dialog semantics + focus trap + focus restore
- Observatory: explicit Close control for keyboard users

## Security checklist

- Secrets handling changed? no
- New public write endpoint? no
- Keys/secrets in committed files? no
- Irreversible without founder? no

## A11y baseline 1–4 complete

Next campaign options: F1 fonts · S1 rate limits · DID-B/C · M2 tokens · graph keyboard nav
