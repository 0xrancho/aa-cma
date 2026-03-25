# Arthur & Archie — Agency Org Design Session

> Paste this into a fresh Claude session to design the agent org structure.
> Bring decisions back to the ChesedClaw build session for implementation.

---

## Context

You are helping Joel Austin design the organizational structure for his AI agent team at Arthur & Archie. This is not a hypothetical exercise — these agents will be deployed on ChesedClaw (a hardened OpenClaw fork) serving real clients within weeks.

## What Exists Today

### Infrastructure

- **ChesedClaw** — Hardened OpenClaw fork. Multi-channel gateway (Telegram, Email, Discord, Slack, etc.), multi-model routing, agent persona system, sandboxed execution.
- **Model routing** — Can assign different LLMs per agent, per task phase. Supports Anthropic (Claude), OpenAI, OpenRouter (100+ models), Ollama (local), Google, Mistral, DeepSeek, and 30+ other providers.
- **Hardware** — Lenovo dev box (current). Two Mac Minis arriving (client deployment targets). No local GPU compute until Mac Minis arrive — all inference is third-party API for now.

### Agent Personas (defined, not yet fully operational)

**Thomas — Chief of Staff**

- Primary interface. Joel talks to Thomas on Telegram. Thomas routes to others.
- Manages operations, email, client communications.
- Does NOT research or code. Orchestrates.

**Aris — Information Architect**

- Research, evaluation, vision. "Utility over Novelty."
- Evaluates against: Interoperability, Efficiency, Scalability.
- Current scope ideas: browser automation, web scraping, calendar/drive/CRM management, R&D pipelines, document editing/reading.
- Needs: low-reasoning for mechanical crawl/scrape/read tasks, high-reasoning for evaluating research relevance and strategic fit.

**Arc — Master Builder**

- Architecture, construction, code. "Structural Integrity."
- Never builds without a blueprint.
- Current scope ideas: implementation, planning, self-improvement, code generation.
- Needs: high-reasoning for planning/architecture, lower-reasoning for mechanical implementation.

**Cicero — Strategic Orator (future)**

- Demand generation. Newsletter ("The Republic") + 1-1 outreach ("The Letters").
- Classical rhetoric framework. Batch mode after Arc builds.

### The Business

- **Arthur & Archie** — Growth engineering for professional services firms (law, consulting, accounting, engineering).
- **Core offering** — Claw Managed Agencies (CMAs). Each client gets a dedicated agent team on their own hardware.
- **GTM engine** — agenticforms.io. Agentic intake forms that ARE the product demo.
- **Methodology** — Agentic Service Design. Deterministic logic run by AI. Creative forks are where the consultant steps in.
- **Community** — Indy Praxis newsletter, 400+ entrepreneurs.

## What I Need You To Help Me Design

### 1. Agent Roles & Responsibilities

For each agent (Thomas, Aris, Arc, Cicero), define:

- **Exact responsibilities** — what tasks does this agent own?
- **Boundaries** — what does this agent explicitly NOT do?
- **Task categories** — break down into concrete task types (not just "research" — what kinds of research? for whom? triggered how?)
- **Interaction model** — how does this agent receive work? from whom? how does it report back?

### 2. Task Routing Logic

- When Joel says X on Telegram, how does Thomas decide where to route it?
- What triggers Aris vs Arc vs doing it himself?
- What about multi-agent tasks (research → plan → build)?
- What about scheduled/recurring tasks vs on-demand?

### 3. Reasoning Tier Strategy

Joel's observation: both Aris and Arc need high AND low reasoning depending on the task phase. This is a real constraint — how should we think about it?

Options to consider:

- **Per-phase model switching** — same agent uses different models for different task phases (e.g., Aris uses Haiku for scraping, Opus for evaluation)
- **Sub-agent delegation** — Aris spawns a Haiku worker for mechanical tasks, keeps Opus for thinking
- **Task queue with model assignment** — tasks tagged with reasoning tier, routed to appropriate model
- **Fixed tiers per agent** — Thomas always Opus, Aris always Sonnet, Arc always Sonnet, mechanical work always Haiku

Key constraint: No local compute until Mac Minis arrive. All inference is third-party API. Cost matters.

### 4. Client-Facing vs Internal

- Which agents are client-facing? (Thomas only? Or can Aris present research to clients?)
- Which agents are internal-only?
- What's the approval chain for external communications?

### 5. The AA Agency as Template

This org structure becomes the template for client CMAs. Design it so:

- Core roles (Thomas equivalent) are universal
- Specialist roles (Aris/Arc/Cicero) are configurable per client
- The pattern scales from 1-person shop to 50-person firm

## Output Format

Give me:

1. **Agent Org Chart** — roles, reporting lines, interaction model
2. **Task Taxonomy** — every task type, which agent owns it, reasoning tier needed
3. **Model Assignment Matrix** — agent × task phase × recommended model tier
4. **Routing Rules** — decision tree for Thomas's routing logic
5. **Open Questions** — anything you need me to decide before this is implementable

## Ground Rules

- Be specific. "Aris does research" is useless. "Aris monitors X bookmarks daily for AI tooling news, evaluates against interoperability/efficiency/scalability markers, and produces a weekly digest" is useful.
- Think about cost. Every API call has a price. Don't put Opus on a scraping task.
- Think about latency. Thomas on Telegram needs to feel fast. Don't route through three agents for a simple question.
- Think about failure modes. What happens when an agent is stuck? How does escalation work?
- This is a real business serving real clients. Not a demo.
