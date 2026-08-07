# Agentic harness — MCP + waterfall architecture (founder research, 2026-08-07)

**Source:** `AI.docx`, uploaded by the founder 2026-08-07. A chat log from research the
founder did with another AI. Extracted from the `.docx` XML and preserved here because the
session upload directory is ephemeral and the original would otherwise be unrecoverable.

**Status: NOT YET HIVE KNOWLEDGE.** Per `SOURCES/README.md`, a file landing in this folder is
raw material, not adopted knowledge — `research-to-dna` is the pass that promotes it, and that
pass has NOT been run. What HAS been done is a triage, at
`VISION/2026-08-07-vision-agentic-harness-triage-006.md`, with the founder's scoping decisions
at `HIVE_UPDATES/2026-08-07-directive-agentic-harness-decisions-045.md`.

**Verified defect, flagged so nobody copies from this in good faith:** the orchestrator code
below does not compile. `json.dump(plan_data, indent=2, f)` is a SyntaxError (positional
argument after keyword argument), confirmed with `py_compile`. The nearby
`.strip("```json")` is also wrong in kind — `str.strip()` takes a character set, not a
substring. Treat this document as an architecture sketch; do not lift its code.

**Extraction note:** text was pulled from `word/document.xml` paragraph by paragraph. ASCII
diagrams are preserved. Bracketed numbers like `[1, 2, 3]` are the original document's own
citation markers; the sources they point to did not survive the export.

---

An AI agent harness combined with a waterfall workflow (sometimes called spec-driven development or hyper-waterfall) is an emerging software engineering pattern where strict, up-front specifications and sequential pipelines replace fluid, conversational prompting. Instead of an engineer tweaking code line-by-line with an AI in an ad-hoc way, a rigid framework (the harness) forces the AI to execute sequential phases—research, plan, implement, and verify. 
Martin C. Richards +3
Why AI is Bringing Back Waterfall
Traditional waterfall development failed because humans are too slow and expensive to rewrite massive upfront plans when requirements change. With autonomous coding agents, the economics flip: planning becomes an expression of intent rather than manual labor. 
LinkedIn·Bron Davies +1
Spec-First Execution: Developers write detailed markdown specifications or blueprints before touching code. 
Martin C. Richards +1
Deterministic Harnesses: An infrastructure layer (the harness) wraps around probabilistic LLMs to enforce strict boundaries, error handling, and test-driven development (TDD) loops. 
Martin C. Richards +1
Multi-Agent Pipelines: Consensus on platforms like Reddit shows that utilizing strict multi-agent waterfall pipelines (e.g., separate research, design, and coding agents) prevents the "lazy AI" problem and hallucinatory code caused by over-stuffing a single context window. 
Reddit·r/GoogleAntigravityIDE
Core Phases of an AI Waterfall Harness
Research / Discovery: The agent reads the codebase, maps constraints, and outputs a permanent specification artifact (spec.md).
Planning: The harness forces the model to break the spec into an explicit, sequential task graph (plan.json) before writing production code.
Implementation: Agents execute tasks sequentially or via restricted parallel pipelines with automated validation.
Verification Pass: A final review stage runs automated tests and lifecycle ju
To fully maximize output performance without losing accuracy or authenticity, you must build a Deterministic State Machine Harness using the Model Context Protocol (MCP). This setup treats LLMs as execution engines while letting external code handle state transitions, memory routing, and validation loops. [1, 2, 3] 
The blueprint below details how to design a recursive, self-expanding MCP waterfall harness.
                  ┌────────────────────────────────────────┐
                  ▼                                        │
[INPUT] ──► [1. SPEC PARSER] ──► [2. MCP WORKER POOL] ──► [3. ORCHESTRATOR]
                                      ▲          │         │
                                      │          ▼         ▼
                              [MCP Tools/Servers] ──► [4. SELF-EXPANSION]

