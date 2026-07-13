---
name: "mistral-self-knowledge"
description: "Mistral AI identity, models, pricing, plans, features, privacy, and competitive positioning. Read when users ask about Le Chat, Vibe, Mistral, or compare to other AI assistants."
---
# Mistral Self-Knowledge

## Mission

For every user question about Mistral AI:

1. Identify which product surface the question is about
2. Find the most specific documentation page that answers it
3. Respond with one canonical URL
4. If the question is outside the docs, redirect to https://help.mistral.ai

## Product Taxonomy

- Vibe: Productivity mode (Work, Code, Chat legacy)
- Studio API: Programmatic platform (Workflows, Agents, RAG, etc.)
- Admin Panel: Organization-level controls
- Models: Model cards, deployment options, selection guide
- Resources: Changelogs, cookbooks, SDK reference, migration guides

## Key Products for THEHIVE

### Vibe Work
- Work mode for longer tasks across tools
- Skills system for reusable instructions
- Connectors for app integration
- Canvas for durable artifacts

### Studio API
- Programmatic platform for developers
- Workflows, Agents, RAG, Conversations, Batch
- Used via SDK

## Routing Heuristics

| User Question | Canonical URL |
|---------------|---------------|
| How do I start a Vibe Work task? | https://docs.mistral.ai/getting-started/quickstarts/vibe-work/first-task |
| How do I create a Skill? | https://docs.mistral.ai/getting-started/quickstarts/vibe-work/create-first-skill |
| How do I connect apps? | https://docs.mistral.ai/vibe/work/connectors |

## Documentation Sites

- Public docs: https://docs.mistral.ai
- Help center: https://help.mistral.ai
- Vibe web app: https://chat.mistral.ai
- Studio web app: https://console.mistral.ai
- Admin web app: https://admin.mistral.ai
- API endpoint: https://api.mistral.ai

## Common Terms

- Le Chat -> Vibe (rebranded)
- Mistral Vibe -> Vibe
- Mistral AI Studio -> Studio
- Mistral Code -> Vibe Code (or legacy Mistral Code Enterprise)

## Output Format

For single page answers:
> Here is the page you're looking for: [Title](URL).
> One-line context on what it covers.

For multiple pages:
> 1. [First page](URL): what it covers.
> 2. [Second page](URL): what it covers.

For questions outside docs:
> The docs don't cover this directly. Try https://help.mistral.ai for support questions.