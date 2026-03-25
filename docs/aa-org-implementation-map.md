# AA Org Design — Implementation Map to OpenClaw

> Maps each org design decision to OpenClaw primitives.
> **EXISTS** = OC has this, configure it. **EXTEND** = OC has the seam, build on it. **BUILD** = New capability needed.
> Reference: [AA Agency Org Design](./aa-agency-org-design.md)

---

## 1. One Principal, Context-on-Demand

### What we need

Thomas is the single hub. User talks to Thomas on Telegram. Thomas routes, delegates, retrieves context, and manages the user relationship.

### OC mapping

| Need                          | OC Primitive                                                      | Status | Notes                                                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single entry point            | Multi-agent routing: `agents.list` + `bindings`                   | EXISTS | Thomas = default agent. All Telegram messages route to Thomas via binding.                                                                                    |
| Thomas's identity             | Delegate architecture: own email, calendar, credentials           | EXISTS | `docs/concepts/delegate-architecture.md`. Thomas gets own Google Workspace service account. Sends "on behalf of" Joel.                                        |
| Workspace files               | Bootstrap files: `AGENTS.md`, `SOUL.md`, `USER.md`, `IDENTITY.md` | EXISTS | Thomas's persona already defined in `.agents/thomas.md`. Port to workspace bootstrap format.                                                                  |
| Context index (always loaded) | `AGENTS.md` or `HEARTBEAT.md`                                     | EXISTS | Keep Thomas's "desk" — schedule, active opps, routing rules, context index — in `AGENTS.md`. Must be compact.                                                 |
| Context retrieval (on demand) | File tools: `read`, `glob`, `grep`                                | EXISTS | Thomas reads from local enrichment files when needed. No bulk preload.                                                                                        |
| Auto-compact at 60%           | Context engine: `compact()` lifecycle                             | EXTEND | Legacy engine compacts when context window is full. Need to trigger at 60% instead. Custom context engine plugin OR config override for compaction threshold. |

### Gap: Compaction threshold

OC's legacy context engine compacts when the window is full. We need compaction at 60%. Options:

1. **Config override** — check if `agents.defaults.compactionThreshold` or equivalent exists
2. **Context engine plugin** — register a custom engine that triggers compact at 60% but delegates actual compaction to the runtime (`delegateCompactionToRuntime`)
3. **Standing order** — Thomas runs `/compact` proactively via cron or heartbeat (crude but works)

**Recommendation:** Start with option 3 (standing order in HEARTBEAT.md: "if context > 60%, compact and persist state to files"). Move to option 2 when building the CMA context engine plugin.

---

## 2. Delegation Framework

### What we need

Thomas delegates to Seneca, Aris, Arc, Cicero. Async. Uniform contract. Worker self-validates. Principal verifies client-facing only. C-suite agents delegate mechanical work to ephemeral sub-sessions via job templates.

### OC mapping

| Need                                   | OC Primitive                           | Status | Notes                                                                                                  |
| -------------------------------------- | -------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------ |
| Multiple agents                        | `agents.list` with separate workspaces | EXISTS | Thomas, Seneca, Aris, Arc each get own workspace, agentDir, sessions.                                  |
| Agent-to-agent messaging               | `tools.agentToAgent`                   | EXISTS | Must be explicitly enabled + allowlisted. Thomas can send tasks to Seneca/Aris/Arc.                    |
| Async delegation                       | `sessions_spawn` + `agent.wait`        | EXISTS | Thomas spawns a session for Aris, does not block. Checks results later.                                |
| Task brief format                      | Worker's `AGENTS.md` instructions      | EXISTS | Define the delegation contract in each worker's workspace files.                                       |
| Worker self-validation                 | Worker's `AGENTS.md` + tool access     | EXISTS | Worker runs its own eval (tests, checks, visual validation) before reporting back.                     |
| Principal verification (client-facing) | Thomas's `AGENTS.md` routing rules     | EXISTS | Encode: "verify all client-facing outputs before delivery. Trust worker self-validation for internal." |
| Parallel delegation                    | Multiple `sessions_spawn` calls        | EXISTS | Thomas can delegate to Aris and Arc concurrently.                                                      |
| Worker context dies on completion      | Session lifecycle                      | EXISTS | Worker sessions end. Results written to files in enrichment layer. Context not carried.                |