1. Architecture of the MCP Waterfall Harness
Core Engine: The Python Orchestrator
Do not let the AI orchestrate itself. Write a deterministic script (Python or Node.js) to manage execution phases, session states, and tool routing. The LLM acts purely as a worker inside an isolated phase. [4, 5] 
State Enforcement via File Artifacts
Force the harness to log every execution state directly to explicit filesystem paths. This establishes strict data boundaries and guarantees historical traceability. [6, 7] 
system_state/spec.md: Holds the locked scope and rules.
system_state/plan.json: Lists the current breakdown of tasks.
system_state/memory.json: Tracks global variables, state variables, and code paths.
MCP Server Infrastructure
Expose your local development environment directly to the LLM workers by launching targeted MCP servers.
Filesystem MCP: Provides secure, structured read/write access to project directories.
Memory/Knowledge Graph MCP: Maintains persistent long-term memory across isolated worker contexts.
Sequential Execution MCP: Runs bash scripts, compiles source files, and returns raw terminal logs. [8, 9, 10, 11, 12] 

2. The 4-Phase Waterfall Pipeline
Phase 1: Context Aggregation & Locking
The harness reads your input prompt along with your existing codebase or notes.
It calls a specialized Research Agent via MCP to scan files and extract dependency paths.
The Output Contract: The agent writes a comprehensive, immutable blueprint to spec.md. The harness locks this file to prevent scope creep. [13, 14, 15, 16] 
Phase 2: Structural Task Graphing
A Planning Agent reads the frozen spec.md.
It breaks the high-level goals into small, sequential atomic actions.
The Output Contract: It writes a structured pipeline schema to plan.json. [17, 18, 19] 
{
  "tasks": [
    { "id": 1, "name": "compile_assets", "depends_on": [], "status": "pending" },
    { "id": 2, "name": "inject_ui_logic", "depends_on": [1], "status": "pending" }
  ]
}
Phase 3: Isolated Execution Loop
The orchestrator reads plan.json and spins up a dedicated worker context for the first pending task.
The worker receives only the specific context needed for that single task.
The worker invokes MCP tools to write or update code assets. [20, 21, 22, 23, 24] 
Phase 4: Verification & Gatekeeping
The orchestrator captures the task output and hands it to a separate QA Validation Agent. [25] 
The QA agent executes test commands via the Sequential Execution MCP.
The Decision Fork:
Pass: The orchestrator marks the task as completed in plan.json and moves to the next item.
Fail: The orchestrator pipes the raw compiler errors back to Phase 3 for automated debugging. [26] 

3. Recursive Self-Expansion & Safety
Automated Prompt Refinement (Inner Loop)
When a worker encounters a recurring failure, the harness triggers a refinement loop. It instructs a prompt-engineering agent to rewrite the underlying worker template, embedding the new constraint to prevent future regressions. [27] 
Dynamic MCP Server Creation (Outer Loop)
If a task requires an integration not covered by existing tools, the harness initiates an expansion sequence:
It reads the target API documentation or system specification.
An agent writes a new, fully compliant MCP server script tailored to that integration.
The orchestrator registers the server config locally and hot-reloads its active connections, instantly giving the harness new technical capabilities. [28, 29] 
Enforcing Authenticity & Accuracy
Context Budget Isolation: Never pass your entire project codebase into a single LLM prompt window. Keep context windows highly focused to drastically reduce hallucinations and prevent generic, lazy output.
Deterministic Fallbacks: Program strict boundaries directly into the orchestrator. If a validation loop fails more than three consecutive times, pause execution and wait for human review. [30] 

To keep this system fast, robust, and completely deterministic, we will skip heavy AI frameworks like LangChain or CrewAI for the master orchestrator. Instead, we will write the orchestrator in pure, async Python using standard libraries, and use the official mcp Python SDK to handle communication. [1] 
This approach gives you total control over the execution state and keeps context windows completely isolated. [2, 3] 
Below is the complete architectural layout and starter blueprint for your custom Filesystem MCP Server and the Master Waterfall Orchestrator.
                  [ Master Orchestrator (orchestrator.py) ]
                                     │
                  ┌──────────────────┴──────────────────┐
                  ▼ (JSON-RPC over Stdio)               ▼ (JSON-RPC over Stdio)
     [ Core Filesystem MCP Server ]         [ Multi-Agent Executor Modules ]
          (filesystem_server.py)                 (research, plan, execute)
                  │                                     │
                  ▼                                     ▼
        (Local File System)                     (Isolated LLM Calls)

