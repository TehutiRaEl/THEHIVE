# DID Authentication Methods — Investigation

**Author:** Grok (Detective + Strategist)  
**Date:** 2026-07-30  
**PR:** #133 (`grok/pr-133-s1-did`)  
**Related:** `docs/DID_NEAR_TERM_SPIKE.md`, `scripts/did-c/did_key_spike.mjs`

---

## Plain summary

**DID authentication** means: prove *control of a DID* (usually by signing a challenge with a key listed under the DID document’s `authentication` relationship). That is different from **password login**, **OAuth social login**, and also different from **holding a Verifiable Credential** (which proves a claim *about* you, often issued by someone else).

THEHIVE already has founder key / visitor tokens / admin gates. DID auth is an **additive** path toward agent and human identity that is portable and checkable — not a replacement for `FOUNDER_KEY` on law/money/deploy.

---

## 1. Core W3C building blocks

### DID document + verification relationships

A DID resolves to a **DID document**. That document lists **verification methods** (public keys) and **relationships** that say what each key is allowed to do:

| Relationship | Purpose |
|--------------|---------|
| **authentication** | Prove “I control this DID” (login / session start) |
| **assertionMethod** | Sign claims / Verifiable Credentials |
| **keyAgreement** | Encryption / shared secrets |
| **capabilityInvocation / Delegation** | Object-capability style authority |

A verifier that receives an **authentication** proof must use a key listed under `authentication` — not assume any key on the document is valid for login.

Source: [W3C DIDs v1.1](https://www.w3.org/TR/did-1.1/).

### Challenge–response (the universal core)

Almost every DID auth flow reduces to:

1. Verifier issues a **nonce/challenge** (and often a domain / audience).
2. Holder signs with the private key matching an `authentication` verification method.
3. Verifier resolves the DID → gets public key → **verifies signature** + checks challenge binding.

This is what **DID-C** (`scripts/did-c/did_key_spike.mjs`) already exercises offline for `did:key` + Ed25519.

---

## 2. DID *methods* (how the identifier is rooted)

| Method | How resolution works | Auth implications | Fit for THEHIVE near-term |
|--------|----------------------|-------------------|---------------------------|
| **did:key** | Public key *is* the identifier; no network registry | Fastest; no rotation/revocation without abandoning DID | **Chosen for DID-C** |
| **did:web** | HTTPS well-known DID document on a domain | Good for orgs/Queen origin; depends on DNS/TLS | Later for `thehive…` identity |
| **did:webvh / did:webs** | Web + stronger history / KEL-style guarantees | More institutional assurance | Future |
| **Ledger methods** (ethr, ion, indy, …) | Chain or network as registry | Revocation/rotation possible; infra cost & availability | Out of scope near-term |
| **did:keri** | Key event logs; flexible | Strong crypto lifecycle; more complex | Research later |

**Security note (did:key):** compromised private key → abandon DID; no in-place revoke.

---

## 3. Protocol stacks for “DID auth” in products

These are *how apps talk*, not different math:

| Stack | What it is | Complexity | Hive note |
|-------|------------|------------|-----------|
| **Raw challenge–response** | Server nonce + client signature over nonce | Lowest | Matches DID-C → DID-B experimental route |
| **DID-CHALLENGE SASL** | SASL mechanism using DID proof (+ optional VC/VP) | Medium | Server/protocol clients; not browser-first |
| **SIOPv2** (Self-Issued OpenID Provider) | User acts as their own OpenID Provider; often DID-bound JWTs | Medium–high | Browser/wallet ecosystems |
| **OpenID4VP** | Present Verifiable Presentations to a verifier (often + wallet) | High | Credential *presentation*, not only DID control |
| **OpenID4VCI** | *Issuance* of credentials into a wallet | High | Issuer role; later if hive issues agent badges |
| **DIDComm** | Messaging layer between agents | High | Agent-to-agent; federation research |
| **WebAuthn / passkeys** | Platform authenticators (not DID-native) | Medium | Complementary; can bind to account alongside DID |
| **Digital Credentials API** (browsers) | Browser mediation for OID4VP / mdoc-style flows | High / evolving | Watch; not required for edge spike |

Industry direction for web wallets is heavily **OpenID4VC family** (SIOPv2 + OpenID4VP + OpenID4VCI). For an edge Worker and agents, **raw challenge–response on did:key** remains the honest first step.

---

## 4. Authentication vs credentials (do not conflate)

| Concept | Proves |
|---------|--------|
| **DID authentication** | Control of the identifier *right now* |
| **Verifiable Credential (VC)** | A signed claim (issuer said X about subject) |
| **Verifiable Presentation (VP)** | Holder presents one or more VCs (often with holder binding) |

You can authenticate with a DID **without** any VC.  
You can present a VC **without** that being the same as “session login.”  
Many products combine both: auth establishes the DID session; VCs authorize richer claims (role, colony, clearance).

---

## 5. Map to THEHIVE today

| Hive control plane | Role vs DID |
|--------------------|-------------|
| Visitor token | Anti-spam session; not cryptographic identity |
| `FOUNDER_KEY` | High-stakes law/decide; keep fail-closed |
| Admin / bridge keys | Ops; not end-user SSI |
| DID-C script | Offline proof that did:key + sign/verify works |
| DID-B (queued) | Optional ` /v11/experimental/...` verify of challenge signatures |

**Recommended ladder**

1. **Now:** DID-C offline (done).  
2. **Next (founder OK):** DID-B — edge issues nonce; client returns `{ did, signature }`; Worker verifies (rate-limited, labeled experimental).  
3. **Later:** `did:web` for Queen/org identity.  
4. **Later:** Optional VC for “agent badge” / colony membership — still not auto-approve proposals.  
5. **Much later:** SIOPv2 / OpenID4VP if wallet UX is a product goal.

---

## 6. Threat notes (short)

- **Replay:** bind signature to challenge + expiry + audience (hive origin).  
- **Phishing / confused deputy:** domain/audience in signed payload.  
- **Key theft (did:key):** no recovery — treat keys as disposable agent identities or protect in hardware later.  
- ** confabulated “SSI login” in UI:** forbidden until verify path is real (hive honesty rule).

---

## 7. Sources (selected)

- W3C Decentralized Identifiers (DIDs) v1.1 — verification methods & `authentication` relationship  
- W3C Verifiable Credentials data model / overview — proofs, proofPurpose  
- OpenID4VP / SIOPv2 / OpenID4VCI — wallet-oriented auth & presentation  
- DID-CHALLENGE SASL draft — protocolized DID (+ optional VC) challenge  
- Surveys on DID/VC adoption and method tradeoffs (e.g. arXiv 2402.02455)

---

## Founder choices (when ready)

| ID | Choice |
|----|--------|
| **AUTH-1** | Stay at DID-C only |
| **AUTH-2** | Implement DID-B experimental verify on Worker |
| **AUTH-3** | Plan `did:web` for hive origin after DID-B works |
| **AUTH-4** | Defer OpenID4VP/wallet until product need is clear |

**Recommendation:** AUTH-1 is current state; **AUTH-2** when you want edge-visible experimental auth without replacing founder key.
