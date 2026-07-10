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

export default {
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
      if (p === '/llm/status') return json({ active_provider: 'cloudflare-edge', providers: [] });
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
        return json({ challenge_id: ch.id, winner, loser, metric: 'colony_wealth' });
      }

      m = p.match(/^\/arena\/project\/(\d+)$/);
      if (m && method === 'POST') {
        const ch = await DB.prepare('SELECT * FROM arena_challenges WHERE id=?').bind(+m[1]).first();
        if (!ch) return json({ detail: 'challenge not found' }, 404);
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

      return json({ detail: 'not found', path: url.pathname }, 404);
    } catch (e) {
      return json({ detail: String(e) }, 500);
    }
  },
};