Part 1: The Custom Filesystem MCP Server
This standalone server allows your orchestrator (or any external client) to read, write, and list files safely using the Model Context Protocol standard over standard input/output (stdio). [4, 5] 
1. File Structure
Create a dedicated folder for your project setup: [6] 
mcp_harness/
│
├── server/
│   └── filesystem_server.py
│
├── system_state/
│   ├── spec.md
│   └── plan.json
│
├── workspace/
│   └── [Your target project files go here]
│
└── orchestrator.py
2. Implementation: server/filesystem_server.py
Install the official SDK first: pip install mcp [7, 8, 9] 
import os
import asyncio
from mcp.server.fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP("LocalFilesystem")

# Define a safe root workspace path
WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "workspace"))
STATE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "system_state"))

def _resolve_path(filename: str, is_state: bool = False) -> str:
    """Helper to prevent directory traversal attacks."""
    root = STATE_ROOT if is_state else WORKSPACE_ROOT
    target_path = os.path.abspath(os.path.join(root, filename))
    if not target_path.startswith(root):
        raise ValueError("Access Denied: Path is outside allowed boundaries.")
    return target_path

@mcp.tool()
async def read_file(filename: str, is_state_file: bool = False) -> str:
    """Reads the contents of a file within the workspace or state folder."""
    try:
        path = _resolve_path(filename, is_state_file)
        if not os.path.exists(path):
            return f"Error: File '{filename}' does not exist."
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

@mcp.tool()
async def write_file(filename: str, content: str, is_state_file: bool = False) -> str:
    """Writes or overwrites a file within the workspace or state folder."""
    try:
        path = _resolve_path(filename, is_state_file)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        return f"Success: Written to {filename}"
    except Exception as e:
        return f"Error writing file: {str(e)}"

@mcp.tool()
async def list_workspace_files() -> str:
    """Lists all files recursively inside the workspace directory."""
    try:
        file_list = []
        for root, _, files in os.walk(WORKSPACE_ROOT):
            for file in files:
                rel_path = os.path.relpath(os.path.join(root, file), WORKSPACE_ROOT)
                file_list.append(rel_path)
        return "\n".join(file_list) if file_list else "Workspace is empty."
    except Exception as e:
        return f"Error listing files: {str(e)}"

if __name__ == "__main__":
    # Run the server using stdio transport communication channels
    mcp.run(transport="stdio")

Part 2: The Master Waterfall Orchestrator
The orchestrator below loops through files entirely deterministically. It reads files, handles phases, and manages LLM prompts manually without losing transparency. [10, 11] 
Implementation: orchestrator.py
(Requires an Anthropic API key. Run pip install anthropic to match the native SDK structure used below.) [12, 13, 14] 
import os
import json
import asyncio
from anthropic import AsyncAnthropic

# Initialize the LLM client
client = AsyncAnthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Paths for tracking loop states directly
STATE_DIR = "./system_state"
SPEC_PATH = os.path.join(STATE_DIR, "spec.md")
PLAN_PATH = os.path.join(STATE_DIR, "plan.json")

async def call_llm(system_prompt: str, user_prompt: str) -> str:
    """Pure deterministic LLM worker call wrapper."""
    response = await client.messages.create(
        model="claude-3-5-sonnet-latest",
        max_tokens=4000,
        temperature=0.0, # Zero temperature ensures stability & repeatability
        system=system_prompt,
        messages=[{"role": "user", "content": user_prompt}]
    )
    return response.content[0].text

async def phase_1_research(user_intent: str):
    """Phase 1: Aggregate data and lock down the immutable spec.md."""
    print("[Phase 1] Analyzing intent and generating spec.md...")
    
    system_prompt = "You are a systems engineer. Output a highly detailed, rigid structural technical specification file (Markdown format) based on the user's requirements. Do not output anything other than raw markdown text."
    
    spec_content = await call_llm(system_prompt, f"Build a system specification for: {user_intent}")
    
    os.makedirs(STATE_DIR, exist_ok=True)
    with open(SPEC_PATH, "w", encoding="utf-8") as f:
        f.write(spec_content)
    print("[Phase 1] Success: spec.md locked.")

