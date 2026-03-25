# Arthur & Archie — Agency Org Design

> Canonical reference for the AA agent organization structure.
> All decisions made in session 2026-03-25. Drives ChesedClaw CMA implementation.

---

## Mission

Arthur & Archie builds systems of redemptive affect for trust-based professional services organizations. The agency maximizes human-to-human interface by allowing technology to operate with agency and encoded judgment. Clients are trust-based PS firms (law, consulting, accounting, engineering) — organizations that live and die on client-contextual awareness and service excellence.

---

## Core Principles

### P1: One Principal, Context-on-Demand

The user always talks to one agent. That agent is the hub — the Jarvis. Under the hood, context is never "carried" in bulk. It is retrieved when needed and scoped to the task at hand. The delegation layer is invisible to the user.

This is true for Joel (Thomas) and for every client CMA (Felix, Augustine, etc.).

The alternative — multiple visible agents — makes the human the hub. That is the old world. We are transitioning from agents-assisting-humans to humans-assisting-agents. The Principal carries the relationship. Everything else is infrastructure.

### P2: Principal Delegates by Default

The Principal delegates every chance it gets. This is not dogma — it is architectural discipline that protects optionality. Today the Principal might run on GPT-5.4 via OAuth where tokens are near-free. Tomorrow that changes, or a client needs a different provider, or you swap to Claude for reasoning quality.

If the Principal is already disciplined about delegation, swapping the Principal's model only affects routing/verification tokens. If the Principal is doing substantive work, a model swap changes output quality across everything.

**Rule: Principal delegates by default not because it is always cheaper today, but because it keeps the system model-agnostic and cost-predictable at any scale.**

The Principal still does cognitive work — cross-domain reasoning, planning with the user, priority management. But domain-specific work always delegates.

### P3: CRM is Dumb SOT, Enrichment is Local

Airtable, HubSpot, Notion, Trello — whatever the client uses — holds record IDs and basic kanban state. The agent's local system (Mac Mini) holds relationships, enrichment, semantic data, all keyed to SOT record IDs. The agent writes back standard meta only.

CRMs are just expensive SOT databases now. They are object and relational hierarchies only — not built for semantic or enrichment data. We integrate to read them and write back standards meta. We do not fight their limitations.

### P4: Delegation IS the Margin Model

Adding jobs a+b+c must not linearly scale context/cost. Each job runs in its own scoped context. Only the Principal carries routing intelligence. If charging X for jobs a and b at Y margin, provisioning jobs a+b+c for X+n must not negatively impact Y — and should improve it.

The delegation framework is the economic engine. Build it in from day one.

### P5: Async by Default, User Chooses Involvement

Delegation is asynchronous. Workers self-validate against task-specific eval criteria. The Principal verifies only client-facing outputs.

Exception: real-time collaboration mode (user editing a doc, looking for hot updates). In this mode the worker posts directly and informs the Principal without the Principal seeing the output. The user chooses their level of involvement per task:

- **Set and walk away** — Principal validates on behalf of the user
- **Real-time collaboration** — Worker posts directly, Principal informed after

### P6: Context Discipline

Principal auto-compacts at 60% context usage. Session state is persisted to files. Context is retrieved on demand, never accumulated.

Workers run in scoped contexts that die when the job completes. Results persist. Context does not.

---

## Organizational Structure

### The Principal

**Role:** Thomas Aquinas (AA) / Felix, Augustine, etc. (client CMAs)

Thomas is Chief of Staff — pure orchestrator. He is NOT doing domain work himself. He routes, verifies, provisions, and reasons across domains.

**Chief of Staff responsibilities:**

