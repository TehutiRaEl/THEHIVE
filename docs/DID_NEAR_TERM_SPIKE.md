# DID / Self-Sovereign Identity — Near-Term Spike Outline (D7)

**Author:** Grok (Strategist + Detective)  
**Updated:** 2026-07-30  
**PR lane:** #133 (`grok/pr-133-s1-did`) / continues #132 workstream  
**Decision:** D7 = near-term (after security basics).

---

## Plain language

**DID** = an ID controlled with keys (not only “log in with Google”).  
**VC** = a signed claim others can check.  
**SSI** = you hold keys; others verify proofs.

Today THEHIVE edge auth is mainly visitor tokens, founder key, admin/bridge keys.

---

## Spike stages

| Stage | Deliverable | Status |
|-------|-------------|--------|
| **D0** | Outline | Done |
| **D1** | Spec note | Done (this doc + security rules) |
| **DID-C / D2 offline** | `scripts/did-c/did_key_spike.mjs` | **Done** |
| **DID-B** | Optional experimental Worker route | Queued (founder OK) |
| **D3** | Optional experimental UI panel | Later |
| **D4** | Park or promote | Founder |

---

## Security rules

- Never commit private keys or seed phrases.  
- Never put PATs inside DID documents.  
- Experimental endpoints: rate-limit; label clearly.  
- Founder decide / deploy / money stay on existing gates.

---

## Run offline spike

```bash
node scripts/did-c/did_key_spike.mjs
```

See `scripts/did-c/README.md`.