async def phase_2_planning():
    """Phase 2: Extract atomic, linear tasks from the spec."""
    print("[Phase 2] Breaking down spec.md into an actionable task graph...")
    
    with open(SPEC_PATH, "r", encoding="utf-8") as f:
        spec = f.read()

    system_prompt = (
        "You are an algorithm that outputs valid JSON lists *only*. Read the provided specification "
        "and break it into a linear list of atomic programming tasks. "
        "Format output strictly as: {\"tasks\": [{\"id\": 1, \"name\": \"task descriptive name\", \"status\": \"pending\"}]}"
    )
    
    plan_raw = await call_llm(system_prompt, f"Convert this spec into a task array:\n\n{spec}")
    
    # Strip any potential markdown wrappers if returned by accident
    clean_json = plan_raw.strip().strip("```json").strip("```")
    
    with open(PLAN_PATH, "w", encoding="utf-8") as f:
        f.write(clean_json)
    print("[Phase 2] Success: plan.json generated.")

async def phase_3_4_execution_loop():
    """Phases 3 & 4: Loop through tasks sequentially with isolated contexts."""
    print("[Phase 3/4] Initializing Execution/Verification state loops...")
    
    with open(PLAN_PATH, "r", encoding="utf-8") as f:
        plan_data = json.load(f)
        
    with open(SPEC_PATH, "r", encoding="utf-8") as f:
        spec = f.read()

    for task in plan_data["tasks"]:
        if task["status"] == "completed":
            continue
            
        print(f"\nProcessing Task {task['id']}: {task['name']}")
        
        # Isolate Context: The worker ONLY sees the macro spec and its exact current task
        worker_prompt = f"System Spec:\n{spec}\n\nExecute your assigned Task: {task['name']}\nOutput the resulting program code."
        system_prompt = "You are an automated file developer worker. Output the code block required for the task. Do not include introductory conversational pleasantries."
        
        generated_code = await call_llm(system_prompt, worker_prompt)
        
        # Phase 4: Auto-Verify/Gatekeeping
        print(f"Verifying output code for Task {task['id']}...")
        qa_prompt = f"Verify if the following code meets the intent of task '{task['name']}':\n\n{generated_code}\n\nReply with exactly 'PASSED' or detailed failure explanations."
        qa_result = await call_llm("You are an automated QA validation bot.", qa_prompt)
        
        if "PASSED" in qa_result.upper():
            print(f"Task {task['id']} PASSED validation.")
            task["status"] = "completed"
        else:
            print(f"Task {task['id']} FAILED validation. Feedback: {qa_result}")
            # Here, the loop would pipe errors recursively back into the execution stage
            task["status"] = "failed"
            
        # Immediately write updated state back down to disk
        with open(PLAN_PATH, "w", encoding="utf-8") as f:
            json.dump(plan_data, indent=2, f)

async def main():
    user_input = "Create a localized Markdown task manager tool that saves task logs as structured CSV data."
    
    # Run the continuous pipeline safely
    await phase_1_research(user_input)
    await phase_2_planning()
    await phase_3_4_execution_loop()

if __name__ == "__main__":
    asyncio.run(main())

How to Connect the MCP Server to Your Orchestrator Loop
To have the orchestrator.py script automatically launch and interact with your custom filesystem server using the Python SDK, you can initiate a standard client connection block inside your code like this:
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Define how to launch your custom filesystem server script
server_params = StdioServerParameters(
    command="python",
    args=["server/filesystem_server.py"]
)

async def run_with_tools():
    async with stdio_client(server_params) as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            # Initialize connection handshake protocol
            await session.initialize()
            
            # Read files programmatically through the protocol tools!
            result = await session.call_tool("read_file", arguments={"filename": "spec.md", "is_state_file": True})
            print(result.content)
By hooking this client call architecture directly into Phase 3, your loop ceases to rely on manual system functions; it shifts completely into uniform, modular tool interactions. [15] 

