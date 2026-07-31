# DID Method Compatibility — Investigation

**Author:** Grok (Detective)  
**Date:** 2026-07-30  
**PR:** #133  
**Related:** `docs/DID_AUTHENTICATION_METHODS.md`, `scripts/did-c/did_key_spike.mjs`

---

## Plain summary

**DID methods are not automatically interchangeable.**  
W3C DID Core defines a **shared document shape** and resolution *concept*. Each **method** (`did:key`, `did:web`, `did:ion`, …) defines its own **create/read/update/deactivate** rules. Software is **not** required to support every method — like browsers need not implement every URI scheme.

**Compatibility** in practice means:

1. Can we **resolve** this DID to a document?
2. Can we **read keys** in a format our verifier understands?
3. Can we **check the right relationship** (`authentication` vs `assertionMethod`)?
4. Does **policy** allow this method for this use case?

---

## 1. What is compatible at the Core layer

| Shared across methods | Method-specific |
|----------------------|-----------------|
| `did:` URI syntax | How the method-specific-id is formed |
| DID document properties (`id`, `verificationMethod`, relationships) | How the document is stored/fetched |
| Verification relationships (`authentication`, …) | Update / rotate / deactivate rules |
| Resolution *returns* a document + metadata | Registry (none, HTTPS, ledger, …) |

If two implementations both consume **conformant DID documents** and agree on **key types** (e.g. Multikey / JWK + Ed25519), they can verify proofs **regardless of method** — *after* resolution succeeds.

---

## 2. Method comparison (hive-relevant)

| Method | Resolution | Rotate / revoke | Network | Best for |
|--------|------------|-----------------|---------|----------|
| **did:key** | Derive doc from key in the identifier | No (abandon DID) | None | Ephemeral agents, tests, DID-C |
| **did:web** | HTTPS `/.well-known/did.json` (or path) | Yes (edit file) | DNS + TLS | Org / Queen origin identity |
| **did:webvh / webs** | Web + stronger history guarantees | Yes | HTTPS + log | Higher-assurance web |
| **did:ion** (Sidetree) | Bitcoin-anchored Sidetree | Yes | Ledger + IPFS-style | Public long-lived identities |
| **did:ethr** | Ethereum registry | Yes | Chain | Web3 ecosystems |
| **did:plc** | PLC directory (atproto) | Yes | Directory service | Bluesky/atproto ecosystem |
| **did:indy / sov** | Hyperledger Indy | Yes | Permissioned ledger | Gov / ecosystem pilots |

**Verifier rule of thumb:** support every method your *issuers and holders actually use*, limited by resolver/library support — not every method in the registry.

---

## 3. Compatibility matrix (practical)

| From \ To | did:key verify | did:web verify | Ledger method verify |
|-----------|----------------|----------------|----------------------|
| **Hive as verifier (edge)** | ✅ Natural fit | ✅ If HTTPS fetch allowed | ⚠️ Heavy / often external resolver |
| **Hive as subject (agent)** | ✅ DID-C | Optional later | Rarely needed |
| **Wallet SIOP/OpenID4VP** | Often yes | Often yes | Depends on wallet |
| **Cross-ecosystem VC** | Issuer DID method must resolve at verifier | Same | Same |

**Not compatible without adapters:**

- Assuming `did:key` rotation APIs exist  
- Treating DNS control of `did:web` as “decentralized”  
- Mixing legacy key encodings (`Ed25519VerificationKey2018` base58) with Multikey without dual support  
- Using a key under `assertionMethod` for **authentication** (wrong relationship)

---

## 4. Key format compatibility (common footgun)

Verification method **types** and encodings differ across eras and ecosystems:

| Style | Example | Note |
|-------|---------|------|
| **Multikey** + `publicKeyMultibase` | Modern DID Core examples | Aligns with did:key multicodec style |
| **JsonWebKey** / `publicKeyJwk` | Wide JWT tooling | Good for JOSE stacks |
| **Legacy suite types** | `Ed25519VerificationKey2018` | Still seen; dual-read during transitions |

**Interop tip:** Verifiers should accept **Multikey and JWK** for Ed25519 at minimum. Ecosystems (e.g. atproto) have documented migrations toward Multikey — expect dual-format windows.

Cryptosuite / alg mismatch (Ed25519 vs ES256K vs RSA) is a hard incompatibility even within one method.

---

## 5. Resolver compatibility

| Resolver capability | Impact |
|---------------------|--------|
| Method drivers registered | `METHOD_NOT_SUPPORTED` if missing |
| HTTPS allowed (Workers) | Required for `did:web` |
| No outbound ledger RPC | Ledger DIDs fail on pure edge |
| Universal Resolver proxy | Convenience; trust & availability tradeoff |

W3C DID Resolution defines error classes such as `METHOD_NOT_SUPPORTED`, `NOT_FOUND`, `INVALID_DID_DOCUMENT` — hive code should map these to honest API errors, not silent success.

---

## 6. Protocol-layer compatibility (SIOP / OpenID4VP)

| Layer | Compatibility need |
|-------|---------------------|
| **Subject syntax** | RP `subject_syntax_types_supported` must list methods the wallet will use |
| **Request** | Wallet must understand RP’s allowed methods |
| **VC issuer DID** | Verifier must resolve issuer method to check credential signature |
| **Holder DID** | May differ from issuer method — both must resolve |

Example: issuer `did:web:issuer.example`, holder `did:key:z6Mk…` — verifier needs **both** web fetch and did:key derivation.

---

## 7. THEHIVE policy recommendation

| Phase | Methods |
|-------|---------|
| **Now (DID-C)** | **did:key** only (Ed25519) |
| **DID-B experimental** | **did:key** only |
| **Org identity** | Add **did:web** for hive origin when ready |
| **Wallet / VC verifier** | did:key + did:web; add ledger methods only for a named ecosystem |
| **Never implicit** | Accept unknown methods without resolver + policy entry |

**Allowlist, don’t denylist.** New methods stay rejected until explicitly enabled.

---

## 8. Test checklist for “compatible”

- [ ] Resolve sample DIDs per enabled method  
- [ ] Verify authentication proof with key under `authentication`  
- [ ] Reject proof that uses wrong relationship  
- [ ] Reject unsupported method with clear error  
- [ ] Dual-read Multikey + JWK if both may appear  
- [ ] did:web: HTTPS only; validate document `id` matches DID  
- [ ] did:key: no network; document derived deterministically  

---

## 9. Bottom line

- **Document model** is shared; **lifecycle and resolution** are per-method.  
- **Compatibility** = resolver support + key-type support + relationship checks + policy allowlist.  
- THEHIVE stays **did:key-first**; **did:web** next for the Queen/org; ledger methods only with a concrete partner ecosystem.

---

## Sources

- W3C DIDs v1.0 / v1.1 — methods, interoperability notes  
- W3C DID Resolution — errors, resolver behavior  
- did:key / did:web method specs  
- Industry guidance on multi-method verifiers  
