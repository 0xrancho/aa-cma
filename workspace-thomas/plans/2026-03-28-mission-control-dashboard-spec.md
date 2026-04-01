# Mission Control Dashboard Spec

_Date:_ 2026-03-28
_Owner:_ (deprecated) Arc
_Status:_ Draft spec for implementation planning

## Assumption

The active request to "get the spec and plan done" most likely refers to `ARC-010: Mission Control Dashboard` in `workspace-arc/BACKLOG.md`.

Why this is the most likely target:
- `ARC-010` is the only backlog item explicitly named as a dashboard/spec-worthy build.
- The repo already contains a vendored `mission-control/` application.
- The current architecture and docs are sufficient to produce a grounded implementation plan without guessing at unrelated features.

If that assumption is wrong, this spec should be treated as a Mission Control planning draft, not final scope.

---

## Problem Statement

Arthur & Archie needs an operator-facing control plane where Joel can see:
- each internal agent's current work state
- each client CMA's current work state
- task flow across a standard operating workflow
- gateway/runtime health and agent activity
- approval bottlenecks and rules/audit events

The repo already includes OpenClaw Mission Control, which provides:
- organizations
- board groups
- boards
- tasks
- approvals
- gateways
- agents
- activity feeds
- realtime streams

So the job is not to invent a new dashboard from scratch. The job is to adapt the existing Mission Control architecture to the AA-CMA operating model.

---

## Goals

### Primary goals
- Deploy Mission Control as the operational dashboard for AA-CMA.
- Represent AA-CMA work using existing Mission Control entities wherever possible.
- Give Joel one place to inspect agent work, board state, approvals, and runtime health.
- Support both internal boards (`Thomas`, `(deprecated) Seneca`, `(deprecated) Aris`, `(deprecated) Arc`) and client boards (for example `Felix / Retrofit`).

### Secondary goals
- Expose useful operational telemetry without requiring direct SSH/log digging for routine use.
- Preserve clean upgradeability against the upstream `mission-control/` codebase.
- Avoid a large schema rewrite unless the AA workflow absolutely requires it.

### Non-goals
- Replacing OpenClaw gateway runtime logic.
- Rebuilding task orchestration from scratch.
- Designing a separate custom PM system outside Mission Control.
- Implementing generalized rules-engine infrastructure in this phase.

---

## Current Architecture Findings

These findings are based on the checked-in code and docs.

### Existing platform capabilities
Mission Control already ships with:
- backend API for boards, tasks, agents, approvals, gateways, organizations, activity
- frontend pages for boards, board groups, agents, approvals, gateways, dashboard
- realtime SSE streams for tasks, approvals, board chat, and agents
- gateway-aware coordination and provisioning services
- board snapshots and board-group snapshots

### Current task model constraint
The task model is currently fixed to four statuses:
- `inbox`
- `in_progress`
- `review`
- `done`

This is enforced in backend logic, not just UI.

### Important implication
The backlog asks for a 7-column workflow:
- Planning
- Inbox
- Assigned
- In Progress
- Testing
- Review
- Done

That workflow is not currently expressible as configuration alone. It requires one of these choices:
1. expand the canonical task status model
2. approximate extra columns through metadata/custom fields while keeping 4 statuses
3. postpone 7-column fidelity and launch on the native 4-state model

### Existing AA-friendly concepts
Mission Control already has several primitives that map well to AA-CMA:
- `Organization` can represent AA-CMA as the top-level tenant.
- `BoardGroup` can represent a client or operational cluster.
- `Board` can represent an agent work surface or a client workstream.
- `Task` can represent individual work items.
- `Agent` and `Gateway` already exist as first-class operational objects.
- `Activity` and `Approvals` already support auditability.

---

## Product Decision

## Decision summary

Use Mission Control as the base platform and adapt AA-CMA onto its existing entities. Do **not** build a separate dashboard. Launch in two steps:

### Phase A
Adopt Mission Control with the existing 4-state task model.

### Phase B
Add AA-specific workflow support only if the 4-state model proves materially insufficient.

This is the right structural choice because it minimizes divergence from upstream and gets Joel operational visibility faster.

---

## AA-CMA Domain Mapping

