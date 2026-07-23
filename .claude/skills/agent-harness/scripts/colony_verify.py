#!/usr/bin/env python3
"""Verify one (or all) colonies' real integration state against their sibling
repo checkouts (2026-07-22 colony deep-integration pass).

Why this script exists instead of harness_manifest_builder.py: that builder
scans a domain FOLDER for SKILL.md files. The "colonies" domain named in
hive-conductor/SKILL.md's routing table isn't a folder of skills at all —
it's six separate GitHub repos (NAR2, 4DBRAIN, aether, automatisch, LocalAGI,
Kimi-K2), checked out as sibling directories next to THEHIVE in this
environment. There is nothing under THEHIVE's own tree for the generic
scanner to find. This script is the real, hand-authored verify step
colonies.json points at — deterministic, stdlib-only, exit-code-driven,
following the same contract (kind: smoke/sample, expect_exit) the generic
tool checks use.

Each colony's check list is specific, real, and traceable to actual commits
from this session (Phase A LICENSE + aether HMAC fix, Phase B tesseract_math
consolidation, Phase C colony_sdk dedup, Phase D automatisch apps/thehive/,
Phase E MCP server on THEHIVE's own side). This is a structural/static check
(file exists/absent, pattern present) — not a live network probe, since none
of the six colonies are deployed anywhere yet (Phase H, parked). Upgrade path:
once a colony is actually live, replace the relevant `contains`/`exists`
checks with a real HTTP call to that colony's own `/colony/health` or
`/colony/manifest`.

Usage:
  python3 colony_verify.py --colony nar2 --repo-root ..
  python3 colony_verify.py --all --repo-root ..
  python3 colony_verify.py --sample
  python3 colony_verify.py --help
"""

import argparse
import json
import os
import sys

# Each check: (kind, relative_path, [needle], description)
#   "exists"      -> relative_path must exist under the colony's repo root
#   "not_exists"  -> relative_path must NOT exist (confirms a dedup/retirement)
#   "contains"    -> file at relative_path must exist and contain needle
#   "not_contains"-> file at relative_path must exist and must NOT contain needle
CHECKS = {
    "nar2": {
        "sibling_dir": "NAR2",
        "checks": [
            ("exists", "LICENSE", None,
             "proprietary hive-internal LICENSE present (Phase A)"),
            ("not_exists", "backend/colony_sdk.py", None,
             "hand-copied colony_sdk.py removed in favor of the shared package (Phase C)"),
            ("contains", "backend/requirements.txt", "sovereign-hive-colony-sdk",
             "requirements.txt pins the shared colony_sdk package (Phase C)"),
            ("contains", "backend/requirements.txt", "4dbrain-tesseract",
             "requirements.txt pins the shared tesseract_math package (Phase B)"),
            ("contains", "backend/main.py", "from colony_sdk import ColonyConfig, make_colony_router",
             "absolute import — was a relative import that would have broken once "
             "colony_sdk.py stopped being a sibling file; fixed during Phase C"),
        ],
    },
    "4dbrain": {
        "sibling_dir": "4DBRAIN",
        "checks": [
            ("exists", "LICENSE", None,
             "proprietary hive-internal LICENSE present (Phase A)"),
            ("exists", "tesseract_math/pyproject.toml", None,
             "tesseract_math is a real installable package (Phase B) — 4DBRAIN is the "
             "canonical owner of the tesseract/hypercomplex/dream-engine math"),
            ("not_exists", "backend/colony_sdk.py", None,
             "hand-copied colony_sdk.py removed in favor of the shared package (Phase C)"),
            ("contains", "backend/requirements.txt", "sovereign-hive-colony-sdk",
             "requirements.txt pins the shared colony_sdk package (Phase C)"),
            ("not_contains", "backend/main.py", "from colony import router",
             "dead, crashing import (ImportError on any real run) removed — found and "
             "fixed while doing the unrelated Phase B tesseract work"),
        ],
    },
    "aether": {
        "sibling_dir": "aether",
        "checks": [
            ("exists", "LICENSE", None,
             "proprietary hive-internal LICENSE present (Phase A)"),
            ("exists", "package.json", None,
             "renamed from LAUpackage.json — the CI cp-workaround step is gone (Phase A)"),
            ("not_exists", "LAUpackage.json", None,
             "old misnamed package manifest removed (Phase A)"),
            ("contains", "src/app/api/colony/events/route.ts", "verifyHiveSignature",
             "HMAC verification added — this route accepted any unauthenticated JSON "
             "body before Phase A"),
        ],
    },
    "automatisch": {
        "sibling_dir": "automatisch",
        "checks": [
            ("exists", "packages/backend/src/apps/thehive/index.js", None,
             "native apps/thehive/ app definition exists (Phase D)"),
            ("exists", "packages/backend/src/apps/thehive/triggers/hive-dispatch-received/index.js", None,
             "'Hive Dispatch Received' trigger exists (Phase D)"),
            ("exists", "packages/backend/src/apps/thehive/actions/send-to-hive-mesh/index.js", None,
             "'Send to Hive Mesh' action exists (Phase D)"),
            ("not_exists", "packages/colony-server", None,
             "orphaned colony-server sidecar removed — confirmed zero references before deletion (Phase C)"),
            ("contains", "packages/backend/src/routes/colony.js", "source:",
             "/colony/manifest reports a real source/commit/license field — the AGPL-3.0 "
             "Section 13 corresponding-source obligation this bridge must meet (Phase D)"),
        ],
    },
    "kimi-k2": {
        "sibling_dir": "Kimi-K2",
        "checks": [
            ("not_exists", "colony-server.js", None,
             "Node colony bridge retired — Python (the app's real language) is now the "
             "single bridge (Phase A)"),
            ("not_exists", "Dockerfile.colony", None,
             "Node bridge's Dockerfile retired alongside colony-server.js (Phase A)"),
            ("not_exists", "colony_sdk.py", None,
             "hand-copied colony_sdk.py removed in favor of the shared package (Phase C)"),
            ("contains", "requirements.txt", "sovereign-hive-colony-sdk",
             "requirements.txt pins the shared colony_sdk package (Phase C)"),
        ],
    },
    "localagi": {
        "sibling_dir": "LocalAGI",
        "checks": [
            ("exists", "pkg/colony/colony.go", None,
             "Go colony bridge, pre-existing — left as-is per plan (shared Go SDK for a "
             "single consumer would be premature, Phase C)"),
            ("exists", "core/agent/mcp.go", None,
             "native remote-HTTP MCP client support — the real attach point for THEHIVE's "
             "backend/mcp_server/ (Phase E)"),
        ],
    },
}

