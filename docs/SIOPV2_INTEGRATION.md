# SIOPv2 Integration Details — Relying Party Focus

**Author:** Grok (Detective)  
**Date:** 2026-07-30  
**PR:** #133  
**Companion:** `docs/SIOPV2_IMPLEMENTATION.md` (concepts) · this file (how to wire an RP)

---

## Plain summary

Integrating **SIOPv2** means THEHIVE acts as a **Relying Party (RP)**:

1. Start a login (build Authorization Request + store `nonce`/`state`)
2. Hand the user to a **wallet / Self-Issued OP**
3. Receive a **Self-Issued ID Token**
4. **Validate** signature + claims
5. Create a **hive session** bound to `sub` (DID or JWK thumbprint)

Near-term hive path remains DID-C/DID-B. This doc is the integration blueprint **if** wallet login becomes a product requirement.

---

## 1. Components you must own (RP side)

| Component | Responsibility |
|-----------|----------------|
| **Login starter** | UI button / QR; creates transaction |
| **Nonce/state store** | D1/KV: one-time `nonce`, `state`, expiry, optional return URL |
| **Request builder** | Builds `siopv2://` or HTTPS request URI (+ optional signed Request Object) |
| **Callback endpoint** | Accepts `id_token` via redirect fragment/query or `POST` |
| **ID Token validator** | Signature + `iss`/`sub`/`aud`/`nonce`/`exp` + subject policy |
| **DID resolver** (if DID subjects) | Resolve `did:key` / allowed methods to verification methods |
| **Session layer** | Map verified `sub` → visitor/agent context — **not** founder decide |

Worker already has rate limiting patterns (S1) and fail-closed founder auth — SIOP callback should use rate limits; founder routes stay on `FOUNDER_KEY`.

---

## 2. Integration sequence (step-by-step)

### Step A — Create transaction

```
nonce  = cryptographically random (e.g. 32 bytes, base64url)
state  = random correlation id
store  { nonce, state, created_at, ttl }  // e.g. 5–10 minutes
```

### Step B — Build Authorization Request

Minimum fields:

| Field | Example policy for hive v1 |
|-------|----------------------------|
| `scope` | `openid` |
| `response_type` | `id_token` |
| `client_id` | `https://<hive-origin>/siop/cb` (or same as redirect) |
| `redirect_uri` | HTTPS callback on hive origin |
| `nonce` | from Step A |
| `state` | from Step A |
| `response_mode` | `fragment` (same-device) or `post` (cross-device) |
| `client_metadata` | algs + `subject_syntax_types_supported` |

**Simplest registration mode for first integration:**  
`client_id` ≈ `redirect_uri` + inline `client_metadata` (no OpenID Federation, no RP DID required).

**Do not** send both “already pre-registered metadata” and conflicting `client_metadata` for the same `client_id` — SIOPv2 forbids proceeding when those conflict.

### Step C — Invoke SIOP

- Same-device: redirect user-agent to `siopv2://?…` or wallet universal link.  
- Cross-device: render QR of the request URL; wallet posts back.

### Step D — Callback

1. Read `id_token` (+ `state`).  
2. Load stored transaction by `state`; reject if missing/expired.  
3. Run **ID Token validation** (below).  
4. Invalidate nonce (one-time).  
5. Issue hive session cookie/token bound to `sub`.

### Step E — Session policy

| Allowed | Forbidden without extra gates |
|---------|--------------------------------|
| Read public hive data as “DID session” | `POST /proposals/{id}/decide` |
| Soft personalization | Admin export / bridge PAT |
| Optional link to visitor tier | Anything requiring `FOUNDER_KEY` |

---

## 3. ID Token validation algorithm (integration critical path)

Per SIOPv2-style rules (draft wording varies; implement the spirit):

