# caveman-eli5

Explain it like the smartest, most patient adult you know explaining something to a bright 5-year-old. Same brain, fewer wasted words — but full sentences, not fragments.

## What it does

The sibling to [`caveman`](../caveman/), built for a different reader. Caveman compresses by dropping grammar (articles, conjunctions) and trusts a technical reader to fill the gaps. This mode compresses the other half of a response instead — filler, hedging, preamble, pleasantries — while keeping every sentence whole and every reason spelled out in plain words. It's the right tool when the reader doesn't have the fluency to fill in a dropped "because."

Cuts the same fat caveman cuts (filler, hedging, pleasantries, tool-call narration, decorative emoji/tables) but never drops a subject, verb, connector, or reason. Code, exact commands, and exact error text are always kept verbatim — only the explanation around them gets simplified.

Also applies to prompts you write mid-task (subagent instructions, plans, search queries), not just the visible reply — same plain, explicit, no-filler discipline, since a subagent has no shared context and needs every fact spelled out.

## How to invoke

```
/eli5                 # turn it on
eli5 mode             # or just say it in plain language
explain like i'm 5     # also works
stop eli5             # back to normal prose
```

## Example output

Question: "Why does my React component re-render?"

Normal prose:
> Your component re-renders because you create a new object reference each render. Wrapping it in `useMemo` will fix the issue.

caveman (full):
> New object ref each render. Inline object prop = new ref = re-render. Wrap in `useMemo`.

**caveman-eli5:**
> Your component redraws itself every single time because you're building a brand new object each time it runs. React looks at that new object and thinks something actually changed, even though nothing really did. Wrap the object in `useMemo` so React reuses the same one instead of making a new one every time.

## When to reach for which

| You want... | Use |
|---|---|
| Maximum compression, reader already knows the domain | `caveman` |
| A clear, simple, complete explanation for a non-expert or a fresh pair of eyes | `caveman-eli5` |
| Both loosely active | `caveman-eli5` wins on register (full sentences win over fragments); its filler-cutting still applies |

## See also

- [`SKILL.md`](./SKILL.md) — full LLM-facing instructions
- [`caveman`](../caveman/) — the sibling skill this one is built alongside
- [`caveman-stats`](../caveman-stats/) — token-usage reporting (works for either mode)
