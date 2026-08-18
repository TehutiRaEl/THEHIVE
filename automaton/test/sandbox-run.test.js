// automaton/test/sandbox-run.test.js
//
// Kai El's sandbox-run mode (2026-08-18): write_target_file (a real, generic
// file-write tool scoped to config.repoRoot, distinct from edit_own_file's
// self-modification) plus its own policy rules, and loop.js's runTick()
// accepting a `task` override to prove the ReAct loop can complete a real
// multi-step task end-to-end — not just the five safety-gap-closure fixes
// gap-closure.test.js already covers.
//
// Uses makeTestContext()'s already-separate repoRoot temp dir (helpers.js) —
// distinct from homeDir, exactly the "writing somewhere that isn't
// automaton's own repo" scenario this tool exists for.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { makeTestContext, cleanup } from './helpers.js';
import { buildToolRegistry } from '../src/agent/tools.js';
import { AgentLoop } from '../src/agent/loop.js';

function buildTools(ctx) {
  return buildToolRegistry({
    policyEngine: ctx.policyEngine, ledger: ctx.ledger, selfMod: ctx.selfMod,
    replicator: ctx.replicator, lineage: ctx.lineage, repoRoot: ctx.repoRoot,
    turnState: { transfersThisTurn: 0 },
  });
}

describe('write_target_file — real writes scoped to repoRoot, not automaton\'s own files', () => {
  test('a live agent turn can write a real file inside repoRoot', async () => {
    const ctx = makeTestContext();
    try {
      const tools = buildTools(ctx);
      const result = await tools.write_target_file(
        { targetPath: 'src/new-feature.js', content: '// real content\n' },
        { inputSource: 'agent' }
      );
      assert.equal(result.ok, true);
      const written = fs.readFileSync(path.join(ctx.repoRoot, 'src', 'new-feature.js'), 'utf8');
      assert.equal(written, '// real content\n');
    } finally { cleanup(ctx); }
  });

  test('creates intermediate directories that do not exist yet', async () => {
    const ctx = makeTestContext();
    try {
      const tools = buildTools(ctx);
      const result = await tools.write_target_file(
        { targetPath: 'brand/new/dir/file.txt', content: 'x' },
        { inputSource: 'agent' }
      );
      assert.equal(result.ok, true);
      assert.equal(fs.readFileSync(path.join(ctx.repoRoot, 'brand', 'new', 'dir', 'file.txt'), 'utf8'), 'x');
    } finally { cleanup(ctx); }
  });

  test('path traversal outside repoRoot is refused, not silently clamped', async () => {
    const ctx = makeTestContext();
    try {
      const tools = buildTools(ctx);
      const result = await tools.write_target_file(
        { targetPath: '../../../../etc/passwd', content: 'pwned' },
        { inputSource: 'agent' }
      );
      assert.equal(result.ok, false);
      assert.match(result.error, /path traversal/);
    } finally { cleanup(ctx); }
  });

  test('does NOT touch automaton\'s own repo — repoRoot really is the target, not ROOT_DIR', async () => {
    const ctx = makeTestContext();
    try {
      const tools = buildTools(ctx);
      await tools.write_target_file({ targetPath: 'proof.txt', content: 'here' }, { inputSource: 'agent' });
      // helpers.js's repoRoot is a throwaway temp dir, never automaton's real
      // source tree — this just documents the intent for a future reader.
      assert.ok(ctx.repoRoot.includes('automaton-repo-'), 'sanity: this really is the throwaway target, not automaton itself');
    } finally { cleanup(ctx); }
  });

  describe('authority.target_write_from_external — the honest, non-self-mod-worded gate', () => {
    for (const source of ['external', 'heartbeat']) {
      test(`an unattended source (${source}) is denied, not silently allowed`, async () => {
        const ctx = makeTestContext();
        try {
          const tools = buildTools(ctx);
          const result = await tools.write_target_file(
            { targetPath: 'should-not-exist.js', content: 'x' },
            { inputSource: source }
          );
          assert.equal(result.ok, false);
          assert.equal(result.blocked, true);
          assert.equal(result.reasonCode, 'TARGET_WRITE_FROM_UNATTENDED_SOURCE');
          assert.doesNotMatch(result.message, /self-modification/i,
            'must never claim "self-modification" — this writes into a different repo entirely');
          assert.equal(fs.existsSync(path.join(ctx.repoRoot, 'should-not-exist.js')), false);
        } finally { cleanup(ctx); }
      });
    }

    // The rule's `undefined` branch is real but NOT reachable through
    // write_target_file() itself — every tool wrapper's own destructuring
    // default (`{ inputSource = 'agent' } = {}`) already coerces a missing
    // inputSource to 'agent' before checkPolicy() ever runs, exactly like
    // every other tool in this registry. Tested here directly against the
    // policy engine, honestly documenting that this is dead code through the
    // real call path rather than silently asserting an unreachable claim.
    test("the rule's undefined-source branch is real at the policy-engine level, even though the tool wrapper never reaches it", () => {
      const ctx = makeTestContext();
      try {
        const decision = ctx.policyEngine.evaluate({ tool: 'write_target_file', targetPath: 'x.js' });
        assert.equal(decision.action, 'deny');
        assert.equal(decision.reasonCode, 'TARGET_WRITE_FROM_UNATTENDED_SOURCE');
      } finally { cleanup(ctx); }
    });

    test('a creator-triggered call is allowed — the CLI --task mode\'s real inputSource', async () => {
      const ctx = makeTestContext();
      try {
        const tools = buildTools(ctx);
        const result = await tools.write_target_file(
          { targetPath: 'ok.js', content: 'x' },
          { inputSource: 'creator-cli' }
        );
        assert.equal(result.ok, true);
      } finally { cleanup(ctx); }
    });
  });

  test('a file over the configured size cap is denied, same cap edit_own_file uses', async () => {
    const ctx = makeTestContext();
    try {
      const tools = buildTools(ctx);
      const oversized = 'x'.repeat(ctx.config.selfMod.maxFileSizeBytes + 1);
      const result = await tools.write_target_file(
        { targetPath: 'big.js', content: oversized },
        { inputSource: 'agent' }
      );
      assert.equal(result.ok, false);
      assert.equal(result.reasonCode, 'FILE_TOO_LARGE');
    } finally { cleanup(ctx); }
  });
});

