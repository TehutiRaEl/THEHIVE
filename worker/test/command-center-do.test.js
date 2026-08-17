// worker/test/command-center-do.test.js
//
// Covers CommandCenterDO (task 14, real-time Command Center push) and its two
// call sites: the /v11/ws route (forwards to the DO) and
// broadcastToCommandCenter() (the heartbeat's fire-and-forget push).
//
// What this suite CANNOT prove: the actual WebSocket upgrade round trip.
// node --test has no real WebSocketPair/101-upgrade runtime — only Cloudflare's
// own edge does. So fetch()'s upgrade branch is exercised only for its
// non-websocket paths (426, /broadcast); the session-tracking/broadcast logic
// that DOES run entirely in JS (_addSession/_broadcast) is tested directly
// against a stub socket, same "real logic behind a minimal stub" discipline
// the rest of this suite uses. Task 14's own Acceptance requires an observed
// live round trip — that proof is a post-merge edge-health-probe check, not
// something this suite can honestly claim.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import worker, { CommandCenterDO, broadcastToCommandCenter } from '../src/index.js';
import { makeEnv, stubCtx, req } from './helpers/env.js';

// A minimal stub matching only what CommandCenterDO's fetch()/_addSession()
// touch on a WebSocket-shaped object: accept(), send(), addEventListener().
function stubSocket() {
  const listeners = {};
  return {
    accepted: false,
    sent: [],
    accept() { this.accepted = true; },
    send(msg) {
      if (this.throwOnSend) throw new Error('closed');
      this.sent.push(msg);
    },
    addEventListener(type, fn) { listeners[type] = fn; },
    _fire(type) { listeners[type]?.(); },
  };
}

describe('CommandCenterDO — session tracking and broadcast', () => {
  test('_addSession adds a socket and _broadcast sends to it', () => {
    const doInstance = new CommandCenterDO({}, {});
    const ws = stubSocket();
    doInstance._addSession(ws);
    assert.equal(doInstance.sessions.size, 1);

    doInstance._broadcast({ kind: 'heartbeat', title: 'x' });
    assert.equal(ws.sent.length, 1);
    const parsed = JSON.parse(ws.sent[0]);
    assert.equal(parsed.type, 'update');
    assert.equal(parsed.kind, 'heartbeat');
    assert.equal(parsed.title, 'x');
  });

  test('_broadcast reaches every connected session, not just one', () => {
    const doInstance = new CommandCenterDO({}, {});
    const a = stubSocket();
    const b = stubSocket();
    doInstance._addSession(a);
    doInstance._addSession(b);

    doInstance._broadcast({ kind: 'x' });
    assert.equal(a.sent.length, 1);
    assert.equal(b.sent.length, 1);
  });

  test('a session that later closes stops receiving broadcasts', () => {
    const doInstance = new CommandCenterDO({}, {});
    const ws = stubSocket();
    doInstance._addSession(ws);
    ws._fire('close');
    assert.equal(doInstance.sessions.size, 0);

    doInstance._broadcast({ kind: 'x' });
    assert.equal(ws.sent.length, 0);
  });

  test('a session that errors is also dropped', () => {
    const doInstance = new CommandCenterDO({}, {});
    const ws = stubSocket();
    doInstance._addSession(ws);
    ws._fire('error');
    assert.equal(doInstance.sessions.size, 0);
  });

  test('a send() failure mid-broadcast drops that session without throwing', () => {
    const doInstance = new CommandCenterDO({}, {});
    const bad = stubSocket();
    bad.throwOnSend = true;
    const good = stubSocket();
    doInstance._addSession(bad);
    doInstance._addSession(good);

    assert.doesNotThrow(() => doInstance._broadcast({ kind: 'x' }));
    assert.equal(doInstance.sessions.has(bad), false);
    assert.equal(good.sent.length, 1);
  });
});

