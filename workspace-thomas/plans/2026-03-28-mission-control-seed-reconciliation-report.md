# Mission Control seed reconciliation report

Date: 2026-03-28
Repo: `/home/rancho/aa-cma`
Mission Control app: `/home/rancho/aa-cma/mission-control`

## Outcome

Reconciled the locally seeded Mission Control state against the broader AA design docs and the current MVP dashboard spec.

Result: the local runtime was seeded from the narrower 5-board MVP script, but the fuller AA operating model supports additional shared workstream boards. I updated the AA seed path to include the missing boards `Opportunity to Engagement` and `Features R&D`, applied it idempotently to the live local runtime, and verified the boards now exist in both the API and dashboard UI.

## Authoritative context used

### 1) Broader AA operating model docs
These were the best available sources for the intended board architecture beyond the narrow MVP seed:

- `/home/rancho/aa-cma/docs/aa-org-implementation-map.md`
  - Data architecture defines the core operating flow as:
    - `Contacts -> Accounts -> Opportunities (by Stage) -> Engagements -> Agents`
  - Managed conversations are explicitly tied to `Opportunity` stages and provisioning handoff.
- `/home/rancho/aa-cma/docs/aa-agency-org-design.md`
  - Org chart and domain model establish a standing research/vision function.
- `/home/rancho/aa-cma/docs/aa-agency-org-design-injection.md`
  - Explicitly mentions `R&D pipelines` as in-scope operating work.

### 2) Current Mission Control dashboard spec
- `/home/rancho/aa-cma/workspace-thomas/plans/2026-03-28-mission-control-dashboard-spec.md`
  - This document is authoritative for the launched MVP, but it is intentionally narrower:
    - `Board can represent an agent work surface or a client workstream`
    - initial boards: `Thomas`, `(deprecated) Seneca`, `(deprecated) Aris`, `(deprecated) Arc`, `Felix / Retrofit`
    - optional later boards: `AA Shared Ops` and additional client-specific/workstream boards
    - open question at the end: whether some boards should be shared workstreams instead of only per-agent boards

## Reconciliation finding

The seed/runtime mismatch came from using the MVP seeding script as if it were the full target architecture.

- The live seed script only created 5 boards.
- The broader AA docs support shared workstream boards in addition to agent boards.
- The user-specified missing boards — `Opportunity to Engagement` and `Features R&D` — are consistent with the broader AA model:
  - `Opportunity to Engagement` maps to the documented opportunity-stage -> provisioning -> engagement handoff flow.
  - `Features R&D` maps to the documented research/vision and R&D pipeline function.

## Actual seed path found

The AA Mission Control seed was coming from:

- `/home/rancho/aa-cma/mission-control/backend/scripts/setup_aa_mission_control.py`

Before reconciliation, that script hard-coded only these boards:

- `Thomas`
- `(deprecated) Seneca`
- `(deprecated) Aris`
- `(deprecated) Arc`
- `Felix / Retrofit`

## Change made

Updated `/home/rancho/aa-cma/mission-control/backend/scripts/setup_aa_mission_control.py` so `BOARD_SPECS` now also includes:

- `Opportunity to Engagement`
- `Features R&D`

I kept them under the existing `AA Internal Operations` board group to minimize structural churn while still aligning the seed with the fuller intended operating model.

## Live apply step

Applied the reconciled seed against the running local backend by copying the updated script into the running backend container and executing it with the backend venv Python.

Applied command path:
- copied host file to container: `/app/scripts/setup_aa_mission_control.py`
- executed in container:
  - `./.venv/bin/python -m scripts.setup_aa_mission_control --gateway-url ws://127.0.0.1:18789 --workspace-root /home/rancho/aa-cma --user-email admin@home.local`

Execution result:
- `boards: 7 total, 2 created`
- `custom fields: 4 total, 0 created, 8 new board bindings`

This confirms the apply was idempotent and only created the two missing boards.

## Before vs after

### Before (live API state)
Board groups:
- `AA Internal Operations`
- `Retrofit`

Boards:
- `Thomas`
- `(deprecated) Seneca`
- `(deprecated) Aris`
- `(deprecated) Arc`
- `Felix / Retrofit`

### After (live API state)
Board groups:
- `AA Internal Operations`
- `Retrofit`

Boards:
- `Thomas`
- `(deprecated) Seneca`
- `(deprecated) Aris`
- `(deprecated) Arc`
- `Opportunity to Engagement`
- `Features R&D`
- `Felix / Retrofit`

## Verification evidence

### API verification
Queried `http://localhost:8000/api/v1/boards` with the local auth token.

Observed returned boards:
- `(deprecated) Arc`
- `(deprecated) Aris`
- `Features R&D`
- `Felix / Retrofit`
- `Opportunity to Engagement`
- `(deprecated) Seneca`
- `Thomas`

### UI verification
Ran the existing dashboard verification script:
- `/home/rancho/aa-cma/workspace-arc/devtools_verify_mc.mjs`

Observed dashboard text included:
- `AA Internal Operations`
- `6 boards`
- `(deprecated) Arc`
- `(deprecated) Aris`
- `Features R&D`
- `Opportunity to Engagement`
- `(deprecated) Seneca`
- `Thomas`
- `Retrofit`
- `Felix / Retrofit`

This proves the updated boards are visible in the live local UI, not just present in the database.

## Exact delta reconciled

### Previously seeded model
- purely MVP-oriented
- agent boards for internal roles
- one client board for Retrofit

### Reconciled model now live locally
- retains all MVP agent boards
- retains Retrofit client board
- adds shared internal workstream boards for:
  - opportunity/provisioning/engagement flow
  - internal features research and validation

## Notes

- The dashboard spec in `workspace-thomas/plans/2026-03-28-mission-control-dashboard-spec.md` was not wrong; it was just intentionally scoped to the MVP launch and explicitly left room for later shared workstream boards.
- The seed script had become the de facto truth for runtime state, which is why the broader intended model did not appear locally.
- The seed script in the repo is now corrected. Because the running backend is containerized, I also had to copy the updated script into the live backend container before applying it.

## Final status

Pass.

The local Mission Control runtime now includes the missing intended boards:
- `Opportunity to Engagement`
- `Features R&D`

and the AA seed path has been updated so the corrected board set can be re-applied idempotently.