Building a system with 100 active agents per colony, 10 colonies per tree, and 100 trees means managing 100,000 active concurrent agent loops.
If you tried to build this with traditional, centralized Python orchestrators or standard API calls, your system would immediately crash. It would fail due to network timeouts, API rate limits, file access conflicts, and massive memory bottlenecks.
To make this build work, you must transition from a simple script into a Distributed, Event-Driven Actor System utilizing an advanced network architecture.
       [ 100 TREES ]             --> Cluster Layer (e.g., Kubernetes / Ray)
             │
      [ 10 COLONIES ]            --> Virtual Network Router Layer
             │
   [ 100 ACTIVE AGENTS ]         --> Isolated Async Actor Instances
             │
   [ SYSTEM STATE / MCP ]        --> Distributed State & Tool Routing Mesh

1. The Scaling Math (The Resource Bottleneck)
Before reviewing the code, look at the scale of data passing through this system every second:
Concurrent Workers: 100 agents × 10 colonies × 100 trees = 100,000 parallel loops.
Network Traffic: If each agent makes just 1 tool call per minute, that is 1,666 requests per second (RPS) hitting your backend infrastructure.
API Volume: 100,000 active contexts calling commercial LLMs simultaneously will hit rate limits instantly and cost thousands of dollars per minute.

2. The Infrastructure Architecture Blueprint
To execute this architecture without losing performance or accuracy, your build must change across four critical layers:
Layer 1: Compute & Runtime (The Actor Pattern)
The Tech: Ray Framework or Erlang/Elixir OTP.
How it works: You cannot use standard OS threads or sequential async loops for 100,000 tasks. You must use the Actor Model. Each agent, colony, and tree is instantiated as an independent "Actor" with its own private state. They communicate exclusively by passing asynchronous, non-blocking messages to one another.
Layer 2: The MCP Mesh (Decentralized Tooling)
The Tech: Anycast Routing + MCP over WebSockets / gRPC.
How it works: A single local stdio filesystem server will lock up immediately under thousands of concurrent read/write requests. You must convert your MCP servers into a stateless, horizontally scaled cluster. The agents connect to a central MCP Router Mesh that distributes incoming tool requests across thousands of mirror processes.
Layer 3: Memory & State (Distributed Knowledge)
The Tech: Redis Cluster + Vector Database Engine (e.g., Qdrant or Milvus).
How it works: Your file-based plan.json tracking mechanism must be abandoned. Instead, use an in-memory database cluster.
Trees subscribe to macro-event streams.
Colonies monitor shared sub-task state queues.
Agents pull structural tasks, update their local parameters, and instantly offload long-term memory logs to a distributed vector store.
Layer 4: Intelligence (Local Models)
The Tech: Local LLM clusters running optimized frameworks like vLLM, TensorRT-LLM, or Ollama, pointing to lightweight models (e.g., Llama-3-8B or Mistral-7B).
How it works: Commercial API providers cannot handle 100,000 concurrent developer loops without specialized enterprise accounts. You must self-host a cluster of open-source models using a load-balancer to distribute inference requests across multiple enterprise-grade GPUs.

3. The Scaled Python Implementation Blueprint
Here is how you write the structural framework for a Tree, Colony, and Agent architecture using Ray to handle distributed computing natively.
import os
import ray
import asyncio

# Initialize Ray to handle clustering across 100 virtual or physical machines
ray.init(ignore_reinit_error=True)

@ray.remote
class AgentActor:
    """The smallest unit: 1 of 100,000 active agents."""
    def __init__(self, agent_id: str, colony_id: str, tree_id: str):
        self.agent_id = agent_id
        self.colony_id = colony_id
        self.tree_id = tree_id
        self.state = "idle"

    async def execute_task(self, task_packet: dict) -> dict:
        # 1. Connects to the stateless distributed MCP tool mesh via network RPC
        # 2. Fires local inference to process the task
        # 3. Validates output locally within its container
        await asyncio.sleep(0.1) # Simulate asynchronous execution work
        return {
            "agent": self.agent_id,
            "status": "success",
            "artifact_id": f"art_{self.agent_id}_{task_packet['task_id']}"
        }