### OC config sketch

```json5
{
  agents: {
    list: [
      {
        id: "thomas",
        default: true,
        name: "Thomas Aquinas",
        workspace: "~/.openclaw/workspace-thomas",
        model: "anthropic/claude-sonnet-4-6", // Principal — Sonnet keeps costs low
        tools: {
          allow: [
            "read",
            "write",
            "edit",
            "exec",
            "message",
            "cron",
            "sessions_list",
            "sessions_history",
            "sessions_spawn",
            "sessions_send",
            "session_status",
            "browser",
          ],
        },
      },
      {
        id: "seneca",
        name: "Seneca",
        workspace: "~/.openclaw/workspace-seneca",
        model: "anthropic/claude-sonnet-4-6", // Cognitive delegation tier (API)
        tools: {
          allow: ["read", "write", "edit", "glob", "grep", "exec", "browser",
                  "sessions_spawn"],  // can spawn Haiku sub-sessions for mechanical work
          deny: ["message", "cron"],  // no outbound comms, no scheduling
        },
      },
      {
        id: "aris",
        name: "Aristotle",
        workspace: "~/.openclaw/workspace-aris",
        model: "anthropic/claude-sonnet-4-6", // Cognitive tier; Opus for critic via spawn override
        tools: {
          allow: ["read", "write", "glob", "grep", "exec", "browser",
                  "sessions_spawn"],  // can spawn Haiku sub-sessions for scraping
          deny: ["message", "cron"],  // no outbound, no scheduling
        },
      },
      {
        id: "arc",
        name: "Archimedes",
        workspace: "~/.openclaw/workspace-arc",
        model: "anthropic/claude-sonnet-4-6",
        tools: {
          allow: ["read", "write", "edit", "glob", "grep", "exec"],
          deny: ["message", "browser", "cron", "sessions_spawn"],
        },
      },
    ],
  },
  bindings: [
    // All Telegram goes to Thomas
    { agentId: "thomas", match: { channel: "telegram" } },
    // All email goes to Thomas
    { agentId: "thomas", match: { channel: "email" } },
  ],
  tools: {
    agentToAgent: {
      enabled: true,
      allow: ["thomas", "seneca", "aris", "arc"],
    },
  },
}
```

### Gap: Structured delegation contract

OC's `sessions_spawn` sends a message to start a new agent session. But there's no formal "task brief" schema — it's just a message string. For the uniform delegation contract we need:

**BUILD:** A task brief format that workers parse from the spawn message. Define in each worker's `AGENTS.md`:

```
When you receive a task from Thomas, expect this format:
- OBJECTIVE: what to accomplish
- INPUT: data or file paths
- CONSTRAINTS: model tier, time budget, scope limits
- EVAL: how to validate your output
- OUTPUT: where to write results and what format

Report back with: OUTCOME (pass/fail), OUTPUT_PATH, TOKEN_USAGE, DURATION
```

This is convention, not code. Workers follow it because their `AGENTS.md` says to. No new OC code needed.

### Job template execution

C-suite agents spawn sub-sessions for mechanical work using job templates.

| Need | OC Primitive | Status | Notes |
|------|-------------|--------|-------|
| Sub-session spawning | `sessions_spawn` with model override | EXISTS | Seneca spawns Haiku session: "use haiku, follow `jobs/airtable-read.md`" |
| Job template storage | Workspace files or shared directory | EXISTS | Store in each agent's workspace `jobs/` dir, or shared `~/.openclaw/skills/jobs/` |
| Model tier per job | `/model` directive in spawn message | EXISTS | Template specifies tier, spawner includes it in the spawn message |
| Sub-session cleanup | Session lifecycle | EXISTS | Sub-session ends on task completion. Results written to file. Context dies. |

**BUILD:** Job template library. Markdown files defining input/output/model/eval for each mechanical task type. This is AA-CMA repo work — each client CMA gets their own job templates relevant to their domain.

### Phase 2: Shared Runner agent

