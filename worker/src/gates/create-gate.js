// worker/src/gates/create-gate.js
// Deterministic gate on every write to hive_proposals.

export function normalizeTitle(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/^#\d+\s+/, '')
    .replace(/^hive\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function createGate(env, DB, { title, body, kind }) {
  const normalized = normalizeTitle(title);

  try {
    const clash = await DB.prepare(
      `SELECT id, title FROM hive_proposals
       WHERE status = 'pending'
         AND normalized_title = ?
       LIMIT 1`
    ).bind(normalized).first();

    if (clash) {
      return {
        ok: false,
        layer: 'gate-1-advocate',
        reason: 'open theme exists',
        existing_id: clash.id,
        existing_title: clash.title,
        normalized_title: normalized,
      };
    }
  } catch (e) {
    // Column may not exist yet pre-migration
  }

  const hasAssumption =
    /\b(assum|risk|cost|sacrific|tradeoff|trade-off|caveat)\b/i.test(body || '');

  if (!hasAssumption && kind === 'architect-proposal') {
    return {
      ok: false,
      layer: 'gate-2-advocate',
      reason: 'no assumption or risk named',
      normalized_title: normalized,
    };
  }

  const hasPossibility =
    /\b(enables?|makes possible|unlocks?|opens?|becomes possible|allows?)\b/i.test(body || '');

  if (!hasPossibility && kind === 'architect-proposal') {
    return {
      ok: false,
      layer: 'gate-3-wonder',
      reason: 'no possibility named',
      normalized_title: normalized,
    };
  }

  if ((body || '').length < 120 && kind === 'architect-proposal') {
    return {
      ok: false,
      layer: 'gate-4-fusion',
      reason: 'insufficient substance (min 120 chars)',
      normalized_title: normalized,
    };
  }

  return { ok: true, normalized_title: normalized };
}

export async function logGateRefusal(env, DB, gate, { title, body, kind }) {
  try {
    await DB.prepare(
      `INSERT INTO gate_refusals (ts, layer, reason, title, body_excerpt, existing_id, kind)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      new Date().toISOString(),
      gate.layer,
      gate.reason,
      title,
      String(body || '').slice(0, 240),
      gate.existing_id || null,
      kind || null
    ).run();
  } catch {
    // Table may not exist yet
  }
}
