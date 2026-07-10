# SKILL: Role-tagged delivery (how ANY member ships)
Origin: all members; convention docs/GOVERNANCE.md + ROLES.md (110 roles)
Use when: every commit, every PR, every session.
Steps:
1. Branch per session/member (claude/*, mistral/*, grok-*); never commit to main directly.
2. Commit: `[ROLE: <exact ROLES.md title>] type(scope): description` + one-line `Rationale:`.
3. One ready-for-review PR per repo per wave; body = what was broken (with evidence), what changed, test plan with checked boxes only for things actually run.
4. Founder merges. A merged PR is FINISHED — follow-ups restart the branch from main.
5. Before ending a session: commit plans/memory updates — containers are ephemeral (we lost a whole plan once; never again).
Gotchas: verify the role exists in ROLES.md first; `git add -A` before a multi-commit split will swallow everything into commit #1 (it happened — PR #22's d26c003).
