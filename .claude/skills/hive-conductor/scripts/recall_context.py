#!/usr/bin/env python3
"""
recall_context.py — the Hive Conductor's memory-recall step (Phase 0 of RAO).

Before compiling a directive into a plan, the Conductor asks sovereign memory
"what has the hive already done that relates to this?" and injects the answer as
context. This closes the loop: heartbeat WRITES memory, the Conductor READS it.

Stdlib only. Degrades gracefully everywhere:
  - memory index not yet provisioned  -> {"available": false, ...}
  - no network egress (dev container) -> {"available": false, "reason": "..."}
  - always exits 0; never blocks planning.

Usage:
  recall_context.py --goal "redesign the arena viewer" [--base URL] [--topk 5] [--brief]
"""
import argparse, json, sys, urllib.parse, urllib.request

DEFAULT_BASE = "https://thehive.sovereignhive.workers.dev"


def recall(base, goal, topk, timeout=12):
    url = base.rstrip("/") + "/v11/memory/search?" + urllib.parse.urlencode(
        {"q": goal, "topK": topk})
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            data = json.loads(r.read().decode("utf-8"))
    except Exception as e:  # network blocked, DNS, 5xx — all non-fatal
        return {"available": False, "reason": f"memory endpoint unreachable: {e.__class__.__name__}",
                "matches": []}
    if not data.get("available"):
        return {"available": False,
                "reason": "memory backend not provisioned (Vectorize index not yet created)",
                "matches": []}
    return {"available": True, "matches": data.get("matches", [])}


def render_brief(goal, res):
    if not res["available"]:
        return ("## Prior hive memory\n"
                f"_None injected — {res['reason']}._\n"
                "Proceed on first principles; the plan will still be recorded to memory on close.\n")
    if not res["matches"]:
        return ("## Prior hive memory\n"
                "_No related prior work found. This appears to be new ground._\n")
    lines = ["## Prior hive memory (recalled before planning)"]
    for m in res["matches"]:
        score = m.get("score", 0)
        kind = m.get("kind", "?")
        ts = (m.get("ts", "") or "")[:19]
        text = (m.get("text", "") or "").strip().replace("\n", " ")
        lines.append(f"- [{score:.3f} · {kind} · {ts}] {text}")
    lines.append("\nUse the above to avoid re-deciding what the hive already settled, "
                 "and to build on prior work rather than duplicate it.")
    return "\n".join(lines) + "\n"


def main():
    ap = argparse.ArgumentParser(description="Recall prior hive memory for a directive (RAO Phase 0).")
    ap.add_argument("--goal", help="the founder directive / goal to recall context for")
    ap.add_argument("--base", default=DEFAULT_BASE, help="edge Queen base URL")
    ap.add_argument("--topk", type=int, default=5)
    ap.add_argument("--brief", action="store_true", help="print a markdown brief instead of JSON")
    ap.add_argument("--sample", action="store_true", help="print a sample run and exit")
    a = ap.parse_args()
    if a.sample:
        demo = {"available": False, "reason": "sample mode (no call made)", "matches": []}
        print(render_brief("sample goal", demo) if a.brief else json.dumps(demo, indent=2))
        return
    if not a.goal:
        ap.error("--goal is required (or use --sample)")
    res = recall(a.base, a.goal, a.topk)
    print(render_brief(a.goal, res) if a.brief else json.dumps(res, indent=2))


if __name__ == "__main__":
    main()
