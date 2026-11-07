-- nanuet-brain — Phase Q-B (BATCH-QB, QB-2): domain routing + vision verdict columns.
--
-- APPLY TO THE LIVE nanuet-brain D1 BEFORE THE QB-7 DEPLOY LANDS
-- (migration-before-deploy, BATCH-QB amendment 5). logNanuetDecision()'s INSERT
-- lists these columns explicitly; if the Workers deploy lands first, EVERY
-- INSERT fails — not just routed ones — and is silently swallowed by the
-- internal catch (total logging loss, a memory hole, not benign degradation).
--   npx wrangler d1 execute nanuet-brain --remote --file=worker/schema/nanuet-brain-domain-routing-columns.sql
--
-- Fresh databases created from worker/schema/nanuet-brain.sql AFTER this change
-- already have these columns in the CREATE TABLE — do NOT apply this file to
-- them (ALTER TABLE ADD COLUMN on an existing column errors). The registry
-- UPDATE below is a no-op there: it sets the row to the same text the seed
-- already carries.
--
-- Naming: descriptive, per this repo's own convention (cf.
-- worker/schema/provider-health-usage-columns.sql). There is NO numbered
-- sequence for the nanuet-brain schema — the base file is nanuet-brain.sql,
-- and the 001 that exists is 001-add-normalized-title.sql for thehive-queen, a
-- different database under Q-003. Do not renumber this file to imply one exists.

ALTER TABLE decision_log ADD COLUMN domain_label TEXT;
ALTER TABLE decision_log ADD COLUMN domain_verdict TEXT;
ALTER TABLE decision_log ADD COLUMN domain_matches TEXT;
ALTER TABLE decision_log ADD COLUMN domain_margin INTEGER;
ALTER TABLE decision_log ADD COLUMN auto_approvable INTEGER;
ALTER TABLE decision_log ADD COLUMN vision_override TEXT;
ALTER TABLE decision_log ADD COLUMN vision_hash TEXT;
ALTER TABLE decision_log ADD COLUMN routing_schema TEXT;

-- Q-C will query by domain; the index is cheap and part of this change.
CREATE INDEX IF NOT EXISTS idx_decision_domain ON decision_log(domain_label);

-- Live registry row: stage 3 is BUILT now. Strings are identical to the seed
-- in worker/schema/nanuet-brain.sql — the two must stay in sync.
UPDATE autonomy_registry SET
  description = 'BUILT (Phase Q-B, QB-2). Runs each proposal through the ported hive-conductor domain router (worker/src/index.js routeProposalDomain) to learn which real domain (edge-backend/frontend/colonies/governance/strategy) it touches, instead of the current domain-blind score. Also records a vision verdict (auto_approvable + hard-category override) against FOUNDERS_VISION.md.',
  turn_on_steps = 'Cloudflare dashboard -> Workers & Pages -> thehive -> Settings -> Variables and Secrets -> add plain variable NANUET_DOMAIN_ROUTING = "on" -> Deploy. Turn on stage 2 first or nothing is logged; stage 1 first or nothing is written.',
  risk_note = 'The ported keyword router costs zero tokens (pure function, no generate() call). It produces only a domain label and a vision verdict — no action, and it can never change a verdict: routing runs after the verdict, inside the log try/catch.'
WHERE key = 'NANUET_DOMAIN_ROUTING';