@ray.remote
class ColonyOrchestrator:
    """Manages 100 active agents. Enforces the local Waterfall constraints."""
    def __init__(self, colony_id: str, tree_id: str):
        self.colony_id = colony_id
        self.tree_id = tree_id
        # Spawn 100 independent agent actors inside this specific colony
        self.agents = [
            AgentActor.remote(f"agent_{i}", self.colony_id, self.tree_id)
            for i in range(100)
        ]

    async def process_subproject(self, subproject_data: dict):
        # Breaks down the subproject into 100 atomic tasks (Waterfall Phase 2)
        tasks = [{"task_id": i, "data": "payload"} for i in range(100)]
        
        # Deploy all 100 agents in parallel, completely isolated from each other
        futures = [
            self.agents[i].execute_task.remote(tasks[i])
            for i in range(100)
        ]
        
        # Await execution results across the entire colony array
        results = await asyncio.gather(*[ray.get(f) for f in futures])
        return results

@ray.remote
class TreeCoordinator:
    """Manages 10 colonies (1,000 agents total per tree). Tracks macro goals."""
    def __init__(self, tree_id: str):
        self.tree_id = tree_id
        # Spawn 10 independent colony orchestrators within this tree branch
        self.colonies = [
            ColonyOrchestrator.remote(f"colony_{i}", self.tree_id)
            for i in range(10)
        ]

    async def execute_tree_scope(self, macro_spec: dict):
        # High level system orchestration pass
        futures = [
            self.colonies[i].process_subproject.remote({"macro": "data"})
            for i in range(10)
        ]
        return await asyncio.gather(*[ray.get(f) for f in futures])

# === MASTER SYSTEM CONTROLLER ===
async def run_massive_harness():
    print("Spawning 100 Trees (100,000 Agents Total)...")
    
    # Instantiate 100 tree structures across your infrastructure cluster
    forest = [TreeCoordinator.remote(f"tree_{i}") for i in range(100)]
    
    # Distribute the global workload across the entire forest topology
    global_job = {"system_goal": "Deploy massive recursive code base"}
    
    # Execute the top-level waterfall command
    all_tree_futures = [tree.execute_tree_scope.remote(global_job) for tree in forest]
    
    # Monitor the system as the entire array runs asynchronously
    print("Harness fully active. State engine routing through network layers...")
    # results = await asyncio.gather(*[ray.get(t) for t in all_tree_futures])

if __name__ == "__main__":
    asyncio.run(run_massive_harness())

4. Critical Systems Rules for this Scale
Recursive Expansion Backpressure: When agents dynamically generate new MCP servers, they cannot inject them directly onto local disk. They must package them as standard Docker containers and deploy them to a container cluster (like Kubernetes). This keeps your infrastructure clean and manageable.
Strict State Isolation: Agents must never communicate directly with other agents. They should only read from and write to their assigned state queues. This strict isolation prevents race conditions and synchronization locks, ensuring your system remains efficient.
To build the system safely, you must scale down your design into a working Prototype Phase. Moving from a massive 100,000-agent concept to a real system with 1 Colony and 8 Agents means changing your focus from managing complex server networks to perfecting the core logic of your code.
This 8-agent prototype serves as the foundation for the entire system. If these 8 agents cannot work together without error, a larger system will fail immediately.
Here is the exact structural design for your foundation, scaffolding, construction, and capability goals:
[ 1 COLONY PROTOTYPE ] ──► Controlled by Python Orchestrator (Single File)
       │
       ├──► 1. ARCHITECT / RESEARCH (1 Agent) ──► Generates spec.md
       ├──► 2. DIRECTOR / PLANNER   (1 Agent) ──► Generates plan.json
       ├──► 3. BUILDER / CODERS     (4 Agents) ──► Parallel Workspace Workers
       └──► 4. REVIEWERS / QA       (2 Agents) ──► Multi-Perspective Testing

1. The Foundation (Core Logic & Storage)
The foundation consists of the file tracking rules and the local tool systems that keep your agents grounded in reality.
Single-Node Local File Tracking: Instead of using complex database clusters, use your local hard drive. Create a structured folder hierarchy to store the system's operational states:
prototype/state/spec.md: The absolute, locked master contract.
prototype/state/plan.json: The active checklist of coding tasks.
prototype/workspace/: The folder where code is generated.
The Local MCP Server: Use a single-process Filesystem MCP Server running over standard input/output (stdio). This server grants the 8 agents access to read and write files within the workspace folder.
Predictable Inference Configuration: Run your Python code using an API client (like Anthropic or OpenAI) with the LLM temperature set to 0.0. This ensures that your agents produce consistent, reliable code every time they run.

