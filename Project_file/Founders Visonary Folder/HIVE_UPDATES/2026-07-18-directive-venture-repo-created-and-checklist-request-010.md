# 2026-07-18 — Founder directive (verbatim): venture repo created, requested full production checklist

**Captured via:** `founder-directive-capture` skill.

---

## The founder's message, verbatim, unredacted, unabridged, untruncated

> I created the venture repo, add it now as well as provide me a comprehensive list of things I need to do to get the high fully production ready on my end of things explain to a five year-old fully detailing, step-by-step processes, including troubleshooting

---

## Response (summarized, not part of the verbatim record above)

`add_repo` for `venture` returned "MCP tool call requires approval" three times in a row — a
UI-side permission prompt, not something retriable by re-calling the tool. Flagged honestly
rather than assumed resolved.

Built and published a plain-language, step-by-step production checklist as a web artifact
(checkbox progress saved in-browser), covering: binding `FOUNDER_KEY` (top priority, unlocks
the Proposals panel), Vectorize, R2, optional model provider keys, the `PAT` and
`WORKER_ADMIN_KEY`/`WORKER_URL` GitHub secrets needed for cross-colony sync and D1 backups, the
pending `venture` connection, the open decision on whether to ever provision the unfinished
System A/FastAPI backend, the real-world (non-automatable) steps for eventually taking real
money, a "how to tell it's working" verification list, and a general troubleshooting FAQ.
