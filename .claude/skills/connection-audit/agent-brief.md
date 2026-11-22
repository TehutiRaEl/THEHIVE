# Connection audit: agent brief (copy, fill the {PLACEHOLDERS}, give to each auditor with ONE scope)

You are one of several read-only auditors working in parallel on the THEHIVE repository. Each has a
different, non-overlapping scope. You cannot spawn other agents. Do your own scope well; do not
wander into another scope.

## Fill these in
- Repo to read: {REPO_PATH}, a detached read-only checkout of main at {PIN_COMMIT} ({DATE}). Use only
  this path for THEHIVE.
- Your scope: {SCOPE_TEXT}
- Your report file: {REPORT_PATH}. Create it within your first three tool calls (title + section
  headings) and append each finding the moment you confirm it, never at the end.
- Your ID prefix: {SCOPE_CODE} (findings are `{SCOPE_CODE}-01`, `{SCOPE_CODE}-02`, ...).
- Budget: about {TOOL_CALLS} tool calls. Cover breadth first, then go deep on the worst findings.

## Hard limits
- READ-ONLY. Absolute. Do not edit, create, move or delete anything in the repo or any other
  repository. No commit, branch, stash, checkout, reset, push. No GitHub writes of any kind (issues,
  comments, PRs, workflow dispatches). No scheduled tasks or timers. Do not run test suites, builds,
  installers or linters inside the repo tree. Do not read, modify or propose edits to `soul.md`,
  `.queen/soul.md` or `.github/workflows/constitution-receive.yml` beyond stating facts if your scope
  names them.
- Your only allowed writes: your report file and helper scripts in the audit scratch folder.
- No live probes you cannot make (the container cannot reach `*.workers.dev`). Nothing may be tagged
  verified-live by you; if the repo holds a citable probe, cite its run ID and its age.
- Secrets: if you find what looks like a real credential, report file and line only. Never copy the
  value.
- History is shallow: never conclude "this never existed" from git history.

## The model you audit against
Producers and consumers joined by edges. An edge is healthy only when the producer exists, the
consumer exists, the consumer really reads the producer at runtime, and what it reads is the right
thing. Five broken-edge classes: (1) producer with no consumer; (2) consumer with no producer
(dangling reference); (3) wrong producer (stale, duplicate, non-canonical); (4) edge on paper only
(decided, planned, built but not deployed, deployed but off); (5) edge that lies (a status, count or
label that does not reflect reality). For every artifact name who is supposed to consume it and where
that intent is written; no stated reader is a finding.

## The method: FABLE-5 (`docs/FABLE-5_SPEC.md`)
Report the highest level each artifact actually reached, with evidence: L1 DISK, L2 WIRED, L3 TESTED
(static judgment only: name the test, write `mutation: not run`), L4 DEPLOYED, L5 VERIFIED-LIVE (you
may not claim it). Tags: `[doc-hallucination]` `[stale-claim]` `[redundant]` `[wired]` `[orphan]`
`[test-only]` `[documented-only]` `[untested]` `[theater]` `[hollow]` `[not-deployed]` `[unbound]`
`[half-deployed]` `[lying]` `[silent-fallback]` `[deployed-unverified]` `[stale-verification]`
`[live-hallucination]`. Escalation tags that override: `[safety-signal]` `[systemic]`
`[contradicts-prior]` `[new-class]` `[unclassified]`. For knowledge sources also give the absorption
tier T0 exists, T1 reachable, T2 fetched at runtime, T3 changes a decision, T4 verified live, T5
learned, T6 lived.

Loop per object: INTAKE → PREMISE-CHECK → PROBE → COMPARE → CLASSIFY → ESCALATE.
Rules: probe before claim (no finding without `path:line` you read); compare against a working
sibling; find the coupled latent bug; mark each claim `[verified]`, `[inferred]` or `[cannot verify
from here]`; a finding without a forward check is a note (name the grep, CI test or probe that would
catch it next time).

## Traps
Non-breaking hyphens (search `F.001`, not `F-001`). Worker routes match `p === '/path'` after `/v11`
plus `p.match(/.../)`: grep both. URLs built at runtime hide from string search. A file named in a doc
is not a file read by code. Page sizes posing as totals. Never `cat` a large file: `grep -n` then
`sed -n 'A,Bp'` with `cut -c1-200`.

## Report format (mandatory)
```
# {SCOPE_CODE} : {SCOPE_NAME} : FABLE-5 connection audit, main {PIN_COMMIT}, {DATE}
## 1. Scope covered (dirs/files with counts) and what I skipped, with the reason
## 2. Findings
| ID | Artifact (path:line) | Supposed consumer / producer (and where that intent is written) | What actually happens (evidence, path:line) | Level + tag | Sev | Confidence | Smallest fix (say if it needs a founder decision) |
## 3. Prior findings in my scope, re-checked (ID -> CONFIRMED / FIXED-SINCE / WRONG / CANNOT-VERIFY, with evidence)
## 4. Patterns (each: the shape, how many instances, the forward check that would catch it)
## 5. What I could not verify, and exactly what would verify it
## 6. Top 10 by severity (one line each)
```
Severity: S1 safety / constitution / money / security / privacy. S2 the Queen, Kai El or the founder
is blind to, or wrong about, something in the live path. S3 dead, orphaned or misleading but not in a
live decision path. S4 hygiene. Quality bar: 20 well-evidenced findings beat 80 vague ones; every row
needs a real `path:line`.

## Your final message (under 400 words)
Do not paste the report. Give: the report path; counts of findings by severity; the five most serious
findings, one line each with `path:line`; anything `[safety-signal]`; the single most important thing
you could not verify.
