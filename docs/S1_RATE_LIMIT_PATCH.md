# S1 Rate Limit Patch (exact inserts)

If `worker/src/index.js` on the branch does not yet contain these lines, apply them.

## POST /command_text

Immediately inside `if (p === '/command_text' && method === 'POST') {`:

```js
        // S1 (PR #132): anti-spam rate limit — same 30/min/IP as arena writes
        const ipCmd = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipCmd, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
```

## POST /memory/remember

Immediately inside `if (p === '/memory/remember' && method === 'POST') {`:

```js
        // S1 (PR #132): anti-spam rate limit
        const ipMem = request.headers.get('CF-Connecting-IP') || 'unknown';
        if (!(await rateLimitOk(DB, ipMem, env))) return json({ detail: 'rate limit exceeded — 30 POSTs/min' }, 429);
```
