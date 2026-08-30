# Venture V1 — The Sovereign Podcast (Kai El’s first venture)

> **Status:** Plan for founder review (not live infrastructure).  
> **Date:** 2026-08-29  
> **UI surface:** Command Center → Venture / Roadmap / Proposals / (future TownHall)  
> **Authority:** Founder-directed vision document; maps to accepted `docs/HIVE_CALL_LIST.md` ladder.

---

## 0. One-sentence intent (from founder)

Kai El creates, hosts, streams, and (eventually) monetizes a multi-platform podcast, with the founder approving, connecting accounts, and guiding — Discord as command surface, multi-platform distribution, persistent preferences, value from day one **where lawful and actually built**.

---

## 1. Honest capability map (what exists vs what this vision needs)

| Vision piece | Hive today (verified) | Gap |
|--------------|----------------------|-----|
| Venture brief → structured plan | **Live:** `POST /v11/venture/plan` | No podcast-specific UI card yet |
| Capability requests | **Live:** `venture_capability_gaps` | Discord/stream APIs not requested yet |
| Sandbox build + PR | **Live:** `venture_sandbox_runs` + workflow pattern | Needs venture repo tasks |
| Kai chat + memory | **Live:** `/command_text`, KAI_BRAIN, Vectorize | Not Discord DMs |
| Proposals / founder decide | **Live** | Use for each irreversible connect/spend |
| Discord server create / bot / voice record | **Not built** | Bot token, intents, hosting |
| YouTube/Twitch/Spotify live push | **Not built** | OAuth + stream keys; founder must connect |
| Store platform login passwords in hive DB | **Must not** | Use OAuth tokens only; founder-gated secrets |
| Auto ad revenue / sponsorship deals | **Not built** | Commerce still founder-gated (Chromosome IX) |
| Command Center “first venture” panel | **Partial** | Venture Planner exists; podcast card is new UI |
| TownHall board item for venture | Schema on main; routes **pending PR #195** | Wire then post `venture_pointer` |

**Rule from call list:** do not claim “wired” or “autonomous streaming” until Wire + Deploy evidence exists.

---

## 2. Macro → micro (how this venture uses hive calls)

| Level | This venture |
|-------|----------------|
| **Founder** | Approves phases; connects OAuth; toggles platforms; decides monetization |
| **Queen** | Scores any proposal that changes infra/spend against FOUNDERS_VISION |
| **Kai El** | Episode planning, scripts, show notes, summaries, gap requests, sandbox task briefs |
| **Akosha** | Later: assign “edit,” “show notes,” “clip for X” specialties |
| **TownHall** | `founder_task` / `plan` / `venture_pointer` / `finding` / `innovation` |
| **Edge** | New routes only after specify→implement→wire→test (no secret dumps) |

---

## 3. Phased roadmap (implement → wire → test → develop → deploy)

### Phase 0 — Command Center visibility (this session can start)

**Goal:** Venture appears as a first-class object in the UI/docs, not only as chat prose.

| Deliverable | Type | This session? |
|-------------|------|----------------|
| This plan doc | Specify | **Yes** |
| Seed `hive_proposals` / TownHall item “Sovereign Podcast V1” | Wire (after TH-1) | After #195 |
| Venture card copy + status badges (Planned / Needs founder / Blocked) | UI develop | Plan + optional stub |
| Capability-gap rows (Discord bot, OAuth YouTube, …) | API already live | **Yes — can POST when you approve** |

### Phase 1 — Paper studio (no external APIs)

**Goal:** Kai + founder can run a full “episode loop” **inside the hive** without Discord/YouTube.

1. Episode brief (topic, duration, format) → Kai via `/command_text` or TownHall.  
2. Kai produces outline + talking points + intro/outro text.  
3. Founder records audio/video **on their machine** (or Discord voice later).  
4. Kai produces show notes, title options, timestamps, X clip scripts.  
5. Artifacts stored as `hive_updates` / R2 files (if FILES bound) / proposal for “publish checklist.”  

**Value day-one without lying:** content pipeline and brand memory, not fake “now live on Twitch.”

### Phase 2 — Discord command surface (founder-provisioned bot)

**Requires founder:** Discord application + bot token in Secrets Store; your user ID; invite URL.

| Step | Owner |
|------|--------|
| Create Discord app + bot, enable intents | Founder |
| `wrangler secret put DISCORD_BOT_TOKEN` (+ FOUNDER_DISCORD_ID) | Founder |
| Worker or separate process: create guild/channels **or** use a pre-created server ID | Implement |
| Channels: `#podcast-planning`, `#podcast-archives`, `#kaiel-status`, `#founder-controls` (text toggles first) | Implement |
| DM founder on milestone (ready / episode archived) | Implement + test |
| **Not in v1:** full voice capture/edit pipeline (high complexity) | Later |

