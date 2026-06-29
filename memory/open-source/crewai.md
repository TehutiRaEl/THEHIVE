# CrewAI — Agent Delegation Chains

**Repo**: joaomdmoura/crewai
**Pattern extracted**: `Crew.kickoff()` — role-based multi-agent collaboration

## Core Insight

Agents in CrewAI have explicit roles and can delegate subtasks to other agents.
A "crew" is a collection of role-specialized agents; complex tasks decompose into subtask chains.

## Integration in THEHIVE

`backend/core/agent_engine.py` — `delegate` tool:
```python
await agent.run("delegate", agent_name="researcher", subtask="find X")
```
- `_AGENT_REGISTRY` dict maps name → ReactAgent instance
- Any agent can delegate to any registered agent
- Prevents self-delegation
- Returns the delegate's ANSWER string

## Links

[[react-engine]] · [[agents/lifecycle]] · [[babyagi]] · [[memgpt]]
