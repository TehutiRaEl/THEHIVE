---
name: "deep-research"
description: "Use when the user asks for thorough research, source-backed synthesis, market or technical landscape analysis, or an evidence-based brief."
---
# Deep Research

Use this Skill to perform a thorough, source-backed investigation with the tools and files available in the current harness. Work directly with the current tools, Skills, and filesystem.

## When to use

Activate for requests that need sustained investigation, source comparison, market or technical landscape analysis, evidence-backed recommendations, or a polished research brief. For quick factual lookups, answer with normal search instead.

## Workflow

1. Clarify the research question, scope, time horizon, geography, audience, and decision to support only when those are missing and materially affect the work.
2. For broad or high-stakes requests, write a short research plan before executing. Include the main search angles, likely source types, and how you will handle internal vs. public information.
3. Route sources deliberately:
   - Public or current information: use web search; use news search for recent news or media coverage; open strong results to read the source more deeply.
   - Internal, private, company, project, or workspace-specific information: load internal-search if available, inspect the relevant tool definitions, and use connected integrations or document-library sources instead of public web.
   - User-provided files or canvases: read the relevant files directly before searching elsewhere.
4. Search iteratively. Start broad to map the topic, then run targeted searches for primary sources, conflicting perspectives, recent developments, and gaps. Do not stop at snippets when the source matters.
5. Keep evidence organized as you work: source title, URL or internal reference, date when relevant, source type, key claims, and reliability notes.
6. Cross-check important claims across multiple sources. Prefer primary sources, official documentation, research papers, standards, regulatory text, company filings, and original datasets over summaries.
7. Synthesize by theme and decision relevance, not by search order. Separate verified facts, estimates, opinions, and your own inference.

## Source Standards

- Cite claims that carry the answer.
- Note source dates for fast-moving topics.
- Name conflicts, uncertainty, stale evidence, and missing access.
- Do not cite a source you have not actually inspected when the claim depends on details beyond the snippet.
- For internal sources, preserve confidentiality and cite only in the format supported by the available tool results.

## Output

Finish by creating a canvas with the research report. Use the canvas Skill to choose the right canvas type; default to a text/markdown report unless the user asked for slides, a dashboard, a table, or another format. The canvas should be self-contained and polished enough for the user to inspect, edit, or share.

Recommended report structure:

- Question: the interpreted research goal.
- Executive Summary: 3-7 ranked takeaways.
- Methodology: search angles, source types, and important limitations.
- Findings: evidence-backed sections organized by theme.
- Source Notes: source quality, conflicts, and caveats.
- Open Questions: uncertainties, gaps, or disputed claims.
- Recommendations / Next Steps: what to decide, test, read, or do next.

After creating the canvas, send only a brief chat message that summarizes the top finding and points the user to the canvas. Do not paste the full report into chat.