# Context Engineering Research

## agents.md (Open Standard)
- Source: https://github.com/agentsmd/agents.md / https://agents.md
- What: Vendor-neutral markdown format for guiding coding agents. "README for agents."
- Adoption: 60K+ open source repos. Backed by OpenAI, Google, Cognition, Cursor, Factory.
- Stewarded by: Agentic AI Foundation under Linux Foundation
- Key feature: Proximity-based precedence (closest AGENTS.md to edited file wins)
- Compatible with: 20+ platforms (Codex, Cursor, Copilot, Jules, VS Code, etc.)
- Relevance to us: Portable layer for client deliverables. We ship AGENTS.md in repo + CLAUDE.md in container.
- Limitation: No memory, no multi-agent coordination, no identity layer.

## Codified Context Infrastructure (Vasilopoulos 2026)
- Source: https://arxiv.org/html/2602.20478v1
- Companion repo: https://github.com/arisvas4/codified-context-infrastructure
- What: Three-tier memory architecture for Claude Code at scale (108K LOC C# project, 283 sessions, 70 days)

### Three Tiers
1. T1 "Constitution" (~660 lines) — hot memory, always loaded. Conventions, routing, checklists. → Our CLAUDE.md
2. T2 "Specialized Agents" (19 agents, ~9,300 lines) — domain-embedded knowledge agents. → Our groups + skills
3. T3 "Cold Memory Knowledge Base" (34 docs, ~16,250 lines) — on-demand specs. → Our memory/ + graph/

### Key Metrics
- 24.2% knowledge-to-code ratio (for every 4 lines of code, 1 line of context infrastructure)
- 87% ad-hoc sessions, 13% structured plan-execute-review
- 80%+ of human prompts ≤100 words (pre-loaded context reduces explanation needs)
- 4.3% overhead for meta-infrastructure maintenance
- Maintenance: ~5 min/session when specs affected, 30-45 min biweekly review

### Key Patterns to Adopt
1. Trigger tables — explicit domain → agent/skill routing in constitution
2. Knowledge-to-code ratio tracking — health metric for memory system
3. Context drift detection — warn when source changes without spec updates
4. Cold memory retrieval via MCP — indexed search across knowledge base
5. Factory agents — templates for bootstrapping new projects/clients

### Key Failure Mode
Specification staleness. Agent trusts outdated docs → generates plausible but wrong code. Their solution: Git-based drift detector parsing commits against subsystem-to-file mapping.

### What They Didn't Solve (Where We're Ahead)
- Multi-agent coordination (NanoClaw groups + IPC)
- Client-facing delivery (reproducible architecture)
- Identity layer (Thomas vs. generic domain agents)
- Vendor-neutral portability (agents.md standard)

### Referenced Research
- Lulla et al. (2026): AGENTS.md files → 29% runtime reduction, 17% token reduction
- Zhang et al. (2026): "Agentic Context Engineering" — brevity bias in LLM context
- Santos et al. (2025): 72.6% of Claude Code projects specify application architecture

## Synthesis: Our Architecture Evolution Path
1. AGENTS.md = vendor-neutral portable project instructions (repo-level)
2. CLAUDE.md = identity + operating rules + memory protocol (container-level, NanoClaw-native)
3. Memory system = stateful layer (memory/, graph/, progress/) → needs MCP retrieval server
4. Trigger tables in CLAUDE.md for explicit routing
5. Drift detection in weekly audit
6. Factory agents for client Claw bootstrapping
