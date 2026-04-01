# ChesedClaw Control Plane Spec

_Date:_ 2026-03-29
_Owner:_ Thomas
_Status:_ Draft for Claude Code follow-up

## Purpose

Clarify the intended Arthur & Archie / ChesedClaw deployment architecture now that the distinction between runtime plane and control plane is explicit.

This spec captures the intended operating model so it can be implemented later in Claude Code without relying on conversational memory.

---

## Executive Summary

Arthur & Archie should not be modeled as one flat multi-agent runtime where all agents share the same practical authority and memory boundaries.

Instead, the system should be split into two planes:

1. **CMA Runtime Plane**
   - the deployed managed agency for a specific client or internal environment
   - contains the client-facing principal agent and worker team
   - owns day-to-day workflow execution, artifacts, and operational business context

2. **ChesedClaw Control Plane**
   - the fleet-level supervisory environment across all managed agencies
   - owns host-level administration, provisioning, maintenance, observability, upgrades, and post-go-live stewardship
   - should have secure host access into each CMA deployment

This means:
- Thomas is the principal agent **inside** a CMA during design, build, and pre-go-live operation
- after go-live, the CMA remains the client runtime plane
- ChesedClaw becomes the authoritative control plane over that deployment
- Abraham is the principal control-plane agent inside ChesedClaw
- AA-CMA should lose direct backstage visibility into deployed client environments after handoff, except through approved control-plane pathways

---

## Core Architectural Distinction

## CMA Runtime Plane

A CMA is the runtime environment for one managed agency deployment.

It contains:
- client-specific workspace and files
- principal agent for business operations
- worker agents for research, GTM, implementation, etc.
- client/runtime tools and data integrations
- workflow artifacts and operational provenance

The CMA runtime plane is where the actual managed agency lives.

### Principal runtime agent
For Arthur & Archie deployments, this principal runtime agent is typically **Thomas** during provisioning and pre-go-live operation.

Thomas should:
- be the sole user-facing principal agent for that deployment
- own conversation state and provenance inside the CMA
- delegate to specialist workers
- require workers to report back through Thomas
- present a coherent chief-of-staff surface to the user/client

### Runtime workers
Examples:
- (deprecated) Arc
- (deprecated) Aris
- (deprecated) Seneca
- other specialist agents

These should be treated as subordinate execution contexts, not peer conversational endpoints for the client.

---

## ChesedClaw Control Plane

ChesedClaw is a separate Claw deployment that functions as the control plane across all client-managed agencies.

It contains:
- fleet-level inventory of client CMAs
- deployment metadata
- host access pathways (for example SSH or equivalent admin channel)
- maintenance procedures
- upgrade and migration workflows
- security posture and health routines
- observability and diagnostics
- approved host-level provisioning controls

### Principal control-plane agent
This principal control-plane agent is **Abraham**.

Abraham should:
- operate inside ChesedClaw, not inside a client CMA
- manage host-level and fleet-level administration
- monitor and support deployed CMAs after go-live
- coordinate maintenance, upgrades, tool provisioning, and health checks
- preserve clear provenance for operator/admin actions

Abraham is not the client-facing managed-agency principal. Abraham is the fleet steward.

---

## Lifecycle Model

## Phase 1: Provisioning / Pre-Go-Live

Environment:
- AA-CMA runtime plane

Principal agent:
- Thomas

Responsibilities:
- shape the client operating model
- coordinate implementation work
- provision the managed agency
- refine workflows and access rules
- supervise specialist workers
- produce runtime artifacts and operating documentation

At this phase, Arthur & Archie has full visibility into the runtime because it is still under active buildout.

## Phase 2: Go-Live / Handoff

A handoff boundary must be established.

At handoff:
- the CMA remains the operational environment for the client
- the deployment is registered into ChesedClaw as a managed cell
- control-plane visibility and stewardship shift to ChesedClaw
- AA-CMA no longer retains unrestricted backstage visibility into the deployed environment
- ongoing host-level changes should flow through ChesedClaw and Abraham

## Phase 3: Post-Go-Live Managed Stewardship

Environment:
- ChesedClaw control plane supervising one or more CMA runtime planes

Principal control-plane agent:
- Abraham

Responsibilities:
- monitor host/runtime health
- manage upgrades and migrations
- provision or remove tools
- respond to incidents and diagnostics
- maintain secure access boundaries
- support future growth/configuration of the client deployment

---

## Visibility and Provenance Rules

## Rule 1: Runtime provenance belongs to the CMA principal
Inside a CMA, Thomas owns the canonical business-operational conversation state and provenance.

Workers do not own canonical state. They report back into Thomas.

