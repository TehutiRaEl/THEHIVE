"""
Agent Engine — Sovereign Hive v12.0
ReAct (Reason + Act) loop with long/short-term memory split and a typed tool registry.
Patterns extracted from: open-mythos (Kye Gomez), OpenHands CodeAct, Hermes Agent, local-AGI,
MemGPT/Letta (paging memory), CrewAI (agent delegation), BabyAGI (prioritized task queue).
"""

import asyncio
import heapq
import json
import logging
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple

from backend.core import llm_router

logger = logging.getLogger("jasper.agent_engine")

# ── Tool registry ──────────────────────────────────────────────

@dataclass
class Tool:
    name: str
    description: str
    parameters: Dict[str, str]   # param_name → description
    fn: Callable                 # async (agent, **kwargs) → str

_TOOLS: Dict[str, Tool] = {}

def register_tool(name: str, description: str, parameters: Dict[str, str]):
    """Decorator to register a callable as a hive tool."""
    def decorator(fn: Callable) -> Callable:
        _TOOLS[name] = Tool(name=name, description=description, parameters=parameters, fn=fn)
        return fn
    return decorator

def tool_schema_list() -> List[Dict]:
    """Return tool schemas as a JSON-serialisable list (for LLM system prompt)."""
    return [
        {
            "name": t.name,
            "description": t.description,
            "parameters": t.parameters,
        }
        for t in _TOOLS.values()
    ]


# ── Memory ─────────────────────────────────────────────────────

@dataclass
class ShortTermMemory:
    """Rolling window of recent observations (last N turns)."""
    window: int = 10
    entries: List[Dict] = field(default_factory=list)

    def add(self, role: str, content: str):
        self.entries.append({"role": role, "content": content})
        if len(self.entries) > self.window:
            self.entries = self.entries[-self.window:]

    def as_messages(self) -> List[Dict]:
        return list(self.entries)


@dataclass
class LongTermMemory:
    """
    MemGPT-style paging memory: main context (hot) + archival storage (cold).
    Hot facts stay in the LLM context window; cold facts are paged out to archival
    and retrieved on demand via keyword search.
    Patterns from: MemGPT/Letta (cpacker), open-mythos (Kye Gomez).
    """
    # Hot tier — always in context (last N facts)
    hot: List[str] = field(default_factory=list)
    hot_size: int = 20
    # Cold tier — archival storage (paged out)
    archival: List[str] = field(default_factory=list)
    max_archival: int = 2000

    def store(self, fact: str):
        self.hot.append(fact)
        if len(self.hot) > self.hot_size:
            # Page oldest hot fact to archival (MemGPT page-out)
            evicted = self.hot.pop(0)
            self.archival.append(evicted)
            if len(self.archival) > self.max_archival:
                self.archival = self.archival[-self.max_archival:]

    def retrieve(self, query: str, k: int = 5) -> List[str]:
        # Search archival (cold) + hot, deduplicated, ranked by keyword overlap
        all_facts = self.archival + self.hot
        scored: List[Tuple[int, str]] = [
            (sum(w in f.lower() for w in query.lower().split()), f)
            for f in all_facts
        ]
        scored.sort(key=lambda x: x[0], reverse=True)
        return [f for score, f in scored[:k] if score > 0]

    def hot_context(self) -> str:
        return "\n".join(f"- {f}" for f in self.hot) if self.hot else "None."


# ── BabyAGI-style prioritized task queue ──────────────────────────

@dataclass(order=True)
class _PrioritizedTask:
    priority: float          # lower = higher priority
    task: str = field(compare=False)
    result: Optional[str] = field(default=None, compare=False)

class PrioritizedTaskQueue:
    """
    Self-ranking task queue inspired by BabyAGI (yoheinakajima).
    Tasks are scored by estimated importance; highest-priority task is always next.
    """
    def __init__(self):
        self._heap: List[_PrioritizedTask] = []
        self._counter = 0

    def add(self, task: str, priority: float = 5.0):
        heapq.heappush(self._heap, _PrioritizedTask(priority=priority, task=task))

    def pop(self) -> Optional[str]:
        if not self._heap:
            return None
        return heapq.heappop(self._heap).task

    def reprioritize(self, task: str, new_priority: float):
        for item in self._heap:
            if item.task == task:
                item.priority = new_priority
        heapq.heapify(self._heap)

    def __len__(self):
        return len(self._heap)

    def as_list(self) -> List[Dict]:
        return [{"task": item.task, "priority": item.priority}
                for item in sorted(self._heap)]


