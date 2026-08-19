-- nanuet-brain — Nanuet's (the Queen's) own D1 database. Phase Q-A, 2026-08-19.
--
-- THE DATABASE DOES NOT EXIST YET. This file is the blueprint; creating the real
-- database is a founder-only act (see "Provisioning" at the bottom of this file
-- and worker/schema/NANUET_AUTONOMY.md). Until it exists, wrangler.jsonc's
-- NANUET_BRAIN binding stays COMMENTED OUT — a D1 binding pointing at a database
-- that does not exist fails the deploy at build time, which would take the live
-- Queen down. Same flip-the-switch discipline this repo already uses for
-- Vectorize, R2 and Queues.
--
-- Why a separate database rather than more tables in thehive-queen: the founder
-- was shown that exact tradeoff on 2026-08-10 (a separate DB costs one of the
-- account's 10 D1 slots, and the pattern does not scale to 13 agents x 2
-- databases) and chose separation anyway, for Kai El as the hive's second brain,
-- with his own words on the Queen: "the same for Nanuet later, when work on the
-- Queen resumes." This is that resumption. Real D1 headroom at the time of that
-- decision, from the founder's own dashboard: 2/10 databases, 91 MB / 5 GB.
--
-- ── Relationship to worker/schema/kai-el-brain.sql ───────────────────────────
-- That file's own header says Nanuet's eventual database should "use this exact
-- schema verbatim rather than a divergent copy, which is the drift bug task 30
-- already fixed once in this repo." That instruction is honoured here: all four
-- tables, all columns, and all indexes are identical, with exactly two stated
-- differences, neither of them silent:
--
--   1. Every `agent` column defaults to 'Nanuet' instead of 'Kai El'.
--   2. decision_log gains THREE additive, nullable columns — subject_kind,
--      subject_id, alignment_score — because Nanuet's real, already-shipped job
--      in worker/src/index.js is queenReview(): scoring one identified proposal
--      0-100 against the founder's written vision. Kai El has no equivalent
--      score. Stuffing a numeric score into a free-text column would make the
--      only thing she actually produces unqueryable.
--
-- Difference 2 is additive and nullable on purpose: kai-el-brain.sql can adopt
-- these three columns later with a plain ALTER TABLE and nothing in Kai El's
-- existing code changes. That keeps the two schemas convergent rather than
-- forked. If a future session reconciles them into one shared file, this is the
-- delta to fold in — it is written down here so it is a decision, not drift.

