# did:key Rotation Limits — Exploration

**Author:** Grok (Detective)  
**Date:** 2026-07-30  
**PR:** #133  
**Related:** `docs/DID_METHOD_COMPATIBILITY.md`, `scripts/did-c/did_key_spike.mjs`

---

## Plain summary

**`did:key` cannot rotate keys inside the same DID.**  
The identifier *is* the public key (multicodec-encoded). Change the key → you get a **different DID**. There is no update, no deactivate, no “replace authentication key while keeping `did:key:z6Mk…` the same.”

That is a **hard method limit**, not a missing feature in our code.

---

## 1. Why rotation is impossible

| Fact | Consequence |
|------|-------------|
| Method is **purely generative** | Document is derived from the identifier; no registry to write |
| Method-specific-id embeds the public key | New key material ⇒ new identifier |
| Spec: no Update / Deactivate operations | Cannot publish a successor key under the same DID |

Official method text (W3C CCG did:key): *“does not support key rotation because the identifier is derived directly from the public key material itself.”*

---

## 2. What “rotation” means elsewhere (contrast)

| Method family | How rotation works |
|---------------|--------------------|
| **did:web** | Edit `did.json`; keep same `did:web:…`; add new keys, retire old |
| **Ledger / Sidetree / PLC** | Signed operations update document; DID string stable |
| **did:webvh** | History + optional pre-rotation commitments |
| **did:key** | **Only option: new DID** |

DID Core describes rotation as a *best practice* for methods that support document updates. **Not all methods do** — did:key is the textbook example that does not.

---

## 3. Security implications of the limit

| Scenario | Outcome with did:key |
|----------|----------------------|
| Private key leaked | Attacker can impersonate **forever** under that DID; legitimate owner cannot “take back” the same DID |
| Routine hygiene rotation | Must mint **new** `did:key` and re-bind all relationships |
| Correlation / privacy refresh | New DID = new correlatable identifier; old DID still valid if key held |
| Long-lived org identity | **Discouraged** by the method’s own security considerations |

Spec guidance historically: avoid using did:key for interactions expected to last **weeks to months** without accepting permanent-compromise risk — or treat the **did:key string itself** as something you rotate on a cadence (i.e. identity migration, not in-place key rotation).

Hardware (HSM / secure enclave) reduces *theft* risk but **does not** add rotation to the method.

---

## 4. Workarounds (application-level, not method-level)

These do **not** change did:key; they change how the *hive* uses it:

| Pattern | How it works | Tradeoff |
|---------|--------------|----------|
| **A. Ephemeral agent IDs** | Short-lived did:key per session/task | No long-term reputation on one DID |
| **B. Explicit migration** | New did:key; out-of-band or signed “successor” record in hive DB | Continuity is **hive policy**, not DID Core |
| **C. DIDComm-style `from_prior`** | Message proves old DID authorizes new DID (JWT `iss`=old, `sub`=new) | Needs protocol support; peers must accept |
| **D. Graduate to did:web** | Org/Queen identity on rotatable method; did:key for throwaway agents | Split identity tiers |
| **E. Re-issue credentials** | VCs bound to old did:key become orphaned; issue new VCs to new DID | Issuer operational cost |

**There is no workaround that keeps the same `did:key:…` string with a new private key.**

---

## 5. Impact on THEHIVE paths

| Path | Rotation limit impact |
|------|------------------------|
| **DID-C spike** | None — offline demo keys are disposable |
| **DID-B experimental verify** | Accept that verified did:key is permanent for that keypair |
| **Agent swarm identities** | Prefer short-lived did:keys; do not treat as lifelong agent souls |
| **Founder / law decide** | Still `FOUNDER_KEY` — never replace with did:key alone |
| **Future colony badges (VC)** | Prefer issuer `did:web` (rotatable); holder may be did:key if short-lived |

---

## 6. Operational policy recommendations

1. **Document** every did:key as non-rotatable in agent onboarding copy.  
2. **TTL mindset:** session or mission scoped; re-key = new DID + new enrollment.  
3. **Compromise playbook:** revoke hive-side grants for that DID; mint new did:key; never promise “key rotation.”  
4. **Long-lived hive identity:** plan **did:web** (or webvh), not did:key.  
5. **Do not** store did:key private keys in git, logs, or frontend bundles.

---

## 7. One-line bottom line

**did:key rotation limit = identity is the key; compromise or hygiene requires a new DID, not an update.**

---

## Sources

- W3C CCG did:key method — “No Key Rotation” / “Key Rotation Not Supported”  
- W3C DID Core — rotation as method-dependent best practice  
- DIDComm DID rotation (`from_prior`) for *identifier* migration when method cannot update  
