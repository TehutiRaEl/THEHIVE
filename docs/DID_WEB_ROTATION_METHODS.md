# did:web Rotation Methods — Investigation

**Author:** Grok (Detective)  
**Date:** 2026-07-30  
**PR:** #133  
**Related:** `docs/DID_KEY_ROTATION_LIMITS.md`, `docs/DID_METHOD_COMPATIBILITY.md`

---

## Plain summary

**`did:web` supports key rotation** because the DID string is a **domain** (optional path), not the key itself. You rotate by **updating the published DID document** (`did.json`) over HTTPS while keeping the same `did:web:…` identifier.

Contrast: `did:key` cannot rotate in place — new key = new DID.

---

## 1. What the method actually specifies

From the [did:web method](https://w3c-ccg.github.io/did-method-web/):

| Operation | Mechanism |
|-----------|-----------|
| **Create** | Publish `did.json` at the well-known (or path) HTTPS URL |
| **Read** | HTTPS GET the document; document `id` must match the DID |
| **Update (rotation lives here)** | Replace/update the `did.json` file contents |
| **Deactivate** | Remove the document or make it unreachable |

There is **no standard HTTP API** for update — whoever controls the web origin (and TLS) controls the document. Git + CI is a common operational pattern for auditability.

Resolution URL (typical):

```text
did:web:example.com
  → https://example.com/.well-known/did.json

did:web:example.com:user:alice
  → https://example.com/user/alice/did.json
```

---

## 2. Rotation methods (patterns in the wild)

### Method A — Overlap publish (recommended baseline)

**Goal:** Zero downtime for verifiers still checking old signatures.

1. Generate **new** keypair (offline / HSM / Key Vault).  
2. Edit DID document:  
   - Add new verification method  
   - Keep **old** method(s) listed under the right relationships for a grace period  
3. Deploy updated `did.json` to **all** origins / CDN edges.  
4. Confirm public GET returns the new document.  
5. Start **signing new** material with the new key only.  
6. After grace (and credential lifetimes allow), **remove** old keys from the document.  
7. Destroy or quarantine old private keys per policy.

Used by enterprise issuers (e.g. Entra Verified ID style flows: create key → publish both keys in `did.json` → sync → sign with new).

### Method B — Immediate replace (emergency)

**Goal:** Suspected compromise.

1. Publish document **without** the compromised key (or empty authentication if total lock-down).  
2. Propagate aggressively (purge CDN).  
3. Accept that **some** in-flight verifications of old signatures may fail if verifiers only trust “current document” and you stripped historical keys.  
4. Re-issue critical credentials if assertion keys were burned.

Tradeoff: security over continuity.

### Method C — Assertion vs authentication split cadence

| Relationship | Rotation advice |
|--------------|-----------------|
| **assertionMethod** (VC signing) | Rotate slower; **retain** old public keys in document long enough that unexpired credentials still verify |
| **authentication** | Can rotate faster; less impact on holders of old VCs |
| **keyAgreement** | Rotate with protocol partners in mind |

Best practice (webvh guidance): **current document = all keys still considered valid**. No requirement for out-of-band revocation lists for did:web pure — removal from the document is the signal.

### Method D — did:webvh / did:webs (history + stronger rotation)

Not plain did:web:

- Append-only **log** (`did.jsonl`) with verifiable updates  
- Optional **pre-rotation**: commit to next update keys before revealing them (limits attacker who steals only the current update key)  
- Stronger audit of *who* rotated *when*

Use when the hive needs **provable history**, not only “whatever is on the server today.”

### Method E — Application-level DID migration

If you must change **method** or abandon a domain:

- New `did:web:new.example` or move to another method  
- Optional DIDComm `from_prior`-style proof linking old → new  
- Re-bind hive records and re-issue credentials  

This is **DID replacement**, not in-document key rotation.

---

## 3. Document shape during overlap rotation (illustrative)

```json
{
  "@context": ["https://www.w3.org/ns/did/v1"],
  "id": "did:web:hive.example",
  "verificationMethod": [
    {
      "id": "did:web:hive.example#key-2026-07",
      "type": "Multikey",
      "controller": "did:web:hive.example",
      "publicKeyMultibase": "z6Mk…NEW…"
    },
    {
      "id": "did:web:hive.example#key-2025-01",
      "type": "Multikey",
      "controller": "did:web:hive.example",
      "publicKeyMultibase": "z6Mk…OLD…"
    }
  ],
  "authentication": ["did:web:hive.example#key-2026-07"],
  "assertionMethod": [
    "did:web:hive.example#key-2026-07",
    "did:web:hive.example#key-2025-01"
  ]
}
```

Notes:

- New auth key only under `authentication` if you want logins on the new key immediately.  
- Keep old key under `assertionMethod` until VC lifetimes expire.  
- Verifiers should accept any key **present** in the resolved document for the relevant relationship.

---

## 4. Operational checklist

- [ ] Generate keys offline / HSM; never commit private keys  
- [ ] Update **all** replicas and CDN before switching signers  
- [ ] Verify `GET https://…/did.json` matches intended doc (`id` field)  
- [ ] Align rotation cadence with **credential expiry** (don’t retire assertion keys while VCs still live)  
- [ ] Cache-bust: short `Cache-Control` on `did.json` or accept stale verifier caches during grace  
- [ ] Document who may publish (founder / ops) — same spirit as FOUNDER_KEY gates  
- [ ] Compromise: remove key fast; treat domain takeover as full identity compromise  

---

## 5. Risks specific to did:web rotation

| Risk | Mitigation |
|------|------------|
| DNS / domain hijack | DNSSEC where possible; monitor; treat as key compromise |
| Stale CDN copy | Explicit purge; low max-age on did.json |
| Split brain (some edges old doc) | Deploy all regions before cutover |
| Retiring assertion key too early | Policy: retain ≥ max VC lifetime unless compromise |
| No history on plain did:web | Optional upgrade path to webvh for audit |

---

## 6. THEHIVE recommendation

| Identity tier | Method | Rotation approach |
|---------------|--------|-------------------|
| Ephemeral agents | **did:key** | No in-place rotation; new DID |
| Hive / Queen org | **did:web** (when ready) | **Method A** overlap publish |
| High-assurance history | **did:webvh** later | Log + optional pre-rotation |
| Law / money / decide | **FOUNDER_KEY** | Unchanged |

**First hive did:web rotation runbook (when domain exists):**

1. Founder-approved key gen  
2. PR or controlled publish of `did.json` with overlap keys  
3. Public verify  
4. Switch signing  
5. After grace, remove old public key from document  

---

## 7. Bottom line

**did:web rotation = publish a new DID document over HTTPS with the same DID id.**  
Best default: **overlap old + new keys**, then retire old keys on a schedule tied to credential lifetime — or immediately on compromise.

---

## Sources

- W3C CCG did:web method — Update / Deactivate  
- Enterprise issuer runbooks (overlap keys in did.json, then sync)  
- did:webvh guidance on valid keys and assertion vs authentication cadence  
