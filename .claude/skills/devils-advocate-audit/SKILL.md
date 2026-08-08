---
name: devils-advocate-audit
description: >
  A proactive, adversarial re-audit of code already marked "done" — committed, merged, or
  passing at the time — built by hybridizing the devils-advocate philosophy lens (memory/
  philosophy/devils-advocate.md: interrogate what's built for hidden failure, not what it
  could become) with fable-debugger's verification discipline (reproduce from the true
  surface, contrast against a working sibling, find the coupled latent bug, never fake a
  green). Triggered by a real event, 2026-07-31: WalletManager.credit() had a load-bearing
  bug (every SOUL grant/tip/payout raised sqlite3.ProgrammingError) that sat in production
  code, past review, past merge, until a coverage-writing pass happened to invoke it for
  the first time. Use this when the founder asks to re-check, re-audit, or sweep past work
  for hidden bugs; when a connector/tool/skill turns out to be unavailable mid-task and it
  raises the question of what else might have gone unverified the same way; before treating
  any "tested"/"working"/"merged" claim as load-bearing without having personally re-run it;
  or periodically as a standing sweep across the codebase (see AUDIT_LEDGER.md for what's
  already covered and what's still owed a real pass).
---

# devils-advocate-audit

fable-debugger answers "something is broken, find it." This answers a harder question: "nothing has been *reported* as broken — is that because nothing is, or because nobody has actually re-checked?" The wallet.py bug is the proof this gap is real: it passed review, passed merge, and would have kept passing every future review too, because every prior look was a *read*, not a *run*. This skill exists so "done" gets re-verified by execution, adversarially, on a schedule — not just trusted forward from whenever it was first claimed.

## Why hybridize instead of just running fable-debugger more often

fable-debugger needs a symptom to reproduce. It is excellent once something is visibly wrong, but it never fires on its own — nobody files a bug against code that *looks* fine. The devils-advocate lens is the missing half: it doesn't wait for a symptom, it manufactures the skepticism that goes looking for one. Its ten questions (`memory/philosophy/devils-advocate.md`) were written for architectural decisions, but they translate directly to code that's already shipped:

| Devil's-advocate question (as written) | As applied to shipped code |
|---|---|
| What is the single point of failure? | What one function, if it silently misbehaves, breaks something load-bearing without raising an error anyone would notice? |
| What hidden assumptions are baked in? | Does this code assume a connection/resource stays open across a call it doesn't control (the exact wallet.py shape)? Does it assume its own tests exercised the real path, not a mocked one? |
| What is the blast radius when this fails? | If this silently misbehaves, what real-world quantity goes wrong — money, access, a constitutional guarantee? |
| Who benefits if this is wrong? | Nobody usually "benefits" from a bug, but who is *harmed* — which agent, colony, or founder-facing feature quietly breaks? |
| What breaks at 10x load / an unusual path? | Has this only ever been exercised once, happily, on the common path? What's the first *un*common invocation it will see? |
| What does the attacker do with this? | Standard security-review question — still applies, run it. |
| What data is never shown (and why)? | Is there a silent fallback or swallowed exception nearby that would hide this exact class of bug from ever surfacing as a visible error? |
| What happens if a dependency disappears? | What if the connector, secret, or service this code assumes is present is actually absent — does it fail loud or fail silent? (This is the literal question that started this skill: a connector turned out to be unavailable, unnoticed, until asked about directly.) |
| Is there a simpler path to the same outcome? | Would a simpler implementation have made this class of bug impossible instead of just unlikely? |

The right-hand column is the audit; the left-hand column is where it came from. Nothing here is invented — it's the hive's own existing philosophy, pointed at a target it was never explicitly aimed at before.

## The loop

```
TARGET       → pick something claiming "done" that has not been independently re-run
 1. SUSPECT     → apply the ten questions above; write down which one raised a real doubt
 2. REPRODUCE   → actually invoke it — call the function, run the endpoint, exercise the
                  path for real. Reading the code and reasoning "this looks right" is
                  exactly the step that already failed once; it doesn't count here.
 3. CONTRAST    → if it passes, find the nearest sibling that's *known* solid and diff
                  the assumptions between them — that's often where the next bug hides
 4. IF BROKEN:
      ROOT-CAUSE   → name the mechanism in one sentence (fable-debugger step 3)
      COUPLED-BUG  → ask what this bug was masking (fable-debugger step 4) — the wallet.py
                     case had exactly one bug, but always check; don't assume there's only one
      FIX-OR-ESCALATE → same authority rules as everywhere else in this hive: a pure
                     test-file fix can proceed, anything touching production code goes to
                     a PR for the founder, never silently patched and merged
 5. LEDGER      → write the result to AUDIT_LEDGER.md regardless of outcome — pass, fail,
                  or "could not verify" — so the sweep is resumable across sessions and the
                  founder can see coverage building, not just a pile of individual fixes
```

## The rule this skill exists to enforce

**"Could not verify" is a valid, required outcome — never silently upgrade it to "passed."** If a target needs a connector, credential, or environment this session doesn't have, say so plainly in the ledger and move to the next target. The founder's own worry that prompted this skill was specifically about silent gaps like that — an unverified thing quietly counted as fine is the failure mode, not an honest "blocked, here's why."

## Choosing targets (SUSPECT step)

Priority order, highest suspicion first:

1. **Anything merged from another session or agent without this session having re-run it.** Grok's PRs, the founder's own patches, anything with only a diff-read review — all of it was *reviewed*, but review is not the same discipline as reproduce-and-verify.
2. **Anything whose only test coverage was added in the same commit that introduced the bug it was meant to catch** — a test written to confirm a fix can share the author's same blind spot. Independently re-deriving the expected behavior (not just re-running the existing test) is the real check.
3. **Anything touching money, permissions, or constitutional law** (SOUL ledger, agency levels, HMAC verification, F-001–F-006 enforcement) — highest blast radius per the table above, audit these before anything cosmetic.
4. **Anything that degrades silently on missing config** (a connector, a secret, an unbound service) rather than failing loudly — these are exactly the "wouldn't be found unless asked" cases.
5. **Anything nobody has touched since it was first written** — age alone isn't a bug, but it does mean zero independent re-verification has happened since.

Check `AUDIT_LEDGER.md` first — it tracks what's already been swept so this doesn't re-audit the same ground twice or, worse, silently skip something because it looks "already handled."

## What this is not

Not a rewrite pass, not a style review, not `simplify` or `security-review` (use those skills for their own jobs). This skill's only question is: **does this actually do what its "done" status claims, verified by running it, not by reading it?** If the answer is yes, record that and move on — a clean bill of health is a real, useful outcome, not a wasted pass.

Not a mining pass either. When this skill's own interrogation lands on a verdict of false/fabricated rather than "works" vs. "doesn't," that verdict is the handoff point to `fabrication-mining` — a sibling skill, not a step of this one. This skill's job ends at reaching the true/false verdict; `fabrication-mining` picks up from there to ask what a false claim was reaching for. Keeping the two separate means a devil's-advocate pass that finds nothing false stays a clean, short report, and a mining pass never gets run on something that hasn't actually been proven false yet.

## Origin

Built 2026-07-31 at the founder's direct request, after the wallet.py bug (found by a coverage-writing pass, not by review) raised the question of how many similar bugs might be sitting unverified across everything already shipped — including a moment in the same session where a connector needed for a task turned out to require the founder's own setup step, which is exactly the kind of silent gap this skill is built to surface instead of let pass quietly. Hybridizes `memory/philosophy/devils-advocate.md` (the interrogation) with `.claude/skills/fable-debugger/SKILL.md` (the verification discipline) — neither replaces the other; this skill is what they produce together, aimed at something neither was pointed at before.