## Rule 2: Control-plane provenance belongs to ChesedClaw
Host-level and fleet-level administration should be recorded under ChesedClaw / Abraham, not hidden inside runtime-agent activity.

## Rule 3: Handoff reduces backstage visibility
After go-live, AA-CMA should not retain ambient backstage visibility into client runtime internals.

Access should occur only through:
- approved control-plane pathways
- explicit support/maintenance actions
- auditable operator workflows

## Rule 4: Client runtime and control plane must remain distinct
A client-facing principal agent should not also function as the unrestricted host-admin surface.

This separation is required for:
- security
- provenance clarity
- trust boundaries
- serviceability at scale

---

## Conversation and Session Model

## Desired runtime-plane behavior
Inside a CMA:
- users speak to Thomas
- Thomas delegates to workers
- workers write outputs and report back
- Thomas surfaces all results
- workers are not treated as peer endpoints for the client

This must be enforced architecturally over time, not merely suggested by policy.

## Desired control-plane behavior
Inside ChesedClaw:
- operator speaks to Abraham
- Abraham inspects fleet state and client deployment health
- Abraham performs or coordinates host-level operations
- Abraham should have access to deployment metadata and secure host/admin channels

## Anti-pattern to avoid
Do not collapse:
- client runtime principal
- host-level admin
- fleet-level control

into one conversational surface.

That creates confused authority and poor provenance.

---

## Deployment Cell Model

Each client CMA should be treated as a **deployment cell**.

A deployment cell includes:
- client runtime host/VM/hardware
- CMA workspace(s)
- principal runtime agent
- worker agents
- local integrations and data boundaries
- approval and access rules
- deployment metadata registered into ChesedClaw

ChesedClaw should maintain a registry of deployment cells with:
- client identifier
- environment type
- host identity
- gateway identity
- runtime version
- installed tools/capabilities
- health status
- backup status
- last maintenance event
- support notes

---

## Permissions Model

## Thomas inside CMA
Allowed:
- business/workflow operations
- delegation
- artifact production
- client-safe reasoning and orchestration

Not ambiently allowed:
- unrestricted host admin
- fleet-level supervision
- post-handoff backstage access across client environments

## Abraham inside ChesedClaw
Allowed:
- host/runtime inspection
- provisioning and upgrades
- fleet operations
- maintenance tasks
- diagnostics and observability
- secure access into client deployment cells

Should still remain constrained by:
- operator authorization
- auditability
- explicit action boundaries
- no autonomous self-replication or uncontrolled self-modification

---

## Product / Implementation Implications

1. **Thomas as principal must become architectural, not only policy-driven**
   - user entrypoint should default to Thomas inside a CMA
   - worker interactions should route back through Thomas
   - worker outputs must be inspectable and surfaced by Thomas

2. **ChesedClaw needs first-class control-plane primitives**
   - fleet inventory
   - deployment registry
   - secure host access workflows
   - maintenance automation
   - runtime health and observability

3. **Handoff must be explicit**
   - pre-go-live vs post-go-live is a real control boundary
   - ownership and visibility must change at handoff

4. **CMA repo separation was directionally correct**
   - separate repos/workspaces make more sense now as plane boundaries
   - what was missing was the architecture concept, not the instinct

---

## Positioning Implications for Arthur & Archie

This architecture sharpens the business model:

Arthur & Archie is not merely building agent features or internal automations.
Arthur & Archie is deploying **managed agencies** as operational runtime cells for trust-driven firms.

ChesedClaw then serves as the control plane that allows Arthur & Archie to:
- steward those deployments after go-live
- maintain them safely
- improve them over time
- support clients without collapsing runtime and admin boundaries

This reinforces the claim that the offering is:
- not SaaS
- not just custom software
- not just consulting
- a managed operational partnership with distinct runtime and control-plane responsibilities

---

## Questions for Claude Code Follow-Up

1. How should ChesedClaw represent deployment cells in code/config?
2. How should handoff from AA-CMA to ChesedClaw be modeled?
3. What should Abraham's workspace/session structure look like?
4. How should secure host access into each CMA be implemented and audited?
5. How can Thomas-as-principal be enforced more structurally inside a CMA?
6. What metadata and lifecycle events must be persisted at the control-plane layer?
7. How should Telegram/chat routing distinguish runtime-plane vs control-plane sessions?

---

## Bottom Line

The correct architecture is:
- **CMA = runtime plane**
- **ChesedClaw = control plane**
- **Thomas = principal runtime agent**
- **Abraham = principal control-plane agent**

This is the model Arthur & Archie should build toward.
It resolves the confusion between principal agent, host runtime, and fleet stewardship, and it creates the right foundation for client deployments from day one.