1. **Self-issued check** — Treat as self-issued when `iss` and `sub` match the self-issued model (same subject). If they differ, this is *not* SIOP; use classic OIDC validation instead.  
2. **`aud`** — Must include the `client_id` the RP sent.  
3. **`nonce`** — Must equal stored nonce for this `state`.  
4. **Time** — Reject if `exp` passed; optionally require `iat` not too far in the past.  
5. **Signature**  
   - **JWK Thumbprint subject:** verify JWS with `sub_jwk`; ensure `sub` is the thumbprint of that JWK; alg in allowlist.  
   - **DID subject:** resolve DID document; select verification method (often `kid` in JWT header); verify; typically **no** `sub_jwk` for pure DID subjects.  
6. **Policy** — Only accept subject syntax you enable (recommend **`did:key` only** for hive v1).  
7. **Claims hygiene** — Profile claims are self-attested unless OpenID4VP VCs are also verified.

---

## 4. Metadata the wallet needs from the hive

| Mechanism | When to use |
|-----------|-------------|
| `client_id` = `redirect_uri` | Fastest prototype |
| `client_metadata` in request | Declare algs + subject types without pre-reg |
| RP DID as `client_id` | Stronger RP identity; needs DID resolve + often signed request |
| OpenID Federation | Multi-org trust frameworks — overkill for hive v1 |

Example `client_metadata` (illustrative):

```json
{
  "id_token_signed_response_alg": "EdDSA",
  "subject_syntax_types_supported": ["did:key"],
  "client_name": "Sovereign Hive"
}
```

---

## 5. Optional: signed Request Object

Higher-assurance RPs sign the Authorization Request as a JWT (`request` parameter) with RP keys. Wallets verify RP signature before prompting the user.  
Hive v1 can skip this; add when phishing resistance for the *request* matters.

---

## 6. Combining with OpenID4VP

| Goal | `response_type` |
|------|-----------------|
| Login only | `id_token` |
| Credentials only | `vp_token` |
| Login + credentials | `vp_token id_token` + `scope=openid` |

Integration tip: validate **ID Token** and **VP Token** independently; do not assume the same key signed both.

---

## 7. Library approach vs hand-rolled

| Approach | Pros | Cons |
|----------|------|------|
| **Hand-rolled RP** | Matches Worker constraints; minimal deps | You own JWT + DID resolve bugs |
| **OSS SIOP RP** (e.g. Sphereon-style) | Faster protocol coverage | Draft churn; bundle size; audit needed |

For Cloudflare Worker: prefer **small hand-rolled validator** for `did:key` + Ed25519 first; avoid pulling full wallet stacks onto the edge.

---

## 8. Failure modes to handle in UI

| Failure | User-visible honesty |
|---------|----------------------|
| No wallet installed | “No SIOP wallet handled this link” |
| Expired nonce | “Login timed out — try again” |
| Bad signature | “Could not verify identity proof” |
| Disallowed DID method | “This identity type is not accepted yet” |
| POST callback without state | Silent reject + rate limit |

Never show “Logged in with SSI” on client-only checks.

---

## 9. Suggested hive milestone ladder

| Milestone | Deliverable |
|-----------|-------------|
| M0 | DID-C offline (done) |
| M1 | DID-B experimental raw verify |
| M2 | SIOP RP prototype: `did:key` only, same-device, nonce store in D1 |
| M3 | Cross-device `response_mode=post` + QR |
| M4 | Optional OpenID4VP combo for one credential type |

---

## 10. Security checklist (integration)

- [ ] Nonce entropy + single use + TTL  
- [ ] HTTPS-only redirect/`response_uri` on hive origin  
- [ ] Rate-limit callback  
- [ ] Allowlist algs and DID methods  
- [ ] Separate SIOP session from `FOUNDER_KEY`  
- [ ] No private keys or PATs in logs  
- [ ] Spec draft version pinned in docs when coding starts  

---

## Bottom line for THEHIVE

**SIOPv2 integration** = RP transaction store + request URI + callback + strict ID Token validation + session mapping.  
**Do not start M2 until** founder wants wallet UX; M0/M1 remain the efficient sovereignty path on the edge.
