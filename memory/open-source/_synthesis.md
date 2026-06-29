# Open Source Synthesis

The Sovereign Hive is built by extracting minimal, composable patterns from 65+ open source repositories
using the [[alchemical-process]] (Nigredo → Albedo → Citrinitas → Rubedo).

## Integration Status

| Repo | Pattern | Status | Target |
|------|---------|--------|--------|
| OmniRoute | Dynamic provider scoring | ✅ Done | gateway/index.js |
| open-mythos | Agent memory architecture | ✅ Done | agent_engine.py |
| OpenHands | CodeAct + tool execution | ✅ Done | agent_engine.py |
| MemGPT/Letta | Paging memory (hot/cold) | ✅ Done | agent_engine.py |
| CrewAI | Agent delegation chains | ✅ Done | agent_engine.py |
| BabyAGI | Prioritized task queue | ✅ Done | agent_engine.py |
| anthropic-cybersecurity | Injection detection | ✅ Done | middleware.py |
| Browser Use | Playwright automation | ✅ Done | browser.py |
| n8n | INodeType + workflow engine | ✅ Done | docker-compose.yml |
| Hermes/Odysseus | ReAct planning loop | ✅ Done | agent_engine.py |
| free-programming-books | RAG corpus | ✅ Done | ingest_knowledge.py |
| build-your-own-x | Task templates | ✅ Done | ingest_knowledge.py |
| system-design-primer | Architecture RAG | ✅ Done | ingest_knowledge.py |
| LangChain | AgentExecutor pattern | 🔄 Ingested | ingest_knowledge.py |
| LlamaIndex | VectorStoreIndex | 🔄 Ingested | ingest_knowledge.py |
| MetaGPT | Role/Message routing | 🔄 Ingested | ingest_knowledge.py |
| Semantic Kernel | Orchestration patterns | 🔄 Ingested | ingest_knowledge.py |
| Semgrep rules | Security patterns | 🔄 Ingested | ingest_knowledge.py |
| Awesome Selfhosted | Self-hosted tools catalog | 🔄 Ingested | ChromaDB |
| Free-for-dev | Free service catalog | 🔄 Ingested | ChromaDB |

## Links

[[waterfall]] · [[react-engine]] · [[agents/memory]] · [[alchemical-process]] · [[devils-advocate]]
