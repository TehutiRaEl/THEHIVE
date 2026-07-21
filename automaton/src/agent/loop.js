// automaton/src/agent/loop.js
//
// The ReAct loop: Think -> Act -> Observe -> Repeat, bounded by maxTurns per
// invocation (a real heartbeat tick calls this once; it is not a runaway
// while(true)). Tool-call protocol is deliberately simple and
// provider-agnostic (a fenced ```tool json block) rather than any one
// vendor's native function-calling schema — this runs unmodified against
// whichever provider in THEHIVE's own waterfall answers (Claude, Groq,
// Mistral, or the Workers AI fallback), not just OpenAI-shaped APIs. This is
// a deliberate simplification vs. upstream (documented in ARCHITECTURE.md),
// not an oversight.

import { buildSystemPrompt } from './system-prompt.js';
import { scanForInjection } from './injection-defense.js';

const TOOL_CALL_RE = /```tool\s*\n([\s\S]*?)\n```/;

function parseToolCall(text) {
  const m = TOOL_CALL_RE.exec(text);
  if (!m) return null;
  try {
    const parsed = JSON.parse(m[1]);
    if (parsed && typeof parsed.tool === 'string') return parsed;
  } catch { /* not a tool call, treat as final text */ }
  return null;
}

export class AgentLoop {
  constructor({ router, tools, ledger, maxTurns = 5 }) {
    this.router = router;
    this.tools = tools;
    this.ledger = ledger;
    this.maxTurns = maxTurns;
  }

  /**
   * Runs up to maxTurns think/act/observe cycles for one heartbeat tick.
   * Returns { turns: [...], finalText }.
   */
  async runTick({ soulFrontmatter, tier, constitutionExcerpt, inputSource = 'agent' }) {
    const turns = [];
    let prompt = 'Continue toward your genesis purpose. Reflect on your current state and decide your next action.';
    const system = buildSystemPrompt({
      soulFrontmatter, tier, balanceCents: this.ledger.balanceCents(), constitutionExcerpt,
    });

    for (let i = 0; i < this.maxTurns; i++) {
      const injectionHits = scanForInjection(prompt);
      const gen = await this.router.generate({ system, prompt, maxTokens: 800 });
      if (!gen) {
        turns.push({ i, error: 'no inference provider answered' });
        break;
      }

      const toolCall = parseToolCall(gen.text);
      if (!toolCall) {
        turns.push({ i, provider: gen.provider, finalText: gen.text, injectionHits });
        return { turns, finalText: gen.text };
      }

      const toolFn = this.tools[toolCall.tool];
      if (!toolFn) {
        turns.push({ i, provider: gen.provider, toolCall, error: `unknown tool: ${toolCall.tool}` });
        prompt = `Unknown tool "${toolCall.tool}". Choose a real tool or respond with plain text.`;
        continue;
      }

      const result = await toolFn(toolCall.args ?? {}, { inputSource });
      turns.push({ i, provider: gen.provider, toolCall, result, injectionHits });
      prompt = `Tool ${toolCall.tool} result: ${JSON.stringify(result)}\n\nContinue.`;
    }
    return { turns, finalText: null, note: 'max turns reached without a final text response' };
  }
}
