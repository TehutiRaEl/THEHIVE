#!/usr/bin/env python3
"""domain_router.py — the Hive Conductor's own Routing step, made runnable.

Why this exists (2026-08-18): `hive-conductor/SKILL.md`'s "Routing (deterministic
first, ask second)" section describes scoring a directive against domain keywords
(edge/worker/api -> edge-backend; tab/UI/react -> frontend; colony/capabilities ->
colonies; soul/constitution/article -> governance; gap/market/positioning ->
strategy) — but until this file, that scoring was prose only, never code. A
`plan-reality-audit`-style check found the ONLY runnable domain-manifest tooling
(`agent-harness/scripts/harness_manifest_builder.py --domain <name>`) scans a
folder for `SKILL.md` files — which none of the Conductor's five real domains
(`worker/`, `frontend/`, the colony repos, `soul.md`, strategy docs) contain, since
they are code/doc surfaces, not skill-folder trees. Run for real against this repo:

    python3 harness_manifest_builder.py --domain worker --repo-root . --json
    -> {"skill_count": 0, "skills": [], ...}   # proven empty, useless for routing

This script is the real fix for the ROUTING half of that gap: deterministic
keyword scoring against the five domains, exactly as documented, so a directive
gets an actual routed domain instead of a hand-waved one. The companion fix for
the MANIFEST half is the five hand-authored, honestly-sourced
`harnesses/<domain>.json` files committed alongside this script (their real
verification commands are drawn straight from this same SKILL.md table, not
invented) plus a small compatibility patch to `goal_compiler.py` so it can build
tasks from `cmd`-based tools, not only `script`-based ones.

Stdlib only. Deterministic: same directive in, same routing out.

Usage:
  python3 domain_router.py --directive "fix the worker API rate limiter"
  python3 domain_router.py --directive "..." --json
  python3 domain_router.py --sample
  python3 domain_router.py --self-test
"""
import argparse
import json
import re
import sys

SCHEMA = "hive-conductor/routing.v1"

# Keyword table copied verbatim from hive-conductor/SKILL.md's "Routing" section
# (2026-08-18) — this file's only job is to make that prose runnable, not to
# redefine it. If the SKILL.md table changes, update this dict to match.
DOMAIN_KEYWORDS = {
    "edge-backend": [
        "edge", "worker", "api", "d1", "database", "route", "endpoint",
        "cloudflare", "backend", "v11", "durable", "heartbeat",
    ],
    "frontend": [
        "tab", "ui", "react", "frontend", "component", "command-center",
        "dashboard", "tsx", "vite", "css", "design", "screen", "button",
    ],
    "colonies": [
        "colony", "colonies", "capabilities", "federation", "sibling-repo",
        "aether", "automatisch", "kimi", "localagi", "4dbrain", "nar2",
    ],
    "governance": [
        "soul", "constitution", "article", "law", "governance", "f-001",
        "f-002", "f-003", "f-004", "f-005", "f-006", "amendment", "vote",
    ],
    "strategy": [
        "gap", "market", "positioning", "competitor", "strategy",
        "roadmap", "grok", "opportunity",
    ],
}

FORCING_QUESTION = (
    "No domain keyword matched this directive. Per hive-conductor/SKILL.md's own "
    "'Routing' step 3: which domain should own this — edge-backend, frontend, "
    "colonies, governance, or strategy — or is this genuinely cross-cutting?"
)


def tokenize(text):
    return set(re.findall(r"[a-z0-9][a-z0-9\-]+", text.lower()))


def score(directive):
    tokens = tokenize(directive)
    scored = {}
    for domain, keywords in DOMAIN_KEYWORDS.items():
        hits = sorted(t for t in tokens if t in keywords)
        if hits:
            scored[domain] = hits
    return scored


def route(directive):
    scored = score(directive)
    if not scored:
        return {
            "schema": SCHEMA,
            "directive": directive,
            "verdict": "REFUSED-NO-MATCH",
            "matched_domains": [],
            "forcing_question": FORCING_QUESTION,
        }
    ranked = sorted(scored.items(), key=lambda kv: (-len(kv[1]), kv[0]))
    domains = [d for d, _ in ranked]
    verdict = "SINGLE-DOMAIN" if len(domains) == 1 else "MULTI-DOMAIN-SPLIT"
    return {
        "schema": SCHEMA,
        "directive": directive,
        "verdict": verdict,
        "matched_domains": domains,
        "matches": {d: hits for d, hits in ranked},
        "next_step": (
            "python3 .claude/skills/agent-harness/scripts/goal_compiler.py "
            "--goal \"%s\" --manifest "
            ".claude/skills/hive-conductor/harnesses/%s.json --out plan.json"
        ) % (directive, domains[0]),
    }


SAMPLE_DIRECTIVE = "fix the worker API rate limiter and verify it builds"

SELF_TESTS = [
    ("fix the worker API rate limiter", {"edge-backend"}),
    ("redesign the command center dashboard tab", {"frontend"}),
    ("check colony capabilities parity across the federation", {"colonies"}),
    ("does this violate soul.md article F-002", {"governance"}),
    ("run a market gap analysis on positioning", {"strategy"}),
    ("wire the react tab to call the new v11 worker endpoint",
     {"frontend", "edge-backend"}),
    ("xyz", set()),  # no real tokens -> REFUSED-NO-MATCH
]


def self_test():
    failures = []
    for directive, expected in SELF_TESTS:
        result = route(directive)
        got = set(result["matched_domains"])
        if expected:
            if not expected.issubset(got):
                failures.append((directive, expected, got))
        else:
            if result["verdict"] != "REFUSED-NO-MATCH":
                failures.append((directive, expected, got))
    if failures:
        print("SELF-TEST FAILED:")
        for directive, expected, got in failures:
            print("  directive=%r expected>=%r got=%r" % (directive, expected, got))
        return 1
    print("SELF-TEST OK: %d/%d cases passed" % (len(SELF_TESTS), len(SELF_TESTS)))
    return 0


def main():
    ap = argparse.ArgumentParser(
        description="Route a founder directive to hive-conductor domain(s) "
                    "via the deterministic keyword table in hive-conductor/SKILL.md.")
    ap.add_argument("--directive", help="the directive/goal text to route")
    ap.add_argument("--json", action="store_true", help="print JSON (default)")
    ap.add_argument("--sample", action="store_true", help="route a sample directive and exit")
    ap.add_argument("--self-test", action="store_true",
                    help="run the built-in routing assertions; exit 0 iff all pass")
    args = ap.parse_args()

    if args.self_test:
        return self_test()
    if args.sample:
        print(json.dumps(route(SAMPLE_DIRECTIVE), indent=2))
        return 0
    if not args.directive:
        ap.error("--directive is required (or use --sample / --self-test)")

    result = route(args.directive)
    print(json.dumps(result, indent=2))
    return 0 if result["verdict"] != "REFUSED-NO-MATCH" else 3


if __name__ == "__main__":
    sys.exit(main())
