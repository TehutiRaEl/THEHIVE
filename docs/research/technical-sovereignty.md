# Technical Sovereignty Research — Open Weights, User-Side Agents, PLC Targets

**Date:** 2026-09-19  
**Status:** Research + roadmap (not all shipped)  

---

## 1. Goal

Reduce **landlord risk**: API keys, closed inference, cloud lock-in, rate-limit eviction.  
Prefer infrastructure the order/Hive can run under its own charter.

---

## 2. Open weights / local inference

| Path | Honesty |
|------|--------|
| **WebLLM** (browser) | Strong sovereignty for client-side; model size/device limits |
| **Ollama + Apache/MIT models** | Local server sovereignty; hardware cost is the rent |
| **Workers AI / Groq / cloud** | Fast; still landlord — label honestly in provider roster |
| **xAI / OpenAI / Anthropic** | Closed; use with badges, never silent default without disclosure |

**Hive work:** keep provider registry + honesty badges; add “fully-open” routing preference when models are actually open.

---

## 3. User-side agent patterns

| Pattern | Why |
|---------|-----|
| Browser extension / user-device execution | Actions under user’s session; architecture researched after tool-vs-person case law — still not a license to violate CFAA/ToS |
| Explicit consent log | Founder/user authorization recorded |
| No silent server-side impersonation of user on third-party sites | Risk reduction |

**Hive work:** design docs + optional scaffold; no “bypass Amazon” product.

---

## 4. PLC / industrial targets

| Target | Status |
|--------|--------|
| Coherence snapshot before dispatch | Design (body doctrine) |
| Deterministic scan tick | Aspirational SLO |
| MQTT Sparkplug B colony bus | Not live — HTTP remains |
| Capabilities in colony.json | Not fully declared |
| Route memory (joint cartilage) | Not shipped |

See PLC/body vision logs for anatomy mapping.

---

## 5. DePIN / data plane

Evaluate Filecoin-class or similar for **non-secret** public artifacts; secrets stay in proper secret stores. Sovereignty ≠ putting private keys on a public network.

---

## 6. Priority bricks (eng)

1. Honesty badges everywhere inference runs  
2. Optional fully-open provider preference  
3. Body/lineage Operator surface (this PR)  
4. Coherence snapshot job (later)  
5. MQTT evaluation spike (later)  