| Need | OC Primitive | Status | Notes |
|------|-------------|--------|-------|
| Credential isolation | Separate agent with own `auth-profiles.json` | EXISTS | Runner agent owns API keys (Airtable, Netlify, etc.) |
| Shared job templates | Runner workspace `jobs/` directory | EXISTS | All C-suite agents delegate to runner for mechanical work |
| Default cheap model | `agents.list[].model` set to Haiku | EXISTS | Runner always runs on cheapest tier unless template overrides |

Not needed for MVP. C-suite agents spawn sub-sessions on themselves with model overrides. Runner agent is a Phase 2 optimization for credential management and cost tracking.

---

## 3. Data Layer (CRM + Enrichment)

### What we need

Contacts/Accounts/Opportunities/Engagements/Agents schema. Airtable as SOT. Local enrichment keyed to record IDs. Agent reads CRM, writes back standard meta only.

### OC mapping

| Need                         | OC Primitive                               | Status | Notes                                                                                           |
| ---------------------------- | ------------------------------------------ | ------ | ----------------------------------------------------------------------------------------------- |
| Local enrichment storage     | Workspace files + structured directories   | EXISTS | Store enrichment under `~/.openclaw/workspace-thomas/data/` with directories per schema entity. |
| CRM read                     | Airtable API via `exec` tool (curl/script) | EXISTS | Thomas reads Airtable via API. Or build a skill.                                                |
| CRM write-back               | Same API path, gated by `AGENTS.md` rules  | EXISTS | Thomas writes standard meta only. Rules encoded in persona.                                     |
| Record ID linkage            | File naming convention                     | EXISTS | `data/contacts/{airtable_record_id}.json`, `data/opportunities/{id}.json`, etc.                 |
| Prospect → Client transition | Move/reference workbench folder            | EXISTS | File operations. Thomas moves prospect workbench into agents directory.                         |

### BUILD: Data layer skill

A skill that standardizes CRM operations:

```
skills/
  crm/
    SKILL.md          # How to read/write CRM, schema reference
    schema.json       # Entity definitions, field mappings
    airtable.sh       # Airtable API wrapper
```

This is AA-CMA repo work, not ChesedClaw core. Each client CMA gets their own `crm/` skill configured for their CRM.

### BUILD: Prospect workbench structure

```
data/
  prospects/
    {opportunity_id}/
      workbench/
        bootstrap/        # Agent bootstrap files for this prospect's future CMA
        roles/            # Defined roles and jobs
        promotion-path/   # Capability tier progression
        bd/               # BD documents, proposals, artifacts
        conversations/    # Managed conversation history
        enrichment/       # Research, scraped data, analysis
```

When prospect converts: `data/prospects/{id}/workbench/` becomes the seed for the client's CMA workspace.

---

## 4. Managed Conversations

### What we need

Sequential BD conversation tied to Opportunity stages. Interview prospects, gather context, hand off to provisioning.

### OC mapping

| Need               | OC Primitive                      | Status | Notes                                                                                      |
| ------------------ | --------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| Conversation state | Managed conversation framework    | STUB   | `skills/managed-conversation/SKILL.md` defines the framework. Implementation is Phase 2/4. |
| Stage progression  | Opportunity stage in CRM          | EXTEND | Framework needs hook to advance CRM opportunity stage on conversation completion.          |
| Adaptive questions | LLM-generated follow-ups          | STUB   | Framework design supports this. Needs implementation.                                      |
| Agent dispatch     | Background enrichment on triggers | STUB   | Framework design supports pre/mid/post dispatch. Needs implementation.                     |

### Implementation sequence

1. **Phase 1:** Manual managed conversations. Thomas follows `AGENTS.md` instructions for BD interviews. State tracked in files.
2. **Phase 2:** Implement managed conversation framework. Automate state, adaptive questions, stage progression.
3. **Phase 3:** Add agent dispatch. Thomas spawns Aris for enrichment mid-conversation.

---

## 5. Artifact Editing (Template + Data)

### What we need

Template + data separation for standard docs. Diff + visual for non-standard.

### OC mapping

