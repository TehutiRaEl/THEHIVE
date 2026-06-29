# BabyAGI — Prioritized Task Queue

**Repo**: yoheinakajima/babyagi
**Pattern extracted**: Self-prioritizing task creation + execution loop

## Core Insight

BabyAGI maintains a task list that it continuously reprioritizes based on context.
New tasks spawn from completed ones; the agent always works on the highest-priority next task.

## Integration in THEHIVE

`backend/core/agent_engine.py` — `PrioritizedTaskQueue` class + tools:
- `queue_task(task, priority)` — adds task (1=highest, 10=lowest)
- `next_task()` — pops highest-priority task (min-heap)
- `reprioritize(task, new_priority)` — re-rank after completion
- Each `ReactAgent` instance has its own `task_queue`

## Links

[[react-engine]] · [[crewai]] · [[memgpt]] · [[agents/lifecycle]]
