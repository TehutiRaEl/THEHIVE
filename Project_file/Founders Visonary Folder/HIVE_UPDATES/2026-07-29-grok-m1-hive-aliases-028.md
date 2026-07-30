# HIVE UPDATE — M1 `--hive-*` CSS aliases

**Date:** 2026-07-29  
**PR:** #132

## Change

`frontend/src/index.css` `:root` now includes canonical `--hive-*` variables aligned with Tailwind Kai EL OS colors (void, yale, cyan, gold, violet, text, danger, success). Legacy `--color-*` / `--bg-*` vars **unchanged** so existing CSS does not break.

## Security checklist

- Secrets handling changed? no
- New public write endpoint? no
- Keys/secrets in committed files? no
- Irreversible without founder? no

## Next session starts at

- M2 (optional): one small component uses `--hive-*` only **or**
- A11y pass 1–2 **or**
- Security deep pass (recommended before DID) **or**
- DID spike outline

Default recommendation: **Security deep pass** (campaign Session 4 track).