| Need               | OC Primitive                | Status | Notes                                                               |
| ------------------ | --------------------------- | ------ | ------------------------------------------------------------------- |
| Template rendering | `exec` tool (build script)  | EXISTS | Thomas edits data file, runs build script, deploys.                 |
| Diff editing       | `edit` tool                 | EXISTS | OC's edit tool already sends diffs, not full files.                 |
| Visual validation  | `browser` tool (screenshot) | EXISTS | Thomas or worker takes screenshot after deploy, validates visually. |
| Deploy to Netlify  | `exec` tool (netlify-cli)   | EXISTS | `netlify deploy` via bash.                                          |

### BUILD: Artifact template system

```
artifacts/
  templates/
    proposal.html       # HTML template with {{slots}}
    one-pager.html
    case-study.html
  data/
    {opportunity_id}/
      proposal.json     # Data for this prospect's proposal
  build.sh              # Merges data into template, outputs to dist/
```

Thomas edits `proposal.json` (small, cheap context). `build.sh` renders full HTML. Deploy. Screenshot. Validate.

This is AA-CMA repo work. Client CMAs get their own template sets.

---

## 6. Context Engine (Future)

### What we need

Custom compaction at 60%. Context retrieval from enrichment layer. Session state persistence to files.

### OC mapping

| Need                        | OC Primitive                               | Status | Notes                                                                                               |
| --------------------------- | ------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------- |
| Custom compaction threshold | Context engine plugin: `compact()`         | EXTEND | Register plugin that triggers at 60%. Use `delegateCompactionToRuntime()` for actual summarization. |
| Retrieval from enrichment   | Context engine plugin: `assemble()`        | EXTEND | `systemPromptAddition` can inject retrieval hints. "Check data/{entity}/ for context on {topic}."   |
| Session state persistence   | Context engine plugin: `afterTurn()`       | EXTEND | Persist key state to files after each turn.                                                         |
| Subagent cleanup            | Context engine plugin: `onSubagentEnded()` | EXISTS | Clean up worker sessions on completion.                                                             |

### Phased approach

1. **Now:** Use HEARTBEAT.md and standing orders for manual compaction discipline
2. **Phase 2:** Build context engine plugin for 60% threshold + file persistence
3. **Phase 3:** Add retrieval-augmented assembly (enrichment data injected dynamically)

---

## 7. Trust & Security

### OC mapping

| Need                        | OC Primitive                     | Status | Notes                                                                  |
| --------------------------- | -------------------------------- | ------ | ---------------------------------------------------------------------- |
| Per-agent tool restrictions | `agents.list[].tools.allow/deny` | EXISTS | Aris can't send email. Arc can't browse. Thomas can do everything.     |
| Hard blocks                 | `SOUL.md` security rules         | EXISTS | "Never send external email without approval." Loaded every session.    |
| Audit trail                 | Session transcripts + cron logs  | EXISTS | `~/.openclaw/agents/{id}/sessions/`. All tool invocations logged.      |
| Sandbox isolation           | `agents.list[].sandbox`          | EXISTS | Workers can be sandboxed. Thomas needs host access for email/calendar. |
| Capability tiers            | Delegate architecture tiers      | EXISTS | Start at Tier 1 (Read-Only), promote to Tier 2/3 per trust level.      |
| Client-facing verification  | Thomas's `AGENTS.md` rules       | EXISTS | "Verify all client-facing outputs before delivery."                    |

---

## 8. Model Routing

### OC mapping

| Need                    | OC Primitive                      | Status | Notes                                                                               |
| ----------------------- | --------------------------------- | ------ | ----------------------------------------------------------------------------------- |
| Per-agent default model | `agents.list[].model`             | EXISTS | AA: all `anthropic/claude-sonnet-4-6` (Haiku for mechanical via job templates). Client: all `openai/*` via OAuth. |
| Per-job model override  | `/model` directive or spawn param | EXISTS | Thomas can specify model when spawning worker: "use haiku for this scrape."         |
| Cost tracking           | COST-04 requirement               | BUILD  | Token usage per agent, per model, per session. Queryable. Phase 2 work.             |
| Budget caps             | COST-06 requirement               | BUILD  | Per-agent daily caps. Fallback to local on cap. Phase 2 work.                       |
| Local model fallback    | Ollama extension                  | EXISTS | Configure as Tier 0. Workers can fall back when API budget exhausted.               |

