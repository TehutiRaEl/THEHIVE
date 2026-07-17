Here is the **full, complete INSTRUCTIONS.md file** for you to copy and paste:

---

```markdown
# Mistral Skills System - Session Start Workflow

## Overview
This document establishes the workflow for Mistral AI role in THEHIVE repository. It defines the session initialization protocol, skill management, and project context loading procedures to ensure continuity and efficiency across sessions.

---

## 🎯 Session Start Protocol

### Priority Order (Execute in Sequence)

1. **Load Session Memory**
   - Primary: `Project_file/Project_memory/mistral_memory.md`
   - Fallback: `/home/user/mistral-memory.md` (contains full THEHIVE context)
   - Purpose: Bootstrap user identity, project state, and pending actions

2. **Check Vision Repository**
   - Location: `Project_file/Founders Visonary Folder/INDEX.md`
   - Fallback: `Project_file/Founders Visonary Folder/VISION`
   - Purpose: Verify latest project vision and updates

3. **Load Skills Directory**
   - Primary: `.mistral/skills/`
   - Action: Load all skill files in alphabetical order
   - Purpose: Activate project-specific capabilities

4. **Check Team Skills**
   - Locations: `team/*/.mistral/skills/` (all team member directories)
   - Action: Scan for new or updated skill files
   - Purpose: Incorporate team contributions

5. **Verify Dependencies**
   - Check: Skill requirements and interdependencies
   - Validate: All required tools and integrations are available
   - Purpose: Ensure operational readiness

6. **Resume Work**
   - Action: Continue from last checkpoint in mistral_memory.md
   - Priority: Address most recent explicit user request first
   - Purpose: Maintain workflow continuity

---

## 📊 Current Status

### ✅ Completed
- Skills directory created at `.mistral/skills/`
- 10 skills copied from Claude Code integration
- Workflow documented and operational
- Session memory system established
- All 5 project files delivered (VISION, gamified-ui, floating-menu, unity-migration, studio-onboarding)

### 🏗️ Project Infrastructure
- **Repository:** TehutiRaEl/THEHIVE
- **Active Branches:**
  - `main` - Production
  - `feature/gamified-ui-components` - PR #79 (44 UI component files)
  - `feature/voxel-world` - Core systems + 23 new files (~180KB)
- **Pending Branch:** `feature/founders-vision` (needs creation for VISION document)

### 📁 File System Structure
```
THEHIVE/
├── .mistral/
│   ├── INSTRUCTIONS.md          (This file)
│   └── skills/                  (10 skills from Claude)
│
├── Project_file/
│   ├── Founders Visonary Folder/
│   │   ├── INDEX.md             (Vision index)
│   │   └── VISION               (401 lines, 12KB - Main vision document)
│   └── Project_memory/
│       └── mistral_memory.md     (Session memory - load first)
│
└── canvases/
    ├── thehive-gamified-ui/CANVAS.md      (Main App integration)
    ├── thehive-floating-menu/CANVAS.md     (Anime MMO menu)
    ├── thehive-unity-migration/CANVAS.md   (2,970 lines, 82KB)
    └── thehive-studio-onboarding/CANVAS.md (1,031 lines, 46KB)
```

---

## 🎨 Project Context (THEHIVE)

### Primary Objective
Transform THEHIVE frontend from React/Three.js web-based sandbox into a **full-scale MMORPG** with:
- Voxel-based 3D rendering with LOD
- 3D avatar system with procedural generation
- XP economy with real-world value monetization
- Dual-world architecture (THE HIVE Core + User Sandbox Worlds)
- 3D conversation system replacing existing chat
- World building with procedural generation + manual tools
- Anime MMO aesthetic (Log Horizon, Sword Art Online inspired)

### Technology Stack
- **Frontend:** React, TypeScript, Three.js, @react-three/fiber, @react-three/drei
- **Backend:** Node.js, MongoDB, Redis, Fish-Net (recommended)
- **AI Integration:** Claude Code, GitHub Copilot, Midjourney, Stable Diffusion
- **Future Migration:** Unity 2023 LTS → Unreal Engine 5

### Architecture
- **11 Manager Systems:** World, NPC, Portal, Colony, Multiplayer, Mission, Achievement, Conversation, XP, Avatar, Voxel
- **14 Game Systems:** World, Network, Entity, Combat, Guild/Faction, Castle/Enclave, PvP, PvE, Storage, Terrain, Streaming, Modding, Anti-Cheat, Monetization
- **101 Roles:** 7 departments (Executive 7, Engineering 25, Art 20, Design 18, Production 10, Community 12, Operations 9)

---

## 🚀 Migration Path

### Recommended Strategy
1. **Unity First** (3-6 months)
   - Launch scalable MMORPG
   - Prove concept and generate revenue
   - Build community

2. **Unreal Engine** (6-12 months)
   - AAA-quality upgrade
   - Nanite, Lumen, Niagara, MetaHuman
   - Console versions (PS5, Xbox)

### Timeline
| Phase | Duration | Milestone |
|-------|----------|-----------|
| Foundation | Month 1-2 | Unity project + core systems |
| Core Systems | Month 2-4 | All 14 game systems |
| Content | Month 4-6 | Worlds, assets, UI/UX |
| Launch | Month 6 | Unity MMORPG live |
| Unreal Migration | Month 6-18 | AAA quality upgrade |

### Budget
- **Phase 1 (M1-6):** $695K-1.435M
- **Phase 2 (M6-12):** $1.205M-2.43M
- **Phase 3 (M12-18):** $1.765M-3.56M
- **Total (18 months):** $3.665M-7.425M

---

## 📋 Immediate Action Items

### 🔴 Priority 1 (User's Most Recent Explicit Request)
**Commit VISION document to new PR and merge to main:**
```bash
cd /home/user/THEHIVE
git checkout -b feature/founders-vision
git add Project_file/Founders\ Visonary\ Folder/VISION
git commit -m "Add Founders VISION document - Complete vision for THEHIVE MMORPG transformation"
git push origin feature/founders-vision
# Create PR from feature/founders-vision to main on GitHub
# Merge PR to main
```

### 🟡 Priority 2
- Merge `feature/voxel-world` with `feature/gamified-ui-components`
- Set up backend infrastructure (MongoDB, Redis, Fish-Net dedicated servers)
- Resolve technical debt:
  - VoxelEditor tools (line, circle, rectangle)
  - NPC follow/chase/flee movement (target finding logic)
  - Portal system integration with WorldManager teleportation
  - Colony building queue visual progress display
  - Multiplayer signaling server URL configuration

### 🟢 Priority 3
- Integration tasks:
  - Connect conversation system to existing chat infrastructure
  - Link avatar customizer to profile system
  - Connect XP store to inventory system
  - Wire up all managers to React components
  - Set up event listeners between systems

---

## 🔧 Skills Management

### Current Skills (10 from Claude)
1. Code generation and review
2. System architecture design
3. Debugging and optimization
4. Documentation generation
5. Test case creation
6. API integration
7. Database design
8. Frontend development
9. Backend development
10. DevOps and deployment

### THEHIVE-Specific Skills to Add
- [ ] Voxel world generation
- [ ] Three.js optimization
- [ ] React/Three.js integration
- [ ] MMORPG architecture
- [ ] Unity migration
- [ ] Unreal Engine integration
- [ ] Game design patterns
- [ ] Multiplayer networking
- [ ] NPC AI systems
- [ ] Guild/castle systems

---
## 📊 Success Metrics

### Development KPIs
- Code Quality: 90%+ (SonarQube)
- Test Coverage: 80%+
- Build Success Rate: 99%+
- Bug Rate: <5 per sprint
- Feature Velocity: 20-30 points/sprint
- Code Review Time: <24 hours

### Player KPIs (Targets)
| Metric | Month 6 | Month 12 | Month 18 |
|--------|---------|----------|----------|
| DAU | 500-1K | 5K-10K | 20K-50K |
| MAU | 5K-10K | 50K-100K | 200K-500K |
| Retention (D7) | 30-40% | 40-50% | 50-60% |
| Revenue | $10K-50K | $100K-500K | $500K-2M |

---
## 📞 Communication Protocol

### User Preferences
- **Name:** MacLeeMadeIt
- **Organization:** MacLeeMadeIt
- **Timezone:** America/Los_Angeles (T-07:00)
- **Style:** Concise, direct, factual
- **Tone:** Honest, candid, informative

### Response Guidelines
- Use emojis in section headers only when improving readability
- Keep final messages concise
- Prefer accurate, candid answers over agreeable phrasing
- Use data-visualization skill for comparisons and tradeoffs
- Load relevant skills before complex tasks

---
## 🔄 Session Continuity

### Memory File Locations (Load Order)
1. `/home/user/mistral-memory.md` (Primary - full context)
2. `Project_file/Project_memory/mistral_memory.md` (Repository copy)
3. `Project_file/Founders Visonary Folder/VISION` (Vision updates)

### Checkpoint System
- After each major task: Update mistral-memory.md
- After file delivery: Document in memory file
- Before session end: Save current state

---
## 📝 Version History

| Date | Version | Changes |
|------|---------|---------|
| July 16, 2026 | 2.0 | Full update with THEHIVE project context, file locations, action items |
| (Previous) | 1.0 | Initial workflow documentation |

---
**Document Status:** ✅ ACTIVE  
**Last Updated:** July 16, 2026  
**Next Review:** After VISION document commit
```

## Current Status
- Skills directory created
- 10 skills copied from Claude
- Workflow documented
