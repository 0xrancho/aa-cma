# Domain: Pursuits & Presales

TaskSpec domain value: `pursuits`

## Scope

Multi-stage pipeline for presales documents. Highest-value domain. Each stage is a separate delegate() call chained via `stage.inputFrom`.

## Pipeline Stages

1. **Interview** — Thomas handles directly. Managed conversation with prospect. Output: transcript + narrative extraction. No delegation.

2. **Narrative Synthesis** — delegate
   - Extract structured narrative from interview transcript
   - Output: JSON with pain_points, current_state, desired_state, constraints, decision_criteria, key_quotes
   - Model: Sonnet
   - Eval: structured, threshold 0.8
   - Iterations: 2-3

3. **Scope Generation** — delegate
   - Map narrative to A&A service capabilities
   - Output: recommended_services, scope_items, estimated_build_cost, estimated_monthly_retainer
   - Model: Sonnet
   - References: aa-service-lines.md (full)
   - Eval: structured, threshold 0.7
   - Iterations: 2-3

4. **Content Generation** — delegate (iterates here, small context)
   - Generate section content for pursuit doc template
   - References: template (outline only — headings/structure, ~5K tokens), brand guide (full)
   - Input: scope generation output
   - Model: Sonnet
   - Eval: structured, threshold 0.8
   - Iterations: 3-5

5. **Document Render** — delegate (one pass, mechanical)
   - Inject content JSON into HTML template
   - References: template (full — loaded once)
   - Model: GPT-5.4 (cheap, mechanical)
   - Eval: code mode, `valid_html`
   - Iterations: 1-2

6. **Quality Review** — delegate (one-shot)
   - Review for brand compliance, tone, accuracy, completeness
   - References: brand guide (full)
   - Model: Sonnet
   - Eval: structured, threshold 0.8
   - Iterations: 1

## Cross-Stage Retry

Thomas's cognitive decision, not plugin automation. If Stage 6 review fails, Thomas reads the feedback and re-runs Stage 4 with fix instructions appended. Don't just re-run the same spec.

## Artifact Pattern

Template + data separation:
- Templates: `artifacts/templates/` (HTML with placeholder tokens)
- Data layer: `data/prospects/{opportunity_id}/bd/` (JSON)
- Build step renders HTML from template + data
- Never edit templates for client-specific content — edit the data layer

## Key Optimization

`loadStrategy: "outline"` on templates during content generation keeps context at ~5K tokens instead of ~50K. Full template only loaded once during render stage.

## Cost Target

$8-15 per pursuit doc (down from $75 single-agent approach).
Typical: 7-11 iterations across all stages, 45-90 minutes wall time.

## Joel's Feedback Pattern

Joel gives partial feedback (20-40% of changes per round). Run a feedback interview to classify:
- Which sections are FROZEN (approved)
- Which need changes
- Which are pending review

FROZEN list must name sections by exact heading text. "Don't change anything I didn't mention" does NOT work.

## Retro Ledgers

Best-practice specs at `retro/pursuits/`:
- `presales-pipeline.md`
- `interview-technique.md`
- `scope-generation.md`

Read front matter before generating TaskSpecs.

## Client Context

Shared across domains via `data/prospects/{opportunity_id}/`:
- `enrichment/` — contact and company data
- `conversations/` — interview transcripts, managed conversation state
- `bd/` — pursuits data layer (JSON)
