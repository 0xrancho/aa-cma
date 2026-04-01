# Agent Data Access Rules Engine — Implementation Plan
**Date:** 2026-04-01
**Status:** Ready to execute
**Owner:** Arc (build), Joel (GCP/auth setup)

## Problem

Thomas, Aris, and Arc access Joel's Google Workspace via `gws` CLI with no enforcement layer. Rules exist only in AGENTS.md (prompt-level). A prompt injection or bad tool call could bypass everything. Clients will need provable, infrastructure-level guarantees that agents can't access unauthorized data.

## Solution

**agentgateway** (github.com/agentgateway/agentgateway) — a Rust reverse proxy that sits between agents and tools. Agents connect to the gateway. The gateway checks identity, evaluates CEL policy rules, and only then forwards to the backend. Agents never touch `gws` directly.

- Apache 2.0, Linux Foundation governance
- v1.0.1 (released 2026-03-20)
- 2,300+ stars, contributors from Microsoft, AWS, Apple, Cisco
- CEL-based per-agent RBAC, audit logging, OpenTelemetry

## Architecture

```
Thomas/Aris/Arc (agents)
  │
  ▼
agentgateway (:3000)
  ├─ JWT/API-key identity check
  ├─ CEL policy evaluation (per-agent tool allowlist)
  ├─ Audit log (who called what, when, with what args)
  │
  ├─► gws-joel (Joel's Workspace credentials)
  │     gmail, calendar, drive, sheets, docs
  │
  └─► gws-thomas (Thomas' Workspace credentials)
        gmail, calendar, drive
```

## Critical Correction

The agentgateway research assumed `gws mcp` exists as a native MCP stdio server. **It does not in v0.22.5.** gws is a CLI tool, not an MCP server. This changes the integration approach:

**Option A: Write a thin MCP wrapper around gws CLI**
- Small Node/Python script that exposes gws commands as MCP tools over stdio
- agentgateway spawns this wrapper as a stdio subprocess
- Wrapper translates MCP tool calls → gws CLI commands → returns JSON results
- Effort: ~200-300 lines, straightforward

**Option B: Use google_workspace_mcp as the backend instead of gws**
- github.com/taylorwilsdon/google_workspace_mcp — 2k stars, 30 contributors, actively maintained
- Python MCP server that directly implements Google Workspace APIs
- Already speaks MCP stdio natively — agentgateway can spawn it directly
- Supports OAuth 2.0/2.1, multi-user, stateless mode
- Covers: Gmail, Drive, Calendar, Docs, Sheets, Slides, Forms, Chat, Tasks, Contacts
- Trade-off: We lose gws helper commands (+triage, +send, +reply) but gain native MCP compatibility

**Option C: Wait for gws MCP support**
- gws is actively developed (v0.22.5, 42 releases). MCP support may land soon.
- Risk: Unknown timeline. Could be weeks or months.

**Recommendation: Option A (MCP wrapper around gws) for Phase 1.** We already have gws authenticated for both accounts, the helper commands are excellent, and a thin wrapper preserves that investment. If gws ships native MCP support later, we drop the wrapper.

Evaluate Option B during Phase 1 if the wrapper proves more complex than expected.

## Environment Discovery

gws supports `GOOGLE_WORKSPACE_CLI_CONFIG_DIR` env var for config directory override. This is cleaner than our current HOME hack for multi-account:

```bash
# Instead of:
HOME=/home/rancho/.config/gws-thomas-home gws ...

# Use:
GOOGLE_WORKSPACE_CLI_CONFIG_DIR=/home/rancho/.config/gws-thomas gws ...
```

**Action item during Phase 1:** Test `GOOGLE_WORKSPACE_CLI_CONFIG_DIR`, migrate from HOME override if it works, update `gws-thomas` wrapper script.

## Phase 1: Foundation (Est. 8 hrs Arc + 2 hrs Joel)

### 1.1 Install agentgateway
```bash
curl https://raw.githubusercontent.com/agentgateway/agentgateway/refs/heads/main/common/scripts/get-agentgateway | bash
```

### 1.2 Write MCP wrapper for gws
Create `tools/gws-mcp-bridge/` — a lightweight MCP stdio server that:
- Accepts MCP `tools/list` → returns available gws operations as tools
- Accepts MCP `tools/call` → translates to gws CLI commands → returns JSON result
- Takes config: which gws binary (`gws` or `gws-thomas`), which services to expose
- Runs as stdio subprocess (agentgateway spawns it)