# ── Global agent registry (for CrewAI-style delegation) ───────────

_AGENT_REGISTRY: Dict[str, "ReactAgent"] = {}


# ── ReAct Agent ────────────────────────────────────────────────

SYSTEM_PROMPT_TEMPLATE = """You are {name}, an agent in the Sovereign Hive.
Role: {role}
Constitution: {soul_hash}

You operate using the ReAct loop:
1. THOUGHT: reason about the current situation
2. ACTION: call exactly one tool by responding with JSON: {{"tool": "<name>", "args": {{...}}}}
3. OBSERVATION: you will receive the tool result
4. Repeat until you can provide a final ANSWER.

When you have a final answer, respond with: ANSWER: <your answer>

Available tools:
{tools}

Long-term memories relevant to this task:
{memories}
"""

class ReactAgent:
    def __init__(
        self,
        name: str,
        role: str = "general",
        soul_hash: str = "unknown",
        max_steps: int = 8,
        llm_provider: str = "",
    ):
        self.name = name
        self.role = role
        self.soul_hash = soul_hash
        self.max_steps = max_steps
        self.llm_provider = llm_provider
        self.short_term = ShortTermMemory()
        self.long_term = LongTermMemory()
        self.task_queue = PrioritizedTaskQueue()
        self._step_count = 0
        self._start_time = time.time()
        # Register in global registry for delegation
        _AGENT_REGISTRY[name] = self

    def _build_system(self, task: str) -> str:
        memories = self.long_term.retrieve(task)
        mem_str = "\n".join(f"- {m}" for m in memories) if memories else "None yet."
        # MemGPT: also surface hot-tier facts directly in context
        hot = self.long_term.hot_context()
        full_mem = f"Hot memory (always present):\n{hot}\n\nRelevant archival:\n{mem_str}"
        return SYSTEM_PROMPT_TEMPLATE.format(
            name=self.name,
            role=self.role,
            soul_hash=self.soul_hash,
            tools=json.dumps(tool_schema_list(), indent=2),
            memories=full_mem,
        )

    async def _llm(self, messages: List[Dict]) -> str:
        result = await llm_router.chat(
            messages=messages,
            max_tokens=1500,
            temperature=0.3,
            provider_hint=self.llm_provider,
        )
        return result["content"]

    async def _execute_tool(self, tool_name: str, args: Dict) -> str:
        tool = _TOOLS.get(tool_name)
        if not tool:
            return f"Error: unknown tool '{tool_name}'. Available: {list(_TOOLS.keys())}"
        try:
            result = await tool.fn(self, **args)
            return str(result)
        except Exception as e:
            return f"Tool error: {e}"

    async def run(self, task: str) -> Dict[str, Any]:
        """
        Execute a task using the ReAct loop.
        Returns {"answer": str, "steps": int, "elapsed_s": float, "trace": list}.
        """
        self._step_count = 0
        trace = []
        system = self._build_system(task)
        self.short_term.add("user", task)

        for step in range(self.max_steps):
            self._step_count = step + 1
            messages = [{"role": "system", "content": system}] + self.short_term.as_messages()

            try:
                response = await self._llm(messages)
            except Exception as e:
                logger.error(f"Agent {self.name} LLM error at step {step}: {e}")
                break

            self.short_term.add("assistant", response)
            trace.append({"step": step + 1, "response": response[:500]})

            # Check for final answer
            if "ANSWER:" in response:
                answer = response.split("ANSWER:", 1)[1].strip()
                self.long_term.store(f"Task '{task[:80]}' → {answer[:120]}")
                elapsed = round(time.time() - self._start_time, 2)
                logger.info(f"Agent {self.name} completed in {step+1} steps ({elapsed}s)")
                return {"answer": answer, "steps": step + 1, "elapsed_s": elapsed, "trace": trace}

            # Try to parse a tool call
            try:
                # Extract JSON from response (model may wrap it in markdown)
                raw = response
                if "```" in raw:
                    raw = raw.split("```")[1].lstrip("json").strip()
                call = json.loads(raw)
                tool_name = call.get("tool", "")
                args = call.get("args", {})
                if tool_name:
                    observation = await self._execute_tool(tool_name, args)
                    self.short_term.add("user", f"OBSERVATION: {observation}")
                    trace[-1]["tool"] = tool_name
                    trace[-1]["observation"] = observation[:300]
                    continue
            except (json.JSONDecodeError, KeyError):
                pass  # No tool call in this response — treat as a thought step

        # Max steps reached without ANSWER
        elapsed = round(time.time() - self._start_time, 2)
        last = self.short_term.entries[-1]["content"] if self.short_term.entries else "No response."
        return {
            "answer": last,
            "steps": self._step_count,
            "elapsed_s": elapsed,
            "trace": trace,
            "note": "max_steps reached",
        }


