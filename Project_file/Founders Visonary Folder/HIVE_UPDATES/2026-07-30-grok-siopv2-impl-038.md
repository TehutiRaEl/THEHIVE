# HIVE UPDATE — SIOPv2 implementation exploration

**Date:** 2026-07-30  
**PR:** #133

## Shipped

- `docs/SIOPV2_IMPLEMENTATION.md` — roles, same/cross-device flows, request params, ID Token validation, subject syntax (JWK thumbprint vs DID), RP metadata options, security checklist, hive ladder vs DID-C/B

## Recommendation

Do not implement full SIOPv2 RP yet; keep DID-C/DID-B as the thin path.

## Security checklist

- Secrets handling changed? no
- New public write endpoint? no
- Keys/secrets in committed files? no
- Irreversible without founder? no
