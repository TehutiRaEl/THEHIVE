# Founder directive — 2026-08-07 — four scoping decisions on the agentic-harness document

Session: THEHIVE, `claude/fable-5-handoff-setup-vefwlb` (session `session_013M4iozyGijv5Q267JZfeEG`).

The founder uploaded `AI.docx` — a chat log from research they did with another AI — and
asked for a triage: *"take the entire chatlog and ask me 4 questions to help you excavate
from the docx file i attached. let me know what seems risky, whats high stakes, whats icing
on the cake, whats white on rice, whats a walk in the park."*

The document contains an MCP + waterfall agentic-harness blueprint, a 100,000-agent scaling
architecture, a scaled-down 8-agent colony prototype, and an AUTOMATON reverse-engineering
rig. The full triage lives in
`VISION/2026-08-07-vision-agentic-harness-triage-006.md`; the source text is preserved at
`SOURCES/research-notes/2026-08-07-agentic-harness-mcp-waterfall.md`.

## Provenance note — read this before quoting anything below

These four answers were given by **selecting options** in a structured question prompt, not
typed as free prose. So the wording below is the option text the founder chose, recorded
exactly, **not** a verbatim quote of something they wrote in their own words. That
distinction matters here for the same reason it always does in this repo: a paraphrase
promoted to a quote is a fabrication, even a flattering one. The founder's own free-typed
words in this exchange were the request quoted above and, afterward, `"Log them"`.

## The four decisions

### 1. Where a Python/Docker harness would actually run

**Question asked:** this harness needs a long-running Python process, a real filesystem, and
Docker; the live system is a Cloudflare Worker, which has none of those. Where would it run?

**Founder chose:** *"Nowhere yet — need to figure that out."* (No always-on machine
identified.)

**Standing consequence:** a home has to be picked before any of the blueprint can run. See
the Oracle finding under "Learned" below — this may be less open than it looks.

### 2. The 100,000-agent architecture vs. task 47's 189/222 roster question

**Question asked:** the document plans for 100 agents × 10 colonies × 100 trees. Task 47 has
been blocked asking whether the 222 agents are real. Same question or different?

**Founder chose:** *"Drop the 100k, focus on the 8."* — *"Ignore the massive-scale section as
premature. Perfect the 8-agent colony first, exactly as the document itself recommends."*

**Standing consequence:** the massive-scale layer (Ray, Kubernetes, Redis Cluster, anycast
MCP mesh, self-hosted GPU cluster) is **out of scope** until the existing 8 agents work
properly. This partially answers task 47's third acceptance question (sequencing) — but task
47 **remains blocked**, because its other two questions are untouched by this.

### 3. Self-expansion — agents writing their own tools and prompts

**Question asked:** the document treats agents writing new MCP servers and rewriting each
other's prompts as a feature. THEHIVE's own automaton review closed that exact hole on
purpose. Which does the founder want?

**Founder chose:** *"Keep it gated, like automaton."* — *"Self-expansion stays behind a
founder-flipped switch that defaults off, same as `AUTOMATON_FINANCIAL_AUTONOMY`. The
capability gets built but cannot fire without you."*

**Standing consequence:** if dynamic MCP-server creation or prompt self-modification is ever
built, it ships **default-off behind a founder switch**, matching the existing precedent in
`automaton/FLIP_THE_SWITCHES.md`. This is the founder holding a previously-made decision
rather than reversing it under new enthusiasm — worth noting, because the document argues
the opposite case persuasively.

### 4. What to do with the document right now

**Question asked:** write it up as a vision doc, build the smallest real piece, or just
triage it?

**Founder chose:** *"Just tell me what to ignore."* — *"You mainly want the triage, not a
build."*

**Standing consequence:** no harness code, no MCP server, no orchestrator built from this
document. Triage and logging only. The founder then said `"Log them"`, which is the
authority for this file and the two alongside it.

## Did

- Read the full `AI.docx` (373k characters raw, ~36k after stripping Word XML noise).
- Triaged it against THEHIVE's real state and delivered the risky / high-stakes / icing /
  white-on-rice / walk-in-the-park breakdown the founder asked for.
- Asked the four questions above; captured all four answers here.
- Wrote the full triage to `VISION/...-triage-006.md` and preserved the source text to
  `SOURCES/research-notes/`.
- Logged a new blocked task (CAMPAIGN.html task 53) for the hosting decision.

## Needs

Still founder-only, unchanged by this exchange:

- **Task 45** — is the Anthropic key valid, and what model ID does it allow?
- **Task 46** — does Cloudflare Workers Builds deploy only `main`, or feature branches too?
- **Task 47** — still blocked on: the real intended headcount vs. `SPORE_ROSTER.md`'s counted
  189, and whether those are real LLM-backed agents or role *labels*. Decision 2 above
  answered the sequencing sub-question only.
- **Task 51** — pick a token-ceiling measurement: real-work-only / raise the limit / leave it.
- **Task 52** — name the Orchestrator. Deliberately not invented by this session; naming
  crosses `FABLE_DNA.md` Chromosome V's Codex boundary.
- **Task 53 (new)** — provision the Oracle Always Free box, or decide against it.

## Learned

Two things checked rather than assumed, both of which change how the document should be read:

1. **The document's orchestrator code does not compile.** `json.dump(plan_data, indent=2, f)`
   is a `SyntaxError` — a positional argument following a keyword argument. Confirmed with
   `py_compile`, not by eye. The `.strip("```json")` line is also wrong in kind: `str.strip()`
   takes a *character set*, not a substring, so it strips any of `` ` ``/`j`/`s`/`o`/`n` from
   both ends. Neither is fatal to the *ideas*, but it establishes the document as an
   architecture sketch rather than tested code — worth knowing before anyone copies from it.

2. **The hosting question may already be half-answered inside this repo.**
   `.github/workflows/deploy.yml` (lines 24–58) targets an *"Oracle Always Free box"*, runs
   `docker-compose down && docker-compose up -d --build` over SSH, and health-checks
   `http://localhost:8080/v11/health`. It has been skipping gracefully — by design, after
   accumulating 165 straight CI failures — because `ORACLE_HOST`, `ORACLE_USER`, and
   `ORACLE_SSH_KEY` are unset. That is a real Linux host with a real filesystem and Docker:
   exactly what this blueprint needs and exactly what a Cloudflare Worker cannot provide. It
   is also the same unprovisioned target that keeps System A (the FastAPI backend) from being
   live, and the same reason `docs/biosystem.html` shows *"Demo Mode — start JASPER backend to
   enable LLM"*. One decision would unblock all three.

**The strongest single idea in the document, for the record:** *"Do not let the AI orchestrate
itself."* Write deterministic code to drive the phases; let the model reason only inside one
phase. That is a direct answer to the founder's own earlier diagnosis that the work cycle was
theater — and it is free to adopt in principle even though nothing is being built from this
document right now.

**Independent corroboration of task 51:** the document argues *"Never pass your entire project
codebase into a single LLM prompt window... to drastically reduce hallucinations."* It reaches
that from a hallucination-quality angle; task 51 reached the same conclusion from a
token-cost angle (96% of the measured ceiling being cache creation). Two unrelated sources,
same finding — that raises confidence the ceiling problem is real and structural, not a
measurement artifact.
