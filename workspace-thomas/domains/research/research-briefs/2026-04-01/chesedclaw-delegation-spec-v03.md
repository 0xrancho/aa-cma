# ChesedClaw Delegation Architecture Spec v0.2

**Document:** `CHESEDCLAW-SPEC.md`
**Version:** 0.3 — Added /retro integration
**Author:** Joel Northam / Arthur & Archie
**Date:** April 2026

---

## 1. Problem Statement

Thomas (Principal Agent, Chief of Staff) cannot reliably delegate to other agents via instruction-based orchestration. Writing delegation protocols in CLAUDE.md fails every time because:

- Thomas forgets what he asked the worker to do
- Thomas can't tell when a worker is stuck, done, or needs help
- Workers produce garbage without Joel steering them directly
- The same task with one agent is great; split across agents it collapses

**Root cause:** LLMs don't follow multi-step state management instructions consistently. Delegation must be **code, not prose.**

**Solution:** A TypeScript plugin inside Thomas's OpenClaw gateway that wraps `sessions_spawn` with structured task specs, an eval loop, and deterministic retry logic. Thomas calls it as a tool. The plugin handles everything else.

---

## 2. System Architecture

### 2.1 Two Peers, Separate Domains

```
┌─────────────────────────────────┐    ┌─────────────────────────────────┐
│  THOMAS                         │    │  ABRAHAM                        │
│  Joel's Chief of Staff          │    │  ChesedClaw Infrastructure Root │
│                                 │    │                                 │
│  Own OC gateway                 │    │  Own OC gateway                 │
│  Own hardware (Beelink)         │    │  Dedicated reliable hardware    │
│  LLM: Claude Opus               │    │  LLM: Sonnet or local           │
│                                 │    │                                 │
│  Domain: Strategy & Operations  │    │  Domain: Fleet & Infrastructure │
│  • Joel's human-to-agent voice  │    │  • SSH + Tailscale into all CMA │
│  • Cognitive triage             │    │  • Fleet monitoring (heartbeats)│
│  • Task delegation via plugin   │    │  • Root-level agent config/     │
│  • Memory & context mgmt        │    │    support for client agents    │
│  • Presales & proposals         │    │  • Provisioning post-POC        │
│  • Sales ops & family admin     │    │  • Observability & cost tracking│
│  • R&D planning                 │    │  • Trust ledger management      │
│                                 │    │  • Works with Josh on prod      │
│  Thomas spawns ephemeral        │    │                                 │
│  WORKERS for execution tasks    │    │  Abraham sees the whole fleet:  │
│  via the delegate() plugin.     │    │  • Thomas (Joel's box)          │
│                                 │    │  • Felix (Retrofit Mac Mini)    │
│  Thomas does NOT manage client  │    │  • CMT agent (Azure Foundry)    │
│  agents or SSH into anything.   │    │  • Augustine (TRL)              │
│                                 │    │  • Future CMA deployments       │
│  Thomas tells Joel when a CMA   │    │                                 │
│  needs Abraham's attention.     │    │  Abraham does NOT report to     │
│  Joel routes to Abraham.        │    │  Thomas. They are peers.        │
└─────────────────────────────────┘    └─────────────────────────────────┘

Communication between Thomas and Abraham goes through Joel (for now).
Future: direct inter-gateway messaging via Tailscale + WebSocket.
```

### 2.2 Thomas + Workers (Inside Thomas's Gateway)

