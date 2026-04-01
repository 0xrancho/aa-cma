# /retro — Structured Retrospective Skill

## Trigger

- `/retro` — infer task type from conversation context, confirm with Joel
- `/retro [category]` or `/retro [category] [subcategory]` — target a specific ledger
- `/retro refactor [category]` — rewrite best-practice-spec from scratch without adding new entry
- `/retro history [category]` — load full entry history into context for review

## Purpose

Capture what worked, what failed, and why. Write findings to a persistent ledger. Each ledger has two parts:

1. **YAML front matter** — the `best-practice-spec`. Compiled wisdom from all entries. Rewritten every time a new lesson is added. This is the ONLY part loaded into context when generating TaskSpecs.
2. **Markdown body** — flat list of dated lesson records. Provenance trail. Never loaded unless Joel runs `/retro history`.

The system always converges toward a tighter spec. Old lessons compile into front matter; raw records stay as receipts.

## Ledger Location

```
retro/
  pursuits/
    presales-pipeline.md
    interview-technique.md
    scope-generation.md
  sales-ops/
    contact-enrichment.md
    scheduling.md
    email-outreach.md
  research/
    crawl-synthesis.md
    implementation.md
  delegate/
    plugin-behavior.md
    eval-modes.md
  client/
    retrofit.md
    cmt.md
  thomas/
    general.md
    spec-generation.md
```

New categories created on first use. Propose the path during the interview:
> "I don't have a retro ledger for this yet. I'd file it under `sales-ops/trip-planning.md`. Work for you?"

## Execution: Standard /retro

### Step 1: Scope

Confirm what we're retroing. If no category specified, infer from conversation context.

> "We just finished the Retrofit proposal. Capturing that, or something else?"

Resolve the ledger file path. If it exists, read it. If not, confirm with Joel that we're creating a new one.

### Step 2: Outcome

> "How'd it land — completed, abandoned, paused, or partial?"

### Step 3: What Worked

> "Which parts were right on the first pass? Anything in the spec I should keep doing?"

### Step 4: What Failed — Attribution

Walk through each significant change and ask for attribution:

> "The scope section got rewritten twice. You changing direction, or worker got it wrong?"

Attribution types:
- **joel_iterating** — Joel refined the ask. Not a failure. No fix needed.
- **spec_failure** — Thomas wrote a bad spec or chose wrong parameters.
- **worker_failure** — Worker misinterpreted a clear spec. Model limitation.
- **infra_failure** — Something broke mechanically.

### Step 5: Model & Constraint Notes

> "Worker was Sonnet 4.6. Observations on how it handled this?"

### Step 6: Eval Criteria Refinement

> "Now that you've seen the output — what would the acceptance criteria have been if you'd written them before we started?"

### Step 7: Recommendations

Propose changes to the best-practice-spec based on findings:

> "Based on this, I'd update the presales spec to use GPT-5.4 for revisions and add preserve-ordering to the FROZEN template. Sound right?"

### Step 8: Write

Do two things:

1. **Append a new entry** to the ledger markdown body
2. **Rewrite the YAML front matter** incorporating new findings

Show Joel the updated best-practice-spec before writing:

> "Here's the updated best-practice-spec for presales. Changes from last version: [diff]. Look right?"

## Execution: /retro refactor [category]

1. Load full ledger (front matter + all entries)
2. Identify patterns, contradictions, stale entries
3. Rewrite the best-practice-spec from scratch
4. Optionally mark entries fully captured in the new spec
5. Show Joel the diff before writing

## Execution: /retro history [category]

Load and display the full ledger file including all entries. This is for:
- Reviewing how a pattern evolved
- Resolving contradictions
- Preparing for a refactor
- Joel wanting evidence behind a best-practice rule

## Ledger File Format

```markdown
---
# BEST-PRACTICE-SPEC: [category]/[subcategory]
# Last updated: YYYY-MM-DD
# Compiled from: N retro entries spanning YYYY-MM to YYYY-MM

task_type: [category]/[subcategory]
description: "One-line description of this task type"

principal_model: [model-id]
recommended_workers:
  [stage_name]: [model-id]

prompt_rules:
  - "Concrete, specific rules for generating prompts"

template_loading:
  [stage_name]: full | outline | summary

eval_criteria:
  [dimension]:
    - "Specific checkable criterion"

known_failure_modes:
  - model: [model-id]
    behavior: "What goes wrong"
    mitigation: "How to prevent it"

cost_benchmark:
  target: "$X-Y per task"
  typical_iterations: "N-M across all stages"
  typical_duration: "X-Y minutes wall time"

notes:
  - "Any other compiled wisdom"
---

# Retro Entries — [category]/[subcategory]

<!-- Provenance trail. NOT loaded into context unless /retro history. -->

## YYYY-MM-DD — [Task Description]

- outcome: completed | abandoned | paused | partial
- principal: [model] | worker: [model]
- iterations: N | cost: $X | duration: N min
- **worked:** what went right
- **spec_failure:** bad spec or params (if any)
- **worker_failure:** worker misinterpreted clear spec (if any)
- **joel_iterating:** Joel changed direction (if any)
- **eval_refinement:** how eval criteria should change (if any)
```

## Integration with delegate()

The delegate plugin does NOT read or write retro ledgers. Integration flows through Thomas:

**Before delegation:**
1. Identify the relevant ledger for this task type
2. Read ONLY the YAML front matter (500-1000 tokens)
3. Apply settings when generating the TaskSpec:
   - `recommended_workers` -> set `model` field per stage
   - `prompt_rules` -> shape the `prompt` wording
   - `template_loading` -> set `loadStrategy` on references
   - `eval_criteria` -> populate `eval.criteria` with proven sub-criteria
   - `known_failure_modes` -> extract worker-facing mitigations into `learnings` field
   - `cost_benchmark` -> inform `maxIterations` and `timeoutSeconds`
4. Filter the best-practice-spec: only pass worker-facing rules to `learnings`. Thomas-facing items (model selection, eval design) stay with Thomas.

**After delegation:**
The TaskResult contains structured metadata (models used, iterations, costs, eval scores). This data is available to Thomas if Joel invokes `/retro`. Thomas does not auto-retro.

## Rules

- Thomas may suggest a retro but never forces it
- Entries are structured findings, not transcripts
- The best-practice-spec front matter is rewritten on every new entry
- History only loaded on explicit `/retro history` request
- Any work Thomas does can be retroed, not just delegated tasks
