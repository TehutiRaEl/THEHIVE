#!/usr/bin/env python3
"""Enforce the wired-or-not claim vocabulary in .claude/tasks/CAMPAIGN.html.

Why this exists (2026-08-07): a founder-ordered audit found 34 of 36 tasks marked `done`
had never been confirmed against production, and four layers of agent work were stacked on
an unverified foundation. The root cause is that a session runs out of context and hands
the next one a bare `done` marker stripped of the knowledge that it meant "it compiles."

`.claude/skills/wired-or-not/SKILL.md` is the reasoning. THIS FILE is the part that
survives a context cutoff, because it runs in CI whether or not anyone read the skill.

The rule enforced: a task claiming `verified-live` must carry a real evidence reference
that a person could check without trusting the claimer — a workflow run ID, a commit SHA,
or a committed test path. Nothing else is inspected; this is deliberately narrow so it
stays true rather than becoming a style checker everyone learns to ignore.

Usage:  python3 scripts/check-claims.py [path-to-campaign.html]
Exit:   0 = every verified-live claim carries evidence; 1 = at least one does not.
"""
import re
import sys

# A claim is only as good as the reference behind it. Each pattern below is something a
# reader can independently go and check.
EVIDENCE = [
    (re.compile(r'\brun[ #]*\d{8,}\b', re.I), 'a workflow run ID'),
    (re.compile(r'\b[0-9a-f]{7,40}\b'), 'a commit SHA'),
    (re.compile(r'\b(?:worker|tests?|automaton)/[\w./-]*test[\w./-]*\.(?:js|mjs|py|ts)\b'), 'a committed test path'),
]
# Deliberately NOT accepted: a bare workflow name like "edge-health-probe" with no run
# number. "We ran the probe" is not checkable — nobody can go look at it. A run ID is.
# This distinction is the entire point of the skill, so the checker has to hold it too.

TASK = re.compile(
    r'<div class="task"[^>]*id="task-([0-9a-z]+)"[^>]*>(.*?)(?=<div class="task"|\Z)',
    re.S)


def check(path):
    try:
        html = open(path, encoding='utf-8').read()
    except OSError as e:
        print(f'::error::cannot read {path}: {e}')
        return 1

    bad, checked = [], 0
    for tid, body in TASK.findall(html):
        text = ' '.join(re.sub(r'<[^>]+>', ' ', body).split())
        if not re.search(r'\bverified-live\b', text, re.I):
            continue
        checked += 1
        # Scope the search to a window around the claim, so a SHA elsewhere in a long task
        # body cannot accidentally satisfy an unrelated verified-live assertion.
        #
        # A character window, NOT a split on '.', because the evidence itself frequently
        # contains periods — "worker/test/generate.test.js" is exactly the kind of proof
        # this checker wants to accept, and sentence-splitting cut it in half. Caught by
        # this script's own test case rather than in review.
        for m in re.finditer(r'\bverified-live\b', text, re.I):
            claim = text[max(0, m.start() - 220):m.end() + 220]
            if not any(pat.search(claim) for pat, _ in EVIDENCE):
                bad.append((tid, text[max(0, m.start() - 80):m.end() + 80].strip()[:160]))
                break

    if checked == 0:
        print('no verified-live claims found — nothing to enforce yet '
              '(this is expected until tasks start using the wired-or-not vocabulary)')
        return 0

    print(f'checked {checked} task(s) claiming verified-live')
    if bad:
        for tid, claim in bad:
            print(f'::error::task {tid} claims verified-live with no checkable evidence.')
            print(f'    claim: "{claim}"')
        print()
        print('A verified-live claim needs a reference someone can check without trusting '
              'you. Accepted: ' + ', '.join(d for _, d in EVIDENCE) + '.')
        print('If you cannot produce one, claim the level you CAN prove '
              '(compiles / tested / merged / deployed) and say what is missing. '
              'See .claude/skills/wired-or-not/SKILL.md')
        return 1

    print('all verified-live claims carry checkable evidence')
    return 0


if __name__ == '__main__':
    sys.exit(check(sys.argv[1] if len(sys.argv) > 1 else '.claude/tasks/CAMPAIGN.html'))
