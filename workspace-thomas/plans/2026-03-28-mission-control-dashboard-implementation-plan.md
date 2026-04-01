# Mission Control Dashboard Implementation Plan

_Date:_ 2026-03-28
_Owner:_ (deprecated) Arc
_Related spec:_ `plans/2026-03-28-mission-control-dashboard-spec.md`

## Assumption

This plan assumes the target work is `ARC-010: Mission Control Dashboard` from `workspace-arc/BACKLOG.md`.

## Outcome target

Deliver a working Mission Control deployment for AA-CMA that gives Joel operational visibility across:
- internal agent boards
- client boards
- gateway status
- approvals
- realtime board/task/agent activity

without forcing a premature rewrite of the task lifecycle model.

---

## Executive Plan

### Recommended path
Ship in two layers.

#### Layer 1: Operational adoption
Use Mission Control largely as-is.
- Stand it up
- wire AA gateway
- create the AA board structure
- verify realtime operations
- use tags/custom fields for workflow nuance

#### Layer 2: AA-specific enhancement
Only after Layer 1 is stable:
- add AA workflow metadata displays
- optionally add rules-engine log visibility
- decide whether the 7-column workflow merits a platform-level status expansion

This reduces risk and gets useful visibility online faster.

---

## Workstreams

## Workstream A: Environment and deployment

### Objective
Get Mission Control running reliably in AA-CMA's local/dev environment.

### Tasks
1. Validate deployment mode
   - choose Docker or local for AA dev use
   - recommendation: Docker first for consistency

2. Configure environment files
   - root `.env`
   - `backend/.env`
   - `frontend/.env.local` if needed
   - set `AUTH_MODE=local` or chosen auth mode
   - set strong `LOCAL_AUTH_TOKEN`
   - set `BASE_URL`
   - set `NEXT_PUBLIC_API_URL`

3. Start dependencies
   - Postgres
   - backend
   - frontend

4. Validate health
   - backend `/healthz`
   - frontend loads
   - login/auth works

### Deliverable
A locally running Mission Control instance for AA-CMA.

### Risks
- env mismatch across root/backend/frontend
- auth misconfiguration
- wrong backend URL from frontend auto resolution

---

## Workstream B: AA information architecture in Mission Control

### Objective
Map AA-CMA onto Mission Control objects cleanly.

### Tasks
1. Create organization
   - `Arthur & Archie`

2. Create board groups
   - `AA Internal Operations`
   - `Retrofit`
   - additional client groups only when needed

3. Create boards
   - `Thomas`
   - `(deprecated) Seneca`
   - `(deprecated) Aris`
   - `(deprecated) Arc`
   - `Felix / Retrofit`

4. Define board naming conventions
   - internal boards: plain agent name
   - client boards: `<Agent/Lead> / <Client>` or `<Client> / <Workstream>`

5. Define board objectives/success metrics where supported
   - use existing board fields rather than external ad hoc docs where possible

### Deliverable
A stable board taxonomy that Joel can navigate without ambiguity.

### Risks
- too many boards too early
- client/internal work mixed without clear grouping

### Recommendation
Start minimal. One board per internal agent plus one per active client CMA.

---

## Workstream C: Gateway and runtime integration

### Objective
Connect Mission Control to the actual AA OpenClaw runtime.

### Tasks
1. Register the AA gateway in Mission Control
   - gateway URL
   - token
   - workspace root
   - self-signed toggle if applicable

2. Validate gateway status page
   - gateway reachable
   - command/status path works

3. Verify board-to-gateway relationships
   - boards that need runtime interaction point at the correct gateway

4. Validate agent lifecycle flows already present in platform
   - online/offline updates
   - session connectivity
   - board chat / task notifications where supported

### Deliverable
Mission Control shows real AA runtime state, not just static PM data.

### Risks
- gateway URL/TLS mismatch
- token/auth mismatch
- board records not attached to gateway correctly

---

## Workstream D: MVP workflow model

### Objective
Adopt a workflow AA can use immediately without destabilizing the platform.

### Decision
Use the current canonical statuses for MVP:
- `inbox`
- `in_progress`
- `review`
- `done`

### Supplemental metadata plan
Create tags and/or custom fields for richer stage visibility.

#### Recommended custom field
`execution_stage`
- `planning`
- `assigned`
- `testing`
- `blocked`

#### Recommended tags
- `internal`
- `client`
- `retrofit`
- `blocked`
- `urgent`
- `planning`
- `testing`

### Why this approach
The codebase hard-codes status behavior in backend rules, task transitions, SSE payloads, and board UI. A status expansion touches multiple surfaces and should not be treated as a setup tweak.

### Deliverable
AA gets usable workflow visibility now, while preserving upgradeability.

---

## Workstream E: AA-specific UI adaptation

### Objective
Make existing Mission Control screens legible for AA operations.

### Tasks
1. Review current dashboard page for sufficiency
   - confirm it shows board and approval value
   - identify AA-specific gaps

2. Improve board detail visibility for AA metadata
   - show `execution_stage` clearly
   - show relevant client/internal tags prominently
   - show blockers consistently

3. Ensure board group context is obvious
   - internal vs client grouping visible

4. Keep activity/live feed as the operator audit stream
   - verify task/activity/agent/approval streams in practice

### Deliverable
UI that works for Joel's operating model without a full redesign.

### Risks
- spending too much time polishing before runtime wiring is real

### Recommendation
Do not start with custom UI chrome. Start with useful information density.

---

## Workstream F: Rules-engine visibility

### Objective
Handle the backlog request to integrate rules-engine logs into the dashboard, but without pretending the plumbing already exists.

