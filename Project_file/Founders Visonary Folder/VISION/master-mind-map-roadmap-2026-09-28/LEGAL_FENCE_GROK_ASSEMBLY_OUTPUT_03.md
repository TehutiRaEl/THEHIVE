# LEGAL FENCE, GROK INSTRUCTIONS, ORG MAPPING, ASSEMBLY — Output 3 of 3

**Source:** Founder-supplied Master Mind Map & Roadmap (2026-09-28). Unabridged.

---

## SECTION A: LEGAL FENCE — Deep Dive

### Zones

**GREEN:** Public pages; free API tiers per ToS; Actions free tier; Workers AI / Groq / Google AI Studio / Cerebras free; Discord **bot** accounts; Kaggle/Colab hours; lawfully collected public data storage.

**RED (never):** CAPTCHA/login bypass; continue after explicit block; private APIs without auth; GDPR personal data without basis; resell free tier; Discord **self-bots**; illegal Actions use; paid-tier circumvention.

**YELLOW (playground):** Public scrape where robots.txt says no (not a DMCA TPM); autonomous free-tier workflows when ToS silent/vague; multi-API gateway for single operator; agent memory in repos; scheduled LLM jobs — if no barrier bypassed and no explicit prohibition.

### Precedents (design law)

hiQ v. LinkedIn · Van Buren · post-block scrape = CFAA · robots.txt ≠ DMCA TPM · EU AI Act · GDPR · **agent is tool; person liable → fence in code**.

### Four checks (order)

1. requires_auth → RED
2. has_technical_barrier → RED
3. terms_explicitly_prohibits → RED
4. silence / not prohibited → YELLOW

### Risk routing

HIGH → sandbox + alert · MEDIUM → founder_review · LOW → execute+log+alert · ZERO → execute

### Sandbox / Audit

Isolated, logged, no production side effects. Audit = append-only SHA-256 prev_hash chain with verify().

---

## SECTION B: GROK-SPECIFIC INSTRUCTIONS

**Provides:** Web Search, X Search, Code Execution, Document Retrieval.
**Does not provide:** Persistent state, schedule, durable storage, long-running process.

**Pattern:** Grok = brain · GitHub Actions = runner · Repo = memory.

Deploy: paste Sovereign Hive context → feed campaigns one-by-one → Grok returns file content + STATE/OUTCOMES/MEMORY updates → founder commits → Actions runs.

Prompt template includes campaign, context, current STATE, task (next action + full files + memory updates), constraints (free tier, fence, no undeclared deps).

Modes: Think (plan) · Big Brain (architecture) · Agent (multi-step).

---

## SECTION C: ANTHROPIC → HIVE MAP

CEO→Emperor · President→Queen · CSO→AZR · Chief Architect→Daemon · Compute→Body · CTO→architect layer · CPO→SEE · Infra→Cloudflare/runner · CFO→SOUL Economy · CCO→Children · CISO→Solomon · Public Benefit→Legal Fence.

Research teams → ConstitutionChecker, Kai El dissection, Sandbox, SOUL, Fence, Swarm, HOARD.
Pipeline: Free GPU → (optional train) → safety stack → inference → SEE/Ghost → Fence+Return.
Structure: 1 founder + N agents; fence+audit as QA; sibling agents; execution-heavy; Emperor oversight; Sandbox as Labs.

---

## SECTION D: CLAUDE HYBRIDIZATION

**Keep:** diff not description; failure cases; trend; "what this does NOT tell you"; KAIEL advisory; no composite-score theater; no auto-accept; two buckets; founder-signed authority; SOUL modes by risk; reuse transport; no fake trustless network.

**Restore:** rung 0–33; two hands; tree not mesh; Mater-Pater; outcome tracking v1; Nanuet-first; Queen as spirit; HOARD; Legal Fence.

**Six specs:** evolution-gate · kaiel-handler · federation · mater-pater · spine-ascent · outcome-tracking.

---

## SECTION E: ASSEMBLY

**Week 1:** C0→C1→C2→C3→C6 parallel→C4→C5
**Week 2:** C7→Return

**Secrets:** GROQ_KEY · CLOUDFLARE_API_TOKEN · CLOUDFLARE_ACCOUNT_ID · DISCORD_WEBHOOK (bot) · FOUNDER_PRIVATE_KEY (Vault/local)

**Sequence:** repo tree + secrets → wrangler D1/Vectorize/deploy → Discord bot → Grok feeds → import fence on every action path → Return Campaign after each campaign.

**One-line of three outputs:** Mind map ontology · Campaign file roadmap · Fence + Grok + org map + hybridization + assembly.

---

The Emperor provides vision. The Queen governs. The HORDE works. The HOARD holds. The cycle never stops.

*End of Output 3 of 3.*
