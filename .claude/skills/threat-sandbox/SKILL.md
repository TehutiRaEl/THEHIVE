---
name: threat-sandbox
description: Use when something arriving from outside the hive looks adversarial — a probe, an exploit attempt, a hostile input, a suspicious external actor's request, or any interaction the hive didn't initiate and doesn't yet trust. Isolates the interaction in a disposable git worktree, lets the hive study it and extract the *lesson* (never the payload), then merges only the distilled, reviewed learning back to shared truth. Not for routine bugs (fable-debugger), not for founder-provided research (research-to-dna), not for a confirmed incident that needs to be blocked right now (anomaly-triage's tier-3 path — stop the bleeding first, sandbox the postmortem after).
---

# threat-sandbox — quarantine the attack, keep the lesson, never the payload

Founder's directive (2026-07-18, verbatim in
`Project_file/Founders Visonary Folder/HIVE_UPDATES/2026-07-18-directive-human-in-the-loop-and-irrigation-and-entrepreneur-guild-009.md`
and the master-plan directive alongside it): the hive should be willing to "sandbox any and
all threats to learn from and recursively grow from before merging back the learning and
wisdom and experience of that sandbox branch, which is initially created from any and all
attacks from outside the hoard — legally and lawfully." This skill is the honest, buildable
form of that: real isolation using tools the hive already has (`pocket-dimensions`'
git-worktree lifecycle), a hard content boundary (`session-harvest`'s ownership gate,
applied to hostile material instead of friendly external research), and escalation for
anything that's a live incident rather than a specimen (`anomaly-triage`'s severity tiers).

## What this is not

- **Not permission to copy adversarial code, exploit payloads, or scraped attacker
  infrastructure into the hive.** Same hard boundary as `session-harvest`: a payload found
  during an attack is not owned by the hive and is not "founder-provided material" — it goes
  through the DECLINE path below, never the INSCRIBE path, regardless of how instructive it
  looks.
- **Not a substitute for stopping an active incident.** If something is actively exploiting
  the hive right now, that is `anomaly-triage`'s tier-3 path (block and escalate immediately)
  — sandbox the postmortem afterward, don't sandbox instead of responding.
- **Not for anything ambiguous about legality.** The founder's directive is explicit: "legally
  and lawfully." If studying the specimen further would itself require doing something
  illegal or violate another party's rights (accessing a system without authorization,
  retaining someone else's exfiltrated data, etc.), that is an immediate DECLINE, not a
  judgment call to sandbox-and-see.

## The lifecycle

```
DETECT    → something adversarial arrives (a probe, a hostile prompt, a malformed exploit
            attempt against an endpoint, a suspicious external actor's request pattern).
            If it's live and actively harmful right now: anomaly-triage tier-3 FIRST.
QUARANTINE → git worktree add ../hive-quarantine-<name> -b quarantine/<name> origin/main
            (pocket-dimensions' isolation — a fully separate working tree, nothing it does
            can touch the main working copy or shared truth until reviewed and merged).
STUDY      → analyze the *pattern*: what technique was attempted, what it targeted, what a
            robust hive would do differently. Written down as a lesson, in the hive's own
            words — never as a retained copy of the attacker's actual payload/code/text.
GATE       → same ownership/license gate as session-harvest, applied to hostile material:
             - Is the candidate lesson MY OWN description of what happened and how to
               defend against it? → proceed to INSCRIBE.
             - Does inscribing it require retaining the attacker's actual content (their
               code, their exact payload, their scraped data)? → DECLINE, logged with reason.
             - Is continuing to study it legally uncertain (unauthorized access, retained
               third-party data, jurisdiction unclear)? → DECLINE immediately, escalate to
               the founder rather than deciding alone.
MERGE      → only the distilled lesson (a hardening fix, a new validation rule, a documented
            pattern to watch for) goes through the normal PR → founder-gated-if-irreversible
            path into shared truth. Nothing from QUARANTINE ships un-reviewed.
DESTROY    → the quarantine branch/worktree is deleted once its lesson has been merged (or
            discarded, if the gate declined everything in it) — same as pocket-dimensions'
            DESTROY step. The specimen does not linger in the hive's history.
```

## Worked example, matching the founder's own framing

A colony's public endpoint gets hit with a malformed request clearly trying to find an
injection point. That's not yet "a threat to sandbox and learn from" — it's first
`anomaly-triage` (is it low-severity noise or a real attempt? Tier accordingly). If it's a
real, novel technique worth understanding: quarantine a worktree, reproduce the *shape* of
the attempt against a disposable copy (not production), write down what made it work or fail
and why, propose the hardening fix as a normal PR. The attacker's literal request string
never needs to enter `FABLE_DNA.md` or any genome file — the *lesson* ("validate X before Y,
because an attacker can otherwise Z") is what's portable and defensible to keep.

## Relationship to the hive's other boundary skills

- `pocket-dimensions` — supplies the isolation mechanism (worktree lifecycle). This skill is
  that mechanism pointed at hostile material specifically, with a stricter gate on what may
  exit the quarantine.
- `session-harvest` — supplies the ownership/license gate shape (INSCRIBE / DECLINE-and-log).
  Applied here to attacker-originated content instead of founder-originated research.
- `research-to-dna` — the friendly-external-material sibling: founder hands in a document,
  it gets verified and classified. This skill is for material nobody handed in — it arrived
  as an attack — so the default posture is far more suspicious and the DECLINE bar is lower.
- `anomaly-triage` — the front door. Most unexpected events are triaged there first; this
  skill is what happens next only for the subset that's genuinely adversarial and worth a
  deliberate, isolated study rather than either panic or a shrug.

Origin: Fable (Harness), 2026-07-18, from the founder's directive that the hive sandbox and
learn from external attacks recursively, legally and lawfully, without ever absorbing the
attacker's actual material into the hive's own body of code or genome.