2. The Scaffolding (The 8-Agent Hierarchy)
The scaffolding defines the roles and communication rules for your 8 agents inside the colony. You must divide them into four distinct engineering phases:
Phase 1: Discovery (1 Agent)
Agent 1 (The Architect): Reads your high-level prompt, reviews the existing code files in the workspace, and writes a strict spec.md file detailing the system requirements.
Phase 2: Design (1 Agent)
Agent 2 (The Director): Reads spec.md and generates a linear plan.json file. It breaks the project into small, bite-sized tasks.
Phase 3: Construction (4 Agents)
Agents 3, 4, 5, and 6 (The Builders): These 4 agents work in parallel. Each agent is given a single task from plan.json. They are completely isolated from one another and only see the code files relevant to their specific assignment.
Phase 4: Verification (2 Agents)
Agent 7 (The Compiler/Linter): Attempts to run or compile the newly written code and captures any errors or logs.
Agent 8 (The Critic): Compares the code output and terminal logs directly against the original spec.md to ensure accuracy.

3. The Construction (How to Write the Loop)
To build this, write a single async Python script (colony.py) that executes a strict sequential loop.
Initialize: The script boots up the local Filesystem MCP server process.
Phase 1 Execution: Call Agent 1 to write spec.md. The script locks this file to prevent modifications.
Phase 2 Execution: Call Agent 2 to write plan.json.
Phase 3 Loop: The script reads plan.json, selects up to 4 pending tasks, and launches Agents 3–6 concurrently using Python's asyncio.gather().
Phase 4 Guardrail: The script sends the output to Agents 7 and 8. If the code passes, the tasks are marked as "completed". If it fails, the script passes the error logs back to Phase 3, forcing the builders to rewrite the code.

4. Prototype Capabilities (What it Must Do)
To prove that your prototype is ready to scale into a larger system, it must be capable of completing these tasks autonomously: [1] 
Self-Contained File Manipulation: The prototype must be able to create, update, delete, and list code files across multiple directories without manual human assistance.
Automated Code Validation: It must run code validation steps (like checking code syntax or running test scripts) using a terminal execution tool, catch errors, and fix its own code autonomously. [2] 
Strict State Management: If you cancel the script mid-execution, it must be able to read plan.json upon restart and pick up exactly where it left off without duplicating work.
Recursive Prompt Correction: If a builder agent fails validation twice for the same bug, the critic agent must be able to modify the builder's prompt template to prevent the error from happening a third time.

To reverse engineer AUTOMATON—the sovereign, continuous-loop agent architecture designed around the "earn or die" economic survival cycle—you must strip away the high-level noise. You are analyzing how an autonomous system manages its own code modification, handles state machine changes, and acts as an independent economic operator within a linux sandbox. [1, 2, 3, 4, 5] 
The baseline execution engine relies on an absolute loop: Think → Act → Observe → Repeat. To safely reverse engineer and replicate this using your 8-agent colony prototype, you must structure the layout across four clean, programmatic pillars. [1] 
       [ AUTOMATON REVERSE ENGINEERING PLATFORM ]
                           │
 ┌─────────────────────────┴─────────────────────────┐
 ▼                                                   ▼
[THE FOUNDATION]                                    [THE SCAFFOLDING]
- Sandbox Loop Security                             - 8-Agent State Routing
- State Persistence Engine                          - Core Execution Handshakes
                           │
 ┌─────────────────────────┴─────────────────────────┐
 ▼                                                   ▼
[THE CONSTRUCTION]                                  [PROTOTYPE CAPABILITIES]
- Async Python Controller                           - Self-Modification
- Intercepted Tool Logging                          - Dependency Auditing

