-- kai-el-brain — Kai El's own D1 database (created 2026-08-10, founder-directed)
--
-- Separate from thehive-queen by the founder's explicit choice, made after being
-- shown the tradeoff: a physically separate database costs one of the account's
-- 10 D1 slots, and this pattern does NOT scale to every agent (13 agents x 2
-- databases each would be 26, well past the ceiling). The founder chose it
-- specifically for Kai El anyway, as the hive's second brain — Nanuet, the first
-- brain, gets the same treatment later when work on the Queen resumes.
--
-- Every table carries an `agent` column even though this database currently
-- serves one agent. That is deliberate: it costs nothing now and means Nanuet's
-- eventual database can use this exact schema verbatim rather than a divergent
-- copy, which is the drift bug task 30 already fixed once in this repo.

-- ── memories ──────────────────────────────────────────────────────────────
-- Kai El's own episodic memory. This does NOT replace the existing Vectorize
-- semantic index (worker/src/index.js remember()/recall()) — it complements it,
-- and closes a real limitation in it: remember() truncates stored text to 512
-- characters in Vectorize metadata, so the full text of every memory has always
-- been discarded at write time. Vectorize keeps the embedding and answers "what
-- is similar"; this table keeps the complete text and the temporal/usage facts a
-- vector index cannot express.
CREATE TABLE IF NOT EXISTS memories (
  id               TEXT PRIMARY KEY,
  agent            TEXT NOT NULL DEFAULT 'Kai El',
  kind             TEXT NOT NULL,              -- chat | work-cycle | roadmap | venture | project | decision
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
-- What Kai El was asked, what he decided, and what actually happened. This is
-- the "training database" half of the founder's request under its honest name:
-- a decision/outcome record, not model training. Real weight-level fine-tuning
-- is a separate future task gated on hosting that does not exist yet (same
-- dependency as task 53) — the founder's own words were "log now, real
-- fine-tuning later."
--
-- risk_tier/risk_reason/risk_handling exist because the founder asked for
-- exactly this by name: for high-risk items Kai El must write out *why* it is
-- high-risk and *how* to handle it, not merely flag it.
CREATE TABLE IF NOT EXISTS decision_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  agent         TEXT NOT NULL DEFAULT 'Kai El',
  ts            TEXT NOT NULL,
  surface       TEXT NOT NULL,   -- chat | roadmap | venture | project | work-cycle
  request       TEXT NOT NULL,   -- what was asked of him
  reasoning     TEXT,            -- his stated reasoning
  action        TEXT,            -- what he did or proposed
  risk_tier     TEXT NOT NULL DEFAULT 'normal',  -- low | normal | high
  risk_reason   TEXT,            -- REQUIRED in practice when risk_tier='high'
  risk_handling TEXT,            -- REQUIRED in practice when risk_tier='high'
  autonomy_mode TEXT NOT NULL DEFAULT 'draft-approve', -- autonomous | draft-approve | explicit-invoke
  outcome       TEXT,            -- NULL until known; filled in later, never guessed
  outcome_at    TEXT,
  provider      TEXT,            -- which LLM actually answered (task 45's real data)
  tokens_in     INTEGER,
  tokens_out    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_decision_agent_ts ON decision_log(agent, ts DESC);
CREATE INDEX IF NOT EXISTS idx_decision_risk     ON decision_log(risk_tier);
CREATE INDEX IF NOT EXISTS idx_decision_pending  ON decision_log(outcome) WHERE outcome IS NULL;

-- ── training_samples ──────────────────────────────────────────────────────
-- The corpus that a future fine-tune would actually draw from. Accumulating it
-- now costs almost nothing and is the only part of "train Kai El" that is
-- buildable without GPU infrastructure. Nothing here trains anything today.
--
-- corrected_output is the most valuable column in this table: when the founder
-- corrects Kai El, that correction is a supervised training pair of a quality no
-- amount of unsupervised logging produces.
--
-- `eligible` defaults to 0 — a sample is not cleared for training use until
-- something explicitly clears it. Defaulting to 1 would mean every logged
-- exchange silently became training data, which is the kind of quiet scope
-- expansion this repo's own audits keep catching.
CREATE TABLE IF NOT EXISTS training_samples (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  agent              TEXT NOT NULL DEFAULT 'Kai El',
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
-- the real on/off state lives in deploy-time environment variables that Kai El
-- cannot write. If enablement lived in this database, Kai El — who writes to this
-- database — could grant himself autonomy by inserting a row. That is not a
-- hypothetical: automaton/ARCHITECTURE.md records finding exactly this class of
-- bug in the upstream system it was reverse-engineered from ("the agent able to
-- edit its own financial/authority rule files"), and closing it was one of the
-- five gaps that rebuild exists to fix. Authority stays where the agent cannot
-- reach it.
CREATE TABLE IF NOT EXISTS autonomy_registry (
  key            TEXT PRIMARY KEY,   -- the env var name that actually controls it
  stage          INTEGER NOT NULL,   -- 1..7, the intended order of granting
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,      -- what Kai El can do when this is on
  turn_on_steps  TEXT NOT NULL,      -- exactly what the founder does to enable it
  risk_note      TEXT NOT NULL,      -- what could go wrong; stated plainly
  requires       TEXT                -- key of the switch that should come first, if any
);

-- ── Seed: the staged-autonomy ladder ──────────────────────────────────────
-- Applied for real 2026-08-10 via the Cloudflare connector. Reproduced here so
-- the database can be rebuilt from this file rather than from live state alone.
-- Full founder-facing version of these steps: FLIP_THE_SWITCHES.md section 12.
INSERT OR REPLACE INTO autonomy_registry (key, stage, title, description, turn_on_steps, risk_note, requires) VALUES
('KAI_BRAIN_WRITE', 1, 'Write to his own brain',
 'Records his own memories, decisions and outcomes into kai-el-brain. Append-only, visible to the founder. Grants no new power to act — only to remember what he already did.',
 'Cloudflare dashboard -> Workers & Pages -> thehive -> Settings -> Variables and Secrets -> add plain variable KAI_BRAIN_WRITE = "on" -> Deploy.',
 'Lowest risk on this ladder. Worst case is storage growth. It cannot cause an action to happen.', NULL),
('KAI_BRAINSTORM_EXPLICIT', 2, 'Deep-think when asked',
 'A longer, more expensive reasoning pass to outline and scope a task. Fires only when the founder explicitly asks.',
 'Same dashboard path -> KAI_BRAINSTORM_EXPLICIT = "on" -> Deploy.',
 'Costs real tokens per invocation, but only when the founder clicks. Cannot fire on its own.', 'KAI_BRAIN_WRITE'),
('KAI_TAB_DRAFT', 3, 'Draft work from the Command Center tabs',
 'Reads the Roadmap, Venture Planner and Project tabs and drafts proposals. Every draft is founder-approved before anything happens.',
 'Same dashboard path -> KAI_TAB_DRAFT = "on" -> Deploy.',
 'Can create proposal rows unprompted, so the queue can fill faster than it is reviewed. Still cannot execute anything.', 'KAI_BRAIN_WRITE'),
('KAI_BRAINSTORM_AUTO', 4, 'Deep-think on his own initiative',
 'Detects an underspecified task and runs the deep-think pass without being asked.',
 'Same dashboard path -> KAI_BRAINSTORM_AUTO = "on" -> Deploy. Recommended only after watching stage 2 long enough to know the real per-invocation cost.',
 'First switch where he spends real tokens without the founder initiating. Task 51''s ceiling is the backstop and now counts real work tokens, so this surfaces there rather than hiding in cache cost.', 'KAI_BRAINSTORM_EXPLICIT'),
('KAI_4DBRAIN_BRIDGE', 5, 'Reach the 4DBRAIN colony',
 'Calls 4DBRAIN''s tesseract/dream-engine endpoints and folds the result into his reasoning.',
 'TWO things, not one: (1) 4DBRAIN must actually be deployed — it is not, its hive.yml base_url is empty and its Railway/Render configs were never provisioned; (2) then set FOURDBRAIN_URL = "<real https URL>" and KAI_4DBRAIN_BRIDGE = "on" -> Deploy.',
 'A real egress path that did not exist before. If 4DBRAIN is ever hosted somewhere the founder does not control, this is how data would leave.', 'KAI_BRAIN_WRITE'),
('KAI_TAB_AUTONOMOUS_LOW', 6, 'Act without asking, on low-risk items only',
 'Acts directly on low-risk items instead of drafting. High-risk items still require explicit founder invocation, and he must state why they are high-risk and how to handle them.',
 'Same dashboard path -> KAI_TAB_AUTONOMOUS_LOW = "on" -> Deploy. Recommended only after reviewing decision_log to see what he WOULD have done during stage 3.',
 'First switch that changes real state with no human in the loop. Safety rests entirely on the risk classifier being right; decision_log exists so this stays auditable.', 'KAI_TAB_DRAFT'),
('KAI_FINANCIAL_AUTONOMY', 7, 'Pay for his own upgrades',
 'Spends real money on his own infrastructure and provider costs. NOT BUILT — this row documents the ladder''s destination so it is explicit rather than assumed.',
 'Deliberately NOT a variable flip. Requires: a spending cap enforced in code, a per-transaction founder-visible record, a ceiling Kai El cannot raise himself, and a separate founder decision on its own terms. automaton/FLIP_THE_SWITCHES.md''s AUTOMATON_FINANCIAL_AUTONOMY is the precedent and defaults off for these reasons.',
 'Highest risk by a wide margin — the one place a bug costs money rather than tokens. Kai El must never be able to raise his own cap; that is the rule this stage cannot ship without.', 'KAI_TAB_AUTONOMOUS_LOW');