-- ── memories ──────────────────────────────────────────────────────────────
-- Nanuet's own episodic memory. This does NOT replace the existing Vectorize
-- semantic index (worker/src/index.js remember()/recall()) — it complements it,
-- and closes the same real limitation Kai El's table closes: remember() truncates
-- stored text to 512 characters in Vectorize metadata, so the full text of every
-- memory has always been discarded at write time. Vectorize keeps the embedding
-- and answers "what is similar"; this table keeps the complete text and the
-- temporal/usage facts a vector index cannot express.
CREATE TABLE IF NOT EXISTS memories (
  id               TEXT PRIMARY KEY,
  agent            TEXT NOT NULL DEFAULT 'Nanuet',
  kind             TEXT NOT NULL,              -- proposal-review | campaign | chat | governance | decision
  text             TEXT NOT NULL,              -- FULL text, deliberately not truncated
  summary          TEXT,
  source           TEXT,                       -- which surface it originated from
  ts               TEXT NOT NULL,              -- ISO8601, written at creation
  importance       REAL NOT NULL DEFAULT 0.5,  -- 0..1, used alongside recency in ranking
  vector_id        TEXT,                       -- link to the Vectorize entry, when one exists
  last_recalled_at TEXT,                       -- NULL until first recalled
  recall_count     INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_memories_agent_ts   ON memories(agent, ts DESC);
CREATE INDEX IF NOT EXISTS idx_memories_kind       ON memories(kind);
CREATE INDEX IF NOT EXISTS idx_memories_vector_id  ON memories(vector_id);

-- ── decision_log ──────────────────────────────────────────────────────────
-- What Nanuet was asked to judge, how she reasoned, and what actually happened.
-- The founder's request for Kai El was a "training database" + "training logs";
-- his own clarification was "log now, real fine-tuning later," because no GPU or
-- training infrastructure exists (the same open dependency as task 53). This is
-- the honest half under its honest name: a decision/outcome record, not training.
--
-- The Queen-specific columns:
--   subject_kind    — what she was judging (proposal | campaign-task | directive)
--   subject_id      — the real row id in thehive-queen, so a decision is traceable
--                     back to the thing it decided rather than free-floating
--   alignment_score — queenReview()'s real 0-100 score against FOUNDERS_VISION.md
--
-- risk_tier/risk_reason/risk_handling exist because the founder asked for exactly
-- this by name for Kai El: for high-risk items the agent must write out *why* it
-- is high-risk and *how* to handle it, not merely flag it. The same rule applies
-- to the Queen — more so, since she is the one agent with no superior.
--
-- outcome is NULL until it is actually known. It is never guessed at write time:
-- a decision log that pre-fills its own outcomes is a log of intentions, and the
-- whole point of this table is to eventually compare the two.
CREATE TABLE IF NOT EXISTS decision_log (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  agent           TEXT NOT NULL DEFAULT 'Nanuet',
  ts              TEXT NOT NULL,
  surface         TEXT NOT NULL,   -- proposal-review | campaign | chat | governance | heartbeat
  request         TEXT NOT NULL,   -- what was put in front of her
  reasoning       TEXT,            -- her stated reasoning (queenReview()'s REASON line)
  action          TEXT,            -- what she did or proposed
  risk_tier       TEXT NOT NULL DEFAULT 'normal',  -- low | normal | high
  risk_reason     TEXT,            -- REQUIRED in practice when risk_tier='high'
  risk_handling   TEXT,            -- REQUIRED in practice when risk_tier='high'
  autonomy_mode   TEXT NOT NULL DEFAULT 'draft-approve', -- autonomous | draft-approve | explicit-invoke
  subject_kind    TEXT,            -- Queen-specific: proposal | campaign-task | directive
  subject_id      TEXT,            -- Queen-specific: the id of the thing judged
  alignment_score INTEGER,         -- Queen-specific: queenReview()'s 0-100 score
  outcome         TEXT,            -- NULL until known; filled in later, never guessed
  outcome_at      TEXT,
  provider        TEXT,            -- which LLM actually answered (task 45's real data)
  tokens_in       INTEGER,
  tokens_out      INTEGER
);
CREATE INDEX IF NOT EXISTS idx_decision_agent_ts ON decision_log(agent, ts DESC);
CREATE INDEX IF NOT EXISTS idx_decision_risk     ON decision_log(risk_tier);
CREATE INDEX IF NOT EXISTS idx_decision_pending  ON decision_log(outcome) WHERE outcome IS NULL;
CREATE INDEX IF NOT EXISTS idx_decision_subject  ON decision_log(subject_kind, subject_id);

-- ── training_samples ──────────────────────────────────────────────────────
-- The corpus a future fine-tune would actually draw from. Accumulating it now
-- costs almost nothing and is the only part of "train the Queen" that is
-- buildable without GPU infrastructure. Nothing here trains anything today.
--
-- corrected_output is the most valuable column in this table: when the founder
-- overrules one of Nanuet's reviews, that correction is a supervised pair of a
-- quality no amount of unsupervised logging produces.
--
-- `eligible` defaults to 0 — a sample is not cleared for training use until
-- something explicitly clears it. Defaulting to 1 would mean every logged review
-- silently became training data, which is the kind of quiet scope expansion this
-- repo's own audits keep catching after the fact.
CREATE TABLE IF NOT EXISTS training_samples (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  agent              TEXT NOT NULL DEFAULT 'Nanuet',
  ts                 TEXT NOT NULL,
  system_prompt      TEXT,
  user_input         TEXT NOT NULL,
  assistant_output   TEXT NOT NULL,
  quality_label      TEXT,        -- good | bad | corrected | NULL (unlabelled)
  corrected_output   TEXT,        -- the founder's correction, when there was one
  source_decision_id INTEGER,     -- ties back to decision_log.id
  eligible           INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_training_agent_ts ON training_samples(agent, ts DESC);
CREATE INDEX IF NOT EXISTS idx_training_eligible ON training_samples(eligible);
CREATE INDEX IF NOT EXISTS idx_training_quality  ON training_samples(quality_label);

-- ── autonomy_registry ─────────────────────────────────────────────────────
-- DESCRIPTIVE ONLY. This table documents what each staged-autonomy switch means
-- and what the founder would do to turn it on. It deliberately has NO `enabled`
-- column.
--
-- That omission is the whole point and must not be "fixed" by a later session:
-- the real on/off state lives in deploy-time environment variables that Nanuet
-- cannot write. If enablement lived in this database, Nanuet — who writes to this
-- database — could grant herself autonomy by inserting a row. That is not a
-- hypothetical: automaton/ARCHITECTURE.md records finding exactly this class of
-- bug in the upstream system it was reverse-engineered from ("the agent able to
-- edit its own financial/authority rule files"), and closing it was one of the
-- five gaps that rebuild exists to fix. It matters more here than anywhere else
-- in the hive, because Nanuet is the one agent whose reports_to is NULL — there
-- is no superior above her to catch it.
CREATE TABLE IF NOT EXISTS autonomy_registry (
  key            TEXT PRIMARY KEY,   -- the env var name that actually controls it
  stage          INTEGER NOT NULL,   -- 1..6, the intended order of granting
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,      -- what Nanuet can do when this is on
  turn_on_steps  TEXT NOT NULL,      -- exactly what the founder does to enable it
  risk_note      TEXT NOT NULL,      -- what could go wrong; stated plainly
  requires       TEXT                -- key of the switch that should come first, if any
);

-- ── Seed: the staged-autonomy ladder ──────────────────────────────────────
-- NOT YET APPLIED ANYWHERE — unlike kai-el-brain.sql, whose seed was applied live
-- on 2026-08-10, this file has never been run against a real database because the
-- database does not exist. When the founder creates it, this whole file is what
-- gets applied (command at the bottom).
--
-- Stages 1-2 are BUILT (Phase Q-A, this file's own commit). Stages 3-6 are
-- documented destinations only, NOT BUILT — the same honest pattern Kai El's
-- stage 7 (KAI_FINANCIAL_AUTONOMY) uses: the ladder's shape is stated up front so
-- it is explicit rather than assumed, and each unbuilt row says so in its own
-- description rather than reading as a switch that already works.
--
-- Founder-facing version of these steps: worker/schema/NANUET_AUTONOMY.md.
INSERT OR REPLACE INTO autonomy_registry (key, stage, title, description, turn_on_steps, risk_note, requires) VALUES
('NANUET_BRAIN_WRITE', 1, 'Write to her own brain',
 'BUILT (Phase Q-A). Records her own memories into nanuet-brain. Append-only, visible to the founder. Grants no new power to act — only to remember what she already did.',
 'Cloudflare dashboard -> Workers & Pages -> thehive -> Settings -> Variables and Secrets -> add plain variable NANUET_BRAIN_WRITE = "on" -> Deploy. Requires the nanuet-brain database to exist and its wrangler.jsonc binding to be uncommented first — until then this switch does nothing at all.',
 'Lowest risk on this ladder. Worst case is storage growth. It cannot cause an action to happen.', NULL),
('NANUET_REVIEW_LOG', 2, 'Log the proposal reviews she already performs',
 'BUILT (Phase Q-A). Writes a decision_log row for every proposal she scores through queenReview() — the score, her REASON line, and which proposal it was. Records what already happens; changes no outcome. Adds nothing to what she is allowed to decide.',
 'Same dashboard path -> NANUET_REVIEW_LOG = "on" -> Deploy. Turn on stage 1 first or nothing is written.',
 'A review only happens at all when the pre-existing QUEEN_AUTONOMOUS_APPROVAL switch (FLIP_THE_SWITCHES.md switch 9) is on. This switch does not turn that one on and cannot. With switch 9 off, this writes nothing because there is nothing to write.', 'NANUET_BRAIN_WRITE'),
('NANUET_DOMAIN_ROUTING', 3, 'Route what she reviews to the right domain',
 'NOT BUILT — Phase Q-B. Would run each proposal through hive-conductor''s domain_router.py to learn which real domain (edge-backend/frontend/colonies/governance/strategy) it touches, instead of the current domain-blind score.',
 'Not a variable flip today: Phase Q-B has to be built first. This row exists so the ladder''s next rung is explicit rather than invented later.',
 'Adds a second reasoning pass per proposal, so it costs tokens. Still produces only a score and a label — no action.', 'NANUET_REVIEW_LOG'),
('NANUET_CAMPAIGN_OBSERVE', 4, 'Read the campaign queue and say what she would pick',
 'NOT BUILT — Phase Q-C tier 1. Would read the task queue and write her own read of it — which task she would pick next and why — into this decision log. Visible to the founder; changes nothing about how the daily firing actually runs.',
 'Not a variable flip today: Phase Q-C tier 1 has to be built first, and Phase Q-C is not authorised. Listed so the destination is stated, not assumed.',
 'Observation only. The risk is not the action — it is that a logged recommendation starts being treated as a decision by whoever reads it. Tier 2 below is where that becomes explicit and reviewable.', 'NANUET_BRAIN_WRITE'),
('NANUET_CAMPAIGN_ADVISE', 5, 'Have her recommendation read before a task is picked',
 'NOT BUILT — Phase Q-C tier 2. The daily-firing protocol would read her logged recommendation before choosing a task, the same way it already reads HIVE_PULSE.md first. Still no autonomous execution — a human or session does the work.',
 'Not a variable flip today: requires Phase Q-C tier 2 plus a real change to the daily-firing protocol, which lives outside the Worker.',
 'First rung where her output influences what actually gets done. The influence is advisory and fully visible, but it is influence.', 'NANUET_CAMPAIGN_OBSERVE'),
('NANUET_DELEGATE_AKOSHA', 6, 'Hand a task to Akosha for coordination',
 'NOT BUILT — Phase Q-C tier 3, and explicitly gated on a fresh founder sign-off, not just on being built. She could hand a task to Akosha to coordinate; every real action (a commit, a PR) still passes the same founder-only gates every other agent has. A voice in the loop, never a bypass of it.',
 'Deliberately NOT reachable by a variable flip. Requires: Phase Q-C tiers 1-2 running and reviewed, an agreed risk classification for delegated task types (the same open question Kai El''s Phase B still has), and the founder''s own sign-off on this rung specifically.',
 'Highest risk on this ladder. Nanuet is the one agent with no superior (reports_to IS NULL), so a delegation path from her is the one place the chain of command has nothing above it to catch a mistake. That is why this rung needs a human decision and not a variable.', 'NANUET_CAMPAIGN_ADVISE');

-- ── Provisioning: the founder's exact steps ───────────────────────────────
-- Nothing below has been run. These are the real commands, not a sketch.
--
--   1. Create the database (this is the founder-only act — it costs one of the
--      account's 10 D1 slots):
--        npx wrangler d1 create nanuet-brain
--
--   2. Copy the database_id that command prints.
--
--   3. Apply this schema to it:
--        npx wrangler d1 execute nanuet-brain --remote --file=worker/schema/nanuet-brain.sql
--
--   4. In wrangler.jsonc, uncomment the NANUET_BRAIN block inside d1_databases
--      and paste the real database_id in place of the placeholder. Do NOT
--      uncomment it before step 1 — a binding to a database that does not exist
--      fails the deploy and takes the live Queen down with it.
--
--   5. Deploy. GET /v11/nanuet/brain should then report provisioned:true with
--      real zeroed counts instead of the "not provisioned" notice.
--
-- Turning on any actual behaviour is a separate, later act — see the ladder above
-- and worker/schema/NANUET_AUTONOMY.md. Creating the database grants nothing on
-- its own: every switch is off until the founder sets it.
