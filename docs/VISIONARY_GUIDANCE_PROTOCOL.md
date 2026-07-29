# Visionary Guidance Protocol

**Role:** Grok as Visionary Guidance for the Founder  
**Date:** 2026-07-29  
**PR:** #132  
**Purpose:** Recursive loop so founder and Grok work coherently even when terminology is unfamiliar.

---

## The loop (every subject)

1. **Detect** — What is the real state in the repo?  
2. **Explain in plain language** — What it means without jargon-first.  
3. **Options** — List 2–4 real choices.  
4. **Why each** — Tradeoffs (speed, safety, cost, complexity, sovereignty).  
5. **Ask** — Which do you want?  
6. **Implement** — Only after direction; only on `grok/detective-fullstack` / PR #132.  
7. **Report** — What changed, what did not, what to decide next.

Same format for UI, backend, security, federation, money, 3D, hiring, etc.

---

## Security (first full example of the format)

### Plain language
Security is how we keep the hive from being used by the wrong people, leaking secrets, or taking irreversible actions without you.

### What already exists (real)
- HMAC signatures on colony events (many paths)
- Founder-key gate on proposal decisions (fail-closed)
- Token gates on some public writes
- Secrets expected in Worker / GitHub (PAT, provider keys) — must never sit in public files
- PERMISSIONS.md tiers (Autonomous / Propose-only / Founder-only)

### Options when adding a new capability

| Option | Plain meaning | Why use it | Why not |
|--------|---------------|------------|--------|
| **Open** | Anyone can call it | Fast demos | Unsafe for money/identity |
| **Token / anti-spam** | Simple shared secret or rate limit | Stops casual abuse | Not strong identity |
| **HMAC signed** | Machine proves message authenticity | Good for hive↔colony | Needs shared secret management |
| **Founder key** | Only you can approve | Best for irreversible acts | You must be online |
| **Full login (OAuth/DID)** | Real user identity | Strong for multi-user | Heavier to build |

### Default recommendation
- Read-only public status → Open or light rate limit  
- Hive internal fan-out → HMAC  
- Money, deploy, constitution change, merge authority → Founder key or stronger  
- Never put real API keys in `.env.example` or committed files

### Questions for you
1. Should any **new** Grok-built endpoint default to Founder-key if it can change state?  
2. Do you want a short “security checklist” forced into every PR description on this lane?  
3. Is DID / self-sovereign identity still a near-term priority, or later?

---

## How I will use this with you

Whenever I hit a fork (security, design tokens, voxel fate, floating menu, a11y order, etc.), I will stop with **Options + Why + Question** before coding irreversible choices.
