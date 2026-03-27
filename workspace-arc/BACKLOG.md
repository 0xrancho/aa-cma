# Arc Backlog — aa-cma
**Last updated:** 2026-03-27
**Owner:** Arc (Builder) | Overseen by Thomas

## Backlog Rules

### Priority Legend
- P0 = Blocks Retrofit launch or aa-cma operations. Do now.
- P1 = Needed before client #2. Do this month.
- P2 = Strategic improvement. Schedule when P0/P1 clear.
- P3 = Nice to have. Backlog for later.

### Task Ownership & Execution Model
Every task has an explicit owner: `Joel` or `Arc`.

**Joel tasks** are provisioning or access tasks that block Arc. They include:
- Credentials, API keys, OAuth consent
- Physical hardware setup (Mac Mini)
- Client relationship actions (meetings, approvals)
- GCP console app creation
- Any action requiring Joel's accounts or admin access

Joel tasks must be completed and validated BEFORE dependent Arc tasks enter the queue. Thomas tracks Joel blockers and reminds proactively.

**Arc tasks** are autonomous build tasks. Arc executes independently with:
- Clear spec and acceptance criteria
- All dependencies resolved (Joel tasks done, access validated)
- No collaborative build sessions with Joel. Ever.
- Reports completion to Thomas when done.

**Validation step:** Before any Arc task starts, Thomas confirms all upstream Joel tasks are done and access is verified. "Arc has access" means tested, not assumed.

### Standing Rules for Arc
- Never build without a plan approved by Thomas
- Never touch aa-cma production without Joel's explicit approval
- Always write tests for infrastructure changes
- Report completion to Thomas, not directly to Joel
- Run silently in background. Thomas reports to Joel.

---

## P0 — Retrofit Launch (Target: April)

