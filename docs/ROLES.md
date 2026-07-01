# Sovereign Hive — Role Catalog

This is the canonical, federation-wide role catalog referenced by every colony's
`docs/GOVERNANCE.md`. It exists to give contributors (human or AI) a consistent
vocabulary for *what kind of work* a change represents, via the `[ROLE: ...]`
commit/PR tag described in [GOVERNANCE.md](./GOVERNANCE.md).

This is a **convention, not an access-control system**. No tooling enforces who
may use which role tag; it is a documentation aid for readability and review
triage, not a permissions model.

101 roles are organized into 10 tiers, scoped either to a single colony
(repository) or across the whole federation ("All repos").

| Tier | # | Role Title | Primary Repo(s) | Responsibility |
|---|---|---|---|---|
| Governance Kernel | 1 | Constitution Steward | THEHIVE | Maintains `docs/GOVERNANCE.md` and `docs/ROLES.md` as the canonical source of truth. |
| Governance Kernel | 2 | Role Catalog Curator | THEHIVE | Reviews and updates the role catalog as the federation evolves. |
| Governance Kernel | 3 | Compliance Auditor | All repos | Periodically checks repos for governance doc presence and freshness. |
| Governance Kernel | 4 | Conflict Resolver | All repos | Arbitrates disagreements between role recommendations across repos. |
| Governance Kernel | 5 | Convention Enforcer | All repos | Maintains the commit/PR tagging convention and advisory CI templates. |
| Governance Kernel | 6 | Federation Liaison | All repos | Coordinates cross-repo announcements and shared documentation links. |
| Executive | 7 | Queen Colony Director | THEHIVE | Owns overall direction and architecture of the hub colony. |
| Executive | 8 | Security Colony Director | NAR2 | Owns NAR2's security and search roadmap. |
| Executive | 9 | Cognitive Colony Director | 4DBRAIN | Owns 4DBRAIN's reasoning/orchestration roadmap. |
| Executive | 10 | Commerce Colony Director | aether | Owns aether's licensing/commerce roadmap. |
| Executive | 11 | Workflow Colony Director | automatisch | Owns automatisch's automation roadmap (upstream-aligned). |
| Executive | 12 | Mind Colony Director | Kimi-K2 | Owns Kimi-K2's language-model gateway roadmap. |
| Executive | 13 | Body Colony Director | LocalAGI | Owns LocalAGI's agent-platform roadmap (upstream-aligned). |
| Executive | 14 | Knowledge Repository Director | build-your-own-x | Oversees curriculum content quality. |
| Executive | 15 | Reference Library Director | free-programming-books | Oversees library curation and link hygiene. |
| Executive | 16 | Academy Director | freeCodeCamp | Oversees curriculum integration (upstream-aligned). |
| Executive | 17 | Release Coordinator | All repos | Coordinates version tags and changelog practices across repos. |
| Executive | 18 | Budget/Resource Steward | All repos | Tracks CI minutes and free-tier resource usage federation-wide. |
| Domain Lead | 19 | API Design Lead | THEHIVE | Owns REST/JSON contract consistency across colony endpoints. |
| Domain Lead | 20 | Data Persistence Lead | THEHIVE, NAR2, 4DBRAIN, Kimi-K2 | Owns SQLite schema and migration conventions. |
| Domain Lead | 21 | Messaging/Eventing Lead | THEHIVE | Owns the colony-events dispatch protocol. |
| Domain Lead | 22 | Frontend UX Lead | aether, 4DBRAIN | Owns shared UI/UX conventions across web frontends. |
| Domain Lead | 23 | Authentication & Authorization Lead | THEHIVE, NAR2 | Owns JWT/auth conventions across colonies. |
| Domain Lead | 24 | Search & Retrieval Lead | NAR2 | Owns deep-search and indexing approach. |
| Domain Lead | 25 | Workflow Automation Lead | automatisch | Owns app-integration and trigger/action conventions. |
| Domain Lead | 26 | Agent Platform Lead | LocalAGI | Owns skills/RAG/multimodal agent conventions. |
| Domain Lead | 27 | Language Model Gateway Lead | Kimi-K2 | Owns model routing and fallback conventions. |
| Domain Lead | 28 | Documentation Lead | All repos | Owns README/docs structure consistency. |
| Domain Lead | 29 | Testing Strategy Lead | All repos | Owns test coverage conventions and CI test wiring. |
| Director | 30 | Database Reliability Director | THEHIVE | Owns WAL/pragma tuning and index health. |
| Director | 31 | API Contract Director | THEHIVE, NAR2, 4DBRAIN, Kimi-K2 | Owns Pydantic response-model coverage. |
| Director | 32 | Network Resilience Director | THEHIVE | Owns HiveMesh timeout/backoff/circuit-breaker behavior. |
| Director | 33 | Secrets & Signing Director | All repos | Owns HMAC signing and secret-handling conventions. |
| Director | 34 | Container & Deploy Director | THEHIVE, NAR2, 4DBRAIN, aether, Kimi-K2 | Owns Dockerfile/compose conventions. |
| Director | 35 | Monitoring Director | THEHIVE | Owns Prometheus/Grafana config conventions. |
| Director | 36 | Frontend Component Director | aether, 4DBRAIN | Owns reusable component conventions. |
| Director | 37 | Backend Routing Director | automatisch | Owns Express router conventions. |
| Director | 38 | Go Services Director | LocalAGI | Owns Fiber route/middleware conventions. |
| Director | 39 | Content Accuracy Director | build-your-own-x, free-programming-books | Owns link/citation accuracy. |
| Director | 40 | Curriculum Integrity Director | freeCodeCamp | Owns lesson/test consistency (upstream-aligned). |
| Middle Management | 41 | Sprint Coordinator | THEHIVE | Tracks open work items across THEHIVE. |
| Middle Management | 42 | Sprint Coordinator | NAR2 | Tracks open work items across NAR2. |
| Middle Management | 43 | Sprint Coordinator | 4DBRAIN | Tracks open work items across 4DBRAIN. |
| Middle Management | 44 | Sprint Coordinator | aether | Tracks open work items across aether. |
| Middle Management | 45 | Sprint Coordinator | automatisch | Tracks open work items across automatisch. |
| Middle Management | 46 | Sprint Coordinator | Kimi-K2 | Tracks open work items across Kimi-K2. |
| Middle Management | 47 | Sprint Coordinator | LocalAGI | Tracks open work items across LocalAGI. |
| Middle Management | 48 | Cross-Repo Dependency Coordinator | All repos | Tracks shared-contract changes (e.g. `colony.json` schema) across repos. |
| Senior Architect/Staff | 49 | Systems Architect | THEHIVE | Maintains `docs/ARCHITECTURE.md` and system diagrams. |
| Senior Architect/Staff | 50 | Performance Architect | THEHIVE | Owns query/index/cache performance work. |
| Senior Architect/Staff | 51 | Security Architect | THEHIVE | Owns auth/middleware/signing architecture. |
| Senior Architect/Staff | 52 | Reliability Architect | THEHIVE | Owns circuit-breaker/retry/backoff architecture. |
| Senior Architect/Staff | 53 | Protocol Staff Engineer | THEHIVE | Owns the colony-events wire protocol shape. |
| Senior Architect/Staff | 54 | Economy Staff Engineer | THEHIVE | Owns wallet/staking/utility-economy modules. |
| Senior Architect/Staff | 55 | Validator Staff Engineer | THEHIVE | Owns constitution/validator rule logic. |
| Senior Architect/Staff | 56 | Agency Staff Engineer | THEHIVE | Owns agency-level/permission logic. |
| Senior Architect/Staff | 57 | Search Architect | NAR2 | Owns search-index architecture. |
| Senior Architect/Staff | 58 | Reasoning Architect | 4DBRAIN | Owns ReAct orchestration architecture. |
| Senior Architect/Staff | 59 | Commerce Architect | aether | Owns licensing/payment architecture. |
| Senior Architect/Staff | 60 | Integration Architect | automatisch | Owns app-connector architecture (upstream-aligned). |
| Senior Architect/Staff | 61 | Agent Architecture Lead | LocalAGI | Owns agent/skill architecture (upstream-aligned). |
| Senior Architect/Staff | 62 | Model Gateway Architect | Kimi-K2 | Owns model-routing architecture. |
| Senior Architect/Staff | 63 | Frontend Staff Engineer | aether, 4DBRAIN | Owns shared component/state architecture. |
| Senior Architect/Staff | 64 | DevOps Staff Engineer | All repos | Owns CI workflow templates and free-tier-budget compliance. |
| Mid-level Engineer | 65 | Backend Engineer | THEHIVE | Implements API route features. |
| Mid-level Engineer | 66 | Backend Engineer | NAR2 | Implements colony route features. |
| Mid-level Engineer | 67 | Backend Engineer | 4DBRAIN | Implements colony route features. |
| Mid-level Engineer | 68 | Backend Engineer | Kimi-K2 | Implements model-gateway route features. |
| Mid-level Engineer | 69 | Backend Engineer | automatisch | Implements router/connector features. |
| Mid-level Engineer | 70 | Backend Engineer | LocalAGI | Implements Go service features. |
| Mid-level Engineer | 71 | Frontend Engineer | aether | Implements UI components and pages. |
| Mid-level Engineer | 72 | Frontend Engineer | 4DBRAIN | Implements React dashboard components. |
| Mid-level Engineer | 73 | Database Engineer | THEHIVE | Implements schema migrations and indexes. |
| Mid-level Engineer | 74 | Database Engineer | NAR2, 4DBRAIN, Kimi-K2 | Implements local persistence layers. |
| Mid-level Engineer | 75 | Test Engineer | THEHIVE | Writes/maintains backend test coverage. |
| Mid-level Engineer | 76 | Test Engineer | NAR2, 4DBRAIN, Kimi-K2 | Writes/maintains colony test coverage. |
| Mid-level Engineer | 77 | Test Engineer | aether, automatisch | Writes/maintains frontend/integration test coverage. |
| Mid-level Engineer | 78 | Documentation Engineer | THEHIVE | Maintains in-repo technical docs. |
| Mid-level Engineer | 79 | Documentation Engineer | NAR2, 4DBRAIN, aether, automatisch, Kimi-K2, LocalAGI | Maintains per-repo README/docs accuracy. |
| Mid-level Engineer | 80 | CI Engineer | All repos | Maintains advisory CI workflow correctness. |
| Mid-level Engineer | 81 | Release Engineer | All repos | Maintains changelog and tag hygiene. |
| Apprentice/Validator | 82 | Code Reviewer Apprentice | THEHIVE | Performs first-pass PR review. |
| Apprentice/Validator | 83 | Code Reviewer Apprentice | NAR2 | Performs first-pass PR review. |
| Apprentice/Validator | 84 | Code Reviewer Apprentice | 4DBRAIN | Performs first-pass PR review. |
| Apprentice/Validator | 85 | Code Reviewer Apprentice | aether | Performs first-pass PR review. |
| Apprentice/Validator | 86 | Code Reviewer Apprentice | automatisch | Performs first-pass PR review. |
| Apprentice/Validator | 87 | Code Reviewer Apprentice | Kimi-K2 | Performs first-pass PR review. |
| Apprentice/Validator | 88 | Code Reviewer Apprentice | LocalAGI | Performs first-pass PR review. |
| Apprentice/Validator | 89 | Link & Citation Validator | build-your-own-x, free-programming-books | Checks external links resolve and citations are accurate. |
| Apprentice/Validator | 90 | Lesson Validator | freeCodeCamp | Checks lesson/test pairs remain consistent. |
| Frontline Support | 91 | Issue Triage | THEHIVE | Labels and routes incoming issues. |
| Frontline Support | 92 | Issue Triage | NAR2, 4DBRAIN, Kimi-K2 | Labels and routes incoming issues. |
| Frontline Support | 93 | Issue Triage | aether, automatisch, LocalAGI | Labels and routes incoming issues. |
| Frontline Support | 94 | Issue Triage | build-your-own-x, free-programming-books, freeCodeCamp | Labels and routes incoming issues. |
| Frontline Support | 95 | Onboarding Guide | All repos | Keeps CONTRIBUTING/setup instructions current. |
| Frontline Support | 96 | Community Q&A | All repos | Answers usage questions in issues/discussions. |
| Janitorial/Ops | 97 | Dependency Hygiene | All repos | Tracks outdated/vulnerable dependencies. |
| Janitorial/Ops | 98 | Dead Code Sweep | All repos | Identifies and flags unused code for removal. |
| Janitorial/Ops | 99 | Artifact Cleanup | THEHIVE, NAR2, 4DBRAIN, Kimi-K2 | Removes stale cache/build artifacts from version control. |
| Janitorial/Ops | 100 | Log Hygiene | All repos | Ensures logging doesn't leak secrets or PII. |
| Janitorial/Ops | 101 | CI Minutes Steward | All repos | Monitors GitHub Actions usage to stay within free-tier limits. |

See [GOVERNANCE.md](./GOVERNANCE.md) for how role tags are used in commits and PRs.
