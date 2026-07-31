# HIVE UPDATE — DID authentication methods investigation

**Date:** 2026-07-30  
**PR:** #133

## Shipped

- `docs/DID_AUTHENTICATION_METHODS.md` — challenge-response core, verification relationships, did:key/web/ledger tradeoffs, SIOPv2/OpenID4VP/DIDComm map, hive ladder vs FOUNDER_KEY

## Security checklist

- Secrets handling changed? no
- New public write endpoint? no
- Keys/secrets in committed files? no
- Irreversible without founder? no

## Recommendation

Stay on DID-C offline until founder green-lights DID-B experimental Worker verify.