# ── Built-in tools ─────────────────────────────────────────────

@register_tool(
    "web_search",
    "Search the web via DuckDuckGo. Returns top results.",
    {"query": "search query string"},
)
async def _web_search(agent: ReactAgent, query: str) -> str:
    try:
        import httpx
        async with httpx.AsyncClient(timeout=10) as c:
            r = await c.get(
                "https://html.duckduckgo.com/html/",
                params={"q": query},
                headers={"User-Agent": "Mozilla/5.0"},
            )
        from html.parser import HTMLParser
        class _P(HTMLParser):
            def __init__(self):
                super().__init__()
                self.results = []
                self._in_result = False
            def handle_starttag(self, tag, attrs):
                d = dict(attrs)
                if d.get("class", "").startswith("result__snippet"):
                    self._in_result = True
            def handle_data(self, data):
                if self._in_result:
                    self.results.append(data.strip())
                    self._in_result = False
        p = _P(); p.feed(r.text)
        snippets = [s for s in p.results if s][:5]
        return "\n".join(snippets) if snippets else "No results found."
    except Exception as e:
        return f"Search error: {e}"


@register_tool(
    "remember",
    "Store a fact in long-term memory for future tasks.",
    {"fact": "string to remember"},
)
async def _remember(agent: ReactAgent, fact: str) -> str:
    agent.long_term.store(fact)
    return f"Stored: {fact[:100]}"


@register_tool(
    "recall",
    "Retrieve relevant facts from long-term memory.",
    {"query": "what to look for"},
)
async def _recall(agent: ReactAgent, query: str) -> str:
    facts = agent.long_term.retrieve(query, k=5)
    return "\n".join(facts) if facts else "Nothing found in memory."


@register_tool(
    "ask_llm",
    "Ask a sub-question to the LLM without triggering a full ReAct loop.",
    {"question": "the question to answer"},
)
async def _ask_llm(agent: ReactAgent, question: str) -> str:
    result = await llm_router.chat(
        messages=[{"role": "user", "content": question}],
        max_tokens=500,
        temperature=0.5,
    )
    return result["content"]


@register_tool(
    "delegate",
    "Delegate a subtask to another named agent (CrewAI-style). Returns the sub-agent's answer.",
    {"agent_name": "name of the target agent", "subtask": "the task to delegate"},
)
async def _delegate(agent: ReactAgent, agent_name: str, subtask: str) -> str:
    target = _AGENT_REGISTRY.get(agent_name)
    if not target:
        available = list(_AGENT_REGISTRY.keys())
        return f"Agent '{agent_name}' not found. Available agents: {available}"
    if target.name == agent.name:
        return "Cannot delegate to self."
    logger.info(f"{agent.name} delegating to {agent_name}: {subtask[:80]}")
    result = await target.run(subtask)
    return result.get("answer", "No answer from delegate.")


@register_tool(
    "queue_task",
    "Add a task to this agent's prioritized task queue (BabyAGI pattern). Priority 1=highest, 10=lowest.",
    {"task": "task description", "priority": "float 1.0–10.0 (default 5.0)"},
)
async def _queue_task(agent: ReactAgent, task: str, priority: float = 5.0) -> str:
    agent.task_queue.add(task, priority=float(priority))
    return f"Queued '{task[:80]}' at priority {priority}. Queue size: {len(agent.task_queue)}"


@register_tool(
    "next_task",
    "Pop the highest-priority task from this agent's queue.",
    {},
)
async def _next_task(agent: ReactAgent) -> str:
    task = agent.task_queue.pop()
    if task is None:
        return "Task queue is empty."
    return f"Next task: {task}"


# ── Factory ────────────────────────────────────────────────────

def create_agent(name: str, role: str = "general", soul_hash: str = "unknown") -> ReactAgent:
    return ReactAgent(name=name, role=role, soul_hash=soul_hash)


def list_agents() -> List[str]:
    return list(_AGENT_REGISTRY.keys())


def get_agent(name: str) -> Optional[ReactAgent]:
    return _AGENT_REGISTRY.get(name)
