# Arthur & Archie — Claw Managed Agency

AA-CMA deployment repo. Runs on [ChesedClaw](https://github.com/joelaustin/chesedclaw) infrastructure.

## Agents

| Agent | Role | Model |
|-------|------|-------|
| Thomas Aquinas | Principal / Chief of Staff | Claude Sonnet 4.6 |
| Seneca | Sales Ops & GTM | Claude Sonnet 4.6 |
| Aris (Aristotle) | Information Architect | Claude Sonnet 4.6 |
| Arc (Archimedes) | Master Builder | Claude Sonnet 4.6 |
| Cicero | Demand Gen (future) | TBD |

## Structure

```
workspace-thomas/     Thomas runtime workspace (AGENTS.md, SOUL.md, USER.md)
workspace-seneca/     Seneca workspace + job templates
workspace-aris/       Aris workspace
workspace-arc/        Arc workspace
data/                 Enrichment layer (contacts, accounts, opportunities)
artifacts/templates/  Standard document templates
jobs/                 Shared job template library
skills/crm/           CRM integration skill
openclaw.json5        Gateway config
docs/                 Org design, implementation map
```

## Setup

1. Install ChesedClaw: `npm install -g chesedclaw`
2. Copy `.env.example` to `.env` and fill in credentials
3. Copy `openclaw.json5` to `~/.openclaw/config.json5`
4. Copy workspaces: `cp -r workspace-thomas/* ~/.openclaw/agents/thomas/agent/`
5. Start: `openclaw gateway run`
