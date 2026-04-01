# /retro — Skill Specification

**Skill:** `/retro`
**Version:** 0.2
**Location:** `.chesedclaw/skills/retro/SKILL.md`
**Author:** Joel Northam / Arthur & Archie
**Date:** April 2026

---

## Purpose

`/retro` is a structured retrospective skill Thomas invokes on command. It captures what worked, what failed, and why — then writes findings to a persistent ledger organized by task type. Each ledger has two parts:

1. **YAML front matter** — The `best-practice-spec` for this task type. This is the compiled wisdom from all entries. It gets **rewritten every time a new lesson is added.** This is the only part Thomas loads into context when generating a TaskSpec or starting similar work.

2. **Markdown body** — Flat list of dated lesson records. The provenance trail. Never loaded into context unless Joel explicitly requests history.

This means the retro system is always converging toward a tighter, more accurate best-practice spec. Old lessons don't accumulate as noise — they get compiled into the front matter and the raw records sit below as receipts.

---

## Invocation

```
Joel: /retro
Joel: /retro proposal
Joel: /retro sales-ops scheduling
Joel: /retro delegate presales-pipeline
Joel: /retro refactor proposal
Joel: /retro history proposal
```

- `/retro` — Thomas infers the task type from current conversation context, confirms with Joel, then starts the interview.
- `/retro [category]` or `/retro [category] [subcategory]` — Target a specific ledger.
- `/retro refactor [category]` — Don't add a new entry. Review all entries, rewrite the best-practice-spec from scratch, optionally prune stale entries.
- `/retro history [category]` — Load the full entry history into context for review. Only way to see past entries.

---

## Ledger File Format

