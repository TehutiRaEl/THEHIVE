# Venture V1 — Our Chemical Desire (Kai El’s first venture)

> **Status:** Founder decisions **locked 2026-08-29** (plan still not live infrastructure).  
> **UI surface:** Command Center Phase 0 first → Discord primary controls (Phase 2+)  
> **Code home until Phase 2:** **THEHIVE only** (no separate venture repo yet)  
> **Authority:** Founder answers §8; maps to accepted `docs/HIVE_CALL_LIST.md` ladder.

---

## 0. Locked founder decisions (2026-08-29)

| # | Decision |
|---|----------|
| 1 | **Name:** *Our Chemical Desire* |
| 2 | **First episode / ongoing format:** Discussion **over a book**. Every episode discussion **and every session** is training data for Kai El (log → memory / training_samples path when switches allow). |
| 3 | **Discord:** **New server** that Kai manages |
| 4 | **Platform (near-term):** **One platform — Discord.** Kai uses the founder’s **current Discord** relationship/account context so a bot can **create the podcast server** (guild) under founder authorization. No multi-OAuth priority list for Phase 2. |
| 5 | **Video / social:** **Two AI avatars** + slides + speech / video-language tooling → **faceless, automated** social outputs aligned to founder preferences and guidance (not founder face-cam). |
| 6 | **Primary controls (v1 ops):** **Discord** (server Kai creates). That server is **connected to Command Center ↔ Worker backend ↔ frontend** and required call sites. |
| 7 | **Phase 0 UI before Discord work:** **Yes** |
| 8 | **Repo:** **THEHIVE only until Phase 2** |

---

## 1. One-sentence intent

Kai El runs *Our Chemical Desire* as a book-discussion podcast and continuous self-training loop, with Discord as the operational control plane (new guild Kai manages), dual AI-avatar + slides faceless media, Command Center as the hive-visible status/plan surface first, all code in THEHIVE until Phase 2, founder approving secrets and irreversible steps.

---

## 2. Honest capability map

| Vision piece | Hive today | Gap |
|--------------|------------|-----|
| Venture plan / gaps / proposals | **Live** | Podcast-specific CC card |
| Kai chat + brain + training_samples | **Live** (switch-gated) | Explicit “every session → training” policy wiring |
| Book-discussion episode briefs | **Live** via `/command_text` | Book title not chosen yet |
| Discord bot creates **new guild** | **Not built** | Bot token, permissions, create-guild flow |
| Discord ↔ Command Center sync | **Not built** | Bridge routes + UI |
| Dual AI avatars + slides + TTS/video language | **Not built** | Model/tooling choice + render pipeline |
| Faceless automated social accounts | **Not built** | Platform APIs + founder preference store |
| TownHall `venture_pointer` | Schema on main; routes **PR #195** | Wire then seed |

**Still forbidden without founder:** password tables in D1, auto-spend, claiming live Discord/YouTube before Wire+Deploy.

---

## 3. Macro → micro (this venture)

| Level | Role |
|-------|------|
| **Founder** | Book choice, bot token, preference guidance, approve publish/spend |
| **Queen** | Score infra/spend proposals vs FOUNDERS_VISION |
| **Kai El** | Host discussion, learn every session, propose structure, drive avatars/scripts |
| **Discord guild** | Primary controls (`#founder-controls`, planning, archives, Kai status) |
| **Command Center** | Phase 0 visibility; later mirror of Discord state |
| **Worker** | APIs, memory, gaps, future Discord bridge call sites |
| **THEHIVE repo** | All code until Phase 2 |

---

## 4. Phased roadmap

### Phase 0 — Command Center visibility (before Discord) — **NEXT**

- Venture card: **Our Chemical Desire**  
- Status badges Phase 0–5; blockers (no bot token, no book selected)  
- CTA: “Select book / Provision Discord bot”  
- Link to this doc; optional TownHall pointer after TH-1 wire  
- Gaps list via existing ventures/gaps API when approved  

### Phase 1 — Paper studio + Kai training loop (THEHIVE only)

1. Founder names **book** (open question below).  
2. Episode = structured discussion of that book (chapters/themes).  
3. Kai produces outline, questions, show notes, dual-avatar script + slide outline.  
4. **Every session** (commune + episode work): write memory + eligible training sample path (`logDecision` / `logTrainingSample` / kaiRemember) under existing switches — **policy: always treat as training**, never silent.  
5. No Discord required.  

### Phase 2 — Discord primary controls (still THEHIVE code)

**Requires founder:** Discord application, bot token in Secrets Store, founder Discord user id, permission for bot to **create guild** (or create guild via founder OAuth — exact API path to confirm at implement time).

- Kai manages **new** podcast server  
- Channels: planning, archives, kaiel-status, founder-controls  
- Bridge: Discord actions ↔ Worker ↔ Command Center display  
- DMs to founder on milestones  

### Phase 3 — Dual AI avatar + slides + speech pipeline

- Two avatars (roles TBD: e.g. Kai + “reader” / devil’s advocate — confirm)  
- Slides from episode outline  
- Speech + video-language tooling for **faceless** outputs  
- Preference store for tone, platforms, post cadence (founder-guided)  

### Phase 4 — Automated social distribution (beyond Discord)

Only after Phase 3 pipeline exists and founder connects accounts (OAuth, not passwords).

### Phase 5 — Monetization

Founder-gated; Kai tracks/reports only.

---

## 5. Command Center UI (Phase 0 spec)

**Panel:** Ventures → **Our Chemical Desire**

1. Status / phase badge  
2. Next action CTA  
3. Book + episode queue  
4. Training note: “Sessions feed Kai memory/training (switch-gated)”  
5. Gaps (Discord bot, avatar pipeline, …)  
6. Link to this plan  

Primary **ops** controls stay Discord from Phase 2; CC remains hive brain mirror.

---

## 6. Capability gaps (file when you say go)

| Gap | needed_for |
|-----|------------|
| Discord bot token + create-guild permission | Phase 2 server Kai manages |
| FOUNDER_DISCORD_ID | DMs + controls auth |
| Dual-avatar + TTS/slide render path | Faceless video |
| Social post adapters (post-Discord) | Automated accounts |
| Explicit session→training policy flag | Every session trains Kai |

---

## 7. Remaining questions (only what’s still unknown)

1. **Which book** for episode 1 (title + optional chapter range)?  
2. **Two avatars:** names/roles/personality (e.g. Kai El + a fixed co-host persona)?  
3. Do you already have a **Discord bot application**, or should the plan assume founder creates one from scratch?  
4. For “use my current Discord”: confirm you mean **your user account owns/authorizes the bot**, and the **podcast guild is new** (not “create channels inside an existing friend server”).  

---

## 8. Session capability (unchanged honesty)

| Can now | Cannot now |
|---------|------------|
| Keep this plan accurate; Phase 0 UI task breakdown | Create real Discord guild without bot token |
| Draft training-policy notes for Worker | Ship dual-avatar video pipeline in one PR |
| TH-1 wire still PR #195 (patch / full blob on order) | Claim automated social accounts live |