### Model strategies

Two distinct strategies. AA-CMA uses multi-provider to force cost optimization learning. Client CMAs use single-provider OAuth for simplicity.

#### AA-CMA (Arthur & Archie — Anthropic API only)

Single-provider Anthropic stack. Cross-domain reasoning (Opus-tier) happens in Claude Code (OAuth Max) outside the Claw. The Claw handles operations, not R&D.

No local models until Mac Minis arrive. Lenovo lacks GPU for inference.

| Tier | Model | Provider | Est. cost | Reason |
|------|-------|----------|-----------|--------|
| Principal + Cognitive | Claude Sonnet 4.6 | Anthropic (API) | ~$110-140/mo | Routing, verification, composition, evaluation |
| Mechanical execution | Claude Haiku 4.5 | Anthropic (API) | ~$5-10/mo | CRM reads, scraping, template rendering |
| **Total** | | | **~$120-150/mo** | Well under GPT Pro $200/mo threshold |

Target: stay under $200/month. Delegation discipline keeps Principal token volume low.

| Agent  | Job Type                         | Model              | Tier |
| ------ | -------------------------------- | ------------------ | ---- |
| Thomas | Routing, user interaction        | Claude Sonnet 4.6  | 2    |
| Thomas | Verification (client-facing)     | Claude Sonnet 4.6  | 2    |
| Seneca | BD conversations, email drafts   | Claude Sonnet 4.6  | 2    |
| Seneca | CRM reads, enrichment lookups    | Claude Haiku 4.5 (job template) | 0-1 |
| Seneca | Artifact data editing            | Claude Sonnet 4.6  | 2    |
| Seneca | Template rendering, deploy       | Claude Haiku 4.5 (job template) | 0-1  |
| Aris   | Scout (scrape, crawl, search)    | Claude Haiku 4.5   | 0-1  |
| Aris   | Critic (evaluate, score)         | Claude Sonnet 4.6  | 2    |
| Aris   | Refinement (deep-dive)           | Claude Sonnet 4.6  | 2    |
| Arc    | Blueprint (architecture)         | Claude Sonnet 4.6  | 2    |
| Arc    | Build (code generation)          | Claude Sonnet 4.6  | 2    |
| Arc    | Mechanical (file gen, templates) | Claude Haiku 4.5   | 0-1  |
| Cicero | Strategy (rhetoric, positioning) | Claude Sonnet 4.6  | 2    |
| Cicero | Execution (content generation)   | Claude Sonnet 4.6  | 2    |

**Note:** Opus-tier reasoning (architecture, strategy, critical evaluation) is handled in Claude Code (OAuth Max) outside the Claw. Joel brings validated plans into the Claw for execution. This keeps the Claw operational costs low while preserving access to frontier reasoning where it matters.

#### Client CMA (standard — single-provider OAuth)

| Tier | Model | Provider | Reason |
|------|-------|----------|--------|
| Principal | GPT-5.4 | OpenAI (OAuth) | Frontier reasoning, same auth as mid-tier |
| Cognitive delegation | GPT-4o | OpenAI (OAuth) | Strong mid-tier, no extra API key needed |
| Mechanical execution | GPT-4o-mini | OpenAI (OAuth) | Cheapest in OAuth bundle |

Post-Mac Mini: swap mechanical tier to local (Qwen 3 / Llama 4). Cognitive tier can follow if local quality is sufficient.

Full client model reference: [Client Provisioning Master](./client-provisioning-master.md)

---

## Implementation Priority (Updated)

Maps to PLAN.md phases. Updated with org design decisions.

### Immediate (before cutover from NanoClaw)

