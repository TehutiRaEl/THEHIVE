# HIVE UPDATE — F1 single font load path

**Date:** 2026-07-30  
**PR:** #132

## Change

`frontend/index.html`: removed Google Fonts stylesheet that duplicated Orbitron and pulled unused Rajdhani/Inter/Fira Code. Kept preconnect. Families continue to load from `src/index.css` @import (Cinzel + Exo 2 + Orbitron).

## Security checklist

- Secrets handling changed? no
- New public write endpoint? no
- Keys/secrets in committed files? no
- Irreversible without founder? no

## Note

Redeploy / `build:app` refreshes `docs/app/index.html` from this source.

## Next

S1 rate limits · DID-B/C · M2 tokens · F2 self-host fonts (optional)
