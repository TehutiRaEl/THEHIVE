// automaton/src/inference/provider.js
//
// A provider is just `{ name, async generate({system, prompt, maxTokens}) -> {text, provider} | null }`.
// This interface replaces upstream's hardcoded Conway-inference-gateway
// client — see conway-dependency note in NOTICE.md/ARCHITECTURE.md. Any
// number of providers can be tried in order; the router (router.js) is the
// only thing that knows about ordering/fallback.

export class Router {
  constructor(providers) {
    this.providers = providers;
  }

  async generate(request) {
    for (const provider of this.providers) {
      try {
        const result = await provider.generate(request);
        if (result) return result;
      } catch (e) {
        console.error(`[automaton:inference] provider ${provider.name} failed: ${e}`);
      }
    }
    return null;
  }
}