```
┌──────────────────────────────────────────────────┐
│  THOMAS'S OPENCLAW GATEWAY                        │
│                                                    │
│  ┌────────────────────────────────────────────┐   │
│  │  THOMAS (Persistent Agent)                  │   │
│  │  LLM: Claude Opus                           │   │
│  │                                              │   │
│  │  Tools:                                      │   │
│  │   • delegate()  ← THE PLUGIN                 │   │
│  │   • calendar, email, apollo, file ops, etc.  │   │
│  │                                              │   │
│  │  Thomas decides WHAT needs doing.             │   │
│  │  Thomas generates a TaskSpec (structured JSON).│  │
│  │  Thomas calls delegate(TaskSpec).             │   │
│  │  Thomas receives TaskResult (structured JSON).│   │
│  │  Thomas evaluates results cognitively.        │   │
│  └──────────────┬─────────────────────────────┘   │
│                 │                                   │
│                 │ delegate() tool call               │
│                 ▼                                   │
│  ┌────────────────────────────────────────────┐   │
│  │  DELEGATE PLUGIN (TypeScript, NOT an LLM)   │   │
│  │                                              │   │
│  │  Runs inside the gateway process.            │   │
│  │  Deterministic code. No reasoning.           │   │
│  │                                              │   │
│  │  1. Receives TaskSpec from Thomas             │   │
│  │  2. Assembles worker prompt:                  │   │
│  │     • TaskSpec.prompt                         │   │
│  │     • Eval criteria as instructions           │   │
│  │     • Output schema requirement               │   │
│  │  3. Calls sessions_spawn with:                │   │
│  │     • Assembled prompt                        │   │
│  │     • Tool subset from TaskSpec.tools         │   │
│  │     • Model from TaskSpec.model               │   │
│  │     • Timeout from TaskSpec.timeoutSeconds     │   │
│  │  4. Receives worker announce-back             │   │
│  │  5. Parses structured output from worker      │   │
│  │  6. Runs eval gate:                           │   │
│  │     ├─ PASS → build TaskResult, return        │   │
│  │     ├─ FAIL + retries left → re-spawn         │   │
│  │     │   with fresh context + eval feedback    │   │
│  │     ├─ FAIL + no retries → return failure     │   │
│  │     └─ STUCK → route to Joel via Telegram     │   │
│  │  7. Returns TaskResult JSON to Thomas          │   │
│  └──────────────┬─────────────────────────────┘   │
│                 │                                   │
│                 │ sessions_spawn (per attempt)       │
│                 ▼                                   │
│  ┌────────────────────────────────────────────┐   │
│  │  WORKER (Ephemeral Sub-agent)               │   │
│  │                                              │   │
│  │  No persistent identity. No memory.          │   │
│  │  Born for one task. Dies on completion.      │   │
│  │  Runs in isolated OC sub-agent session.      │   │
│  │  LLM: per TaskSpec (Sonnet, GPT-5.4, Haiku) │   │
│  │                                              │   │
│  │  The worker receives a prompt that ends with: │  │
│  │  "Output your results as JSON matching this   │  │
│  │   schema: {status, confidence, output_path,   │  │
│  │   self_assessment, needs_help, question}"     │  │
│  │                                              │   │
│  │  The worker does NOT know about:             │   │
│  │   • Thomas                                    │   │
│  │   • The delegation plugin                     │   │
│  │   • Other workers                             │   │
│  │   • The eval loop                             │   │
│  │  It just does its job and outputs JSON.       │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
└──────────────────────────────────────────────────┘
```

---

## 3. The Delegate Plugin

### 3.1 Plugin Registration

The plugin registers `delegate` as a tool available to Thomas. OC plugins are TypeScript modules loaded by the gateway at startup.

```typescript
// plugins/delegate/index.ts

export default function delegatePlugin(gateway) {
  gateway.registerTool({
    name: "delegate",
    description: "Delegate a task to an ephemeral worker agent. " +
      "Provide a structured TaskSpec. Returns a structured TaskResult. " +
      "Use this for any execution work: file creation, research, " +
      "document generation, data enrichment, API calls.",
    parameters: TaskSpecSchema,  // JSON Schema for TaskSpec
    handler: delegateHandler,
  });
}
```

### 3.2 TaskSpec — What Thomas Sends

```typescript
interface TaskSpec {
  // What
  name: string;                    // Human-readable task name
  domain: "sales_ops" | "proposal" | "research";
  prompt: string;                  // Scoped instruction for the worker
  systemContext?: string;          // Extra system prompt (brand voice, etc.)

  // With what
  tools: string[];                 // Tool IDs the worker gets
  references: FileReference[];     // Files to inject into worker context

  // How to judge
  eval: {
    mode: "structured" | "code";
    // "structured" = worker outputs JSON, plugin checks fields
    // "code"       = plugin runs a function (file exists? valid HTML?)
    criteria: string;              // Description of what "done" looks like
    passThreshold?: number;        // 0-1, for structured mode
    codeCheck?: string;            // Function name for code mode
  };

  // Limits
  maxIterations: number;           // Hard stop (typically 1-5)
  model: string;                   // LLM for the worker
  timeoutSeconds?: number;         // Per-iteration wall clock limit

  // Learnings (populated by Thomas from /retro best-practice-spec)
  learnings?: string;
  // Thomas reads the YAML front matter of the relevant retro ledger
  // and extracts worker-facing guidance: prompt patterns to follow,
  // patterns to avoid, structural rules. Thomas filters out items
  // that are Thomas-facing (model selection, eval criteria design)
  // and only passes rules the worker can act on.

  // Pipeline (optional — for multi-stage tasks)
  stage?: {
    name: string;                  // Stage identifier
    inputFrom?: string;            // TaskResult ID to pull input from
    outputKey: string;             // Key for this stage's output
  };
}

interface FileReference {
  path: string;
  role: "template" | "brand_guide" | "example" | "input";
  loadStrategy: "full" | "summary" | "outline";
  // "full"    = inject entire file
  // "summary" = inject LLM-generated summary (pre-computed)
  // "outline" = inject structure/headings only (for templates)
}
```

