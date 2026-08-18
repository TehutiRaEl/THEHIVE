-- provider_health usage-tracking columns (2026-08-18, Phase 2 Kai El authority —
-- usage/quota visibility)
--
-- Applied live via ensureTables() in worker/src/index.js on every heartbeat
-- (ALTER TABLE ... ADD COLUMN, guarded so it's a no-op once already applied — same
-- pattern as every other migration-loop entry in that function). Reproduced here so
-- the schema is rebuildable from the repo rather than known only from live state,
-- matching the convention set by venture-capability-gaps.sql / venture-sandbox-runs.sql.
--
-- Deliberately three new columns on the EXISTING bounded provider_health row (one row
-- per provider, upserted in place), not a new growing per-call log table — D1 row
-- growth is a real, named constraint in this repo, and a log-per-call table was
-- explicitly ruled out for that reason. total_calls counts every real attempt
-- (success or failure); the token columns only grow on a real completion.
--
-- recordProviderHealth() increments these in place on every real generate() call:
--   INSERT INTO provider_health (...) VALUES (...)
--   ON CONFLICT DO UPDATE SET
--     total_calls = total_calls + 1,
--     total_tokens_in = total_tokens_in + excluded.total_tokens_in,
--     total_tokens_out = total_tokens_out + excluded.total_tokens_out
-- — an increment, not an overwrite/append. GET /v11/llm/status selects these three
-- columns alongside the existing provider/ok/error/checked_at fields; no new route
-- was needed since that endpoint already merges provider_health in.
ALTER TABLE provider_health ADD COLUMN total_calls INTEGER NOT NULL DEFAULT 0;
ALTER TABLE provider_health ADD COLUMN total_tokens_in INTEGER NOT NULL DEFAULT 0;
ALTER TABLE provider_health ADD COLUMN total_tokens_out INTEGER NOT NULL DEFAULT 0;