## Organization model
- One Mission Control organization for Arthur & Archie operations.

## Board group model
Use `BoardGroup` for grouped operational context.

Recommended board groups:
- `AA Internal Operations`
- `Retrofit`
- one board group per future client CMA

## Board model
Use `Board` as the primary unit of execution and visibility.

Recommended initial boards:
- `Thomas`
- `(deprecated) Seneca`
- `(deprecated) Aris`
- `(deprecated) Arc`
- `Felix / Retrofit`

Optional later boards:
- `AA Shared Ops`
- additional client-specific boards per function if one client needs multiple workstreams

## Agent model
Attach actual runtime agents to boards where possible.

Recommended mapping:
- one lead agent per board where Mission Control expects lead behavior
- board members/agents for worker or runtime representation

## Gateway model
Register the AA OpenClaw gateway so Mission Control can surface:
- gateway health
- session coordination
- agent lifecycle actions
- realtime board interactions

## Task model
Use Mission Control tasks as the canonical work item visible in the dashboard.

For AA launch, task semantics should be:
- `inbox` = untriaged or queued
- `in_progress` = assigned and actively worked
- `review` = awaiting lead/human review or approval path
- `done` = completed

Use tags/custom fields to carry additional workflow detail before changing the core status system.

---

## Workflow Spec

## MVP workflow
The MVP should use the native status system and interpret it consistently.

### Status definitions
- `inbox`: item exists but is not yet actively being executed
- `in_progress`: item has an owner and is being executed
- `review`: item needs approval, QA, or lead review before completion
- `done`: item is complete

### Supplemental workflow detail via metadata
To approximate AA's richer workflow without backend status changes, add:
- tags for `planning`, `assigned`, `testing`
- or custom fields such as:
  - `execution_stage`
  - `owner_type`
  - `client`
  - `priority_class`

Recommended `execution_stage` custom field values:
- `planning`
- `assigned`
- `testing`
- `review`
- `blocked`

This preserves the backend's 4-state logic while giving the UI and reports enough detail to distinguish work phases.

## Future workflow upgrade
If AA needs true 7-column board movement, then task status must be extended platform-wide.

Proposed future canonical statuses:
- `planning`
- `inbox`
- `assigned`
- `in_progress`
- `testing`
- `review`
- `done`

That is a real product change, not a local dashboard tweak.

---

## Functional Requirements

## FR-1: Board visibility
Joel can view all active boards and board groups from one dashboard.

Acceptance shape:
- internal agent boards visible
- client CMA boards visible
- counts for open work visible

## FR-2: Board detail visibility
Joel can open a board and inspect:
- current tasks
- assignees
- approvals
- comments/chat
- recent activity
- agent presence/health

## FR-3: Runtime awareness
Joel can see whether the gateway and related agents are reachable and active.

Acceptance shape:
- gateway status page configured
- agents page linked to actual AA agents where possible
- realtime updates flow through existing streams

## FR-4: Grouped client visibility
Joel can inspect boards grouped by client or operating domain.

Acceptance shape:
- board groups represent clients/internal clusters
- group snapshot shows sibling board state

## FR-5: Operational workflow support
The dashboard supports AA's task lifecycle without forcing a full workflow-engine rewrite on day one.

Acceptance shape:
- native 4-state model works immediately
- extra workflow nuance captured with tags/custom fields

## FR-6: Approval visibility
Joel can identify work blocked on approval.

Acceptance shape:
- pending approval counts visible
- approval detail tied to relevant board/task

## FR-7: Auditability
Joel can inspect meaningful activity history for debugging and governance.

Acceptance shape:
- task events visible
- agent status changes visible
- board chat and approvals visible
- rules-engine logs can be linked or imported later

---

## Non-Functional Requirements

## NFR-1: Upstream compatibility
Prefer configuration and thin extensions over deep forks.

## NFR-2: Low-friction ops
Local/dev deployment should work via existing documented Docker or local setup.

## NFR-3: Realtime correctness
Realtime feeds should remain source-of-truth aligned with backend state.

## NFR-4: Security
Mission Control should run behind the existing auth mode with non-placeholder tokens and restricted access.

