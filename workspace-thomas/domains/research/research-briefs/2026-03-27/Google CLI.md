# Implementation Plan #3: Google Workspace CLI + Client Data Integration
**Score: 48/60 | Priority: HIGH**
**Target: aa-cma + client-cma (both)**

## What It Is

`gws` is a universal CLI for all Google Workspace APIs (Gmail, Drive, Calendar, Sheets, Docs, Chat, Admin). Dynamically built from Google's Discovery Service — when Google adds an API endpoint, gws picks it up automatically. 40+ agent skills included. Structured JSON output purpose-built for AI consumption.

## Why It Matters for A&A

Two uses:
- **aa-cma**: Thomas manages Joel's calendar, email, Drive. Structured CLI instead of fragile web automation.
- **client-cma**: Retrofit Felix needs Gmail, Calendar, Drive access. Future clients same. gws is the standard integration layer.

This is upstream of Plano — you need the data connections working before you add rules enforcement.

## Phased Approach

### Phase 1: GCP Console App + gws Setup (Week 1)
**This is also step 2 of Retrofit deployment.**

For aa-cma (Joel's Workspace):
```bash
npm install -g @googleworkspace/cli
gws auth setup  # walks through GCP console app creation
```
- Create GCP project for A&A
- Configure OAuth consent screen
- Set scopes: Gmail, Calendar, Drive, Sheets
- Test basic commands against Joel's Workspace

For Retrofit (Jeremy's Workspace):
- Create separate GCP console app (Jeremy's org)
- Jeremy grants OAuth consent for Felix's access
- Scope to project-relevant data only
- Test basic commands against Jeremy's Workspace

**Effort:** Joel 4 hrs (GCP setup + OAuth), Arc 4 hrs (CLI config + testing)
**Output:** Working `gws` access to both Workspaces

### Phase 2: Agent Skill Integration (Week 2-3)
Import and customize gws agent skills for ChesedClaw:

**For Thomas (aa-cma):**
- Calendar: schedule meetings, check availability, block time
- Gmail: filter, prioritize, draft replies
- Drive: organize deliverables, find documents

**For Felix (Retrofit):**
- Calendar: project scheduling, deadline tracking
- Gmail: project communication, client correspondence
- Drive: project documents, deliverables
- Sheets: project tracking, status reports

Create ChesedClaw skill wrappers:
```
skills/
  gws-calendar/SKILL.md    — calendar management via gws
  gws-gmail/SKILL.md       — email management via gws
  gws-drive/SKILL.md       — document management via gws
```

Each skill wraps `gws` commands with agent-appropriate defaults and permissions.

**Effort:** Arc 10 hrs, Thomas 4 hrs (testing)
**Output:** Working agent skills for Workspace access

### Phase 3: OneDrive + Trello Integration (Week 2-3, parallel)
gws handles Google Workspace. These need separate integration:

**Trello:**
- REST API with token auth
- Felix needs: read boards, read/write cards, read/write comments
- Create skill wrapper: `skills/trello/SKILL.md`
- Test against Jeremy's project boards

**OneDrive:**
- Microsoft Graph API with OAuth
- Felix needs: read project files
- Create skill wrapper: `skills/onedrive/SKILL.md`
- Test against Jeremy's project folders

**Effort:** Arc 8 hrs
**Output:** Working Trello + OneDrive skills for Felix

### Phase 4: Wire into Rules Engine (Week 3-4)
Once data connections work and rules engine exists (Plan #1 Phase 0):
- Every `gws` command goes through rules validation
- Every Trello/OneDrive call goes through rules validation
- Test full pipeline: agent request → rules check → API call → response

**Effort:** Arc 4 hrs
**Dependencies:** Plan #1 Phase 0 complete

## Dependency Map

```
Phase 1: GCP + gws setup ──────────────────┐
Phase 3: Trello + OneDrive setup ──────────┤
                                            ↓
Phase 2: Agent skill integration ──→ Phase 4: Wire into rules engine
                                            ↓
                                    Retrofit UAT ready
```

## Risk Assessment

- **OAuth complexity: Medium** — GCP console setup has steps. Joel needs to do this with Jeremy present or with Jeremy's admin credentials.
- **gws stability: Medium** — "Not an officially supported Google product." Community maintained. Could break.
- **API quotas: Low** — Professional services agents won't hit Google rate limits.
- **OneDrive OAuth: Medium** — Microsoft Graph auth is notoriously fiddly. Budget extra time.

## Success Criteria

### Phase 1
- [ ] `gws gmail list` returns Joel's recent emails
- [ ] `gws calendar agenda` returns Joel's schedule
- [ ] Same commands work against Jeremy's Workspace

### Phase 2
- [ ] Thomas can schedule a meeting via skill
- [ ] Felix can read Jeremy's project emails via skill
- [ ] Structured JSON output parsed correctly by agents

### Phase 3
- [ ] Felix can read Jeremy's Trello boards
- [ ] Felix can read Jeremy's OneDrive project files

### Phase 4
- [ ] Rules engine blocks Felix from non-project data
- [ ] All API calls logged with allow/deny status
