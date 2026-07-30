# OpenID4VP Integration — Explanation

**Author:** Grok (Detective)  
**Date:** 2026-07-30  
**PR:** #133  
**Related:** `docs/SIOPV2_IMPLEMENTATION.md`, `docs/DID_AUTHENTICATION_METHODS.md`

---

## Plain summary

**OpenID4VP** (OpenID for Verifiable Presentations) is the protocol for **asking a wallet for credentials** and **getting them back** in a standard container called a **`vp_token`**.

| Protocol | Answers |
|----------|---------|
| **SIOPv2** | “Who controls this key / DID?” (self-issued ID Token) |
| **OpenID4VP** | “Show me these claims / credentials” (VP Token) |
| **OpenID4VCI** | “Issue a credential into the wallet” (issuance; separate) |

THEHIVE does **not** need OpenID4VP for the near-term DID-C/DID-B spike. OpenID4VP matters when the hive becomes a **Verifier** of third-party or hive-issued **Verifiable Credentials** (e.g. agent badge, colony membership) via a wallet UX.

---

## 1. Roles in OpenID4VP

| Role | Who | Job |
|------|-----|-----|
| **Verifier** | THEHIVE (if integrated) | Requests presentation; checks crypto + policy |
| **Holder** | User / agent | Owns credentials in a **Wallet** |
| **Wallet** | App / OS component | Builds presentation; returns `vp_token` |
| **Issuer** | Separate party (or future hive issuer) | Created the credential earlier (OpenID4VCI or other) |

OpenID4VP is **format-agnostic**: W3C VC (JWT or Data Integrity), SD-JWT VC, ISO mdoc, etc., as long as verifier and wallet agree on formats.

---

## 2. Integration flow (what you actually build)

### Same-device

1. User is on the hive site (Verifier).  
2. Verifier builds an **Authorization Request** (`response_type=vp_token`, `nonce`, query of what credentials are needed).  
3. Redirect / deep link to Wallet (`openid4vp://` or HTTPS app link).  
4. User consents; Wallet returns **`vp_token`** (+ often **`presentation_submission`**).  
5. Verifier validates signatures, nonce, audience, schema/policy.

### Cross-device (common web + phone wallet)

1. Verifier shows a **QR** encoding the request.  
2. Wallet scans; user consents.  
3. Wallet **HTTP POSTs** the response to Verifier’s **`response_uri`** using **`response_mode=direct_post`** (avoids huge redirect URLs and desktop/phone split).  
4. Verifier correlates via `state` / transaction ids and validates.

```
Verifier                         Wallet
   |--- Authorization Request --->|
   |                              | (user consent)
   |<-- vp_token (redirect/POST) -|
   |--- verify presentation ------|
```

---

## 3. Key request parameters (Verifier → Wallet)

| Parameter | Role |
|-----------|------|
| `response_type` | `vp_token` (credentials only) or `vp_token id_token` (with SIOPv2 auth) |
| `client_id` | Verifier identity |
| `redirect_uri` / `response_uri` | Where response goes (`response_uri` especially for `direct_post`) |
| `nonce` | Replay protection; must appear in holder binding where required |
| `state` | Correlate request/response |
| **Query** | What to present: historically **Presentation Exchange** `presentation_definition`; newer drafts emphasize **DCQL** (`dcql_query`) |
| `response_mode` | e.g. `direct_post` for cross-device |

Example shape (illustrative):

```
response_type=vp_token
&client_id=...
&response_uri=https://thehive.example/vp/callback
&response_mode=direct_post
&nonce=...
&dcql_query={...}   # or presentation_definition=...
```

---

## 4. Key response artifacts (Wallet → Verifier)

| Artifact | Meaning |
|----------|---------|
| **`vp_token`** | Container with one or more presentations (format depends on credential type) |
| **`presentation_submission`** | Maps “what was requested” to “where it is in the token” (PE-style) |
| **`id_token`** (optional) | Only if combined with SIOPv2 (`response_type=vp_token id_token`) |

### Verifier validation steps (integration checklist)

1. Parse `vp_token` / submission.  
2. Verify cryptographic proofs (issuer signatures on VCs; holder binding / key-binding JWT where required).  
3. Check `nonce` / `aud` binding to *this* verifier transaction.  
4. Enforce policy (credential type, issuer allowlist, expiry, revocation if available).  
5. **Then** map claims into a hive session — never skip crypto for UI convenience.

---

## 5. Combining with SIOPv2

| Mode | `response_type` | Result |
|------|-----------------|--------|
| Credentials only | `vp_token` | Presentations only |
| Auth + credentials | `vp_token id_token` + `scope=openid` | Self-issued ID Token **and** VP Token |

Use the combo when you need **both** “prove key control” and “show issued claims.” Keys for ID Token and for VP **need not** be the same; do not assume they are.

---

## 6. What “integration” means for THEHIVE (concrete components)

If the founder later green-lights a Verifier role:

| Component | Responsibility |
|-----------|----------------|
| **Worker or backend** | Create presentation request; store nonce/state; callback endpoint; verify VP |
| **Frontend** | Trigger flow; show QR for cross-device; show success/failure honestly |
| **Policy config** | Which credential types / issuers count (e.g. “colony member”) |
| **Session bridge** | Map verified claims → visitor/agent context — **still not** `FOUNDER_KEY` decide |

**Not required for:** DID-C offline spike, DID-B experimental raw verify, or founder proposal decide.

---

## 7. OpenID4VCI (do not confuse)

| Spec | Direction |
|------|-----------|
| **OpenID4VP** | Wallet → Verifier (present) |
| **OpenID4VCI** | Issuer → Wallet (issue) |

Hive as **issuer** of agent badges would use OpenID4VCI (or another issuance path). Hive as **gate** checking badges would use OpenID4VP.

---

## 8. Digital Credentials API (browsers)

Modern browsers are adding a **Digital Credentials API** that can carry OpenID4VP-shaped requests without only custom schemes. Integration option later for web verifiers; still needs the same crypto verification on the server. Evolving — pin a profile when implementing.

---

## 9. Security notes

- Always bind presentations to **nonce + verifier audience**.  
- Prefer **HTTPS response endpoints**; rate-limit callbacks (S1 spirit).  
- Self-attested claims ≠ verified credentials.  
- Revocation checking is issuer/method-specific — plan explicitly or document “not checked yet.”  
- UI must not say “credential verified” until server verification succeeds.

---

## 10. Recommendation for THEHIVE

| Priority | Action |
|----------|--------|
| **Now** | DID-C / optional DID-B only |
| **Later** | OpenID4VP if product needs wallet-presented colony/agent credentials |
| **Avoid** | Building Verifier + Issuer + Wallet stack before a single clear use case |

**First OpenID4VP use case (when ready):** Verifier-only — accept one credential type from an allowlisted issuer; same-device or QR+`direct_post`; no auto-approve of constitutional proposals.

---

## Sources

- OpenID for Verifiable Presentations (OpenID4VP) specification drafts  
- Combination profiles with SIOPv2 (`vp_token id_token`)  
- Credential format notes: W3C VC, SD-JWT VC, mdoc  
