# Enrichment Architecture — Standing Pattern

Established: 2026-03-02
Updated: 2026-03-06 (migrated to Contact/Account/Opportunity/Engagement model)
Approved by: Joel

## Problem

Joel regularly runs prospects through enrichment and scraping tools (Firecrawl, AgenticForms CEB pipeline, brand-extractor) during the sales journey. That data needs to be accessible during meeting prep and email responses without creating stale duplicates that drift from source.

## Architecture (Post-Migration)

The three-layer model (Source Projects / CRM / Memory Graph) is superseded by the Contact/Account/Opportunity/Engagement object model. The new schema provides deterministic, traversal-based context assembly with no vector DB needed.

### Layer 1: Source Projects (Canonical — unchanged)
- `agenticforms/ceb/output/{company}/` — CEB interview data, enrichment, transform, brief HTML
- `agenticforms/case-studies/{company}/` — Case study interview data, output
- `brand-extractor/output/{company}/` — Firecrawl scrapes, brand assets
- These are the source of truth for enrichment data. Referenced via `sources` arrays in enrich objects. Never copied.

### Layer 2: CRM (Pipeline + Summary — unchanged)
- Airtable SF-Opportunities table is the pipeline management layer
- `local_slug` field links Airtable records to local filesystem objects

### Layer 3: Knowledge Layer (replaces Memory Graph)
- **Contacts** at `/workspace/project/contacts/{slug}/` — person-level data, managed conversation state
- **Accounts** at `/workspace/project/accounts/{slug}/` — company-level data, CEB findings
- **Opportunities** at `/workspace/project/opportunities/{slug}/` — deal-level data, deliverables, decision logs
- **Engagements** at `/workspace/project/engagements/{slug}/` — active delivery (promoted from Opportunity on Closed-Won)

Each object has:
- `state_index.json` — manifest with Airtable IDs, file pointers, stage, load instructions
- `enrich/*.json` — structured enrichment data with `sources` arrays pointing to Layer 1
- `docs/*.md` — narrative docs with YAML frontmatter

### Context Assembly

1. Identify master object (Contact, Account, Opportunity, or Engagement)
2. Load `state_index.json` -> get file pointers
3. Load all files in `files_to_load`
4. Scan `docs/` frontmatter -> load full content only for task-relevant docs
5. Optionally load linked objects
6. Assemble context payload

## CEB as the Enrichment Layer

CEB (Client Experience Brief) is the enrichment engine. Joel runs prospects through it to convert raw elicitation into structured inputs via the A&A growth engineering methodology.

- If CEB exists -> referenced in enrich object `sources` array. Pull from it.
- If no CEB -> work with what's in the enrich objects. Don't guess.
- When Joel runs a CEB: update Opportunity `enrich-opportunity.json` sources + Account `enrich-account.json` sources.

## Rules

- Reference, don't copy. Enrich objects point to source files via `sources` arrays.
- Source projects stay canonical. Enrichment tools own the data.
- CRM owns pipeline stage. Knowledge layer owns relationship context.
- `state_index.json` is the single manifest. If it's not in a state_index, it doesn't exist in the system.
- Memory graph nodes are DEPRECATED. Do not create new ones.
