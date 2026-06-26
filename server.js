const express = require('express');
const fs = require('fs-extra');
const { exec } = require('child_process');
const path = require('path');
const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// READ from memory-base — using named wildcard
app.get('/api/memory/*file', (req, res) => {
  const file = req.params.file;
  const fullPath = path.join(__dirname, 'memory-base', file);
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'File not found: ' + file });
  }
  res.sendFile(fullPath);
});

// WRITE to sovereign-memory (auto-commit)
app.post('/api/memory/sovereign-memory/*file', (req, res) => {
  const file = req.params.file;
  const fullPath = path.join(__dirname, 'memory-base', 'sovereign-memory', file);
  fs.ensureDirSync(path.dirname(fullPath));
  fs.writeFileSync(fullPath, JSON.stringify(req.body, null, 2));

  exec(`cd memory-base && git add . && git commit -m "Update ${file}" && git push`, (err) => {
    if (err) console.error('Git error:', err);
  });

  res.json({ ok: true, path: file });
});

app.listen(3000, () => {
  console.log('🔄 Sovereign Bridge running on http://localhost:3000');
  console.log('📁 Serving memory-base from', path.resolve('memory-base'));
});
