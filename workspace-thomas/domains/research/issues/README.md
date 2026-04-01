# Issues Queue

Structured handoff point between Thomas and the workbench (Aris → Arc pipeline).

## How it works

When Thomas or Joel hits a scope boundary (something too complex for TG, needs research, needs building), an issue file is created here. Aris picks up issues, researches them, and produces plans in `randd/`.

## File format

Each issue is a markdown file named `YYYY-MM-DD-<slug>.md`:

```markdown
---
status: open | researching | planned | resolved
from: thomas | joel
priority: high | medium | low
created: YYYY-MM-DD
---

## Problem
What's blocked or needed.

## Context
Relevant files, links, conversation context.

## Desired outcome
What "done" looks like.
```

## Status flow

1. `open` — created by Thomas or Joel
2. `researching` — Aris is working on it
3. `planned` — Aris has produced a plan in `randd/`
4. `resolved` — work is complete or no longer needed