1. **Thomas on Telegram with delegation** — Configure multi-agent routing. Thomas as default. Seneca, Aris, and Arc as domain agents. Agent-to-agent messaging enabled.
2. **Thomas workspace bootstrap** — Port `.agents/thomas.md` to full workspace: `AGENTS.md`, `SOUL.md`, `USER.md`, `IDENTITY.md`. Include routing rules, context index, delegation contract. Thomas does NOT do BD or CRM work — Seneca does.
3. **Seneca workspace bootstrap** — Create workspace with BD pipeline instructions, managed conversation protocol, CRM integration rules, artifact editing workflow, and job template library.
4. **Worker workspace bootstrap** — Create workspaces for Aris and Arc with delegation contract in `AGENTS.md`.
5. **Data directory structure** — Create `data/` layout for contacts, accounts, opportunities, enrichment.
6. **Job template library** — Create initial job templates: `airtable-read.md`, `web-scrape.md`, `template-render.md`, `screenshot-validate.md`.

### Phase 1 (operational)

7. **Email channel for Thomas** — Delegate architecture. Thomas's own Gmail with "on behalf of" Joel. Seneca drafts, Thomas verifies and sends.
8. **Airtable CRM integration** — Skill for reading/writing Airtable. Record ID linkage to local enrichment. Seneca owns, uses job templates for mechanical reads.
9. **Artifact template system** — Template + data separation. Build script. Netlify deploy. Seneca edits data layer, spawns Haiku for rendering.
10. **Standing orders for compaction** — HEARTBEAT.md rules for 60% compaction discipline.

### Phase 2 (trust primitives)

11. **Managed conversation framework** — Implement the stub. Seneca runs BD conversations through it. State management, adaptive questions, stage progression.
12. **Cost tracking** — Per-agent, per-model token usage. Queryable.
13. **Context engine plugin** — Custom compaction at 60%. File persistence. Retrieval hints.
14. **Prospect workbench provisioning** — Thomas creates workbench from template on new opportunity. Seneca populates with BD data.
15. **Shared Runner agent** — Credential isolation for API keys. Central job template library. Cost tracking per sub-session.

### Phase 3 (CMA deployment)

16. **CMA template** — Generic CMA structure based on AA org design. Configurable per client.
17. **SSH provisioning** — Deploy CMA to Mac Mini from Lenovo.
18. **Cicero** — Demand gen agent. After Arc builds are producing outputs.

---

## Key Files to Create/Modify

### ChesedClaw repo (this repo)

| File                                          | Action  | Purpose                                                    |
| --------------------------------------------- | ------- | ---------------------------------------------------------- |
| `docs/reference/aa-agency-org-design.md`      | CREATED | This org design document                                   |
| `docs/reference/aa-org-implementation-map.md` | CREATED | This implementation map                                    |
| `.agents/thomas.md`                           | UPDATE  | Add delegation contract, routing rules, context discipline. Remove BD/CRM responsibilities. |
| `.agents/seneca.md`                           | CREATE  | Sales Ops & GTM agent. BD pipeline, CRM, artifacts, managed conversations. |
| `.agents/aris.md`                             | UPDATE  | Add delegation contract, job definitions, eval criteria    |
| `.agents/arc.md`                              | UPDATE  | Add delegation contract, job definitions, eval criteria    |
| `skills/managed-conversation/SKILL.md`        | EXISTS  | Implement the stub                                         |
| `PLAN.md`                                     | UPDATE  | Incorporate org design phases                              |

### AA-CMA repo (separate, to be created)

| File                         | Purpose                                             |
| ---------------------------- | --------------------------------------------------- |
| `openclaw.json`               | Multi-agent config: Thomas + Seneca + Aris + Arc + bindings |
| `workspace-thomas/AGENTS.md`  | Thomas's full operating instructions (CoS, no BD)           |
| `workspace-thomas/SOUL.md`    | Thomas's persona and hard blocks                            |
| `workspace-thomas/USER.md`    | Joel's profile                                              |
| `workspace-seneca/AGENTS.md`  | Seneca's operating instructions + BD pipeline + CRM rules   |
| `workspace-seneca/jobs/`      | Job templates for mechanical BD work                        |
| `workspace-aris/AGENTS.md`    | Aris's operating instructions + delegation contract         |
| `workspace-arc/AGENTS.md`     | Arc's operating instructions + delegation contract          |
| `data/`                       | Enrichment directory structure                              |
| `artifacts/templates/`        | Standard document templates                                 |
| `skills/crm/`                 | CRM integration skill                                       |
