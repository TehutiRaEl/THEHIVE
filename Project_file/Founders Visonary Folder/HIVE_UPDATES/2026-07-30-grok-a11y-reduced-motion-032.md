# HIVE UPDATE — A11y-3 reduced motion

**Date:** 2026-07-30  
**PR:** #132

## Change

`frontend/src/index.css`: `@media (prefers-reduced-motion: reduce)` collapses animation/transition durations and disables Tailwind `animate-pulse` / `animate-fadeIn` / `animate-slideIn` for users who request reduced motion.

## Security checklist

- Secrets handling changed? no
- New public write endpoint? no
- Keys/secrets in committed files? no
- Irreversible without founder? no

## Next

A11y-4 focus traps · F1 fonts · S1 rate limits · DID-B/C · M2 tokens
