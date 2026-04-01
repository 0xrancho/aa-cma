# delegate() Build Backlog

Source: aris/research-briefs/2026-04-01/chesedclaw-delegation-spec-v03.md (Section 7)
Plugin: .openclaw/extensions/delegate/
Retro skill: workspace-thomas/skills/retro/SKILL.md

---

## Build 1: delegate() Plugin — DONE (2026-04-01)

Plugin built at `.openclaw/extensions/delegate/`. Registered as tool in openclaw.json5.

### Deferred from Build 1 (still open):

- **Telegram guidance routing** — when worker returns `needs_help`, block the loop and route question to Joel via Telegram. Currently returns `stuck` immediately. Requires OC event system investigation.
- **Stage chaining** — `stage.inputFrom` reading previous TaskResult output. Types stubbed, implementation deferred until presales pipeline (Build 3).
- **Cost tracking** — `tokensUsed` and `estimatedCost` in TaskResult. Requires provider-level usage reporting. Currently returns 0.
- **Transcript persistence** — saving full worker transcripts to disk. `transcriptPath` currently returns empty string.
- **First test** — deploy gateway, have Thomas delegate "create a file called test.md with the word hello" and verify file_exists eval returns success.

## /retro Skill — DONE (2026-04-01)

Skill built at `workspace-thomas/skills/retro/SKILL.md`. Ledger directory at `retro/`.
Added to Thomas's AGENTS.md skills list. delegate() integration already wired via `learnings` field in `assemblePrompt()`.

---

## Build 2: TaskSpec Template Library

Domain-specific TaskSpec templates for common delegation patterns.

Domains:
- sales_ops: enrichment, email drafts, calendar ops, CRM reads/writes
- proposal: narrative synthesis, scope generation, content generation, HTML render, quality review
- research: web crawl, document extraction, synthesis

Each template defines: default model, required tools, reference loading strategy, eval mode and criteria, max iterations.

Ship criteria: Thomas can reference a template by domain/name and fill in task-specific fields.

## Build 3: Presales Pipeline

Multi-stage delegation for proposals. Each stage is a separate delegate() call chained via stage.inputFrom.

Stages: Interview (Thomas direct) -> Narrative Synthesis -> Scope Generation -> Content Generation -> Document Render -> Quality Review

Key optimization: loadStrategy "outline" for templates keeps content generation context at ~5K tokens instead of ~50K.

Ship criteria: Generate a complete presales document for under $15 in API spend. Re-run an existing prospect's transcript and compare to manually-created proposal.

## Build 4: Sales & Ops Task Library

Thomas learns to generate TaskSpecs from natural language. Pattern matching from Joel's instructions to appropriate domain templates.

Ship criteria: Joel says "enrich this contact list" and Thomas generates and executes the right TaskSpec without Joel specifying details.
