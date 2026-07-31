# Skill Benchmark: caveman-eli5

**Model**: <model-name>
**Date**: 2026-07-31T18:55:38Z
**Evals**: 1, 2, 3 (3 runs each per configuration)

## Summary

| Metric | With Skill | Without Skill | Delta |
|--------|------------|---------------|-------|
| Pass Rate | 94% ± 10% | 77% ± 9% | +0.18 |
| Time | 15.3s ± 1.2s | 16.8s ± 1.9s | -1.5s |
| Tokens | 46590 ± 68 | 41242 ± 250 | +5347 |

## Notes

- eval-git-rebase-merge is the clearest differentiator: the baseline (no skill) answered in bullet-point fragments with dropped subjects ('Takes the other branch's changes and combines them...') -- exactly the ambiguity-risk this skill exists to avoid for a non-expert reader. With-skill produced full connected prose with explicit 'because' reasoning in nearly every sentence.
- eval-vpn-explain is a tie (83% both configurations) and should not be read as the skill underperforming: the user's own prompt already said 'explain like im 5', so the baseline model followed that literal instruction well even with no skill active. This eval mainly demonstrates the skill's consistency/enforcement value (same register every time) rather than a raw quality delta -- it's a weak discriminator for description-triggering purposes since an explicit request already gets ELI5-style output unprompted.
- The one assertion the with-skill vpn-explain run missed ('explicitly names that traffic is routed through another server') is a real, worth-fixing gap: the answer explained encryption and location-masking clearly but left the routing mechanism implicit. Candidate for a SKILL.md revision -- add explicit guidance to name the mechanism, not just its effects.
- The baseline nodejs-heap-oom run is denser and more jargon-assuming (specific heap size ranges, 'backpressure', batch-size tuning) than the with-skill version, and contains one filler-word slip ('just'). This is the strongest content-quality gap between configurations across all three evals.
- Small n (1 run per configuration per eval, 3 evals total) -- this is a quick qualitative pass, not a statistically powered benchmark. Good enough to sanity-check the skill's direction; would want 3+ runs per config before treating the pass-rate delta as precise.
- Token counts here are whole-subagent totals (includes reading the SKILL.md file itself, ~46-47k input tokens per with-skill run vs ~41k for baseline) -- that read cost is a one-time session overhead in real use, not a per-message tax, so this delta overstates steady-state cost. It is not evidence the skill increases per-reply token usage; that would need measuring final-answer length alone, which the with-skill answers were actually similar length to or shorter than baseline on 2 of 3 evals.