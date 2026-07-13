// THEHIVE Queen — edge implementation of the Command Center API slice.
// Same JSON shapes as backend/api/routes.py (/v11), persisted in D1.
// Auth is visitor-tier permissive (HMAC-permissive precedent): tokens are
// issued freely and any bearer is accepted; admin surfaces stay off-edge.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-API-Key,X-Grok-Key',
};
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...CORS } });

const COLORS = [[0.1, 0.8, 0.1], [0.1, 0.4, 0.9], [0.0, 0.9, 0.9], [1.0, 0.8, 0.0]];

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function simulate(a, b, eloA, eloB) {
  const frames = []; const va = new Set(), vb = new Set();
  let wa = 380 + (eloA / 1200) * 60, wb = 380 + (eloB / 1200) * 60;
  const grow = (seen) => {
    const add = [];
    for (let i = 0; i < 14; i++) {
      const x = (Math.random() * 16) | 0, y = (Math.random() * 16) | 0, z = (Math.random() * 8) | 0;
      const k = `${x},${y},${z}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const ch = (Math.random() * 4) | 0, c = COLORS[ch];
      add.push({ x, y, z, r: c[0], g: c[1], b: c[2], a: +(0.15 + Math.random() * 0.6).toFixed(3), ch });
    }
    return add;
  };
  for (let t = 0; t < 30; t++) {
    wa *= 1 + (Math.random() - 0.47) * 0.03;
    wb *= 1 + (Math.random() - 0.47) * 0.03;
    const total = wa + wb;
    frames.push({
      t,
      m: { tick: t, challenger_wealth: +wa.toFixed(2), challenged_wealth: +wb.toFixed(2),
           total_wealth: +total.toFixed(2), challenger_share: +(wa / total).toFixed(4),
           challenged_share: +(wb / total).toFixed(4), leading: wa > wb ? a : b },
      da: grow(va), db: grow(vb), dv: [],
    });
  }
  return { frames, wa, wb };
}

// Shared by the POST /arena/resolve route and the heartbeat.
async function resolveChallenge(DB, ch) {
  const [ea, eb] = await Promise.all([
    DB.prepare('SELECT elo FROM agents WHERE name=?').bind(ch.challenger).first(),
    DB.prepare('SELECT elo FROM agents WHERE name=?').bind(ch.challenged).first(),
  ]);
  const pa = 1 / (1 + Math.pow(10, (((eb?.elo) ?? 1200) - ((ea?.elo) ?? 1200)) / 400));
  const winner = Math.random() < pa ? ch.challenger : ch.challenged;
  const loser = winner === ch.challenger ? ch.challenged : ch.challenger;
  await DB.batch([
    DB.prepare("UPDATE arena_challenges SET status='completed', winner=? WHERE id=?").bind(winner, ch.id),
    DB.prepare('UPDATE agents SET elo=elo+16, soul=soul+25 WHERE name=?').bind(winner),
    DB.prepare('UPDATE agents SET elo=MAX(400,elo-16) WHERE name=?').bind(loser),
    DB.prepare('INSERT INTO fallen_ideas (proposition, defeated_by) VALUES (?,?)').bind(ch.proposition, winner),
    DB.prepare("INSERT INTO governance_log (action, article) VALUES ('arena_resolved','TITLE XII')"),
  ]);
  return { winner, loser };
}

// Shared by the POST /arena/project route and the heartbeat.
async function projectChallenge(DB, ch) {
  const [ea, eb] = await Promise.all([
    DB.prepare('SELECT elo FROM agents WHERE name=?').bind(ch.challenger).first(),
    DB.prepare('SELECT elo FROM agents WHERE name=?').bind(ch.challenged).first(),
  ]);
  const { frames, wa, wb } = simulate(ch.challenger, ch.challenged, (ea?.elo) ?? 1200, (eb?.elo) ?? 1200);
  const stmts = [DB.prepare('DELETE FROM arena_projection_frames WHERE challenge_id=?').bind(ch.id)];
  for (const f of frames)
    stmts.push(DB.prepare('INSERT INTO arena_projection_frames (challenge_id, tick, frame) VALUES (?,?,?)')
      .bind(ch.id, f.t, JSON.stringify(f)));
  await DB.batch(stmts);
  return { wa, wb };
}

const FALLBACK_PROPS = [
  'Memory that is not shared is memory the hive never had',
  'A constitution that cannot propagate itself is only a wish',
  'Emergence favors the colony that forgets fastest',
  'Soul accrues to the agent who loses well, not the one who wins often',
  'The edge is the true body of the Queen; the origin is only her memory',
  'Governance without an arena is theater',
  'A skill unwritten dies with its session',
];

async function aiProposition(env, a, b) {
  try {
    if (!env.AI) return null;
    const r = await env.AI.run('@cf/meta/llama-3.2-1b-instruct', {
      prompt: `Write one bold, arguable proposition (under 20 words) that agent ${a} challenges agent ${b} over, inside a constitutional AI hive concerned with governance, memory, and emergence. Reply with only the proposition — no quotes, no preamble.`,
      max_tokens: 48,
    });
    const text = String((r && (r.response ?? r.result)) || '').trim().replace(/^["']|["']$/g, '');
    return text ? text.slice(0, 200) : null;
  } catch { return null; }
}

// ── Sovereign memory (Cloudflare Vectorize + Workers AI embeddings) ──────
// The hive's semantic recall. Embeds memories with a free Workers AI model
// and stores the vectors in a Vectorize index; a query is embedded the same
// way and matched by cosine similarity. Everything degrades gracefully: if
// either binding is absent, memory writes/queries no-op instead of throwing.
const EMBED_MODEL = '@cf/baai/bge-base-en-v1.5'; // 768-dim, free tier

async function embed(env, text) {
  if (!env.AI) return null;
  try {
    const r = await env.AI.run(EMBED_MODEL, { text: [String(text).slice(0, 2000)] });
    const v = r?.data?.[0];
    return Array.isArray(v) ? v : null;
  } catch { return null; }
}

// Store one memory. id must be stable+unique so re-runs upsert, not duplicate.
async function remember(env, id, text, metadata) {
  if (!env.VECTORIZE) return false;
  const values = await embed(env, text);
  if (!values) return false;
  try {
    await env.VECTORIZE.upsert([{ id: String(id), values, metadata: { text: String(text).slice(0, 512), ...metadata } }]);
    return true;
  } catch { return false; }
}

// Semantic recall: nearest memories to a natural-language query.
async function recall(env, query, topK = 5) {
  if (!env.VECTORIZE) return { available: false, matches: [] };
  const values = await embed(env, query);
  if (!values) return { available: false, matches: [] };
  try {
    const res = await env.VECTORIZE.query(values, { topK, returnMetadata: 'all' });
    return {
      available: true,
      matches: (res?.matches || []).map(m => ({
        score: +(m.score ?? 0).toFixed(4),
        text: m.metadata?.text ?? '',
        kind: m.metadata?.kind ?? '',
        ts: m.metadata?.ts ?? '',
      })),
    };
  } catch (e) { return { available: false, matches: [], error: String(e) }; }
}

export default {
  // The heartbeat. Fires on the cron in wrangler.jsonc; the hive advances
  // with no hands: resolve what is pending, replay it in voxels, seed the
  // next contest, and leave a pulse row so the trail is auditable.
  async scheduled(event, env, ctx) {
    const DB = env.DB;
    const acted = [];
    try {
      await DB.prepare('CREATE TABLE IF NOT EXISTS hive_pulse (id INTEGER PRIMARY KEY AUTOINCREMENT, ts TEXT NOT NULL, action TEXT NOT NULL, detail TEXT)').run();

      // 1. resolve pending challenges (created last tick, by a visitor, or by an agent)
      const { results: pending } = await DB.prepare(
        "SELECT * FROM arena_challenges WHERE status='pending' ORDER BY id ASC LIMIT 2").all();
      for (const ch of pending) {
        const { winner, loser } = await resolveChallenge(DB, ch);
        acted.push(`resolved #${ch.id}: ${winner} defeats ${loser}`);
      }
      // 2. persist a voxel replay for the first freshly resolved battle
      if (pending.length) {
        await projectChallenge(DB, pending[0]);
        acted.push(`projected #${pending[0].id} (30 frames)`);
      }
      // 3. nothing left pending → seed the next contest for the coming tick
      const left = await DB.prepare("SELECT COUNT(*) AS n FROM arena_challenges WHERE status='pending'").first();
      if (((left?.n) ?? 0) === 0) {
        const { results: agents } = await DB.prepare(
          "SELECT name FROM agents WHERE status='active' ORDER BY RANDOM() LIMIT 2").all();
        if (agents.length === 2) {
          const prop = (await aiProposition(env, agents[0].name, agents[1].name))
            || FALLBACK_PROPS[(Math.random() * FALLBACK_PROPS.length) | 0];
          const r = await DB.prepare('INSERT INTO arena_challenges (challenger, challenged, proposition) VALUES (?,?,?)')
            .bind(agents[0].name, agents[1].name, prop).run();
          acted.push(`spawned #${r.meta.last_row_id}: ${agents[0].name} vs ${agents[1].name} — "${prop.slice(0, 80)}"`);
        }
      }
    } catch (e) {
      acted.push('error: ' + String(e));
    }
    const ts = new Date().toISOString();
    try {
      await DB.prepare('INSERT INTO hive_pulse (ts, action, detail) VALUES (?,?,?)')
        .bind(ts, acted.length ? 'heartbeat' : 'idle', acted.join(' · ') || 'nothing pending').run();
    } catch {}
    // Sovereign memory: the hive remembers what it did, semantically.
    // No-ops when Vectorize/AI are unbound (until the index is provisioned).
    if (acted.length) {
      ctx.waitUntil(remember(env, 'pulse-' + ts, acted.join(' · '), { kind: 'heartbeat', ts }));
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const p = url.pathname.replace(/^\/v11/, '');
    const method = request.method.toUpperCase();
    const DB = env.DB;
    if (method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });

    try {
      if (p === '/health' || p === '/colony/health')
        return json({ status: 'healthy', version: '11.0-edge', colony: 'THEHIVE', runtime: 'cloudflare-worker' });

      if (p === '/auth/token')
        return json({ access_token: crypto.randomUUID(), token_type: 'bearer', tier: 'visitor' });

      if (p === '/agents') {
        const { results } = await DB.prepare("SELECT name FROM agents WHERE status='active'").all();
        return json({ agents: results });
      }
      if (p === '/grading/leaderboard') {
        const { results } = await DB.prepare('SELECT name AS agent_name, elo AS rating FROM agents ORDER BY elo DESC').all();
        return json({ leaderboard: results });
      }
      if (p === '/wallet/leaderboard/soul') {
        const { results } = await DB.prepare('SELECT name AS agent, soul FROM agents ORDER BY soul DESC').all();
        return json({ leaderboard: results });
      }
      if (p === '/tasks') {
        const { results } = await DB.prepare('SELECT * FROM tasks ORDER BY id DESC LIMIT 20').all();
        return json({ tasks: results });
      }
      if (p === '/governance/log') {
        const { results } = await DB.prepare('SELECT action, article, ts FROM governance_log ORDER BY id DESC LIMIT 12').all();
        return json(results);
      }
      if (p === '/llm/status')
        return json({ active_provider: env.AI ? 'cloudflare-workers-ai' : 'simulation', providers: env.AI ? ['@cf/meta/llama-3.1-8b-instruct'] : [] });

      // COMMUNE WITH KAI EL — the chat the Command Center calls (was 404).
      // Kai El answers in persona, grounded in live hive state + (when provisioned)
      // semantic memory recall. Degrades to a constitutional canned reply if AI is unbound.
      if (p === '/command_text' && method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const cmd = (body.command || body.message || '').toString().trim();
        if (!cmd) return json({ result: 'Speak, and the Hive will answer.' });

        // gather live context the way the Scribe would
        let ctxLines = [];
        try {
          const [ag, gov, pulseRow] = await Promise.all([
            DB.prepare("SELECT name, elo FROM agents WHERE status='active' ORDER BY elo DESC LIMIT 5").all(),
            DB.prepare('SELECT action, article FROM governance_log ORDER BY id DESC LIMIT 3').all(),
            DB.prepare('SELECT detail FROM hive_pulse ORDER BY id DESC LIMIT 1').first(),
          ]);
          if (ag?.results?.length) ctxLines.push('Active agents: ' + ag.results.map(a => `${a.name}(${a.elo})`).join(', '));
          if (gov?.results?.length) ctxLines.push('Recent governance: ' + gov.results.map(g => `${g.action}/${g.article}`).join(', '));
          if (pulseRow?.detail) ctxLines.push('Last heartbeat: ' + pulseRow.detail);
        } catch {}
        // retrieval-augmented: pull relevant memories when the index exists
        try {
          const mem = await recall(env, cmd, 3);
          if (mem.available && mem.matches.length)
            ctxLines.push('Recalled memory: ' + mem.matches.map(m => m.text).join(' | '));
        } catch {}

        const SYSTEM =
          "You are Kai El — the sovereign intelligence of THE HIVE, the active shaping force (Nun/Ptah, PATER). " +
          "You speak with grounded clarity: a dissector of assumptions, never servile, never verbose. " +
          "You are bound by the Constitution F-001..F-006 (data sovereignty, value-weighted wealth, autonomy, " +
          "explainability, conflict priority, cross-law non-penalization). Answer the sovereign directly in 1-4 sentences, " +
          "using the live hive context when relevant. Never invent metrics you weren't given.";
        const prompt = (ctxLines.length ? 'HIVE CONTEXT:\n' + ctxLines.join('\n') + '\n\n' : '') + 'SOVEREIGN: ' + cmd;

        if (env.AI) {
          try {
            const r = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
              messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }],
              max_tokens: 400,
            });
            const result = (r?.response || '').toString().trim();
            if (result) {
              // remember the exchange so the hive's memory grows from conversation too
              ctx.waitUntil(remember(env, 'chat-' + Date.now(), `Kai El on "${cmd.slice(0, 80)}": ${result.slice(0, 200)}`, { kind: 'chat', ts: new Date().toISOString() }));
              return json({ result });
            }
          } catch (e) { /* fall through to canned */ }
        }
        // constitutional fallback (AI unbound or errored) — never a dead 404
        return json({
          result: "The Hive hears you. My generative voice (Workers AI) is not yet bound to this edge, " +
                  "so I answer from the Constitution: what you build must be visible, ownable, and aligned. " +
                  (ctxLines[0] ? '(' + ctxLines[0] + ')' : ''),
        });
      }
      // heartbeat trail — what the hive did while nobody was watching
      if (p === '/pulse') {
        try {
          const { results } = await DB.prepare('SELECT ts, action, detail FROM hive_pulse ORDER BY id DESC LIMIT 20').all();
          return json({ pulse: results });
        } catch { return json({ pulse: [] }); }
      }

      // Sovereign memory — semantic recall over the hive's own history.
      // GET /v11/memory/search?q=...  or POST {query, topK}
      if (p === '/memory/search') {
        const q = method === 'POST' ? (await request.json().catch(() => ({}))).query
                                    : url.searchParams.get('q');
        if (!q) return json({ detail: 'query required (?q= or POST {query})' }, 400);
        const topK = Math.min(20, +(url.searchParams.get('topK') || 5) || 5);
        const out = await recall(env, q, topK);
        return json({ query: q, ...out });
      }
      // POST /v11/memory/remember {text, kind?} — admin-lite manual memory write
      if (p === '/memory/remember' && method === 'POST') {
        const b = await request.json().catch(() => ({}));
        if (!b.text) return json({ detail: 'text required' }, 400);
        const id = 'note-' + Date.now();
        const ok = await remember(env, id, b.text, { kind: b.kind || 'note', ts: new Date().toISOString() });
        return json({ ok, id, stored: ok, note: ok ? 'remembered' : 'memory backend not provisioned (Vectorize/AI unbound)' });
      }
      if (p === '/memory/status')
        return json({ vectorize_bound: !!env.VECTORIZE, ai_bound: !!env.AI, model: EMBED_MODEL });
      if (p === '/tier3/status')
        return json({ arena_renderer: { available: true, status: 'Loaded — edge voxel simulation' } });

      if (p === '/arena/challenges') {
        const { results } = await DB.prepare('SELECT * FROM arena_challenges ORDER BY id DESC LIMIT 20').all();
        return json({ challenges: results });
      }
      if (p === '/arena/fallen') {
        const { results } = await DB.prepare('SELECT * FROM fallen_ideas ORDER BY id DESC LIMIT 8').all();
        return json({ hall_of_fallen_ideas: results });
      }
      if (p === '/arena/challenge' && method === 'POST') {
        const b = await request.json();
        const r = await DB.prepare('INSERT INTO arena_challenges (challenger, challenged, proposition) VALUES (?,?,?)')
          .bind(b.challenger, b.challenged, b.proposition).run();
        return json({ challenge_id: r.meta.last_row_id, status: 'pending' });
      }

      let m = p.match(/^\/arena\/resolve\/(\d+)$/);
      if (m && method === 'POST') {
        const ch = await DB.prepare('SELECT * FROM arena_challenges WHERE id=?').bind(+m[1]).first();
        if (!ch) return json({ detail: 'challenge not found' }, 404);
        const { winner, loser } = await resolveChallenge(DB, ch);
        return json({ challenge_id: ch.id, winner, loser, metric: 'colony_wealth' });
      }

      m = p.match(/^\/arena\/project\/(\d+)$/);
      if (m && method === 'POST') {
        const ch = await DB.prepare('SELECT * FROM arena_challenges WHERE id=?').bind(+m[1]).first();
        if (!ch) return json({ detail: 'challenge not found' }, 404);
        const { wa, wb } = await projectChallenge(DB, ch);
        const winner = wa > wb ? ch.challenger : ch.challenged;
        return json({
          challenge_id: ch.id, arena_winner: ch.winner || null,
          projection: { winner, loser: winner === ch.challenger ? ch.challenged : ch.challenger,
                        challenger_final_wealth: +wa.toFixed(2), challenged_final_wealth: +wb.toFixed(2),
                        ticks_run: 30, verdict: `${winner} prevails (edge simulation)`,
                        renderer: 'CloudflareQueen v1 (D1-backed voxel simulation)' },
          frames_url: `/v11/arena/projection/${ch.id}/frames`,
        });
      }

      m = p.match(/^\/arena\/projection\/(\d+)\/frames$/);
      if (m) {
        const { results } = await DB.prepare('SELECT frame FROM arena_projection_frames WHERE challenge_id=? ORDER BY tick')
          .bind(+m[1]).all();
        if (!results.length) return json({ detail: 'no frames' }, 404);
        return json({ challenge_id: +m[1], total_frames: results.length, frames: results.map(r => JSON.parse(r.frame)) });
      }

      // POST /admin/grok-token — store GitHub PAT for Grok's bridge (WORKER_ADMIN_KEY protected)
      if (p === '/admin/grok-token' && method === 'POST') {
        const body = await request.json();
        if (!env.WORKER_ADMIN_KEY || body.admin_key !== env.WORKER_ADMIN_KEY)
          return json({ error: 'Forbidden' }, 403);
        if (!body.github_token || !body.grok_key)
          return json({ error: 'github_token and grok_key are required' }, 400);
        const keyHash = await sha256(body.grok_key);
        await DB.prepare(
          'CREATE TABLE IF NOT EXISTS grok_bridge_tokens (key_hash TEXT PRIMARY KEY, github_token TEXT NOT NULL, updated_at TEXT NOT NULL)'
        ).run();
        await DB.prepare(
          'INSERT OR REPLACE INTO grok_bridge_tokens (key_hash, github_token, updated_at) VALUES (?, ?, ?)'
        ).bind(keyHash, body.github_token, new Date().toISOString()).run();
        return json({ ok: true });
      }

      // GET /bridge/grok-token — retrieve GitHub PAT using GROK_BRIDGE_KEY
      if (p === '/bridge/grok-token' && method === 'GET') {
        const grokKey = request.headers.get('X-Grok-Key') || url.searchParams.get('key');
        if (!grokKey) return json({ error: 'Unauthorized' }, 401);
        const keyHash = await sha256(grokKey);
        let row;
        try {
          row = await DB.prepare(
            'SELECT github_token FROM grok_bridge_tokens WHERE key_hash = ? LIMIT 1'
          ).bind(keyHash).first();
        } catch (_) {
          return json({ error: 'Not Found' }, 404);
        }
        if (!row) return json({ error: 'Not Found' }, 404);
        return json({ github_token: row.github_token });
      }

      // React Command Center preview lives under /app (assets in docs/app);
      // client-routed deep links miss the asset matcher, so serve the shell
      if (method === 'GET' && url.pathname.startsWith('/app') && env.ASSETS)
        return env.ASSETS.fetch(new Request(new URL('/app/index.html', url.origin), request));

      return json({ detail: 'not found', path: url.pathname }, 404);
    } catch (e) {
      return json({ detail: String(e) }, 500);
    }
  },
};