### JOEL-001: Create GCP Console App (Retrofit)
**Owner:** Joel | **Effort:** 1 hr
**Blocks:** ARC-001
- Create GCP project for Retrofit (Jeremy's org)
- Configure OAuth consent screen
- Set scopes: Gmail (read/draft), Calendar (read/write), Drive (read)
- Generate OAuth client credentials
- Share credentials with Thomas for env doc
**Validation:** `gws auth login` succeeds with Jeremy's credentials

### JOEL-002: Create GCP Console App (aa-cma)
**Owner:** Joel | **Effort:** 1 hr
**Blocks:** ARC-001
- Create GCP project for A&A
- Configure OAuth consent screen
- Set scopes: Gmail, Calendar, Drive, Sheets
- Generate OAuth client credentials
**Validation:** `gws auth login` succeeds with Joel's credentials

### JOEL-003: Collect Retrofit API Tokens
**Owner:** Joel | **Effort:** 30 min
**Blocks:** ARC-002, ARC-003
- Get Trello API token from Jeremy (already has account access)
- Get OneDrive API token / Microsoft Graph app registration from Jeremy
- Document all tokens in env doc
**Validation:** Each token tested with a simple API call

### JOEL-004: Provision Mac Mini for Retrofit
**Owner:** Joel | **Effort:** 2 hrs
**Blocks:** ARC-008
- Physical Mac Mini setup
- OS + Node.js + ChesedClaw installed
- Network configured (Tailscale or direct)
- SSH access confirmed
**Validation:** Joel can SSH into Mini. ChesedClaw responds.

### JOEL-005: Schedule Retrofit UAT Call with Jeremy
**Owner:** Joel | **Effort:** 15 min
**Blocks:** ARC-007
- Book 1-hour call with Jeremy for live UAT
- Create TG group with Jeremy for demo
- Share UAT script with Jeremy in advance
**Validation:** Call scheduled, TG group created

---

### ARC-001: Install gws CLI + Configure OAuth
**Owner:** Arc | **Effort:** 4 hrs
**Depends on:** JOEL-001, JOEL-002 ✅ validated
- Install `gws` CLI on dev Lenovo
- Configure OAuth for Joel's Workspace (aa-cma)
- Configure OAuth for Jeremy's Workspace (Retrofit)
- Test: `gws gmail list`, `gws calendar agenda`, `gws drive list` on both
- Document auth flow for future client onboarding
**Acceptance:** `gws` returns real data from both Workspaces

### ARC-002: Trello API Integration
**Owner:** Arc | **Effort:** 4 hrs
**Depends on:** JOEL-003 ✅ validated
- Create `skills/trello/SKILL.md` wrapper
- Implement: read boards, read/write cards, read/write comments
- Test against Jeremy's project boards
- Structured JSON output for Felix consumption
**Acceptance:** Felix can read and update Trello project cards

### ARC-003: OneDrive Integration
**Owner:** Arc | **Effort:** 4 hrs
**Depends on:** JOEL-003 ✅ validated
- Microsoft Graph API OAuth setup
- Create `skills/onedrive/SKILL.md` wrapper
- Implement: read project files, list folders
- Test against Jeremy's project documents
**Acceptance:** Felix can read project files from OneDrive

### ARC-004: gws Agent Skills for Felix
**Owner:** Arc | **Effort:** 6 hrs
**Depends on:** ARC-001
- Create `skills/gws-calendar/SKILL.md` — project scheduling, deadlines
- Create `skills/gws-gmail/SKILL.md` — project email, client comms
- Create `skills/gws-drive/SKILL.md` — project docs, deliverables
- Customize each for Retrofit context (Jeremy's workflows, project types)
- Test each skill end-to-end
**Acceptance:** Felix can manage Jeremy's calendar, email, and Drive via skills

### ARC-005: Rules Engine v0
**Owner:** Arc | **Effort:** 12 hrs
**Depends on:** None (can start immediately)
- Define YAML rules schema
- Build middleware that validates tool calls against rules
- Write rules for aa-cma agents (Thomas, Seneca, Aris, Arc)
- Write rules for Retrofit Felix
- Unit test suite: 100% rule coverage
- Log every allow/deny to local file
**Acceptance:** All unit tests pass. No unauthorized action possible without rule change.

### ARC-006: Felix Instance Bootstrap
**Owner:** Arc | **Effort:** 4 hrs
**Depends on:** ARC-001 through ARC-005 all complete
- Use ChesedClaw Provisioning tool to bootstrap Felix instance
- Load env doc with all credentials and config
- Provision Telegram gateway for Felix
- Install Felix skills (gws, Trello, OneDrive, rules engine)
- Wire USER.md for Jeremy
- Configure AGENTS.md for Felix persona and capabilities
**Acceptance:** Felix responds in Telegram with access to all three data sources

### ARC-007: Retrofit UAT Script
**Owner:** Arc | **Effort:** 4 hrs
**Depends on:** ARC-006, JOEL-005
- Write test cases covering all Felix capabilities:
  - Calendar: schedule meeting, check availability, block time
  - Gmail: read inbox, draft reply, filter by project
  - Drive: find document, list project folder
  - Trello: read board, update card, add comment
  - OneDrive: read project file
  - Rules: verify Felix cannot access non-project data
- Format for live TG demo with Jeremy
**Acceptance:** All test cases pass in TG group. Jeremy confirms functionality.

### ARC-008: Mac Mini Migration
**Owner:** Arc | **Effort:** 4 hrs
**Depends on:** ARC-007 (UAT passed), JOEL-004 ✅ validated
- Migrate Felix instance from Lenovo to Mac Mini
- Install `gws` CLI on Mini, reconfigure OAuth
- Verify all data connections work from Mini
- Verify Telegram gateway works from Mini
**Acceptance:** Felix fully operational on Mac Mini. Joel has SSH access.

### ARC-009: Observability + SOPs
**Owner:** Arc | **Effort:** 4 hrs
**Depends on:** ARC-008
- Rules engine logs accessible to Joel via SSH
- SOP doc for Joel: check Felix health, restart, review logs
- SOP doc for Jeremy: interact with Felix, escalation path
- Alerting: if Felix goes down, Thomas notifies Joel
**Acceptance:** Joel can independently monitor and manage Felix.

---

## P1 — Before Client #2

### JOEL-006: Mission Control Evaluation Session
**Owner:** Joel | **Effort:** 1 hr
**Blocks:** ARC-010
- Joel reviews openclaw-mission-control (abhi1693) demo
- Decides: adopt as-is, fork and customize, or build our own
- Defines which agents get their own kanban board
**Validation:** Decision made, approach documented

### ARC-010: Mission Control Dashboard
**Owner:** Arc | **Effort:** 12 hrs
**Depends on:** JOEL-006
- Deploy openclaw-mission-control (or fork)
- Configure kanban board per agent: Thomas, Seneca, Aris, Arc
- Configure kanban for each client CMA: Felix (Retrofit)
- 7-column workflow: Planning → Inbox → Assigned → In Progress → Testing → Review → Done
- Wire into ChesedClaw gateway for real-time agent events
- Integrate rules engine logs into dashboard
**Acceptance:** Joel can see all agent task status in one dashboard. Each agent has its own board.

### ARC-011: gws Agent Skills for aa-cma
**Owner:** Arc | **Effort:** 6 hrs
**Depends on:** ARC-001
- Thomas skills: calendar management, email orchestration, Drive organization
- Seneca skills: prospect email tracking, proposal management
- Same gws CLI, different agent rules
**Acceptance:** Thomas can manage Joel's calendar and email via gws skills

### ARC-012: Rules Engine → Plano Upgrade
**Owner:** Arc | **Effort:** 20 hrs
**Depends on:** Rules engine proven in Retrofit production
- Evaluate whether YAML rules engine is sufficient or needs proxy upgrade
- If upgrading: install Plano, migrate rules to filter chains
- Add OTEL tracing
- Only if client #2 IT team requires infrastructure-level data governance
**Acceptance:** Agent data access enforced at proxy level with audit trail

### ARC-013: Client Onboarding Template
**Owner:** Arc | **Effort:** 8 hrs
**Depends on:** Retrofit launch complete
- Extract Retrofit deployment steps into reusable template
- Parameterize: client name, data sources, agent persona, rules
- Joel provisioning checklist auto-generated per client
- Arc task queue auto-generated from template
- Document what's manual vs automatable
**Acceptance:** Client #2 onboarding takes 50% less time than Retrofit

### ARC-014: MiniMax Skills Integration
**Owner:** Arc | **Effort:** 6 hrs
**Depends on:** None
- Import PDF, PPTX, XLSX generation skills from MiniMax-AI/skills
- Test document generation for client deliverables
- Integrate into Felix and Thomas skill sets
**Acceptance:** Agents can generate professional PDFs and presentations

---

## P2 — Strategic

### JOEL-007: Methodology Extraction Session
**Owner:** Joel | **Effort:** 4 hrs
**Blocks:** ARC-015
- Block 4 hours to document top 3 consulting methodologies
- Thomas facilitates extraction, captures in structured format
**Validation:** 3 methodologies documented and reviewed

### ARC-015: Spec-Kit Methodology Encoding
**Owner:** Arc | **Effort:** 24 hrs
**Depends on:** JOEL-007
- Install Spec-Kit, create aa-professional-services preset
- Encode Joel's methodologies as templates
- Map to agent workflow phases
- Test against next client engagement
**Acceptance:** Arc can build CMA from spec without Joel hand-holding

### ARC-016: Agent Router Model
**Owner:** Arc | **Effort:** 8 hrs
**Depends on:** Multiple CMAs running
- Evaluate local vs cloud routing for cost optimization
- Test with aa-cma workload patterns
- Deploy if >20% cost reduction demonstrated
**Acceptance:** Measurable API cost reduction without quality loss

### ARC-017: Understand Anything Integration
**Owner:** Arc | **Effort:** 4 hrs
**Depends on:** Client projects with legacy codebases
- Install for codebase analysis
- Use on client legacy systems before modernization
**Acceptance:** Arc can generate knowledge graph of client codebase

---

## P3 — Future

### ARC-018: OpenSpace Self-Evolving Skills
**Effort:** TBD | Validate claims before investing

### ARC-019: Auto Dream Memory Integration
**Effort:** TBD | ChesedClaw compatibility evaluation needed

### ARC-020: Microsoft 365 Integration
**Effort:** TBD | Build when first M365 client onboards

---

## Roadmap

```
WEEK OF MARCH 31 (now)
  Joel: JOEL-001 + JOEL-002 (GCP console apps)
  Joel: JOEL-003 (Retrofit API tokens)
  Arc: ARC-005 (rules engine — no blockers, start now)

WEEK OF APRIL 7
  Joel: validates Arc has access to both Workspaces
  Arc: ARC-001 (gws setup) + ARC-002 (Trello) + ARC-003 (OneDrive)

WEEK OF APRIL 14
  Arc: ARC-004 (Felix skills) + ARC-006 (Felix bootstrap)
  Joel: JOEL-004 (Mac Mini) + JOEL-005 (schedule UAT call)

WEEK OF APRIL 21
  Arc: ARC-007 (UAT script)
  Joel + Jeremy: UAT call
  Arc: ARC-008 (Mac Mini migration)

WEEK OF APRIL 28
  Arc: ARC-009 (observability + SOPs)
  → RETROFIT GO-LIVE

MAY
  Joel: JOEL-006 (Mission Control eval)
  Arc: ARC-010 (Mission Control) + ARC-011 (aa-cma skills) + ARC-014 (MiniMax)
  Arc: ARC-013 (onboarding template)

JUNE+
  Joel: JOEL-007 (methodology session)
  Arc: ARC-015 (Spec-Kit) + strategic items
```
