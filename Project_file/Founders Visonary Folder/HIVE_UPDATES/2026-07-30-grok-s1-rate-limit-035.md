# HIVE UPDATE — S1 rate limits on chat + memory write

**Date:** 2026-07-30  
**PR:** #132

## Change

`worker/src/index.js`:

- `POST /v11/command_text` — `rateLimitOk` (30 POSTs / IP / min) before processing
- `POST /v11/memory/remember` — same gate

Same helper already used by arena writes. KV if bound, else D1; fails open on infra errors (anti-spam, not a hard security boundary).

## Security checklist

- Secrets handling changed? no
- New public write endpoint? no
- Keys/secrets in committed files? no
- Irreversible without founder? no

## Next

DID-C · M2 tokens · S2 optional token on command_text · merge PR #132 when ready
