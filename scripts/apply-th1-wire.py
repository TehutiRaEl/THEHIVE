#!/usr/bin/env python3
"""Surgical TH-1 wire: three anchors into worker/src/index.js."""
from pathlib import Path
import re
import sys

p = Path("worker/src/index.js")
text = p.read_text()
if "CREATE TABLE IF NOT EXISTS townhall_items" in text and "p === '/townhall'" in text:
    print("already wired")
    sys.exit(0)

m = re.search(
    r"DB\.prepare\(`CREATE TABLE IF NOT EXISTS venture_sandbox_runs[\s\S]*?founder_note TEXT\)`\),",
    text,
)
if not m:
    print("ANCHOR1 fail: venture_sandbox_runs block not found", file=sys.stderr)
    sys.exit(1)
ddl = """DB.prepare(`CREATE TABLE IF NOT EXISTS townhall_items
      (id INTEGER PRIMARY KEY AUTOINCREMENT,
       ts TEXT NOT NULL, updated_at TEXT NOT NULL,
       author_agent TEXT NOT NULL, kind TEXT NOT NULL,
       title TEXT NOT NULL, body TEXT,
       status TEXT NOT NULL DEFAULT 'open',
       claimed_by TEXT, assigned_by TEXT,
       preferred_specialty TEXT, specialty_tags TEXT,
       priority INTEGER NOT NULL DEFAULT 50,
       pressure REAL NOT NULL DEFAULT 0,
       signal_score REAL NOT NULL DEFAULT 0,
       ttl_at TEXT,
       parent_id INTEGER, root_id INTEGER,
       loop_phase TEXT, failure_of_id INTEGER, innovation_note TEXT,
       colony_id TEXT, mesh_targets TEXT, gateway_hint TEXT,
       founder_visible INTEGER NOT NULL DEFAULT 1,
       risk_tier TEXT NOT NULL DEFAULT 'normal',
       vision_ref TEXT, alignment_score REAL,
       council_status TEXT, elder_note TEXT,
       requires_founder INTEGER NOT NULL DEFAULT 0,
       proposal_id INTEGER, roadmap_ref TEXT, output_ref TEXT,
       provenance TEXT,
       contradiction_flag INTEGER NOT NULL DEFAULT 0, gap_label TEXT)`),"""
text = text.replace(m.group(0), m.group(0) + "\n    " + ddl, 1)

m = re.search(
    r"if \(p === '/updates'\) \{[\s\S]*?catch \{ return json\(\{ updates: \[\] \}\); \}\n      \}",
    text,
)
if not m:
    print("ANCHOR2 fail: /updates block not found", file=sys.stderr)
    sys.exit(1)
routes = """
      // TownHall bulletin (TH-1)
      if (p === '/townhall' && method === 'GET') {
        try {
          await ensureTables(DB);
          const { limit, offset } = pageParams(url, 50, 200);
          const status = (url.searchParams.get('status') || '').toString().slice(0, 40);
          const kind = (url.searchParams.get('kind') || '').toString().slice(0, 40);
          let sql = 'SELECT * FROM townhall_items';
          const binds = [];
          const clauses = [];
          if (status) { clauses.push('status=?'); binds.push(status); }
          if (kind) { clauses.push('kind=?'); binds.push(kind); }
          if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');
          sql += ' ORDER BY signal_score DESC, id DESC LIMIT ? OFFSET ?';
          binds.push(limit, offset);
          const { results } = await DB.prepare(sql).bind(...binds).all();
          return json({ items: results || [], limit, offset });
        } catch (e) { return json({ items: [], detail: String(e) }); }
      }
      if (p === '/townhall' && method === 'POST') {
        if (!(await tokenOk(DB, request, env))) return json({ detail: 'token required (GET /v11/auth/token first)' }, 401);
        const ipTh = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipTh, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        await ensureTables(DB);
        const body = await request.json().catch(() => ({}));
        const title = (body.title || '').toString().trim().slice(0, 200);
        if (!title) return json({ detail: 'title required' }, 400);
        const kind = (body.kind || 'agent_ask').toString().slice(0, 40);
        const author = (body.author_agent || 'anonymous').toString().slice(0, 80);
        const detail = (body.body || '').toString().slice(0, 4000);
        const risk = ['low', 'normal', 'high'].includes(body.risk_tier) ? body.risk_tier : 'normal';
        const requiresFounder = risk === 'high' || body.requires_founder ? 1 : 0;
        const priority = Number.isFinite(+body.priority) ? Math.min(100, Math.max(0, +body.priority)) : 50;
        const now = new Date().toISOString();
        const signal = priority;
        const r = await DB.prepare(
          `INSERT INTO townhall_items (
            ts, updated_at, author_agent, kind, title, body, status,
            preferred_specialty, specialty_tags, priority, pressure, signal_score,
            colony_id, founder_visible, risk_tier, requires_founder, vision_ref, loop_phase
          ) VALUES (?,?,?,?,?,?, 'open', ?,?,?,0,?, ?,1,?,?,?,?)`
        ).bind(
          now, now, author, kind, title, detail,
          body.preferred_specialty ? String(body.preferred_specialty).slice(0, 80) : null,
          body.specialty_tags ? JSON.stringify(body.specialty_tags).slice(0, 500) : null,
          priority, signal,
          body.colony_id ? String(body.colony_id).slice(0, 40) : null,
          risk, requiresFounder,
          body.vision_ref ? String(body.vision_ref).slice(0, 200) : null,
          body.loop_phase ? String(body.loop_phase).slice(0, 40) : 'intake'
        ).run();
        return json({ ok: true, id: r.meta?.last_row_id ?? null });
      }"""
if "p === '/townhall'" not in text:
    text = text.replace(m.group(0), m.group(0) + routes, 1)

m3 = "'GET /pulse', 'GET /memory/status', 'POST /memory/search', 'POST /memory/remember',"
if m3 not in text:
    print("ANCHOR3 fail", file=sys.stderr)
    sys.exit(1)
if "'GET /townhall'" not in text:
    text = text.replace(m3, m3 + "\n            'GET /townhall', 'POST /townhall (token+rate-limited)',", 1)

p.write_text(text)
print("wired ok", len(text))