### 3.3 TaskResult — What Thomas Receives

```typescript
interface TaskResult {
  id: string;
  taskName: string;
  status: "success" | "failed" | "stuck" | "timeout";
  iterations: number;

  // Output
  outputPath?: string;             // File path if worker created a file
  outputData?: any;                // Structured data if applicable
  workerSummary: string;           // Worker's own summary of what it did

  // Eval
  evalPassed: boolean;
  evalDetails: string;             // Why it passed or failed

  // Cost
  tokensUsed: number;
  estimatedCost: number;
  durationSeconds: number;

  // Guidance (if worker got stuck)
  guidanceLog?: {
    question: string;
    response: string;
    respondedBy: "joel";
  }[];

  // Audit
  transcriptPath: string;
}
```

### 3.4 The Delegation Loop (Plugin Internals)

```typescript
async function delegateHandler(taskSpec: TaskSpec): Promise<TaskResult> {
  const taskId = generateId();
  let iteration = 0;
  let lastEvalFeedback = "";

  while (iteration < taskSpec.maxIterations) {
    iteration++;

    // 1. Assemble worker prompt
    const workerPrompt = assemblePrompt(taskSpec, lastEvalFeedback, iteration);

    // 2. Spawn worker via sessions_spawn
    const spawnResult = await sessionsSpawn({
      task: workerPrompt,
      model: taskSpec.model,
      tools: taskSpec.tools,
      runTimeoutSeconds: taskSpec.timeoutSeconds || 300,
    });

    // 3. Wait for announce-back
    const workerOutput = await waitForCompletion(spawnResult.runId);

    // 4. Parse structured output from worker's response
    const parsed = parseWorkerOutput(workerOutput);

    // 5. Handle "needs help"
    if (parsed.needs_help) {
      const guidance = await routeToJoel(parsed.question, taskSpec.name);
      lastEvalFeedback = `Joel's guidance: ${guidance.response}`;
      continue;  // Re-spawn with guidance
    }

    // 6. Run eval gate
    const evalResult = runEval(taskSpec.eval, parsed, workerOutput);

    if (evalResult.passed) {
      return buildTaskResult(taskId, taskSpec, "success", iteration,
        parsed, evalResult, spawnResult);
    }

    // 7. Eval failed — prepare feedback for next iteration
    lastEvalFeedback = `Previous attempt failed eval. Feedback: ${evalResult.details}. ` +
      `Try again with a different approach.`;

    // Fresh context on next spawn (Ralph pattern — no context carryover)
  }

  // Max iterations exhausted
  return buildTaskResult(taskId, taskSpec, "failed", iteration,
    null, { passed: false, details: "Max iterations reached" }, null);
}
```

```typescript
function assemblePrompt(
  taskSpec: TaskSpec,
  evalFeedback: string,
  iteration: number
): string {
  let prompt = "";

  // System context (brand voice, etc.)
  if (taskSpec.systemContext) {
    prompt += taskSpec.systemContext + "\n\n";
  }

  // Reference files
  for (const ref of taskSpec.references) {
    const content = loadReference(ref);
    prompt += `--- ${ref.role.toUpperCase()}: ${ref.path} ---\n${content}\n\n`;
  }

  // Pipeline input (if this is a later stage)
  if (taskSpec.stage?.inputFrom) {
    const prevOutput = getPreviousStageOutput(taskSpec.stage.inputFrom);
    prompt += `--- INPUT FROM PREVIOUS STAGE ---\n${prevOutput}\n\n`;
  }

  // The actual task
  prompt += `--- TASK ---\n${taskSpec.prompt}\n\n`;

  // Eval feedback from previous iteration (if retry)
  if (evalFeedback) {
    prompt += `--- FEEDBACK FROM PREVIOUS ATTEMPT ---\n${evalFeedback}\n\n`;
  }

  // Learnings from retro best-practice-spec (if provided)
  if (taskSpec.learnings) {
    prompt += `--- RULES FROM PREVIOUS SIMILAR TASKS ---\n`;
    prompt += `Follow these rules based on past experience:\n`;
    prompt += `${taskSpec.learnings}\n\n`;
  }

  // Output schema instruction
  prompt += `--- REQUIRED OUTPUT FORMAT ---
When you complete the task, output a JSON block with this exact structure:
\`\`\`json
{
  "status": "done" | "stuck",
  "confidence": 0.0 to 1.0,
  "output_path": "/path/to/created/file (if applicable)",
  "self_assessment": "Brief assessment of your work quality",
  "needs_help": false,
  "question": null
}
\`\`\`
If you are stuck or unsure how to proceed, set needs_help to true
and put your question in the question field. Do not guess.
Output this JSON block as the LAST thing in your response.`;

  return prompt;
}
```

### 3.5 Eval Modes

```typescript
function runEval(
  evalConfig: TaskSpec["eval"],
  parsed: WorkerOutput,
  rawOutput: string
): { passed: boolean; details: string } {

  if (evalConfig.mode === "structured") {
    // Check worker's self-reported confidence against threshold
    const threshold = evalConfig.passThreshold || 0.7;
    if (parsed.confidence >= threshold && parsed.status === "done") {
      return { passed: true, details: `Confidence ${parsed.confidence} >= ${threshold}` };
    }
    return {
      passed: false,
      details: `Confidence ${parsed.confidence} < ${threshold}. ` +
        `Worker self-assessment: ${parsed.self_assessment}`
    };
  }

  if (evalConfig.mode === "code") {
    // Run a programmatic check
    // Examples: file exists, valid HTML, CSV has expected columns,
    //           JSON schema validates, API returned 200
    const check = codeChecks[evalConfig.codeCheck!];
    return check(parsed, rawOutput);
  }
}

