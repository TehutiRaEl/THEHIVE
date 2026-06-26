const express = require('express');
const fs = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MEMORY_BASE = path.join(__dirname, 'memory-base');

app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// CORS — allow all origins for local dev
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', memoryBase: fs.existsSync(MEMORY_BASE) });
});

// Helper: resolve wildcard param to a clean path string
// Express wildcard (*) can return an Array when using the 'router' package
function resolveWildcard(param) {
  if (Array.isArray(param)) return param.join('/');
  return param || '';
}

// READ from memory-base (including tutorials)
app.get('/api/memory/*', (req, res) => {
  const file = resolveWildcard(req.params[0]);
  if (!file) return res.status(400).json({ error: 'No path provided' });

  const fullPath = path.join(MEMORY_BASE, file);

  // Prevent path traversal outside memory-base
  if (!fullPath.startsWith(MEMORY_BASE + path.sep) && fullPath !== MEMORY_BASE) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'Not found', path: file });
  }

  res.sendFile(fullPath);
});

// WRITE to sovereign-memory (auto-commit)
app.post('/api/memory/sovereign-memory/*', (req, res) => {
  const file = resolveWildcard(req.params[0]);
  if (!file) return res.status(400).json({ error: 'No path provided' });

  const fullPath = path.join(MEMORY_BASE, 'sovereign-memory', file);

  // Prevent path traversal
  const sovereignBase = path.join(MEMORY_BASE, 'sovereign-memory');
  if (!fullPath.startsWith(sovereignBase + path.sep)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    fs.ensureDirSync(path.dirname(fullPath));
    fs.writeFileSync(fullPath, JSON.stringify(req.body, null, 2));
  } catch (err) {
    console.error('Write error:', err);
    return res.status(500).json({ error: 'Write failed', detail: err.message });
  }

  exec(
    `cd "${MEMORY_BASE}" && git add . && git commit -m "Update ${file}" && git push`,
    (err) => { if (err) console.error('Git error:', err.message); }
  );

  res.json({ ok: true, path: file });
});

app.listen(PORT, () => {
  console.log(`🔄 Sovereign Bridge live on http://localhost:${PORT}`);
  console.log(`   Memory base: ${MEMORY_BASE}`);
  console.log(`   Exists: ${fs.existsSync(MEMORY_BASE)}`);
});