Tool mapping example:
```
MCP tool: gmail_triage       → gws gmail +triage --format json
MCP tool: gmail_read         → gws gmail +read --id {id} --headers --format json
MCP tool: gmail_send         → gws gmail +send --to {to} --subject {subject} --body {body}
MCP tool: gmail_reply        → gws gmail +reply --message-id {id} --body {body}
MCP tool: gmail_draft        → gws gmail +send --to {to} --subject {subject} --body {body} --draft
MCP tool: calendar_agenda    → gws calendar +agenda --format json
MCP tool: calendar_insert    → gws calendar +insert --summary {summary} --start {start} --end {end}
MCP tool: drive_list         → gws drive files list --params '{...}'
MCP tool: drive_read         → gws drive files get --params '{...}'
```

### 1.3 Migrate gws-thomas to CONFIG_DIR
Test and switch from HOME override to `GOOGLE_WORKSPACE_CLI_CONFIG_DIR`:
```bash
# Test
GOOGLE_WORKSPACE_CLI_CONFIG_DIR=/home/rancho/.config/gws-thomas gws auth status

# If works, update /home/rancho/.local/bin/gws-thomas
```

### 1.4 Write agentgateway config
```yaml
# /home/rancho/aa-cma/config/agentgateway.yaml

listeners:
- name: main
  address: 127.0.0.1
  port: 3000

backends:
- mcp:
    targets:
    - name: gws-joel-gmail
      stdio:
        cmd: node
        args: ["tools/gws-mcp-bridge/index.js", "--binary", "gws", "--services", "gmail"]
    - name: gws-joel-calendar
      stdio:
        cmd: node
        args: ["tools/gws-mcp-bridge/index.js", "--binary", "gws", "--services", "calendar"]
    - name: gws-joel-drive
      stdio:
        cmd: node
        args: ["tools/gws-mcp-bridge/index.js", "--binary", "gws", "--services", "drive"]
    - name: gws-thomas-gmail
      stdio:
        cmd: node
        args: ["tools/gws-mcp-bridge/index.js", "--binary", "gws-thomas", "--services", "gmail"]
    - name: gws-thomas-calendar
      stdio:
        cmd: node
        args: ["tools/gws-mcp-bridge/index.js", "--binary", "gws-thomas", "--services", "calendar"]
    - name: gws-thomas-drive
      stdio:
        cmd: node
        args: ["tools/gws-mcp-bridge/index.js", "--binary", "gws-thomas", "--services", "drive"]

# Phase 1: API key auth (simple). Phase 2: migrate to JWT.
authentication:
  apiKey:
    keys:
    - name: thomas
      key: "${THOMAS_API_KEY}"
    - name: aris
      key: "${ARIS_API_KEY}"
    - name: arc
      key: "${ARC_API_KEY}"

mcpAuthorization:
  rules:
  # Thomas: full Gmail (own account), Calendar, Drive
  - 'auth.identity == "thomas" && mcp.tool.target.startsWith("gws-thomas")'
  # Thomas: read-only on Joel's account (with explicit permission)
  - 'auth.identity == "thomas" && mcp.tool.target.startsWith("gws-joel") && mcp.tool.name.contains("read") || mcp.tool.name.contains("triage") || mcp.tool.name.contains("agenda") || mcp.tool.name.contains("list")'
  # Aris: Drive read only (research briefs)
  - 'auth.identity == "aris" && mcp.tool.name.startsWith("drive_") && (mcp.tool.name == "drive_list" || mcp.tool.name == "drive_read")'
  # Arc: Drive read/write (workspace-arc only)
  - 'auth.identity == "arc" && mcp.tool.name.startsWith("drive_")'
  # Seneca: Gmail read + draft only, Calendar read, Drive read/write
  - 'auth.identity == "seneca" && mcp.tool.name == "gmail_triage" || mcp.tool.name == "gmail_read" || mcp.tool.name == "gmail_draft"'
  - 'auth.identity == "seneca" && mcp.tool.name == "calendar_agenda"'
  - 'auth.identity == "seneca" && mcp.tool.name.startsWith("drive_")'

accessLog:
  filter: 'mcp.method == "call_tool"'
  fields:
    add:
      agent_id: 'auth.identity'
      tool_name: 'mcp.resource.name'
      target: 'mcp.tool.target'
      timestamp: 'request.time'
```

Note: CEL expressions above are illustrative. Exact syntax needs validation against agentgateway v1.0.1 docs during implementation. The admin UI at localhost:15000 has a CEL playground for testing.