```markdown
---
# BEST-PRACTICE-SPEC: proposal/presales-pipeline
# Last updated: 2026-04-01
# Compiled from: 8 retro entries spanning 2026-01 to 2026-04
# This front matter is the ONLY part loaded into Thomas's context
# when generating TaskSpecs for this task type.

task_type: proposal/presales-pipeline
description: "Multi-stage presales document generation pipeline"

principal_model: claude-opus-4-6
recommended_workers:
  content_generation: claude-sonnet-4-6
  revision: gpt-5.4
  html_render: gpt-5.4
  review: claude-sonnet-4-6

prompt_rules:
  - "Never use 'conversational tone' — instead describe exact voice:
     'professional but direct, no jargon, as if explaining to a
     smart non-technical principal'"
  - "FROZEN list must name sections by exact heading text.
     'Don't change anything I didn't mention' does NOT work."
  - "Add 'preserve internal ordering of all list items' to every
     FROZEN instruction. Sonnet reorders without this."
  - "When specifying client-specific content, include at least
     two concrete details from the interview narrative.
     'Write for the client' is too vague — 'reference Alec's
     concern about project intake volume and his preference for
     async communication' produces usable output."

template_loading:
  content_stage: outline    # headings/structure only, ~5K tokens
  render_stage: full        # full HTML loaded once, no iteration
  brand_guide: full         # summary was insufficient — full works better

eval_criteria:
  brand_voice:
    - "Uses A&A voice — direct, no jargon?"
    - "Addresses client by name and references their specific situation?"
    - "No generic consulting language (avoid: 'leverage', 'synergy',
       'best-in-class', 'holistic approach')?"
  content_quality:
    - "Every scope item traceable to a specific interview finding?"
    - "Pricing section separates build vs. retainer with clear deliverables?"
  structural:
    - "All template placeholder tokens replaced?"
    - "No orphaned sections or empty headings?"

known_failure_modes:
  - model: claude-sonnet-4-6
    behavior: "Reorganizes bullet lists and section internals during revision"
    mitigation: "Use GPT-5.4 for revision stages, or add explicit
                 'preserve internal ordering' instruction"
  - model: claude-sonnet-4-6
    behavior: "Self-scores brand compliance 0.9 regardless of actual quality"
    mitigation: "Use broken-out sub-criteria instead of single
                 'brand compliance' check. Or use code eval mode."
  - model: gpt-5.4
    behavior: "Strips inline CSS and <style> tags during HTML manipulation"
    mitigation: "Add explicit 'do not modify any <style> tags or
                 inline style attributes' to render stage prompt"

cost_benchmark:
  target: "$8-15 per proposal"
  typical_iterations: "7-11 across all stages"
  typical_duration: "45-90 minutes wall time"

notes:
  - "Cross-stage retry is Thomas's cognitive decision, not plugin automation.
     If Stage 4c review fails, Thomas rewrites the Stage 4a spec with
     review feedback — don't just re-run the same spec."
  - "Joel gives partial feedback (20-40% of changes per round).
     Always run feedback interview to classify: which sections are FROZEN
     (approved), which need changes, which are pending review."
---

# Retro Entries — proposal/presales-pipeline

<!-- These entries are the provenance trail for the best-practice-spec above.
     NOT loaded into context unless Joel runs /retro history. -->

## 2026-04-01 — Retrofit Design Proposal v2

- outcome: completed
- principal: claude-opus-4-6 | worker: claude-sonnet-4-6
- iterations: 7 | cost: $12.40 | duration: 45 min
- **worked:** FROZEN list with explicit section names; outline loadStrategy
- **spec_failure:** "conversational tone" interpreted as casual → fix: describe exact voice
- **worker_failure:** Sonnet reordered scope bullets despite no instruction → fix: add preserve-ordering to FROZEN
- **joel_iterating:** pricing restructured (split build/retainer) — not a failure
- **eval_refinement:** "brand compliance" too vague → split into 3 sub-criteria

## 2026-03-28 — CMT Initial Proposal

- outcome: completed
- principal: claude-opus-4-6 | worker: claude-sonnet-4-6
- iterations: 9 | cost: $18.20 | duration: 90 min
- **worked:** multi-stage pipeline kept template out of content iteration context
- **spec_failure:** brand guide loaded as summary lost critical voice details → fix: load full
- **worker_failure:** Sonnet self-scored 0.9 on brand voice, output was generic → fix: sub-criteria
- **worker_failure:** GPT-5.4 stripped inline CSS in render stage → fix: explicit preserve instruction
- **joel_iterating:** exec summary reframed after v1 — Joel changed narrative angle
- **model_note:** Sonnet good for first drafts, bad for revisions; GPT-5.4 reliable for mechanical render

## 2026-03-15 — Retrofit Design Proposal v1

- outcome: abandoned
- principal: claude-opus-4-6 | worker: claude-sonnet-4-6
- iterations: 4 | cost: $75+ | duration: 2+ hours
- **note:** Single-agent approach. Full template reloaded every turn.
             This is what prompted the multi-stage pipeline design.
- **lesson:** Never iterate content with full HTML template in context.
              Separate content generation from template rendering.
```

---

## The Interview

When Joel invokes `/retro`, Thomas runs a structured interview to capture what a human won't provide unprompted.

### Interview Flow

**Step 1: Scope**
Thomas confirms what they're retroing.
> "We just finished the Retrofit proposal. Capturing that, or something else?"

**Step 2: Outcome**
> "How'd it land — completed, abandoned, paused, or partial?"

**Step 3: What Worked**
> "Which parts were right on the first pass? Anything in the spec I should keep doing?"

**Step 4: What Failed — Attribution**
Thomas walks through each significant change and asks:
> "The scope section got rewritten twice. You changing direction, or worker got it wrong?"

Attribution types:
- **joel_iterating** — Joel refined the ask. Not a failure. No fix needed.
- **spec_failure** — Thomas wrote a bad spec or chose wrong parameters.
- **worker_failure** — Worker misinterpreted a clear spec. Model limitation.
- **infra_failure** — Something broke mechanically.

**Step 5: Model & Constraint Notes**
> "Worker was Sonnet 4.6. Observations on how it handled this?"

**Step 6: Eval Criteria Refinement**
> "Now that you've seen the output — what would the acceptance criteria have been if you'd written them before we started?"

**Step 7: Recommendations**
Thomas proposes changes to the best-practice-spec:
> "Based on this, I'd update the presales spec to use GPT-5.4 for revisions and add preserve-ordering to the FROZEN template. Sound right?"

**Step 8: Write**
Thomas does two things:
1. Appends a new entry to the ledger body
2. **Rewrites the YAML front matter best-practice-spec** incorporating the new findings

