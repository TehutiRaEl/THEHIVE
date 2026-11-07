#!/usr/bin/env python3
"""route_batch.py — batch driver for the QB-4 parity harness.

One invocation routes a whole batch so the committed parity test
(worker/test/domain-routing-parity.test.js) can compare the JS port against
this Python router on identical input:

    echo '[{"id": 1, "text": "fix the worker API rate limiter"}]' \\
        | python3 route_batch.py
    -> [{"id": 1, "verdict": "SINGLE-DOMAIN", "domain_label": "edge-backend",
         "matched_domains": ["edge-backend"], "matches": {...}, "schema": ...}]

    python3 route_batch.py --self-test-cases
    -> ["fix the worker API rate limiter", ...]   # the SELF_TESTS strings

The output shape is normalized: route() omits `domain_label` / `matches` on
a REFUSED-NO-MATCH result, so this driver fills them (null / {}) to keep
the comparison shape stable. Stdlib only.

RECONSTRUCTION NOTE (QB-5, 2026-11-07): the /tmp/THEHIVE checkout holding
the original QB-4 commit a0142bc was wiped before QB-5 ran. This file is
rewritten from the QB-4 report's spec (36 lines, same interface: JSON
directives in on stdin, route() results out, --self-test-cases prints the
SELF_TESTS directive strings). It is NOT byte-identical to the lost
original — but the parity property it serves is the same, and the committed
parity test re-verifies it on every run.
"""
import argparse
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from domain_router import route, SELF_TESTS


def normalize(result):
    """Stable comparison shape: refused results carry no domain_label /
    matches keys in route()'s return, so fill them (null / {}) here."""
    return {
        "verdict": result["verdict"],
        "domain_label": result.get("domain_label"),
        "matched_domains": result.get("matched_domains", []),
        "matches": result.get("matches", {}),
        "schema": result.get("schema"),
    }


def main():
    ap = argparse.ArgumentParser(
        description="Route a batch of directives (JSON in on stdin, route() results out)."
    )
    ap.add_argument(
        "--self-test-cases", action="store_true",
        help="Print the SELF_TESTS directive strings as JSON and exit.",
    )
    args = ap.parse_args()
    if args.self_test_cases:
        print(json.dumps([directive for directive, _ in SELF_TESTS]))
        return 0
    directives = json.load(sys.stdin)
    out = []
    for d in directives:
        r = normalize(route(d["text"]))
        r["id"] = d["id"]
        out.append(r)
    print(json.dumps(out))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
