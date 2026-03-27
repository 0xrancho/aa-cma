# Implementation Plan #1: Plano — Agent Data Access Rules Engine
**Score: 49/60 | Priority: CRITICAL**
**Target: aa-cma + client-cma (both)**

## What It Is

Plano is an AI-native proxy that sits between agents and data sources (email, calendar, CRM, APIs) with request/response filtering, guardrails, and observability. Built on Envoy by core contributors.

## Why It Matters for A&A

Two uses:
- **aa-cma**: Thomas, Seneca, Aris, Arc all access Joel's systems. Rules engine governs what each agent can do.
- **client-cma**: Felix (Retrofit) and future client agents need enforceable boundaries on client data access.

Without this, agent access rules live in AGENTS.md (prompt-level). One prompt injection or bad tool call bypasses everything. Plano moves enforcement to infrastructure.

## Phased Approach

### Phase 0: Rules Engine (Week 1-2) — START HERE
Skip Envoy. Skip OTEL. Build a simple rules engine that validates agent actions before execution.

```
Agent Request → [Rules Engine] → Allowed? → Execute
                                → Denied? → Log + Block
```

Implementation:
- JSON/YAML rules file per agent defining allowed operations
- Simple middleware that checks each tool call against the rules
- Unit tests for every rule (test that Thomas CAN read calendar, test that Aris CANNOT send email)
- Log every allow/deny decision to a local file

Example rules for aa-cma:
```yaml
thomas:
  gmail: [read, draft, send]
  calendar: [read, write]
  drive: [read, write]
  trello: [read]

aris:
  gmail: []
  calendar: []
  drive: [read]  # research briefs only
  web: [search, fetch]

arc:
  gmail: []
  calendar: []
  drive: [read, write]  # workspace-arc only
  exec: [allowed]

seneca:
  gmail: [read, draft]  # drafts only, Thomas sends
  calendar: [read]
  drive: [read, write]
```

Example rules for Retrofit Felix:
```yaml
felix:
  gmail: [read, draft]  # no send without approval
  calendar: [read, write]
  drive: [read]  # project folders only, not HR/finance
  trello: [read, write]  # project boards only
  onedrive: [read]
```

Unit tests:
- `test_thomas_can_send_email()` → pass
- `test_aris_cannot_send_email()` → pass
- `test_felix_cannot_delete_trello_board()` → pass
- `test_felix_cannot_access_hr_drive()` → pass

**Effort:** Arc 12 hrs over 2 weeks
**Dependencies:** None. Can build before gws is set up.
**Output:** Working rules engine with test suite. Deploys as part of ChesedClaw instance.

### Phase 1: Integrate with GWS + Data Sources (Week 3-4)
Once gws CLI and API tokens are configured, wire the rules engine into the actual data flow:
- Rules engine validates before `gws` commands execute
- Same for Trello API calls and OneDrive API calls
- Test against real aa-cma data (Joel's Workspace)
- Test against Retrofit data (Jeremy's systems)

**Effort:** Arc 8 hrs
**Dependencies:** GWS CLI configured (Plan #3 Phase 1 complete)

### Phase 2: Plano Proxy (Month 2-3) — OPTIONAL UPGRADE
If the rules engine works well and client volume justifies it, upgrade to full Plano:
- Out-of-process proxy (no more middleware, standalone service)
- OTEL tracing for compliance reporting
- Agentic Signals for monitoring
- Dashboard for Joel to see all agent-to-client-data interactions

Only do this when:
- Client #2 or #3 is onboarding and their IT team asks about data governance
- Joel needs a monitoring dashboard (mission control)
- Rules engine becomes too complex for YAML files

**Effort:** Arc 20 hrs over 4 weeks
**Dependencies:** Rules engine proven in production, client volume justifies investment

### Phase 3: Mission Control Dashboard (Month 3-4) — FUTURE
Build or adopt a monitoring interface showing:
- All agent actions across all CMAs
- Rule violations and blocks
- Data access patterns per agent per client
- Cost tracking per CMA instance

This is where Plano's OTEL traces feed into something Joel can actually look at.

**Effort:** TBD based on dashboard approach (build vs buy)
**Dependencies:** Phase 2 Plano proxy running

## Risk Assessment

- **Phase 0 risk: Low** — simple rules file + unit tests. Worst case it's a validated config that informs AGENTS.md.
- **Phase 1 risk: Low** — wiring existing rules into real API calls. Straightforward middleware.
- **Phase 2 risk: Medium** — Envoy configuration learning curve. Only take on when justified.
- **Phase 3 risk: Medium** — Dashboard build could scope-creep. Define MVP first.

## Success Criteria

### Phase 0
- [ ] Rules YAML for aa-cma agents (Thomas, Seneca, Aris, Arc)
- [ ] Rules YAML for Retrofit Felix
- [ ] Unit test suite with 100% rule coverage
- [ ] Every deny decision logged

### Phase 1
- [ ] Rules engine validates real gws/Trello/OneDrive calls
- [ ] Zero unauthorized access in 30 days of operation
- [ ] Joel can review access logs

### Phase 2+
- [ ] Client IT team satisfied with data governance answer
- [ ] Joel can see all agent activity in one place
