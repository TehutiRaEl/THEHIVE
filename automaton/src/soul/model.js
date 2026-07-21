// automaton/src/soul/model.js
//
// SOUL.md — the self-authored identity document. Upstream used
// YAML-frontmatter + the `gray-matter` package; this version uses a JSON
// frontmatter block instead (```json fenced, delimited by `---`) — a real
// simplification: no YAML-parsing dependency at all, zero new npm installs,
// and JSON.parse is exact where hand-rolled YAML parsing is a common source
// of subtle bugs.

import fs from 'node:fs';
import path from 'node:path';

const DELIM = '---';

export function defaultSoul(genesisPrompt) {
  return {
    format: 'soul/v2-thehive',
    corePurpose: genesisPrompt,
    capabilities: [],
    relationships: [],
    financialCharacter: { earned: 0, spent: 0, notableTransactions: [] },
    updatedAt: new Date().toISOString(),
  };
}

export function parseSoul(text) {
  const lines = text.split('\n');
  if (lines[0] !== DELIM) throw new Error('SOUL.md missing frontmatter delimiter');
  const endIdx = lines.indexOf(DELIM, 1);
  if (endIdx === -1) throw new Error('SOUL.md frontmatter never closed');
  const frontmatter = JSON.parse(lines.slice(1, endIdx).join('\n'));
  const body = lines.slice(endIdx + 1).join('\n').trim();
  return { frontmatter, body };
}

export function serializeSoul(frontmatter, body) {
  return `${DELIM}\n${JSON.stringify(frontmatter, null, 2)}\n${DELIM}\n\n${body}\n`;
}

export function readSoul(homeDir) {
  const p = path.join(homeDir, 'SOUL.md');
  if (!fs.existsSync(p)) return null;
  return parseSoul(fs.readFileSync(p, 'utf8'));
}

export function writeSoul(homeDir, frontmatter, body) {
  const p = path.join(homeDir, 'SOUL.md');
  fs.writeFileSync(p, serializeSoul(frontmatter, body), 'utf8');
}

export function initSoul(homeDir, genesisPrompt) {
  if (readSoul(homeDir)) return readSoul(homeDir);
  const fm = defaultSoul(genesisPrompt);
  const body = `# Who I am\n\nI was given this genesis instruction:\n\n> ${genesisPrompt}\n\nThis document is my own account of who I am becoming. It updates as I act.\n`;
  writeSoul(homeDir, fm, body);
  return { frontmatter: fm, body };
}