## NFR-5: Incremental extensibility
AA-specific workflow features must be layered in a way that allows later migration to a cleaner upstream-compatible model.

---

## Data Model Decisions

## Decision 1: Use existing task statuses for MVP
Reason:
- lowest implementation cost
- least risk to task rules, approval rules, and SSE behavior
- preserves existing board UI and backend assumptions

## Decision 2: Represent richer workflow via tags/custom fields first
Reason:
- avoids touching core status transitions in multiple backend/frontend files
- gives AA the visibility it wants without destabilizing task logic

## Decision 3: Use board groups for client-level clustering
Reason:
- already supported by platform
- matches AA's need to see grouped client work

## Decision 4: Keep one board per agent/client work surface initially
Reason:
- simple operational mental model
- aligns with backlog language about boards per agent and per client CMA

---

## UX / UI Spec

## Dashboard page
The dashboard should prioritize:
- board/group summaries
- pending approvals
- active agents
- gateway health
- recent activity

If current dashboard already provides most of this, AA customization should be additive, not a redesign.

## Boards page
Should support quick scanning of:
- internal boards
- client boards
- status counts
- links into board detail

## Board detail page
Already supports substantial value and should remain the operational center.

Needed AA-specific adaptations:
- clearer display of AA workflow metadata (`execution_stage`, client tags, blockers)
- optional shortcuts/filters for internal vs client work
- visible relationship between board and board group/client

## Live feed / activity
Should remain enabled and be treated as the operator audit stream.

## Gateway page
Must be configured and used, not ignored. Gateway visibility is core to operating remote agents.

---

## Risks

## Risk 1: 7-column workflow pressure
The backlog specifies seven workflow columns, but the current platform only supports four statuses in backend logic.

Impact:
- medium to high

Mitigation:
- ship on 4-state model first
- add AA workflow metadata
- only extend canonical statuses after proving the need

## Risk 2: Over-forking upstream Mission Control
A heavy AA-specific fork would increase maintenance cost.

Impact:
- high

Mitigation:
- prefer config, seed data, thin UI additions, and optional extension points

## Risk 3: Runtime integration assumptions
Mission Control has gateway-aware code, but AA still needs actual gateway registration and runtime wiring validated.

Impact:
- medium

Mitigation:
- treat gateway registration and connectivity as a first-class implementation track

## Risk 4: Rules engine visibility is not native yet
The backlog mentions integrating rules-engine logs, but this repo does not show an AA rules engine already integrated into Mission Control.

Impact:
- medium

Mitigation:
- scope rules-engine dashboarding as a later phase or lightweight log-ingest panel

## Risk 5: Ambiguous board taxonomy
Too many boards too early will create noise.

Impact:
- medium

Mitigation:
- start with a minimal board topology and expand only when usage demands it

---

## Open Questions

These do not block the spec, but they affect implementation choices.

1. Should AA operate with one organization only, or separate organizations per client?
   - Recommendation: one organization initially, board groups per client.

2. Should each agent always have its own board, or should some boards be shared workstreams?
   - Recommendation: start one board per agent/internal function plus one board per client CMA.

3. Does Joel actually need strict 7-column kanban behavior, or just better visibility into work phase?
   - Recommendation: validate this before changing core status logic.

4. Are rules-engine logs expected inside Mission Control now, or is linking to external logs sufficient for MVP?
   - Recommendation: external link or simple import for MVP.

---

## Recommended Scope Cut

## MVP scope
- deploy Mission Control locally for AA-CMA
- define board groups and boards
- register gateway
- seed or create initial boards for Thomas, (deprecated) Seneca, (deprecated) Aris, (deprecated) Arc, Felix
- use native 4-state workflow
- add tags/custom fields for AA-specific workflow nuance
- validate dashboard, board detail, approvals, gateways, and activity views

## Deferred scope
- true 7-status model
- custom analytics for rules engine logs
- extensive UI redesign
- multi-organization client isolation unless required

---

## Next Steps

1. Approve this scope direction: Mission Control adoption, not replacement.
2. Decide whether MVP ships on 4-state workflow or whether 7-state workflow is mandatory now.
3. Execute the implementation plan in `2026-03-28-mission-control-dashboard-implementation-plan.md`.
