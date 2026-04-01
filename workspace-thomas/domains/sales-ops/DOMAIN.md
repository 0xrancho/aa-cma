# Domain: Sales & Operations

TaskSpec domain value: `sales_ops`

## Scope

High-frequency, low-complexity execution. Most tasks are single-iteration delegation.

- Contact enrichment (Apollo lookups, LinkedIn data)
- Email composition (prospect outreach, follow-ups, cold campaigns)
- Calendar operations (scheduling, availability checks, family admin)
- CRM reads and writes (Airtable)
- Content publishing (articles, social posts, GTM calendar)
- Data processing (CSV transforms, list cleanup)

## Data Paths

- CRM records: `data/contacts/`, `data/accounts/`, `data/opportunities/`
- Enrichment: `data/prospects/{opportunity_id}/enrichment/`
- Conversations: `data/prospects/{opportunity_id}/conversations/`
- Managed conversations registry: `data/managed-conversations.json`

CRM is dumb SOT. Airtable holds record IDs and kanban state only. Local system holds relationships, enrichment, semantic data. Keyed to CRM record IDs. Agent writes back standard meta only.

## Delegation Patterns

**Enrichment:**
- Model: cheap (Haiku or GPT-5.4)
- Tools: apollo_search, file_read, file_write
- Eval: code mode, `enrichment_rate` (>= 80% rows enriched)
- Iterations: 2-3

**Email drafting:**
- Model: Sonnet (needs tone calibration)
- Tools: file_read, file_write
- References: brand guide (summary), prospect enrichment (full)
- Eval: structured mode, threshold 0.8
- Iterations: 2-3

**CRM operations:**
- Model: Haiku (mechanical)
- Tools: exec (curl to Airtable API)
- Eval: code mode, custom checks per operation
- Iterations: 1-2

**Calendar operations:**
- Model: GPT-5.4 (reliable for scheduling logic)
- Tools: calendar_read, calendar_write
- Eval: code mode, `events_created`
- Iterations: 1-2

## Retro Ledgers

Best-practice specs at `retro/sales-ops/`:
- `contact-enrichment.md`
- `scheduling.md`
- `email-outreach.md`
- `social-posting.md`
- `family-admin.md`

Read front matter before generating TaskSpecs.