// Registry of code checks
const codeChecks: Record<string, EvalFunction> = {
  file_exists: (parsed) => {
    const exists = fs.existsSync(parsed.output_path);
    return { passed: exists, details: exists ? "File created" : "File not found" };
  },
  valid_html: (parsed) => {
    const html = fs.readFileSync(parsed.output_path, "utf-8");
    const valid = html.includes("<html") && html.includes("</html>");
    return { passed: valid, details: valid ? "Valid HTML structure" : "Invalid HTML" };
  },
  csv_has_rows: (parsed) => {
    const csv = fs.readFileSync(parsed.output_path, "utf-8");
    const rows = csv.trim().split("\n").length;
    return { passed: rows > 1, details: `${rows} rows found` };
  },
  enrichment_rate: (parsed) => {
    // Check what percentage of rows got enriched
    const data = JSON.parse(fs.readFileSync(parsed.output_path, "utf-8"));
    const rate = data.filter(r => r.enriched).length / data.length;
    return { passed: rate >= 0.8, details: `Enrichment rate: ${(rate * 100).toFixed(0)}%` };
  },
  // Add more as needed — this grows over time
};
```

---

## 4. Domain Mapping — How Thomas Uses delegate()

### 4.1 Sales & Operations

High-frequency, low-complexity. Most tasks are single-iteration execution.

**Examples of what Thomas delegates:**

```
Joel: "Schedule dentist for all 5 kids next month"

Thomas generates TaskSpec:
  name: "Schedule dentist visits"
  domain: "sales_ops"
  prompt: "Find availability at [dentist] for 5 children.
           Book consecutive morning slots on the same day.
           Avoid these dates: [from calendar].
           Email confirmation to Amanda."
  tools: ["calendar_read", "calendar_write", "email_send"]
  eval: { mode: "code", codeCheck: "events_created" }
  maxIterations: 2
  model: "gpt-5.4"
```

```
Joel: "Enrich this contact list from Apollo"

