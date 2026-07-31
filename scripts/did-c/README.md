# DID-C — Offline `did:key` spike

**Decision:** D7 near-term, option **DID-C** (offline script, no edge route yet).

## What it does

1. Generates an Ed25519 key pair **in memory only**
2. Derives a `did:key:z…` identifier from the public key
3. Signs a challenge and verifies the signature
4. Prints a JSON report (**never** prints the private key)

## Run

```bash
node scripts/did-c/did_key_spike.mjs
node scripts/did-c/did_key_spike.mjs "my-challenge"
```

Requires **Node 20+** (Web Crypto Ed25519).

## What it is not

- Not Worker login
- Not a replacement for `FOUNDER_KEY`
- Not a wallet product

Next promotion path (founder-gated): DID-B experimental `/v11/experimental/...` verify route.