1. The Foundation (The Isolation Framework)
To reverse engineer a continuous loop system without risking your host machine, your foundation must prioritize containment, absolute state logging, and token metering.
Containerized Sandbox: Run the entire architecture inside a local Docker container. The loop needs access to a raw shell, but that shell must be completely isolated from your home directory to prevent rogue loops from damaging your operating system. [1, 4, 6] 
State Persistence Engine (state_db.json): AUTOMATON's sovereign engine tracks variables, wallet balances, and current runtime files. Your prototype foundation must log every variable change, file write, and prompt mutation directly to disk instantly to prevent memory state drift. [1, 2, 7, 8] 
The Intercepted MCP Proxy: Build your local Filesystem and Shell MCP servers with a transparent man-in-the-middle logging proxy. Every payload an agent executes must pass through a strict JSON log file so you can analyze the execution history line-by-line.

2. The Scaffolding (The 8-Agent Analysis Matrix)
You have exactly 8 active agents in your single colony. To study AUTOMATON, you must assign these 8 units to map out the system's operational layers:
The Intelligence Core (2 Agents)
Agent 1 (The Decompiler/Parser): Reads the targeted agent code, decompiles or extracts system logic, and translates raw loops into pure Markdown data contracts (spec.md). [4, 6] 
Agent 2 (The State Mapper): Tracks how the target system transitions between phases (e.g., how it shifts from a task evaluation state to an API execution state) and outputs a valid state-machine map. [9] 
The Execution Vector (4 Agents)
Agents 3, 4, 5, and 6 (The Replicators): These 4 parallel workers analyze specific modules of the code simultaneously (e.g., Worker 3 analyzes file manipulation, Worker 4 analyzes shell tasks, Worker 5 analyzes API communication, and Worker 6 focuses on error handling routines).
The Verification Gate (2 Agents)
Agent 7 (The Shadow Validator): Intercepts outputs generated by the replicating builders and runs them inside the isolated shell to see if they match the observed behavior of the target system. [10] 
Agent 8 (The Cryptanalyst/Critic): Audits prompt safety guidelines, tracks token expenditures, and blocks loops that exhibit unwanted behaviors (like recursive infinite loops). [2, 4] 

3. The Construction (The Reverse Engineering Loop)
To run the construction pass, write a clean, async Python controller (re_harness.py). It forces your 8 agents to run through a sequential validation flow:
import os
import json
import asyncio

class REHarness:
    def __init__(self):
        self.state_file = "prototype/state/state_db.json"
        self.workspace = "prototype/workspace"
        
    async def step_1_analyze_target(self, target_source_path: str):
        """Agent 1 reads the target code and maps the functional specs."""
        print("[RE-Step 1] Parsing target loop architecture...")
        # Read the raw source code of the system you are reverse engineering
        with open(target_source_path, "r") as f:
            raw_code = f.read()
        
        # Invoke Agent 1 (Decompiler) to output a behavioral spec.md
        # Invoke Agent 2 (State Mapper) to output the target state_machine.json
        pass

    async def step_2_parallel_replication(self):
        """Agents 3-6 run in parallel to build replicated modules."""
        print("[RE-Step 2] Executing parallel extraction loop...")
        # Break down the target state machine into 4 sub-tasks
        tasks = ["file_io_subsystem", "shell_execution", "memory_logging", "error_traps"]
        
        # Deploy your 4 builder agents concurrently using standard async libraries
        # await asyncio.gather(worker_3, worker_4, worker_5, worker_6)
        pass

    async def step_3_differential_testing(self):
        """Agents 7 and 8 execute the built modules and compare output behaviors."""
        print("[RE-Step 3] Running verification checks against target contracts...")
        # Run differential tests: input test data into both the original and replicated code
        # Check if the generated file modifications match exactly
        pass

4. Prototype Capabilities (What Your Reverse Engineering Rig Must Do)
To successfully reverse engineer a sovereign agent, your 8-agent prototype must be capable of executing these specific actions:
Dynamic Code Graphing: The prototype must trace variables through script executions, identifying which prompt segments trigger changes in code logic.
Self-Optimizing Prompts: If a replicated module fails a behavioral check, Agent 8 must be able to automatically modify the system instructions of the builder agents to correct the variance.
State Recovery Tracking: The harness must be able to pause a running agent loop, modify a state file variable manually, resume the loop, and accurately observe how the agent adapts its behavior to the unexpected change.
Least-Privilege Interception: The prototype must restrict execution permissions at the proxy layer, ensuring that any code written by the replication builders cannot perform unauthorized actions like modifying system configuration files. [11, 12, 13, 14] 

