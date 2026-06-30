# SWE-agent — Agent-Computer Interface (ACI)

**Repo**: princeton-nlp/SWE-agent
**Pattern extracted**: ACI — constrained action space for code manipulation

## Core Insight

SWE-agent wraps a code environment with a strict action interface (read file, edit lines,
run bash, search). This prevents the LLM from issuing dangerous or ambiguous commands.

## Potential Integration

`backend/api/browser.py` — add `BrowserACI` that wraps Playwright with constrained actions:
- `navigate(url)`, `click(selector)`, `type(text)`, `extract_text()`, `screenshot()`
- No raw JS execution — prevents prompt injection via web content

## Links

[[browser]] · [[react-engine]] · [[agents/lifecycle]]
