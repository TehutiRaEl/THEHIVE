#!/usr/bin/env node
/**
 * DID-C (PR #133 / D7) — offline did:key spike
 *
 * Plain language:
 * - Creates an ephemeral Ed25519 key pair in memory (never written to disk).
 * - Builds a did:key identifier from the public key.
 * - Signs a challenge string and verifies the signature.
 *
 * This is NOT production login. No private keys are stored. No network calls.
 *
 * Usage:
 *   node scripts/did-c/did_key_spike.mjs
 *   node scripts/did-c/did_key_spike.mjs "optional challenge text"
 *
 * Requires Node 20+ (global Web Crypto).
 */

import { webcrypto } from 'node:crypto';

const crypto = webcrypto;

function b64url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

/** Multicodec ed25519-pub prefix 0xed 0x01 then raw 32-byte public key → base58btc */
function base58btc(bytes) {
  const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = BigInt('0x' + Buffer.from(bytes).toString('hex'));
  let out = '';
  while (n > 0n) {
    const mod = Number(n % 58n);
    out = ALPHABET[mod] + out;
    n = n / 58n;
  }
  for (const b of bytes) {
    if (b === 0) out = '1' + out;
    else break;
  }
  return out || '1';
}

async function main() {
  const challenge = process.argv[2] || `hive-did-c-spike:${new Date().toISOString()}`;

  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: 'Ed25519', namedCurve: 'Ed25519' },
    true,
    ['sign', 'verify'],
  );

  const rawPub = new Uint8Array(await crypto.subtle.exportKey('raw', publicKey));
  const prefixed = new Uint8Array(2 + rawPub.length);
  prefixed[0] = 0xed;
  prefixed[1] = 0x01;
  prefixed.set(rawPub, 2);
  const did = `did:key:z${base58btc(prefixed)}`;

  const data = new TextEncoder().encode(challenge);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'Ed25519' }, privateKey, data));
  const ok = await crypto.subtle.verify({ name: 'Ed25519' }, publicKey, sig, data);

  const report = {
    ok,
    did,
    challenge,
    signature_b64url: b64url(sig),
    publicKey_b64url: b64url(rawPub),
    note: 'experimental offline spike only — not hive production auth; private key never persisted',
  };

  console.log(JSON.stringify(report, null, 2));
  if (!ok) process.exit(1);
}

main().catch((e) => {
  console.error(String(e));
  process.exit(1);
});