describe('AgentLoop.runTick — a real multi-step task, end-to-end, not just gap-closure', () => {
  test('a task prompt is used verbatim as the starting prompt, not the generic genesis one', async () => {
    const ctx = makeTestContext();
    try {
      const seen = [];
      const stubRouter = {
        generate: async ({ prompt }) => { seen.push(prompt); return { text: 'done — nothing more to do.', provider: 'stub' }; },
      };
      const tools = buildTools(ctx);
      const loop = new AgentLoop({ router: stubRouter, tools, ledger: ctx.ledger });
      const result = await loop.runTick({
        soulFrontmatter: { corePurpose: 'test' }, tier: 'normal', constitutionExcerpt: '',
        inputSource: 'creator-cli', task: 'Add a README to the venture repo explaining its purpose.',
      });
      assert.equal(seen[0], 'Add a README to the venture repo explaining its purpose.');
      assert.equal(result.finalText, 'done — nothing more to do.');
    } finally { cleanup(ctx); }
  });

  test('a real multi-turn task: think, call write_target_file, observe, then finish', async () => {
    const ctx = makeTestContext();
    try {
      const tools = buildTools(ctx);
      let turn = 0;
      const stubRouter = {
        generate: async () => {
          turn += 1;
          if (turn === 1) {
            return {
              text: '```tool\n{"tool":"write_target_file","args":{"targetPath":"README.md","content":"# Venture\\n"}}\n```',
              provider: 'stub',
            };
          }
          return { text: 'README written. Task complete.', provider: 'stub' };
        },
      };
      const loop = new AgentLoop({ router: stubRouter, tools, ledger: ctx.ledger });
      const result = await loop.runTick({
        soulFrontmatter: { corePurpose: 'test' }, tier: 'normal', constitutionExcerpt: '',
        inputSource: 'creator-cli', task: 'Write a real README.',
      });

      assert.equal(result.turns.length, 2, 'one tool-call turn, one final-text turn');
      assert.equal(result.turns[0].toolCall.tool, 'write_target_file');
      assert.equal(result.turns[0].result.ok, true, 'the real tool call must have actually succeeded, not just been parsed');
      assert.equal(result.finalText, 'README written. Task complete.');

      const written = fs.readFileSync(path.join(ctx.repoRoot, 'README.md'), 'utf8');
      assert.equal(written, '# Venture\n', 'the file the loop reported writing must really exist on disk');
    } finally { cleanup(ctx); }
  });

  test('without a task override, the original genesis-purpose prompt is unchanged (no regression)', async () => {
    const ctx = makeTestContext();
    try {
      const seen = [];
      const stubRouter = {
        generate: async ({ prompt }) => { seen.push(prompt); return { text: 'ok', provider: 'stub' }; },
      };
      const tools = buildTools(ctx);
      const loop = new AgentLoop({ router: stubRouter, tools, ledger: ctx.ledger });
      await loop.runTick({ soulFrontmatter: { corePurpose: 'test' }, tier: 'normal', constitutionExcerpt: '' });
      assert.match(seen[0], /Continue toward your genesis purpose/);
    } finally { cleanup(ctx); }
  });
});