Thomas generates TaskSpec:
  name: "Apollo contact enrichment"
  domain: "sales_ops"
  prompt: "For each contact in /uploads/contacts.csv, look up
           current title, company, email, LinkedIn via Apollo.
           Output enriched CSV to /output/contacts-enriched.csv."
  tools: ["apollo_search", "file_read", "file_write"]
  references: [{ path: "contacts.csv", role: "input", loadStrategy: "full" }]
  eval: { mode: "code", codeCheck: "enrichment_rate" }
  maxIterations: 3
  model: "gpt-5.4"
```

```
Joel: "Post the article that's due today per GTM calendar"

Thomas generates TaskSpec:
  name: "GTM article publish"
  domain: "sales_ops"
  prompt: "Today's GTM entry: [entry from calendar].
           Draft article matching brand guide.
           Post to [platform]. Cross-post summary to LinkedIn."
  tools: ["file_read", "social_post", "linkedin_api"]
  references: [
    { path: "brand-guide.md", role: "brand_guide", loadStrategy: "summary" }
  ]
  eval: { mode: "structured", passThreshold: 0.8 }
  maxIterations: 3
  model: "claude-sonnet-4-6"
```

### 4.2 Presales & Proposals

The highest-value domain. This is where multi-stage delegation saves real money.

**Current cost problem:** One agent iterating on a presales HTML document reloads the full template into context every turn. One presales doc = $75 in API spend over an hour.

**Solution:** Split into pipeline stages. Each stage is a separate `delegate()` call. Content iteration happens in a small-context worker. Template rendering happens once in a separate worker. The full HTML template never re-enters context during iteration.

```
PRESALES PIPELINE (Thomas orchestrates, calling delegate() per stage)

Stage 1: INTERVIEW
  Thomas handles this directly — it's cognitive work.
  Thomas conducts the managed conversation with the prospect.
  Joel seeds the elicitation strategy.
  Thomas adapts questions while ensuring complete coverage.
  Output: Interview transcript + extracted narrative.
  (No delegation. Thomas is the right agent for this.)

Stage 2: NARRATIVE SYNTHESIS
  delegate({
    name: "Narrative synthesis",
    domain: "proposal",
    prompt: "Extract structured narrative from this interview transcript.
             Output JSON with: pain_points[], current_state, desired_state,
             constraints[], decision_criteria[], key_quotes[].",
    references: [
      { path: "interview-transcript.md", role: "input", loadStrategy: "full" }
    ],
    tools: ["file_read", "file_write"],
    eval: { mode: "structured", passThreshold: 0.8 },
    maxIterations: 3,
    model: "claude-sonnet-4-6",
    stage: { name: "narrative", outputKey: "narrative-synthesis" }
  })

Stage 3: SCOPE GENERATION
  delegate({
    name: "Scope generation",
    domain: "proposal",
    prompt: "Map this client narrative to A&A service capabilities.
             Generate scope recommendations with effort estimates.
             Output JSON with: recommended_services[], scope_items[],
             estimated_build_cost, estimated_monthly_retainer.",
    references: [
      { path: "aa-service-lines.md", role: "context", loadStrategy: "full" }
    ],
    tools: ["file_read", "file_write"],
    eval: { mode: "structured", passThreshold: 0.7 },
    maxIterations: 3,
    model: "claude-sonnet-4-6",
    stage: {
      name: "scope",
      inputFrom: "narrative-synthesis",
      outputKey: "scope-generation"
    }
  })

Stage 4a: DOCUMENT CONTENT (small context — iterates here)
  delegate({
    name: "Proposal content generation",
    domain: "proposal",
    prompt: "Generate section content for each section in the
             proposal template outline. Use the scope and narrative
             as source material. Match A&A brand voice.
             Output JSON keyed by section ID.",
    references: [
      { path: "proposal-template.html", role: "template", loadStrategy: "outline" },
      { path: "brand-guide.md", role: "brand_guide", loadStrategy: "summary" }
    ],
    tools: ["file_read", "file_write"],
    eval: { mode: "structured", passThreshold: 0.8 },
    maxIterations: 5,    // More iterations OK — context is small
    model: "claude-sonnet-4-6",
    stage: {
      name: "content",
      inputFrom: "scope-generation",
      outputKey: "proposal-content"
    }
  })

  KEY: loadStrategy "outline" means only the section headings and
  structure of the template are injected — NOT the full HTML.
  This keeps context ~5K tokens instead of ~50K.