describe('CommandCenterDO.fetch() — non-upgrade paths', () => {
  test('POST /broadcast calls _broadcast with the parsed payload', async () => {
    const doInstance = new CommandCenterDO({}, {});
    const ws = stubSocket();
    doInstance._addSession(ws);

    const request = new Request('https://internal/broadcast', {
      method: 'POST',
      body: JSON.stringify({ kind: 'heartbeat', title: 'Arena cycle' }),
    });
    const response = await doInstance.fetch(request);
    assert.equal(response.status, 200);
    assert.equal(ws.sent.length, 1);
    assert.equal(JSON.parse(ws.sent[0]).title, 'Arena cycle');
  });

  test('a request with no Upgrade header and not /broadcast is rejected 426', async () => {
    const doInstance = new CommandCenterDO({}, {});
    const request = new Request('https://internal/ws');
    const response = await doInstance.fetch(request);
    assert.equal(response.status, 426);
  });
});

describe('/v11/ws route', () => {
  test('503s when COMMAND_CENTER is not bound (matches the flip-the-switch pattern)', async () => {
    const env = makeEnv();
    const response = await worker.fetch(req('/ws'), env, stubCtx());
    assert.equal(response.status, 503);
  });

  test('forwards the real request to the DO instance named "global"', async () => {
    const calls = [];
    const fakeStub = { fetch: async (request) => { calls.push(request); return new Response('forwarded'); } };
    const env = makeEnv({
      COMMAND_CENTER: {
        idFromName: (name) => { assert.equal(name, 'global'); return 'id-for-global'; },
        get: (id) => { assert.equal(id, 'id-for-global'); return fakeStub; },
      },
    });
    const request = req('/ws', { headers: { Upgrade: 'websocket' } });
    const response = await worker.fetch(request, env, stubCtx());
    assert.equal(await response.text(), 'forwarded');
    assert.equal(calls.length, 1);
    assert.equal(calls[0], request);
  });
});

describe('/v11/debug/ws-broadcast-test — the CI-triggerable proof route', () => {
  test('calls broadcastToCommandCenter with a kind:debug-test payload and echoes it back', async () => {
    let received;
    const fakeStub = {
      fetch: async (url, init) => { received = { url, init }; return new Response('ok'); },
    };
    const env = makeEnv({
      COMMAND_CENTER: { idFromName: () => 'id', get: () => fakeStub },
    });
    const response = await worker.fetch(
      req('/debug/ws-broadcast-test', { method: 'POST', body: { title: 'ci-check' } }),
      env,
      stubCtx()
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.broadcasted, true);
    assert.equal(body.payload.kind, 'debug-test');
    assert.equal(body.payload.title, 'ci-check');
    assert.equal(received.url, 'https://internal/broadcast');
    assert.equal(JSON.parse(received.init.body).title, 'ci-check');
  });

  test('with no body, still succeeds with a default title', async () => {
    const env = makeEnv({
      COMMAND_CENTER: { idFromName: () => 'id', get: () => ({ fetch: async () => new Response('ok') }) },
    });
    const response = await worker.fetch(
      req('/debug/ws-broadcast-test', { method: 'POST' }),
      env,
      stubCtx()
    );
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.payload.title, 'ws-broadcast-test');
  });
});

describe('broadcastToCommandCenter()', () => {
  test('no-ops when COMMAND_CENTER is unbound (never throws)', async () => {
    await assert.doesNotReject(() => broadcastToCommandCenter({}, { kind: 'x' }));
  });

  test('POSTs the payload to the DO\'s /broadcast path when bound', async () => {
    let received;
    const fakeStub = {
      fetch: async (url, init) => {
        received = { url, init };
        return new Response('ok');
      },
    };
    const env = {
      COMMAND_CENTER: {
        idFromName: () => 'id-for-global',
        get: () => fakeStub,
      },
    };
    await broadcastToCommandCenter(env, { kind: 'heartbeat', title: 'x' });
    assert.equal(received.url, 'https://internal/broadcast');
    assert.equal(received.init.method, 'POST');
    assert.equal(JSON.parse(received.init.body).kind, 'heartbeat');
  });

  test('a throwing DO fetch is swallowed — the heartbeat must never fail because of this', async () => {
    const env = {
      COMMAND_CENTER: {
        idFromName: () => 'id',
        get: () => ({ fetch: async () => { throw new Error('DO unreachable'); } }),
      },
    };
    await assert.doesNotReject(() => broadcastToCommandCenter(env, { kind: 'x' }));
  });
});
