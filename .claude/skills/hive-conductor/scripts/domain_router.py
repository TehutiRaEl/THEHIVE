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
#
# QB-2 revision (2026-11-06, BATCH-QB): measured against the 116 live proposals
# (~/workspace/q009/proposals-all.json) BEFORE freezing the schema — the original
# table gave 79 SINGLE-DOMAIN / 19 MULTI-DOMAIN-SPLIT / 18 REFUSED-NO-MATCH, with
# governance in 18/19 splits (always on a single generic keyword) and real work
# refused ("Resolve Claude Authentication Error", "Enhance Task Routing
# Optimization"). Changes, all in this revision:
#   - edge-backend gains "routing" (task/domain routing IS edge work), a
#     provider/auth family (authentication, auth, provider, api-key, apis,
#     gateway, gateways), and Cloudflare stores (r2, bucket, vectorize).
#     Provider NAMES (claude/groq/mistral/openrouter) were deliberately NOT
#     added: they are incidental mentions in proposal bodies, not domain
#     signals — the QB-2 parity harness caught them inflating edge-backend hit
#     counts on governance proposals, and they were removed the same day.
#   - frontend gains "front-end" (hyphenated form; the tokenizer keeps a
#     hyphenated word as ONE token, so "front-end" never matches "frontend" —
#     a false negative, not a false positive).
#   - edge-backend gains "back-end" for the same hyphen reason.
#   - Split rule (route() below): a domain only forces a MULTI-DOMAIN-SPLIT with
#     >= 2 distinct keyword hits. A single generic keyword (governance in a
#     corpus where governance is the default topic) no longer claims a split.
# QB-5 revision (2026-11-07, BATCH-QB): measured against the same 116 live
# proposals. Changes, both mirrored in the JS port (drift rule below):
#   - frontend LOSES "design": it fires on ordinary prose ("by design",
#     "fail-closed by design") and misrouted #4 ("Bind a founder key so
#     proposals can actually be decided") to frontend on that one word. The
#     frontend list keeps 13 UI-specific keywords; a pure-design proposal
#     with no UI vocabulary now refuses honestly instead of being claimed
#     by a generic word (amendment 2's principle: a single generic keyword
#     must not claim a label).
#   - edge-backend gains "secret": the Hive's auth vocabulary (wrangler
#     secret, Secrets Store, FOUNDER_KEY). #4 is the proving case.
#   - Measured blast radius: "design" and "secret" each occur in exactly
#     one corpus item (#4) — no other corpus outcome changes. #4 moves
#     frontend -> edge-backend; totals stay 110 SINGLE / 0 SPLIT / 6 REFUSED.
#     "key" and "founder" were considered and REJECTED: "key" occurs in 16
#     corpus items (mostly API-key contexts already covered) and "founder"
#     is a role word, not a domain signal.
# DRIFT RULE (bidirectional, BATCH-QB amendment 1): this table and the JS port
# (worker/src/index.js DOMAIN_KEYWORDS / routeProposalDomain) change together,
# same PR, both directions. A change to either without the other breaks the
# QB-4 parity test. The JS table header carries this file's SCHEMA version.
DOMAIN_KEYWORDS = {
    "edge-backend": [
        "edge", "worker", "api", "apis", "d1", "database", "route", "routing",
        "endpoint", "cloudflare", "backend", "back-end", "v11", "durable",
        "heartbeat", "authentication", "auth", "provider", "api-key", "secret",
        "gateway", "gateways", "r2", "bucket", "vectorize",
    ],
    "frontend": [
        "tab", "ui", "react", "frontend", "front-end", "component", "command-center",
        "dashboard", "tsx", "vite", "css", "screen", "button",
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
    # QB-2 split rule (BATCH-QB amendment 2): a domain only forces a
    # MULTI-DOMAIN-SPLIT with >= 2 DISTINCT keyword hits. One generic keyword
    # (governance in a corpus where governance is the default topic) must not
    # claim a split. A single strong domain is the label; the weak domains stay
    # visible in `matches` but do not veto it. Zero strong domains (every
    # matched domain at exactly 1 hit) is genuinely ambiguous -> split, NULL label.
    # QB-2 revision, positional tie-break (measured 2026-11-06): that "split on
    # any tie" rule PLUS the "routing" keyword gives 62 splits / 59% NULL labels
    # on the real corpus, which defeats the feature. Zero strong domains is
    # therefore resolved POSITIONALLY, not alphabetically: the label is the domain
    # of the FIRST domain-keyword occurrence in the routed text (the proposal's
    # own framing — a "Governance Kernel Proposal for F-007 ..." names governance
    # first). Measured result: 110 single / 0 split / 6 refused (5% NULL). The
    # split verdict survives for inputs with >= 2 strong domains (self-test case
    # 6 still splits). The tie stays visible: margin 0 and the full ranked list
    # in `matches`, so a positional label is never mistaken for a confident one.
    strong = [d for d, hits in ranked if len(hits) >= 2]
    if len(domains) == 1 or len(strong) == 1:
        verdict = "SINGLE-DOMAIN"
        label = domains[0] if len(domains) == 1 else strong[0]
    elif len(strong) >= 2:
        verdict = "MULTI-DOMAIN-SPLIT"
        label = None
    else:
        verdict = "SINGLE-DOMAIN"
        label = None
        for tok in re.findall(r"[a-z0-9][a-z0-9\-]+", directive.lower()):
            for domain, keywords in DOMAIN_KEYWORDS.items():
                if tok in keywords:
                    label = domain
                    break
            if label:
                break
    return {
        "schema": SCHEMA,
        "directive": directive,
        "verdict": verdict,
        "domain_label": label,
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
    # QB-2 additions: provider/auth family, routing keyword, hyphenated forms,
    # and the >= 2-hit split rule (a single generic keyword must not force a
    # split). The self-test only asserts expected-subset-of-got, so exact
    # verdicts for these cases are asserted by the JS parity harness (QB-4).
    ("Resolve Claude Authentication Error", {"edge-backend"}),
    ("Enhance Task Routing Optimization", {"edge-backend"}),
    ("Provision Vectorize (sovereign memory)", {"edge-backend"}),
    ("redesign the front-end tab for the command center", {"frontend"}),
    ("Governance Kernel Proposal for F-007 - Enhance Task Routing Optimization",
     {"edge-backend", "governance"}),
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