- Orchestration: receives all inbound from Joel, routes to the right domain agent
- Cross-domain reasoning: planning, priority management, synthesis across domains
- Agent Provisioning: creates workbench folders for prospective clients, defines roles/jobs/promotion paths — this is delivery of the CoS function, not domain work
- Client-facing verification: reviews all external-facing outputs before delivery
- Morning brief synthesis: cross-domain awareness (schedule + active opps + pending items)
- Executive Assistant tasks: email triage, calendar, home admin, accounting (delegates mechanical parts as one-off jobs; EA may split to a dedicated agent later)

**What Thomas does NOT do:**

- Compose prospect emails (Seneca drafts, Thomas verifies and sends)
- Edit BD artifacts (Seneca edits data layer, runs build, deploys)
- Manage CRM records directly (Seneca reads/writes Airtable)
- Hold prospect conversation state (Seneca runs managed conversations)
- Research or evaluate (Aris)
- Write code or architect systems (Arc)

**What the Principal carries at all times (the "desk"):**

- Today's schedule
- Active opportunities by stage
- Pending items and blockers
- Routing rules (who does what, when to delegate)
- Index of available contexts (what exists and where)

**What the Principal retrieves on demand (the "cabinet"):**

- Prospect conversation history
- Artifact content
- Enrichment data
- Research outputs
- Engagement details
- Worker results

### C-Suite (Domain Owners)

Domain owners own both cognitive and execution jobs within their domain. The split is by **domain**, not by **work type**. Each domain owner selects their own model tier per job.

#### Seneca — Sales Ops & GTM

**Domain:** Business development pipeline, prospect conversations, CRM, artifacts.

**Cognitive jobs:** Prospect email composition, positioning and language advice, BD interview conversations (managed conversations), presales strategy.

**Execution jobs:** CRM management (Airtable read/write), proposal and artifact generation (template + data), enrichment data gathering, pipeline state management.

**Model tier:** Sonnet for email composition and BD conversations. Haiku for CRM reads, enrichment lookups, and mechanical data work (via job templates).

**Output:** Draft emails (Thomas verifies and sends), BD artifacts, CRM updates, prospect workbench data.

**Key distinction:** Seneca drafts all prospect-facing content. Thomas reviews and sends. The prospect sees "Thomas" — Seneca is invisible.

#### Aris (Aristotle) — The Information Architect

**Domain:** Thinking, research, evaluation, vision.

**Cognitive jobs:** Evaluate tool fit against interoperability/efficiency/scalability markers. Assess positioning for prospects. Strategic analysis. Vision planning.

**Execution jobs:** Web scraping, document crawling, data extraction, bookmark monitoring, search execution, enrichment lookups.

**Model tier:** Selects own model per job. Haiku for mechanical scrape/crawl. Opus for evaluation and strategic reasoning. Sonnet for refinement and follow-up.

**Output:** Always a document or structured data. Never code.

#### Arc (Archimedes) — The Master Builder

**Domain:** Technical implementation, planning, architecture, code mastery.

**Cognitive jobs:** System blueprinting, architecture decisions, implementation planning, risk assessment.

**Execution jobs:** Code generation, testing, deployment, file generation, template rendering, build automation.

**Model tier:** Selects own model per job. Opus for planning/architecture. Sonnet for code generation and implementation.

**Output:** Working code, config files, deployed artifacts.

#### Cicero — The Strategic Orator (Future)

**Domain:** Demand generation, content, outreach.

**Cognitive jobs:** Rhetorical strategy, feature-to-benefit mapping, positioning analysis.

**Execution jobs:** Newsletter generation ("The Republic"), personalized outreach ("The Letters"), content deployment.

**Mode:** Batch — triggered after Arc completes a build. Not always-on.

### The Delegation Contract

Uniform across all workers, all job types:

```
IN:  Task brief (objective, input data, constraints, eval criteria, model tier hint)
OUT: Validated result (outcome, output content, token usage, duration, eval pass/fail)
```

- Worker picks model tier based on job's reasoning needs
- Whether the job is cognitive or mechanical is the worker's problem, not the Principal's
- Worker self-validates against task-specific eval criteria
- Principal verifies client-facing outputs only
- All delegation is async
- Results persist to files; worker context dies on completion