### 1.5 Test matrix
| Test | Expected |
|---|---|
| Thomas → gmail_triage (own account) | ALLOW |
| Thomas → gmail_send (own account) | ALLOW |
| Thomas → gmail_send (Joel's account) | DENY |
| Thomas → calendar_agenda (Joel's) | ALLOW (read) |
| Aris → gmail_send (any) | DENY |
| Aris → drive_list | ALLOW |
| Aris → drive_write | DENY |
| Arc → gmail_anything | DENY |
| Arc → drive_list | ALLOW |
| Arc → drive_write | ALLOW |
| Unknown API key | DENY all |

### 1.6 Joel setup tasks (not automatable)
- Generate API keys for each agent (random UUIDs, store in `.env`)
- Verify test matrix results
- Review audit logs

## Phase 2: Harden (Est. 6 hrs Arc)

### 2.1 Migrate to JWT auth
- Set up Keycloak or Auth0 (evaluate lightweight options — maybe just a simple JWT issuer)
- Each agent gets a signed JWT with `sub` claim matching their identity
- More secure than API keys: tokens expire, can't be replayed indefinitely

### 2.2 gws service account auth
- Interactive OAuth won't survive process restarts (NanoClaw daemon context)
- Set up service account or headless refresh token flow for both accounts
- Test credential survival across reboots

### 2.3 Argument-level restrictions
CEL can inspect tool arguments:
```yaml
# Block Thomas from forwarding to external domains
- 'auth.identity == "thomas" && mcp.tool.name == "gmail_send" && mcp.tool.arguments["to"].endsWith("@commitimpact.com")'
# Block Felix from accessing HR folder
- 'auth.identity == "felix" && mcp.tool.name == "drive_list" && !mcp.tool.arguments["query"].contains("HR")'
```

### 2.4 Wire into NanoClaw
- Update Thomas' NanoClaw config to connect to agentgateway instead of calling gws directly
- Update AGENTS.md CLI tools section to reference gateway endpoint
- Remove direct gws access from agent environments

## Phase 3: Client Deployment Template (Est. 4 hrs Arc)

### 3.1 Client CMA template
- Parameterized agentgateway config for new client onboarding
- Per-client gws credentials directory
- Default restrictive rules (read-only by default, explicit write grants)
- Audit log retention policy

### 3.2 Retrofit Felix rules
```yaml
felix:
  gmail: [triage, read, draft]     # no send without approval
  calendar: [agenda, insert]        # can schedule but not delete
  drive: [list, read]               # project folders only
  trello: [read, write]             # project boards only
```

### 3.3 Client-facing documentation
- One-pager explaining the enforcement model for client IT teams
- "Your agent physically cannot access tools outside its authorized set"
- Audit log samples showing what monitoring looks like

## Open Issues to Validate

1. **agentgateway #1202** — Connection failures with multiple backends. Test with our 6-target config before depending on it.
2. **agentgateway #1367** — Auth config merging issues. Test with our multi-agent setup.
3. **gws credential persistence** — Verify encrypted credentials survive subprocess spawning by agentgateway. If keyring backend fails in subprocess context, may need `GOOGLE_WORKSPACE_CLI_KEYRING_BACKEND=file`.
4. **Tool count** — gws may expose many tools per service. Need to keep total under MCP client limits (~50-100 tools). The MCP wrapper controls this by only exposing the operations we actually need.

## Dependencies

| Dependency | Status |
|---|---|
| gws installed + authenticated (Joel) | Done |
| gws-thomas installed + authenticated | Done |
| gws skill written | Done |
| agentgateway binary | Not started |
| MCP wrapper for gws | Not started |
| Agent identity system (API keys → JWT) | Not started |

## Success Criteria

### Phase 1
- [ ] agentgateway running, serving MCP endpoint at localhost:3000
- [ ] MCP wrapper translates tool calls to gws commands correctly
- [ ] Thomas can triage/read/send email through gateway
- [ ] Aris CANNOT send email through gateway (blocked + logged)
- [ ] All tool calls appear in audit log with agent identity
- [ ] Full test matrix passes

### Phase 2
- [ ] JWT auth replacing API keys
- [ ] Credentials survive process restarts (headless auth)
- [ ] Argument-level restrictions working (domain filtering, folder restrictions)
- [ ] NanoClaw integration — Thomas routes through gateway in production

### Phase 3
- [ ] Client onboarding template with parameterized config
- [ ] Felix (Retrofit) rules deployed and tested
- [ ] Client-facing documentation delivered
