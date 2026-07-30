# DID / Self-Sovereign Identity — Near-Term Spike Outline (D7)

**Author:** Grok (Strategist + Detective)  
**Date:** 2026-07-29  
**PR:** #132  
**Decision:** D7 = near-term (after security basics). Security deep pass is documented; this is the **plan**, not a full login product.

---

## Plain language

**DID** (Decentralized Identifier) = an ID a person or agent can control without only “logging in with Google.”  
**VC** (Verifiable Credential) = a signed claim (“this agent is in colony X”) that others can check.  
**SSI** = the broader idea: you hold the keys; platforms verify proofs instead of owning your identity forever.

Today THEHIVE edge auth is mainly:

- Visitor tokens (anti-spam)
- Founder key (high-stakes decisions)
- Admin / bridge keys (ops)

DID does **not** replace founder-key for irreversible hive law in phase 1. It **adds** a path toward agent/human identity that is portable and cryptographically checkable.

---

## What already exists in the repo (detective)

Prior sessions and docs have **discussed** DID/VC/SSI (strategy, vision, Grok memory themes). The **live Worker** does not currently implement `did:key` issuance, VC verification, or DID-based login as a product surface. Treat full “SSI is live” claims as **vision unless a route is proven in `worker/src/index.js`**.

Baseline to build on: fail-closed `FOUNDER_KEY`, token gates, CORS allowlist, no secret values on `/debug/env`.

---

## Near-term goal (spike, not platform)

Prove **one thin, honest path**:

1. Generate or accept a **`did:key`** (key material never logged).  
2. Sign a **tiny proof** (e.g. challenge nonce).  
3. Verify that proof on the edge **or** in a documented offline script.  
4. Report capability honestly in UI/docs (“experimental / not production login”).

Out of scope for the spike: multi-user OAuth replacement, full W3C wallet UX, on-chain anchoring, replacing FOUNDER_KEY.

---

## Recommended method for the spike: `did:key`

| Why `did:key` | Why not others first |
|---------------|----------------------|
| No ledger required | `did:web` needs domain + HTTPS well-known hosting |
| Fits edge crypto (Web Crypto) | `did:ion` / network methods need external infra |
| Good for agents + founder tools | Heavy wallets before product need |

Later: `did:web` for `thehive…` origin if you want a public resolvable DID for the Queen.

---

## Spike stages

| Stage | Deliverable | Gate |
|-------|-------------|------|
| **D0** | This outline (done) | — |
| **D1** | Spec note: challenge-response shape, what is stored vs never stored | Docs |
| **D2** | Minimal verify helper (Worker route **or** script) for a fixed test vector | Founder OK to add experimental route |
| **D3** | Optional UI: “experimental identity” panel, no fake “logged in as DID” unless verify succeeds | Honesty |
| **D4** | Decision: park, or promote to real auth factor alongside founder key | Founder |

Any **new** state-changing route from this work defaults to **founder-key** or stays read-only/experimental (D5).

---

## Security rules for the spike

- Never commit private keys or seed phrases.  
- Never put real PATs inside DID documents.  
- Experimental endpoints: rate-limit; label clearly; prefer no persistence of private material.  
- Public DID documents contain **public** keys only.  
- Founder decide / deploy / money paths stay on existing founder/admin gates until an explicit redesign.

---

## How this fits the hive constitutionally

- **F-001 Data sovereignty:** user/agent keys not harvested into open logs.  
- **Autonomy:** identity not solely rented from a social login vendor.  
- **Honesty:** UI must not claim SSI login until verify path is real.

---

## Founder choices when ready to code

| ID | Choice |
|----|--------|
| **DID-A** | Docs-only through D1, then stop |
| **DID-B** | D2 verify helper on Worker under `/v11/experimental/...` (read-mostly) |
| **DID-C** | Offline script in repo only (no edge route yet) |

**Recommendation:** DID-A now is already satisfied by this file; next code session pick **DID-C** (safest) or **DID-B** if you want edge visibility.

---

## Campaign handoff

**This session:** D0 outline complete.  
**Next session options:** DID-B/C implementation · A11y 1–2 · F1 Orbitron load cleanup · S1 rate limits · M2 token usage.