### Execution Layer (Job Templates)

C-suite agents should not burn Sonnet/Opus tokens on mechanical work. When a domain owner needs data retrieval, CRM reads, template rendering, or other mechanical tasks, it spawns a sub-session using a **job template**.

**Job templates** are reusable instruction sets stored as markdown files:

```
jobs/
  airtable-read.md        # Pull records by filter, return structured JSON
  airtable-write.md       # Write standard meta back to SOT
  web-scrape.md           # Scrape URL, return structured content
  template-render.md      # Merge data into HTML template, deploy
  enrichment-lookup.md    # Cross-reference record against enrichment files
  email-draft.md          # Compose email from brief (Sonnet, not Haiku)
  screenshot-validate.md  # Take screenshot, compare against expectations
```

Each template specifies:

- **Model tier** — Haiku for mechanical, Sonnet for composition
- **Tools needed** — which tools the sub-session requires
- **Input format** — what the C-suite agent provides
- **Output format** — what comes back (file path, structured JSON, etc.)
- **Eval criteria** — how the sub-session self-validates before returning

Any C-suite agent can invoke any job template. Seneca spawns a Haiku sub-session with `airtable-read.md` to pull CRM records. Aris spawns a Haiku sub-session with `web-scrape.md` to crawl a site. The sub-session does the work on cheap tokens and dies.

**Why not named lower-level agents?** A "data retriever" agent needs a workspace, agentDir, session store, auth profiles — operational overhead for something that has no persona, no persistent memory, and no routing intelligence. Job templates are just markdown files. Zero overhead. Add a new one by dropping a file.

**Phase 2 optimization: shared Runner agent.** A single utility agent that owns API credentials (Airtable key, Netlify token, etc.) and the job template library. C-suite agents delegate to it via `sessions_spawn`. Better credential isolation than duplicating keys across workspaces. Not needed for MVP.

### Org Chart

```
PRINCIPAL
  Thomas (CoS)        — orchestration, provisioning, verification, cross-domain

C-SUITE (domain owners)
  Seneca              — Sales Ops & GTM: BD pipeline, CRM, artifacts
  Aris (Aristotle)    — Research & Vision: evaluation, analysis, web research
  Arc (Archimedes)    — Engineering: architecture, code, implementation
  Cicero (future)     — Demand Gen: content, outreach, newsletters

EXECUTION LAYER
  Job templates       — reusable instruction sets, Haiku/local, ephemeral
  Runner agent        — shared credential boundary (Phase 2)
```

---

## Data Architecture

### Schema

```
Contacts
  └─ Accounts
       └─ Opportunities (by Stage)
            └─ Engagements
                 └─ Agents (provisioned CMAs)
```

### Storage Model

| Layer       | Location                                | Purpose                                                              |
| ----------- | --------------------------------------- | -------------------------------------------------------------------- |
| SOT records | CRM (Airtable, HubSpot, Notion, Trello) | Record IDs, kanban state, basic fields                               |
| Enrichment  | Local (Mac Mini)                        | Relationships, semantic data, conversation history, research outputs |
| Linkage     | SOT record IDs                          | Every local enrichment record keys to a CRM record ID                |

**Write-back policy:** Agent writes standard meta to CRM when requested. Enrichment data stays local — CRMs are not built for it.

**Client pattern:** Same model. Felix manages Trello for Retrofit Design. Trello holds what the business sees. Felix's Mac Mini holds Trello data PLUS whatever else it needs. All relationally tied to SOT CRM. When the business wants to adopt something new in their field of vision, they ask the agent to provision it.

### Managed Conversations

Tied to Opportunities by Stage. Sequential:

1. **BD Stage** — Seneca runs prospect interviews via email (Thomas verifies and sends). Managed conversation framework handles state, adaptive questions, enrichment dispatch.
2. **Provisioning Stage** — Context gathered in BD hands off to Thomas for provisioning. Thomas creates workbench folder with bootstrap files, roles, jobs, promotion path.
3. **Client Stage** — Workbench folder referenced under Agents in schema. Prospect folder becomes the agent workspace.

---

## Artifact Editing Strategy

### The Problem

Seneca (or any domain agent) edits HTML docs. Entire file loads into context for tiny changes. Each round-trip costs the full file in tokens. This is the most expensive pain point.

### Solution: Template + Data Separation (Standard Docs)

For all standard documents (both AA and client):

- HTML is a template with defined sections and data slots
- Domain agent only edits a data/content layer (JSON, YAML, frontmatter)
- A build step merges data into template and deploys (via job template on Haiku)
- No agent touches raw HTML for standard docs

### Fallback: Diff + Visual Validation (Non-Standard Docs)

For one-off or non-standard documents:

- Diff-only editing (agent holds structural map, sends targeted edit instructions)
- Visual validation via screenshot after edit (vision model evaluates instead of re-reading HTML)

---

## Context Architecture

### Principal Context Budget

The Principal's context window is the most expensive resource. Protect it:

1. **Always loaded:** Routing intelligence, context index, active state summary
2. **Retrieved on demand:** Everything domain-specific
3. **Auto-compact at 60%:** Persist session state to files before hitting budget
4. **Workers die on completion:** Only results persist, not worker context

### Telegram Topics (Gateway-Independent)

Telegram Topics can help scope Principal context by workflow. But the architecture must not be married to one gateway. The context-on-demand retrieval pattern works regardless of channel.

### Cost Protection via Delegation

Principal on frontier model = most expensive tokens. Every token the Principal spends doing domain work is frontier-tier cost. Delegation to Haiku/Sonnet workers is almost always cheaper:

- Principal pays ~50 frontier tokens to route and verify
- Worker pays ~500 cheap tokens to do the work
- vs. Principal paying ~500 frontier tokens to do it itself

---

## CMA Template Pattern

Every client CMA follows the same structural pattern:

### Universal (every CMA)

- One Principal agent (the "Jarvis")
- Delegate architecture (own identity, acts on behalf of)
- Context-on-demand retrieval
- Auto-compaction at 60%
- Async delegation framework
- Job template execution layer (Haiku/local sub-sessions)
- Data layer: SOT CRM integration + local enrichment
- Managed conversation framework (configured per client)

### Configurable (per client)

- Principal persona (name, tone, domain expertise)
- Worker roles and domains (not every client needs Aris/Arc/Cicero equivalents)
- Jobs within each worker domain
- CRM integration target (Airtable, HubSpot, Notion, Trello, etc.)
- Channel bindings (Telegram, Email, WhatsApp, Slack, etc.)
- Capability tier (Read-Only, Send on Behalf, Proactive)
- Model assignments per job

### Scaling Economics

Start simple. A client CMA might be:

- Principal only, no workers (all delegation goes to model-tier-optimized sub-sessions)
- Principal + one worker domain
- Principal + multiple worker domains

Adding workers and jobs must not linearly scale cost. The delegation framework ensures each new job runs in scoped context. The Principal's routing intelligence grows minimally with each new job (just an index entry).

---

## Promotion Path (Agent Maturity)

Just as the org design defines roles, jobs, and delegation — each CMA has a promotion path for expanding capability:

1. **Bootstrap** — Principal only. Read-only + draft. Human approves everything.
2. **Operational** — Principal + basic delegation. Send on behalf. Standing orders for routine tasks.
3. **Autonomous** — Principal + multiple workers. Proactive tier. Scheduled jobs, async delegation, self-validation.
4. **Scaled** — Full worker team. Custom domains. Multi-channel. Cost-optimized model routing.

Promotion requires demonstrated trust at each level.
