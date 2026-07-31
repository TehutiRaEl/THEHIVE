# S1 — Rate limit inserts for `worker/src/index.js`

Apply inside the Worker on branch `grok/pr-133-s1-did` (or merge into main via PR).

## 1. `POST /command_text`

Replace the start of the handler:

```js
      if (p === '/command_text' && method === 'POST') {
        const body = await request.json().catch(() => ({}));
```

With:

```js
      if (p === '/command_text' && method === 'POST') {
        // S1 (PR #133): anti-spam rate limit — same 30/min/IP as arena writes
        const ipCmd = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipCmd, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        const body = await request.json().catch(() => ({}));
```

## 2. `POST /memory/remember`

Replace:

```js
      if (p === '/memory/remember' && method === 'POST') {
        const b = await request.json().catch(() => ({}));
```

With:

```js
      if (p === '/memory/remember' && method === 'POST') {
        // S1 (PR #133): anti-spam rate limit
        const ipMem = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipMem, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
        const b = await request.json().catch(() => ({}));
```

Uses existing `rateLimitOk` (fail-open on infra errors).
