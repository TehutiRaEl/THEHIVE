# SIOPv2 Implementation Details — Exploration

**Author:** Grok (Detective)  
**Date:** 2026-07-30  
**PR:** #133  
**Related:** `docs/DID_AUTHENTICATION_METHODS.md`, `docs/DID_NEAR_TERM_SPIKE.md`

---

## Plain summary

**SIOPv2** (Self-Issued OpenID Provider v2) lets the **user** act as their own OpenID Provider. Instead of Google/Auth0 issuing an ID Token, the **user’s wallet/app** signs an ID Token with a key **they** control. The website (Relying Party / RP) verifies that signature.

For THEHIVE: this is a **later, wallet-oriented** path. Near-term remains **DID-C / DID-B** (raw challenge–response). SIOPv2 is what you adopt if you want browser/wallet “Login with my DID” UX interoperable with OpenID ecosystems.

Spec working draft: [OpenID SIOPv2](https://openid.net/specs/openid-connect-self-issued-v2-1_0.html) (and WG drafts on openid.github.io).

---

## 1. Roles

| Role | Who | Job |
|------|-----|-----|
| **RP** (Relying Party) | THEHIVE website / Worker | Starts login; verifies ID Token |
| **Self-Issued OP (SIOP)** | User wallet / app | Holds keys; signs Self-Issued ID Token |
| **End-User** | Human (or agent controlling keys) | Approves release of identity |

Unlike classic OIDC, the RP’s trust is **directly with the End-User’s key**, not a third-party IdP’s reputation.

---

## 2. Happy-path flow (implementation view)

```
RP                         SIOP (wallet)              User
 |---- Authorization Request (openid:// or https) ----->|
 |                                                      |-- consent --|
 |<--- Self-Issued ID Token (redirect or POST) ---------|
 |-- verify JWT signature + claims ---------------------|
 |-- create session ------------------------------------|
```

### 2.1 Same-device vs cross-device

| Model | How response returns |
|-------|----------------------|
| **Same-device** | Redirect back to RP (`fragment` or query) with `id_token` |
| **Cross-device** | Often `response_mode=post` — SIOP **HTTPS POSTs** the token to RP’s `redirect_uri` (phone scans QR on desktop) |

Implementers must store **nonce** (and often **state**) server-side so the callback can validate replay protection.

---

## 3. Authorization Request (RP → SIOP)

Typical parameters:

| Parameter | Role |
|-----------|------|
| `scope` | Must include `openid` |
| `response_type` | Often `id_token` (implicit-style) |
| `client_id` | RP identifier — may be `redirect_uri`, a DID, or federation entity id |
| `redirect_uri` | Where response is delivered |
| `nonce` | **Required** for replay protection |
| `state` | CSRF / correlation |
| `response_mode` | `fragment` (default-ish) or `post` for cross-device |
| `client_metadata` / `registration` | Just-in-time RP metadata when not pre-registered |
| `request` / `request_uri` | Optional signed Request Object (JWT) when RP signs the request |

**Example shape** (illustrative):

```
siopv2://?scope=openid
  &response_type=id_token
  &client_id=https%3A%2F%2Fthehive.example%2Fcb
  &redirect_uri=https%3A%2F%2Fthehive.example%2Fcb
  &nonce=n-0S6_WzA2Mj
  &client_metadata=%7B%22id_token_signed_response_alg%22%3A%22ES256%22%7D
```

Invocation endpoints historically include custom schemes (`openid:`, `siopv2:`) and **HTTPS universal links** for web wallets.

---

## 4. Self-Issued ID Token (the core artifact)

### 4.1 Self-issued invariant

A token is treated as **self-issued** when conceptually the **user is the issuer**. Implementers commonly enforce:

- `iss` and `sub` identify the same subject in the self-issued sense (drafts evolved: classic SIOP used `iss=https://self-issued.me`; v2 emphasizes user-controlled identifiers / DIDs).

**Subject syntax types:**

| Type | `sub` | Key material |
|------|--------|--------------|
| **JWK Thumbprint** | Thumbprint of key | `sub_jwk` present; verify JWT with that JWK |
| **DID** | `did:…` | Resolve DID document; use verification method; `sub_jwk` typically **not** used the same way |

### 4.2 Claims the RP must check

| Check | Why |
|-------|-----|
| Signature verifies | Token integrity |
| `aud` matches RP `client_id` / expected audience | Token was meant for this RP |
| `nonce` matches the one issued for this login | Anti-replay |
| `exp` / `iat` sensible | Freshness |
| Subject syntax matches RP policy | Only accept `did:key` / allowed methods |

Self-attested profile claims (`name`, `email`, …) inside the ID Token are **not** third-party verified unless accompanied by OpenID4VP / other VC presentation.

---

## 5. RP metadata (how SIOP learns about the hive)

SIOPv2 supports **not** pre-registering every RP:

1. **`client_id` = `redirect_uri`** — simplest legacy path  
2. **Inline `client_metadata` / `registration`** in the request  
3. **DID** as client_id — resolve RP DID document  
4. **OpenID Federation** automatic registration — entity configuration from URL

For a first hive experiment, (1) or (2) is enough. DID/Federation registration is for multi-party trust frameworks.

---

## 6. Libraries & implementation surface

| Piece | Work |
|-------|------|
| RP: create auth request URI | Build query + nonce store |
| RP: callback endpoint | Accept `id_token`, verify JWT |
| SIOP: parse request | Wallet deep link handler |
| SIOP: sign ID Token | User key (often Ed25519 / ES256) |
| Optional | Request Object JWT, OpenID4VP `vp_token` alongside |

Reference-style OSS: Sphereon `siop-oid4vp`, various `did-auth-siop` libraries — **pin versions carefully**; drafts moved between ID1 and later WG drafts.

---

## 7. Relation to OpenID4VP

| Spec | Proves |
|------|--------|
| **SIOPv2** | User controls identifier (auth event) |
| **OpenID4VP** | User presents Verifiable Credentials / presentations |

Products often **combine** them: SIOP for “who,” OpenID4VP for “what claims.” Keys used for ID Token vs VP **need not** be the same; RPs should not assume they are.

---

## 8. Security checklist for any future hive SIOP RP

- [ ] Cryptographic random `nonce`; one-time use; short TTL  
- [ ] Validate `aud`, signature, expiry  
- [ ] Restrict allowed subject syntax (e.g. only `did:key` at first)  
- [ ] Do not treat self-attested claims as KYC  
- [ ] Rate-limit callback endpoint (S1 spirit)  
- [ ] Never log private keys or full PATs  
- [ ] Founder-key paths stay separate — SIOP session ≠ proposal decide

---

## 9. THEHIVE recommendation

| Phase | Action |
|-------|--------|
| **Now** | DID-C offline; optional DID-B raw verify |
| **Not yet** | Full SIOPv2 RP on Worker |
| **If product needs wallet login** | Add RP: nonce store + JWT verify + `did:key` only; same-device first |
| **Avoid** | Claiming “OpenID/SIOP login” in UI before verify is live |

**Why not SIOP first?** Worker is edge-first; SIOP needs wallet deep links, redirect/POST callbacks, metadata variants, and draft churn. Raw DID challenge reuses the same crypto THEHIVE already spiked with less protocol surface.

---

## 10. Sources

- OpenID Self-Issued OpenID Provider v2 (draft / WG)  
- OpenID Connect Core § Self-Issued OP (v1 baseline)  
- OpenID4VP (credential presentation companion)  
- Library READMEs (Sphereon SIOP-OID4VP) for concrete JWT shapes