Stage 4b: DOCUMENT RENDER (loads template once, no iteration)
  delegate({
    name: "Proposal HTML render",
    domain: "proposal",
    prompt: "Inject the section content JSON into the HTML template.
             Replace all placeholder tokens. Preserve all formatting.
             Save final HTML to /output/proposal-[client].html.",
    references: [
      { path: "proposal-template.html", role: "template", loadStrategy: "full" }
    ],
    tools: ["file_read", "file_write"],
    eval: { mode: "code", codeCheck: "valid_html" },
    maxIterations: 2,    // Mechanical task — 1-2 passes max
    model: "gpt-5.4",   // Cheap model, mechanical task
    stage: {
      name: "render",
      inputFrom: "proposal-content",
      outputKey: "proposal-rendered"
    }
  })

Stage 4c: DOCUMENT REVIEW
  delegate({
    name: "Proposal quality review",
    domain: "proposal",
    prompt: "Review this proposal for: brand compliance, tone
             consistency, accuracy against the client narrative,
             completeness of all sections. Output a review JSON
             with scores per dimension and specific fix instructions
             if any dimension scores below 0.8.",
    references: [
      { path: "brand-guide.md", role: "brand_guide", loadStrategy: "summary" }
    ],
    tools: ["file_read"],
    eval: { mode: "structured", passThreshold: 0.8 },
    maxIterations: 1,    // Review is one-shot
    model: "claude-sonnet-4-6",
    stage: {
      name: "review",
      inputFrom: "proposal-rendered",
      outputKey: "proposal-review"
    }
  })

  If review FAILS → Thomas reads the review feedback and re-runs
  Stage 4a with the fix instructions appended. This is Thomas making
  a cognitive decision, not the plugin looping automatically.
  Cross-stage retry is Thomas's job. Intra-stage retry is the plugin's job.

ESTIMATED COST: $8-15 per proposal (down from $75)
  Stage 2: ~$0.50 (small input, 1-2 iterations)
  Stage 3: ~$1.00 (small input, 1-2 iterations)
  Stage 4a: ~$3-8 (multiple iterations, but small context)
  Stage 4b: ~$1-2 (one pass, template loaded once)
  Stage 4c: ~$1-2 (one pass, review only)
```

### 4.3 Research & Development

Two phases with a human trigger between them.

**Phase 1: Autonomous Research**

```
Thomas spawns 2-3 parallel research workers:

  delegate({
    name: "Research crawl — [angle]",
    domain: "research",
    prompt: "Research [topic] focusing on [specific angle].
             Crawl these sources: [source list].
             Output structured findings JSON.",
    tools: ["web_search", "web_fetch", "file_write"],
    eval: { mode: "structured", passThreshold: 0.6 },
    maxIterations: 3,
    model: "gpt-5.4",   // Cheap model for crawling
  })