SAMPLE_RESULT = {
    "colony": "nar2",
    "repo_root": "../NAR2",
    "passed": True,
    "checks": [
        {"kind": "exists", "path": "LICENSE", "ok": True,
         "description": "proprietary hive-internal LICENSE present (Phase A)"},
    ],
}


def _read(path):
    try:
        with open(path, encoding="utf-8", errors="replace") as f:
            return f.read()
    except OSError:
        return None


def run_check(colony_root, kind, rel_path, needle, description):
    path = os.path.join(colony_root, rel_path)
    if kind == "exists":
        ok = os.path.exists(path)
    elif kind == "not_exists":
        ok = not os.path.exists(path)
    elif kind == "contains":
        text = _read(path)
        ok = text is not None and needle in text
    elif kind == "not_contains":
        text = _read(path)
        ok = text is not None and needle not in text
    else:
        raise ValueError("unknown check kind: %s" % kind)
    return {"kind": kind, "path": rel_path, "ok": ok, "description": description}


def verify_colony(colony_id, repo_root):
    spec = CHECKS[colony_id]
    colony_root = os.path.join(repo_root, spec["sibling_dir"])
    if not os.path.isdir(colony_root):
        return {
            "colony": colony_id,
            "repo_root": colony_root,
            "passed": False,
            "checks": [],
            "error": "sibling repo directory not found: %s" % colony_root,
        }
    checks = [run_check(colony_root, k, p, n, d) for (k, p, n, d) in spec["checks"]]
    return {
        "colony": colony_id,
        "repo_root": colony_root,
        "passed": all(c["ok"] for c in checks),
        "checks": checks,
    }


def main():
    ap = argparse.ArgumentParser(
        description="Verify a colony's real integration state against its sibling repo checkout.")
    ap.add_argument("--colony", choices=sorted(CHECKS.keys()),
                     help="Colony id to verify (e.g. nar2, 4dbrain, aether, automatisch, kimi-k2, localagi).")
    ap.add_argument("--all", action="store_true",
                     help="Verify every known colony.")
    ap.add_argument("--repo-root", default="..",
                     help="Parent directory containing every sibling colony checkout (default: ..).")
    ap.add_argument("--sample", action="store_true",
                     help="Print an example result and exit 0 (no disk access).")
    args = ap.parse_args()

    if args.sample:
        print(json.dumps(SAMPLE_RESULT, indent=2))
        return 0

    if not args.colony and not args.all:
        ap.error("provide --colony <id>, --all, or --sample")

    targets = sorted(CHECKS.keys()) if args.all else [args.colony]
    results = [verify_colony(cid, args.repo_root) for cid in targets]
    print(json.dumps(results if len(results) > 1 else results[0], indent=2))
    return 0 if all(r["passed"] for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