Thomas shows Joel the updated best-practice-spec before writing:
> "Here's the updated best-practice-spec for presales. Changes from last version: [diff]. Look right?"

---

## Context Loading Rules

### Default: Front Matter Only

When Thomas reads a retro ledger to inform new work, he loads **only the YAML front matter.** The markdown body (entry history) stays on disk.

```
Thomas needs to generate a presales TaskSpec:
→ Read .chesedclaw/retro/proposal/presales-pipeline.md
→ Parse YAML front matter only
→ Apply prompt_rules, recommended_workers, eval_criteria,
  known_failure_modes, template_loading settings
→ Generate TaskSpec incorporating all applicable patterns
```

This keeps context usage minimal. A well-maintained best-practice-spec is 30-60 lines of YAML — roughly 500-1000 tokens.

### On Demand: Full History

When Joel runs `/retro history [category]`, Thomas loads the full file including all entries. This is for:
- Reviewing how a pattern evolved over time
- Resolving contradictions between recent findings
- Preparing for a refactor
- Joel wanting to see the evidence behind a best-practice rule

### On Refactor: Full History → Rewrite

When Joel runs `/retro refactor [category]`, Thomas:
1. Loads full history
2. Identifies patterns, contradictions, stale entries
3. Rewrites the best-practice-spec from scratch
4. Optionally archives entries fully captured in the new spec
5. Shows Joel the diff before writing

---

## Ledger Organization

```
.chesedclaw/
  retro/
    proposal/
      presales-pipeline.md
      interview-technique.md
      scope-generation.md
    sales-ops/
      contact-enrichment.md
      scheduling.md
      email-outreach.md
      social-posting.md
      family-admin.md
    research/
      crawl-synthesis.md
      implementation.md
    delegate/
      plugin-behavior.md
      eval-modes.md
    client/
      retrofit.md
      cmt.md
      trl.md
    thomas/
      general.md
      spec-generation.md
```

Each file follows the same format: YAML front matter (best-practice-spec) + markdown body (dated entries).

New categories and subcategories are created on first use. Thomas proposes the path during the interview:
> "I don't have a retro ledger for this yet. I'd file it under `sales-ops/trip-planning.md`. Work for you?"

---

## Integration with delegate()

The delegate plugin does NOT read or write retro ledgers. The integration flows through Thomas:

**Before delegation:**
Thomas reads the relevant best-practice-spec front matter. Thomas uses it to generate a better TaskSpec — choosing models, wording prompts, setting eval criteria per compiled learnings.

**After delegation:**
The delegate plugin returns a TaskResult with structured metadata (models used, iterations, costs, eval scores). Thomas has this data available if Joel invokes `/retro`. Thomas does not auto-retro.

**In the TaskSpec schema (from delegate spec v0.2), add:**

```typescript
interface TaskSpec {
  // ... all existing fields, plus:

  learnings?: string;
  // Populated by Thomas from the best-practice-spec front matter.
  // Injected into the worker prompt as:
  // "LESSONS FROM PREVIOUS SIMILAR TASKS: ..."
  // Contains worker-facing guidance only — model notes,
  // prompt patterns to avoid, structural rules.
  // Thomas filters the best-practice-spec to only include
  // items relevant to the worker (not Thomas-facing items
  // like model selection or eval criteria design).
}
```

**In the delegate plugin's `assemblePrompt()` function, add:**

```typescript
// After the task instruction, before the output schema
if (taskSpec.learnings) {
  prompt += `--- LESSONS FROM PREVIOUS SIMILAR TASKS ---\n`;
  prompt += `Follow these rules based on past experience:\n`;
  prompt += `${taskSpec.learnings}\n\n`;
}
```

---

## What /retro Is NOT

- **Not automatic.** Joel invokes it. Thomas may suggest it but never forces it.
- **Not a conversation log.** Entries are structured findings, not transcripts.
- **Not part of the delegate plugin.** Delegate is deterministic code. Retro is cognitive skill. They inform each other but are separate.
- **Not limited to delegation.** Any work Thomas does can be retroed.
- **Not an append-only dump.** The best-practice-spec front matter is rewritten on every entry. History accumulates, wisdom converges.

---

*Thomas learns from every engagement. The best-practice-spec is how chesed compounds.*