Then Thomas synthesizes all crawler outputs into a planning brief
(Thomas does this himself — it's cognitive work).
Thomas presents the brief to Joel.
Joel decides what to execute.
```

**Phase 2: Joel-Triggered Execution**

```
Joel: "Execute recommendation 3 from the R&D brief"

Thomas generates implementation TaskSpecs:
  1. Design doc (delegate to Sonnet worker)
  2. Code/config changes (delegate to Sonnet worker)
  3. Testing (delegate with code eval mode)

Each step is a separate delegate() call.
Thomas chains them using the stage.inputFrom mechanism.
```

---

## 5. Abraham's Domain (Separate from Thomas)

Abraham runs on its own OC gateway on dedicated hardware. Abraham is the ChesedClaw infrastructure root — the originator, not a delegate.

### 5.1 Abraham's Tools

```
• ssh_exec(host, command)        — Run commands on any CMA box
• update_agent_config(host, config) — Modify CLAUDE.md/SOUL.md remotely
• read_trust_ledger(host)        — Pull trust ledger from a CMA
• provision_cma(spec)            — Stand up a new client agent instance
• fleet_health()                 — Heartbeat check across all CMA boxes
• cost_report(host, period)      — API spend per client per period
• alert(channel, message)        — Notify Joel or Josh via Telegram/Slack
```

### 5.2 Abraham's Responsibilities

- **Fleet monitoring:** Periodic heartbeat checks on all deployed CMA instances. Alert Joel/Josh if an agent is unresponsive, over budget, or behaving anomalously.
- **Provisioning:** After Joel completes POC and sends invoice, Abraham provisions the production CMA instance on client hardware (Mac Mini) or Azure Foundry.
- **Root-level support:** Can SSH into any CMA box and modify agent config, update tools, patch skills, adjust trust parameters. This is how Josh does production support.
- **Observability:** Aggregates cost, health, and trust data across the fleet. Surfaces weekly reports.

### 5.3 Communication with Thomas

For now: through Joel. Joel tells Thomas what he needs, Joel tells Abraham what to do. No direct Thomas→Abraham channel yet.

Future: `sessions_send` via Tailscale WebSocket bridge between gateways. Thomas sends a structured message ("Felix needs a config update, here's the change"), Abraham receives and executes.

---

## 6. Client Managed Agency (CMA) Lifecycle

The complete end-to-end flow. Retrofit Design (Felix) is the first reference implementation.

```
PHASE 1: PROSPECT
  Joel identifies prospect via network/referral.
  Thomas enriches contact (delegate to worker: Apollo lookup).
  Thomas drafts outreach (delegate to worker: email composition).
  Joel makes introduction. Thomas manages scheduling.
  Exit: Meeting scheduled.

PHASE 2: INTERVIEW
  Thomas conducts managed conversation with prospect.
  Joel seeds elicitation strategy and framework.
  Thomas adapts questions dynamically, ensures complete coverage.
  Output: Transcript + narrative extraction.
  Exit: Complete narrative captured.

PHASE 3: PROPOSAL
  Thomas runs presales pipeline (Section 4.2):
    Narrative synthesis → Scope → Content → Render → Review.
  Joel reviews final proposal, iterates if needed.
  Joel presents to prospect.
  Exit: Proposal accepted, SOW signed.

PHASE 4: POC BUILD
  Thomas generates agent spec from client narrative.
  Thomas delegates build tasks:
    • CLAUDE.md / SOUL.md generation (worker)
    • Tool integration & testing (worker)
    • Client gateway setup (worker)
  Joel validates POC with client.
  Exit: Client confirms POC works. Joel sends invoice.

PHASE 5: HANDOFF TO JOSH
  Thomas packages deployment bundle:
    • Final agent config
    • Client narrative + scope
    • Test results
    • Monitoring requirements
  Thomas pushes to shared repo + Trello.
  Thomas notifies Josh via Slack.
  Exit: Josh acknowledges receipt.

PHASE 6: PRODUCTION (Josh + Abraham)
  Josh re-configures agent for production.
  Josh tests all integrations.
  Abraham provisions the CMA instance:
    • Trust ledger initialization
    • Promotion track baseline
    • Observability stack (logs, cost, health)
  Abraham deploys to client hardware or Azure Foundry.
  Abraham adds instance to fleet monitoring.
  Exit: Agent live, monitoring active, retainer billing begins.

PHASE 7: ONGOING
  Abraham monitors fleet health via heartbeat.
  Abraham surfaces weekly client reports.
  Josh handles technical support (via Abraham's SSH tools).
  Joel handles relationship issues.
  Trust ledger accumulates demonstrated chesed.
  Agent earns promotion through faithful action.
  This phase is the retainer. It runs indefinitely.
```

---

## 7. Build Order

### Build 1: The delegate() plugin

**Scope:** TypeScript OC plugin, ~200-300 lines. Registers `delegate` tool. Wraps `sessions_spawn`. Implements the eval loop with structured output parsing and retry with fresh context.

**Ship criteria:** Thomas can call `delegate()` with a TaskSpec JSON, a worker spawns, does the task, and Thomas receives a TaskResult JSON with pass/fail status.

**First test:** Have Thomas delegate "create a file called test.md with the word hello in it" and verify the code eval (`file_exists`) returns success.

### Build 2: Presales pipeline

**Scope:** TaskSpec library for the 5-stage presales pipeline (Section 4.2). Template outline extractor. Stage chaining via `inputFrom`.

**Ship criteria:** Generate a complete presales document for under $15 in API spend.

**First test:** Re-run an existing prospect's interview transcript through the pipeline and compare output to the manually-created proposal.

### Build 3: Sales & ops task library

**Scope:** Library of common TaskSpecs for Joel's daily work. Calendar, email, enrichment, posting. Thomas learns to generate these from natural language.

**Ship criteria:** Joel says "enrich this contact list" and Thomas generates and executes the right TaskSpec without Joel specifying the details.

### Build 4: Abraham provisioning

**Scope:** Abraham's OC gateway + SSH tools + fleet monitoring. This is Josh's build.

**Ship criteria:** Abraham can provision a new CMA instance, add it to fleet monitoring, and alert Joel/Josh when health degrades.

### Build 5: Full CMA lifecycle

**Scope:** Wire up Phases 1-7 end to end. Retrofit Design (Felix) is the reference implementation.

**Ship criteria:** Complete one full lifecycle from prospect to monitored production agent with retainer billing active.

---

## 8. Integration with /retro Skill

The delegate plugin does not read or write retro ledgers. The integration flows through Thomas's cognitive layer.

### Before Delegation

Thomas reads the YAML front matter of the relevant retro ledger (e.g., `.chesedclaw/retro/proposal/presales-pipeline.md`). **Only the front matter is loaded into context** — typically 500-1000 tokens of compiled best-practice-spec. Thomas never loads the full entry history unless Joel explicitly requests it via `/retro history`.

Thomas applies the best-practice-spec when generating the TaskSpec:
- `recommended_workers` → sets `model` field per stage
- `prompt_rules` → shapes the `prompt` wording
- `template_loading` → sets `loadStrategy` on references
- `eval_criteria` → populates `eval.criteria` with proven sub-criteria
- `known_failure_modes` → adds mitigations to `learnings` field
- `cost_benchmark` → informs `maxIterations` and `timeoutSeconds`

The `learnings` field in the TaskSpec carries worker-facing rules extracted from the best-practice-spec. Thomas filters out Thomas-facing items (model selection, eval design) and only passes rules the worker can act on.

### After Delegation

The plugin returns a TaskResult with structured metadata: models used, iterations per stage, eval scores, total cost, duration. This data is available to Thomas if Joel invokes `/retro`. Thomas does not auto-retro.

When Joel runs `/retro`, Thomas uses both the conversation context and the TaskResult metadata to populate the retro entry. Then Thomas **rewrites the best-practice-spec front matter** incorporating new findings. The front matter converges toward a tighter spec with each cycle.

### The Feedback Loop

```
/retro best-practice-spec
       ↓ (Thomas reads front matter)
TaskSpec generation
       ↓ (delegate plugin executes)
TaskResult
       ↓ (Joel invokes /retro)
New retro entry + rewritten best-practice-spec
       ↓ (next time)
Better TaskSpec generation
```

Each delegation cycle that ends with a `/retro` makes the next delegation cycle's spec better. The best-practice-spec is the compound interest mechanism.

---

## 9. What This Is NOT

- **Not CrewAI/AutoGen/LangGraph.** This is a purpose-built OC plugin, not a generic framework.
- **Not a SaaS.** This is A&A's internal orchestration. Client agents don't run on this — they run on ChesedClaw.
- **Not replacing Thomas.** Thomas is the brain. The plugin is the spinal cord. Workers are the hands.
- **Not fully autonomous.** Joel stays in the loop for judgment. The goal is automating execution, not decision-making.
- **Not a named agent taxonomy.** Workers are ephemeral. No Seneca, no Aristotle, no Arcametis. Domain expertise lives in TaskSpec libraries, not agent personalities.

---

## 10. Open Questions

1. Does OC's plugin system support registering custom tools with JSON schema params, or does this need to be a custom skill + exec wrapper?
2. How does the plugin intercept the announce-back from `sessions_spawn`? Is there an event hook, or does it poll `sessions_history`?
3. For the guidance channel (worker stuck → Joel via Telegram), does OC have an event system that can block the loop and wait for an external response?
4. What's the right eval mode for proposal content quality? Self-assessment with a high threshold, or a separate cheap eval LLM call?
5. How does Josh want to receive the Phase 5 handoff bundle? Git repo? Trello? Slack file upload?
6. Where does Abraham run? Same hardware class as Thomas, or cloud (for reliability)?

---

*"OpenClaw is software you install. NanoClaw is infrastructure you run. ChesedClaw is faithfulness you govern."*

*Abraham originates. Thomas counsels. Workers execute. Joel decides.*
