// automaton/src/inference/simulate-provider.js
//
// Fully offline, deterministic fallback — no network, no keys, always
// answers. Used as the last resort in the provider chain (so --selfcheck and
// the test suite work with zero external dependencies) and whenever the
// THEHIVE Worker is unreachable, mirroring the same "always degrade
// honestly, never fabricate infrastructure that isn't there" ethos already
// established across THEHIVE's Worker code.

export function createSimulateProvider() {
  return {
    name: 'simulate',
    async generate({ system, prompt, maxTokens }) {
      return {
        text: `[simulated response — no live inference provider reachable]\nsystem: ${String(system).slice(0, 80)}\nprompt: ${String(prompt).slice(0, 200)}`,
        provider: 'simulate',
      };
    },
  };
}