### Findings
This repo contains Mission Control platform code, but not an obvious AA rules-engine integration already wired into it.

### Plan
#### MVP option
Surface rules-engine logs outside the main data model first:
- link out to log files or a log viewer
- or ingest summarized events into activity as a follow-on task

#### Phase 2 option
Create a proper ingest path for rule allow/deny events:
- normalized event schema
- backend endpoint or importer
- frontend panel/filter in activity/dashboard

### Deliverable
A realistic staged approach instead of vague "integrate logs" language.

---

## Workstream G: Validation and acceptance

### Objective
Prove the dashboard is operationally useful.

### Test checklist
1. Mission Control boots successfully.
2. Login/auth works.
3. Organization/board groups/boards can be created and viewed.
4. Gateway can be registered and shows healthy status.
5. Board detail page shows tasks, approvals, chat, and activity.
6. Realtime streams update task/activity/agent state.
7. Internal boards and client boards are both navigable.
8. AA workflow metadata is visible through tags/custom fields.
9. Joel can identify pending approvals and blocked work.

### Acceptance criteria for ARC-010 MVP
- Joel can see all agent task status in one dashboard.
- each internal agent has a visible board
- each active client CMA has a visible board or grouped board presence
- gateway status is visible
- approvals and activity are visible
- no core status-model rewrite is required for MVP

---

## Implementation Sequence

## Phase 0: Decision lock
### Goal
Freeze the scope before touching code.

### Actions
- approve Mission Control adoption path
- approve MVP on 4-state workflow
- confirm board taxonomy

### Exit criteria
No ambiguity on whether 7-column support is mandatory now.

---

## Phase 1: Stand up Mission Control
### Actions
- configure env
- run backend/frontend/db
- verify health and auth

### Exit criteria
Mission Control is running locally and reachable.

---

## Phase 2: Configure AA structure
### Actions
- create AA organization
- create board groups
- create initial boards
- define naming/objective conventions

### Exit criteria
AA structure exists in the UI and is navigable.

---

## Phase 3: Wire gateway and runtime visibility
### Actions
- register gateway
- validate connectivity
- attach relevant boards
- verify agent/runtime status flows

### Exit criteria
Dashboard reflects actual OpenClaw runtime state.

---

## Phase 4: Add workflow metadata support
### Actions
- create tags/custom fields
- expose them in operational workflows
- verify board detail usability

### Exit criteria
AA can distinguish planning/testing/blocked/etc without changing canonical statuses.

---

## Phase 5: UX tightening
### Actions
- small UI improvements where the AA model is unclear
- no broad redesign

### Exit criteria
Joel can operate without friction or ambiguity.

---

## Phase 6: Optional extensions
### Actions
- rules-engine event visibility
- stronger analytics
- evaluate true 7-status model

### Exit criteria
Only pursued after MVP is stable and useful.

---

## If 7-Column Workflow Is Declared Mandatory Now

If Joel insists on the exact 7-column workflow immediately, scope changes materially.

### Additional backend impact
Likely files impacted include:
- task model/schema definitions
- task API validation and allowed status sets
- task transition rules
- approval gating logic
- board/task snapshot logic
- SSE payload generation where status assumptions exist
- tests for task workflows

### Additional frontend impact
Likely files impacted include:
- board detail page status options
- task board column rendering logic
- list and badge components
- task forms and validation
- any dashboard aggregates based on status buckets
- generated API types after backend schema change

### Recommendation
Do not do this in ARC-010 MVP unless there is a hard operational reason. It is a platform feature change, not simple board setup.

---

## Assumptions

1. Mission Control is the intended implementation surface.
2. AA can tolerate MVP on the native 4-state lifecycle.
3. A single organization with board groups per client is acceptable initially.
4. Gateway registration is feasible with current AA runtime config.
5. Upstream compatibility matters.

---

## Major Risks and Mitigations

## Risk: Scope explosion from status-model rewrite
Mitigation:
- explicitly defer true 7-state workflow unless made mandatory

## Risk: Runtime integration stalls after UI work starts
Mitigation:
- prioritize gateway wiring before UI customization

## Risk: Board taxonomy becomes messy
Mitigation:
- start with minimal board/group model and naming rules

## Risk: Rules-engine integration becomes a phantom requirement
Mitigation:
- split MVP visibility from full ingestion architecture

---

## Concrete Next Steps

1. Thomas approves the assumption that this work is `ARC-010`.
2. Thomas confirms whether 4-state MVP is acceptable.
3. (deprecated) Arc executes Phase 1 and Phase 2 first.
4. After runtime wiring is validated, (deprecated) Arc implements any required AA-specific UI adjustments.
5. Defer status-model expansion until usage proves it necessary.

---

## File-by-File Build Guidance

If implementation proceeds, (deprecated) (deprecated) Arc should work roughly in this order:

1. Environment/config files
   - `mission-control/.env`
   - `mission-control/backend/.env`
   - `mission-control/frontend/.env.local`

2. Seed/config/setup path
   - whichever routes or scripts are used to create organization/board groups/boards/gateway records

3. UI adjustments only after runtime validation
   - dashboard pages
   - board detail surfaces
   - metadata display components

4. Optional later product changes
   - task status model changes across backend/frontend/test surfaces

---

## Definition of Done

This plan is complete when:
- Mission Control is running for AA-CMA
- AA boards and board groups exist and are coherent
- gateway/runtime visibility is real
- Joel can inspect board state, approvals, activity, and agents from one dashboard
- workflow nuance is represented without destabilizing the platform

Not required for done:
- exact 7-column native workflow
- full rules-engine event ingestion
- extensive dashboard redesign
