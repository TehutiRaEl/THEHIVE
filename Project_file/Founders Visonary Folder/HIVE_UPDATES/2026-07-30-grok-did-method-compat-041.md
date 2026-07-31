# HIVE UPDATE — DID method compatibility

**Date:** 2026-07-30  
**PR:** #133

## Shipped

- `docs/DID_METHOD_COMPATIBILITY.md` — Core vs method-specific, comparison table, key-format footguns, resolver errors, SIOP/VP implications, hive allowlist policy

## Recommendation

Allowlist did:key now; did:web next; no implicit multi-method acceptance.

## Security checklist

- Secrets handling changed? no
- New public write endpoint? no
- Keys/secrets in committed files? no
- Irreversible without founder? no
