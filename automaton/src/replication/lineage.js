// automaton/src/replication/lineage.js

import { genId } from '../state/database.js';

export class Lineage {
  constructor(db) {
    this.db = db;
  }

  createProposed({ parentId, genesisPrompt, constitutionHash }) {
    const id = genId('lin');
    this.db.prepare(
      `INSERT INTO lineage (id, parent_id, spawned_at, genesis_prompt, constitution_hash, status)
       VALUES (?,?,?,?,?,'proposed')`
    ).run(id, parentId ?? null, Date.now(), genesisPrompt, constitutionHash);
    return id;
  }

  setStatus(id, status) {
    this.db.prepare('UPDATE lineage SET status = ? WHERE id = ?').run(status, id);
  }

  get(id) {
    return this.db.prepare('SELECT * FROM lineage WHERE id = ?').get(id);
  }

  activeChildren() {
    return this.db.prepare("SELECT * FROM lineage WHERE status IN ('approved','running')").all();
  }

  all() {
    return this.db.prepare('SELECT * FROM lineage ORDER BY spawned_at DESC').all();
  }
}