### Phase 3 — Distribution (OAuth, not password storage)

**Requires founder:** OAuth apps for each platform; connect once; store **refresh tokens** in Secrets Store or encrypted founder-only store — never in public D1 dumps.

Order of platforms (suggested — confirm):

1. YouTube (upload + later live)  
2. Spotify for Podcasters / RSS  
3. X (clips)  
4. Twitch  
5. Apple (via RSS)  

UI toggles in Command Center / Discord `#founder-controls` only **enable already-connected** platforms.

### Phase 4 — Live stream engine

Multi-platform simultaneous live is non-trivial (OBS/RTMP, restream, or platform APIs). Treat as **sandbox venture repo** work with real PRs, not a single Worker fetch handler.

### Phase 5 — Monetization

Only after: real audience path + founder business entity decisions (existing commerce honesty). Kai **tracks and reports**; founder **receives and decides**. No auto-spend.

---

## 4. Brand defaults (editable — please confirm)

| Field | Proposed default | Confirm? |
|-------|------------------|----------|
| Working title | **The Sovereign Podcast** | Y/N / alternate |
| Format | Conversation (founder ↔ Kai El) | |
| Default length | 60 minutes | |
| Primary video | YouTube | |
| Primary audio | Spotify via RSS | |
| Command surface | Discord + Command Center | |
| Auto-publish | **Off** until founder toggles | |

---

## 5. Command Center UI — first appearance (spec)

**Panel name:** “Ventures → Sovereign Podcast (V1)”

**Sections:**

1. **Status** — Phase 0–5 badges; blockers (missing bot token, missing OAuth).  
2. **Next action** — single founder CTA (e.g. “Provision Discord bot”, “Approve Phase 1 episode brief”).  
3. **Episode queue** — list from TownHall `kind=plan|finding` filtered by `colony_id=podcast` or `vision_ref`.  
4. **Platform toggles** — disabled until connected; never show raw secrets.  
5. **Kai summary** — last 3 agent-work / concern lines related to this venture.  
6. **Gaps** — live from `GET /v11/ventures/gaps?venture=sovereign-podcast`.

**Does not require Discord to ship Phase 0 UI** — only honest empty states.

---

## 6. Capability gaps to file (when you say go)

| Gap title | capability_needed | needed_for |
|-----------|-------------------|------------|
| Discord bot token + guild | Discord Bot API | Channels, DMs, founder controls |
| YouTube OAuth + upload | YouTube Data API | Publish / later live |
| Podcast RSS host | Feed hosting (R2 or external) | Spotify/Apple |
| Stream key / RTMP path | Live encoding | Multi-platform live |
| Encrypted token vault | Secrets Store pattern | Remember connections without password tables |

---

## 7. What this session can / cannot do

### Can do now (docs / plan / structure)

- [x] Publish this plan on a branch/PR  
- [ ] Open PR for plan  
- [ ] After your answers: tighten brand + phase order  
- [ ] Draft Phase 0 UI wireframe copy in docs  
- [ ] List exact gap POST bodies for your approval  
- [ ] Align with TH-1 TownHall so a `venture_pointer` can land once routes are live  

### Can do only with your tokens / accounts

- Discord bot create + invite  
- YouTube/Twitch/Spotify developer apps  
- Any live stream test  

### Cannot honestly claim this session

- “Kai already created your Discord server and is live on YouTube”  
- Storing your platform **passwords** in D1  
- Autonomous ad revenue  
- Full audio edit + multi-RTMP engine in one Worker PR  

### TH-1 index.js wire (parallel)

PR #195 still holds the surgical patch only (245KB full-file apply was deferred). **This session:** venture plan ships; TH-1 remains “apply three anchors then merge” unless you order full-blob push again.

---

## 8. Questions for you (no assumptions)

1. **Brand:** Keep “The Sovereign Podcast” or different name/subtitle?  
2. **Phase 1 first episode topic** (even placeholder)?  
3. **Discord:** New server Kai manages, or bot joins a server **you** already own?  
4. **Platform priority order** for OAuth (pick top 2 for Phase 3)?  
5. **Avatar/video:** Face-cam you, AI avatar, screen-share slides, or audio-only first?  
6. **Command Center vs Discord:** Which is the **primary** control surface for v1 toggles?  
7. **Should Phase 0 UI ship before any Discord work?** (Recommended: yes.)  
8. **Venture repo:** Use existing `venture` colony repo, new repo name, or only THEHIVE docs until Phase 2?

Reply with answers (even partial). Next step after answers: adjust this plan + optional gap POSTs + Phase 0 UI task breakdown.
