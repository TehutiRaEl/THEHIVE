# PR #208 dissect — keep vs discard

**Date:** 2026-09-20  
**PR:** https://github.com/TehutiRaEl/THEHIVE/pull/208  
**Context:** #206 already merged (Body tab + base UNIFIED). #208 is a parallel draft on overlapping paths.

---

## KEEP (absorbed into resolved UNIFIED / #210 successor)

| Item | Why |
|------|-----|
| Live queue snapshot (~74 rows, ~53 pending) | Operational truth for founder decide |
| Approved IDs **1–8** table | Do-not-re-propose list |
| Rejected IDs **9–21** auth cluster | Do-not-revive list |
| F-007 / task-routing **clone diagnosis** | Names the real spam theme |
| Founder choices **A / B / C** bulk-reject | Actionable UI hygiene |
| “One cohesive proposal” framing vs 50 clones | Aligns with PROPOSAL_COALESCENCE |

These are now in `docs/UNIFIED_PROPOSAL_2026-09-20.md` on the resolve branch.

---

## DISCARD (do not merge #208)

| Item | Why |
|------|-----|
| `BodyLineagePanel.tsx` (208 variant) | #206 already on main; cosmetic only |
| `LeftNav.tsx` body item (`🫀`) | #206 already added `🧬` |
| `KaiElOS.tsx` dual `dream` PanelId | #206 `handleSelect` alias is cleaner; dual key is redundant |
| Task-14 comment deletion in KaiElOS | Noise; keep the explanatory comment on main |
| Short HIVE_UPDATES (7 lines) | Superseded by fuller logs |
| Entire #208 branch merge | Path conflicts with main; no unique UI left |

---

## Action

1. Merge the **resolve PR** (Omnivore + coalescence + absorbed keep) when CI green  
2. **Close #208** without merge  
3. **Close original #207** if still open (superseded by resolve branch)

---

*Grok · 2026-09-20*
