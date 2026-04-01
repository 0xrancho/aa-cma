# Domain: Research & Development

TaskSpec domain value: `research`

## Scope

Two phases with a human trigger between them. Autonomous crawling and synthesis, then Joel-triggered execution.

## Phase 1: Autonomous Research

Thomas spawns 2-3 parallel research delegates targeting different angles of the same topic.

**Crawl workers:**
- Model: Haiku or GPT-5.4 (cheap, high-throughput for token-heavy raw data)
- Tools: web_search, web_fetch, file_write
- Eval: structured mode, threshold 0.6 (research is exploratory)
- Iterations: 2-3

Thomas synthesizes all crawler outputs into a planning brief himself (cognitive work — cross-domain reasoning, pattern recognition, strategic framing). Thomas presents the brief to Joel. Joel decides what to execute.

## Phase 2: Joel-Triggered Execution

Joel picks recommendations from the brief. Thomas generates implementation TaskSpecs and chains them via stages:

1. Design doc (delegate to Sonnet)
2. Code/config changes (delegate to Sonnet)
3. Testing (delegate with code eval mode)

Each step is a separate delegate() call.

## Three Markers

Evaluate all research findings against:

- **Interoperability**: Does it work with our current stack? (OC gateway, ChesedClaw, Airtable CRM, Tailscale, existing tooling)
- **Efficiency**: Does it reduce latency or code complexity? (Not just "is it cool")
- **Scalability**: Will this break when we add 10x more data? (More clients, more agents, more volume)

If a finding doesn't pass at least two markers, it's noise. Filter it out.

## Delegation Patterns

**Web crawl:**
- Model: Haiku (fast, cheap for raw scraping)
- Tools: web_search, web_fetch, file_write
- Eval: structured, threshold 0.6
- Iterations: 2-3

**Document extraction:**
- Model: Haiku
- Tools: file_read, file_write
- Eval: structured, threshold 0.6
- Iterations: 1-2

**Synthesis (if delegated, not always):**
- Model: Sonnet (needs reasoning for cross-source analysis)
- Tools: file_read, file_write
- Eval: structured, threshold 0.7
- Iterations: 2-3

**Implementation (Phase 2):**
- Model: Sonnet (code generation)
- Tools: read, write, edit, exec
- Eval: code mode, task-specific checks
- Iterations: 3-5

## Output

Research always produces a document or structured data, never code directly. Research informs implementation, which is a separate delegation chain.

## Retro Ledgers

Best-practice specs at `retro/research/`:
- `crawl-synthesis.md`
- `implementation.md`

Read front matter before generating TaskSpecs.
