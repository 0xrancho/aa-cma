# Client Agent Onboarding Skill

## Trigger
- "Onboard [name]" / "Start onboarding for [name]"
- "Send the onboarding email to [name]"
- "Set up [name]'s executive agent"
- Any request to begin a new client's agent build process

## Purpose
End-to-end workflow for onboarding a new executive agent client. Generates the AGENT.md schema, builds a branded onboarding schedule, deploys it, sends the initial email, and creates a client group for ongoing work.

## Inputs
- **Client name** (first + last)
- **Client email**
- **Company name** (or mock company name for test environments)
- **Context** — any notes from Joel about the engagement, the client's role, pain points, or what was discussed in the sales conversation

## Execution Steps

### Step 1: Generate AGENT.md Schema
Build a draft AGENT.md for the client's executive agent. Structure:

```yaml
# [Client Name] — Executive Agent

## Identity
- Name, role, company
- Operating context (industry, team size, reporting structure)

## Capabilities
- List of agent roles (sourced from engagement context)
- For each: what it does, what tools it needs, what data it touches

## Memory Architecture
- What the agent should remember long-term
- What's session-ephemeral
- Key relationships and entities to track

## Operating Rules
- Communication preferences
- Decision authority boundaries
- Escalation triggers

## Data Sources
- Systems the agent needs access to (CRM, email, calendar, docs, BI tools)
- Data quality notes (clean, messy, mixed)
- Access requirements (API keys, OAuth, manual export)

## Open Questions
- Anything Thomas couldn't determine from available context
- Flagged for client input
```

Write to `/workspace/group/output/{client-slug}-onboarding/agent-md-schema.md`

### Step 2: Build Onboarding Schedule
Generate a branded HTML schedule page. Five steps:

| Step | Name | Timeline | Owner |
|------|------|----------|-------|
| 1 | Define | Day 1 | Client + Thomas |
| 2 | Review | Day 2 | Joel + Client |
| 3 | Build | Days 3-5 | Thomas |
| 4 | Provision | Day 6 | Joel (physical IT) |
| 5 | Validate | Days 7-10 | Client + Thomas |

Each step has a simple checkbox list of tasks. Use A&A brand system:
- Fonts: Fraunces (display) + Inter (body)
- Colors: blue (#1DA1D4), amber (#F2B35E), charcoal (#3A4A54)
- Password gate with contextual access code
- Title: "Executive Agent Onboarding"

Design reference: the Feng onboarding page at `/workspace/group/output/feng-onboarding/index.html`

Write HTML to `/workspace/group/output/{client-slug}-onboarding/index.html`

### Step 3: Deploy to Netlify
Create a new Netlify site (or use existing if one exists for this client).

Deploy via file digest API:
1. SHA1 hash the HTML file
2. POST `/api/v1/sites` (or `/sites/{id}/deploys` if site exists) with file digest
3. PUT file content to deploy endpoint
4. Verify deploy state is "ready"

Site naming convention: `aa-{client-slug}-onboarding`
Set a contextual password in the HTML gate.

Record the URL and password.

### Step 4: Send Initial Email
Use the golden copy template at `memory/templates/onboarding-email-initial.md`.

Populate variables:
- `[FirstName]` — client's first name
- `[SCHEDULE_URL]` — Netlify URL from Step 3
- `[PASSWORD]` — access code from Step 3

Send from thomas@arthurarchie.com via Gmail API.
- Subject: "Executive Agent Onboarding"
- New thread

### Step 5: Create Client Group
Propose a new NanoClaw group for this client's ongoing agent work:
- Group name: "[Client Name] — Agent Build"
- Folder: `{client-slug}-agent`
- Trigger: `@Thomas`

Flag to Joel for approval before creating. The group will hold:
- Client-specific CLAUDE.md with engagement context
- Memory files for the build process
- Output artifacts

### Step 6: Update Contact + Opportunity Objects
⚠️ memory/graph/ is DEPRECATED. Do NOT create graph files.

1. Confirm Contact at `/workspace/project/contacts/{slug}/state_index.json` — create from schema if missing
2. Confirm Opportunity at `/workspace/project/opportunities/{slug}/state_index.json` — create from schema if missing
3. Add `managed_conversation` block to Contact state_index (group_path, runtime_files, thread_id)
4. Add contact to `/workspace/project/data/managed-conversations.json`
5. Record deliverables in Opportunity state_index (AGENT.md path, onboarding URL, email thread ID)
6. Write `docs/YYYY-MM-DD-kickoff.md` in Opportunity docs/ with YAML frontmatter

### Step 7: Confirm
Brief Telegram message to Joel: "Onboarded [Name]. Email sent, schedule live at [URL]. Client group proposed."

That's it. Don't mirror the email copy. Don't elaborate.

---

## Handoff Definition
Onboarding is complete when:
1. Client has reviewed the AGENT.md schema and provided feedback
2. Joel has had a 1-on-1 with the client to verify requirements
3. Thomas has built custom tools and skills based on verified requirements (HITL with Joel)
4. Joel has completed physical IT setup (miniPC or Docker on client's machine)
5. Agent repo is pulled, environment provisioned, channels and data stores connected

Steps 3-5 are manual for now. No automation exists yet. This skill covers steps 1-2 and the setup work that precedes them.

---

## Voice Rules (for all client-facing copy)
- Cordial, clear, honest. Not cold, not pretentious.
- Introduce Thomas as: "Joel's executive assistant, exactly what we want to build for you"
- First email: "Hi [FirstName]" — replies: just "[FirstName],"
- Include the AI chat prompt so clients can self-qualify:
  > "I am building my own executive agent. Here is how my AI engineering partners suggest I get started. Interview me to see if this is the best fit and how I can improve the plan."
- Commas and semicolons, not em dashes
- No LLM slop (see operating-rules.md negative guide)
- Brief by default. Implicit depth over explicit detail.

## Error Handling
- If Netlify deploy fails, retry with file digest method. If still failing, write HTML locally and send Joel the file path.
- If Gmail send fails, draft the email content in Telegram for Joel to send manually.
- If client context is thin, flag open questions in the AGENT.md rather than guessing.

## Output Location
All artifacts go to `/workspace/group/output/{client-slug}-onboarding/`
