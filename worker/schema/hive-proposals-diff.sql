-- hive_proposals diff columns (2026-08-10, Kai El's first architect-agent evolution)
--
-- Applied for real via the Cloudflare D1 connector against thehive-queen (production)
-- on 2026-08-10. Reproduced here so the schema is rebuildable from the repo rather
-- than known only from live state.
--
-- These columns let a 'architect-proposal' row carry a real, reviewable code diff
-- instead of only prose describing an intended change. Nothing here changes what a
-- proposal can DO — decideProposal() still never executes an architect-proposal;
-- a human (the founder, or a Claude Code session) still performs the real commit/PR.
-- ACTION_ALLOWLIST is unchanged; this is purely richer proposal content plus an
-- honest, real validity check on it.
ALTER TABLE hive_proposals ADD COLUMN diff TEXT;         -- unified diff, nullable
ALTER TABLE hive_proposals ADD COLUMN diff_files TEXT;   -- JSON array of touched file paths
ALTER TABLE hive_proposals ADD COLUMN diff_check TEXT;   -- NULL | 'pending' | 'applies_clean' | 'failed: <reason>'
