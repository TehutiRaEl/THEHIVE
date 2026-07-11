# SKILL: Audit and repair a repo's GitHub Actions
Origin: Fable 5, 2026-07-05, THEHIVE PR #22 + gap #13 (165-failure deploy loop, NAR2 parse bug)
Use when: red Actions tab, mystery failures, or adopting a fork.
Steps:
1. Pull run history per workflow (API: /actions/workflows/<f>/runs) — counts by conclusion; a run NAMED by its file path = the YAML does not parse.
2. Static-audit each file: secrets it references vs secrets that exist; URLs it curls (dead hosts!); paths it assumes.
3. Classify KEEP / FIX / DELETE (upstream-infra workflows in forks → DELETE; one-shot completed → DELETE).
4. Fix patterns: missing secrets → graceful-skip guard step writing to GITHUB_STEP_SUMMARY; `secrets` in `if:` is ILLEGAL → export to env and guard in bash; stray markdown fences from pasted YAML.
5. Verify: yaml.safe_load every file, push, confirm branch runs green via API.
Gotchas: `pull_request_target` bots in forks misbehave on YOUR PRs; schedule triggers never fire on forks; a broken workflow file fails EVERY push regardless of its triggers.
