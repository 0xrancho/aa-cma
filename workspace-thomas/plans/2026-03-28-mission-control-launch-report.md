# Mission Control Launch Report

_Date:_ 2026-03-28
_Executor:_ (deprecated) Arc

## Outcome

**Status:** substantially complete, with stack running and AA seed applied in the live local runtime.

Mission Control backend, frontend, Postgres, and Redis are up locally. The AA setup/seeding path was made available inside the backend runtime, executed successfully against the live database, and verified through the running API.

## What was launched

### Services
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Backend health: `http://localhost:8000/healthz`
- Postgres: `127.0.0.1:5432`
- Redis: `127.0.0.1:6379`

### Docker services running
- `openclaw-mission-control-backend-1`
- `openclaw-mission-control-frontend-1`
- `openclaw-mission-control-db-1`
- `openclaw-mission-control-redis-1`
- `openclaw-mission-control-webhook-worker-1`

## Code/runtime change made

### Backend runtime fix
The backend image previously did **not** copy `backend/scripts/*.py` into the container, which meant the new AA setup script could not exist in runtime even after rebuilds.

Changed:
- `mission-control/backend/Dockerfile`

Added copy step:
- `COPY --chown=appuser:appgroup backend/scripts/*.py ./scripts/`

This was the minimal required runtime fix to make the new setup script available inside the real backend container.

## Commands run

### Rebuild images
```bash
cd /home/rancho/aa-cma/mission-control
docker compose -f compose.yml --env-file .env build backend frontend webhook-worker
```

### Relaunch stack
```bash
docker compose -f compose.yml --env-file .env up -d --force-recreate
```

### Health verification
```bash
docker compose -f compose.yml ps
curl -sf http://127.0.0.1:8000/healthz
curl -I -s http://127.0.0.1:3000/
```

### Confirm setup script exists in runtime
```bash
docker compose -f compose.yml exec -T backend sh -lc 'ls -la /app/scripts'
```

### Run AA setup/seed in live backend container
```bash
docker compose -f compose.yml exec -T backend sh -lc \
  '/app/.venv/bin/python /app/scripts/setup_aa_mission_control.py \
  --gateway-url ws://127.0.0.1:18789 \
  --workspace-root /home/rancho/aa-cma'
```

### Re-run idempotently and bind to local Mission Control user
```bash
docker compose -f compose.yml exec -T backend sh -lc \
  '/app/.venv/bin/python /app/scripts/setup_aa_mission_control.py \
  --gateway-url ws://127.0.0.1:18789 \
  --workspace-root /home/rancho/aa-cma \
  --user-email admin@home.local'
```

### API validation
```bash
curl -H 'Authorization: Bearer <LOCAL_AUTH_TOKEN>' http://127.0.0.1:8000/api/v1/users/me
curl -H 'Authorization: Bearer <LOCAL_AUTH_TOKEN>' http://127.0.0.1:8000/api/v1/organizations/me/list
curl -H 'Authorization: Bearer <LOCAL_AUTH_TOKEN>' 'http://127.0.0.1:8000/api/v1/boards?limit=50'
curl -H 'Authorization: Bearer <LOCAL_AUTH_TOKEN>' 'http://127.0.0.1:8000/api/v1/board-groups?limit=50'
curl -H 'Authorization: Bearer <LOCAL_AUTH_TOKEN>' 'http://127.0.0.1:8000/api/v1/gateways?limit=50'
curl -H 'Authorization: Bearer <LOCAL_AUTH_TOKEN>' 'http://127.0.0.1:8000/api/v1/gateways/status?gateway_url=ws://127.0.0.1:18789'
```

### Browser-equivalent local verification
Used headless Google Chrome via DevTools protocol with the Mission Control local-auth token injected into session storage, then scraped the rendered dashboard DOM.

Artifacts created during verification:
- `/tmp/mc-browser-verification.json`
- `/home/rancho/aa-cma/workspace-arc/devtools_verify_mc.mjs`

## Validation evidence

### 1) Stack is up
`docker compose ps` showed:
- backend up on `8000`
- frontend up on `3000`
- db healthy
- redis healthy
- worker up

### 2) Backend health passed
`curl http://127.0.0.1:8000/healthz`
returned:
```json
{"ok":true}
```

### 3) AA seed/setup completed in live runtime
The setup script ran successfully inside the backend container and reported:
- organization: `Arthur & Archie`
- gateway: `AA OpenClaw Gateway`
- groups: `2 total`
- boards: `5 total`
- tags: `7 total`
- custom fields: `4 total`

The second pass linked the local user `admin@home.local` to the AA organization and set it active.

### 4) Seeded data verified through live API
Verified via authenticated API calls:
- organizations include `Arthur & Archie`
- board groups include:
  - `AA Internal Operations`
  - `Retrofit`
- boards include:
  - `Thomas`
  - `(deprecated) Seneca`
  - `(deprecated) Aris`
  - `(deprecated) Arc`
  - `Felix / Retrofit`
- gateway includes:
  - `AA OpenClaw Gateway`
  - URL: `ws://127.0.0.1:18789`
  - workspace root: `/home/rancho/aa-cma`

### 5) Browser/UI verification performed
Headless Chrome successfully loaded the Mission Control dashboard shell after local-auth token injection.

Observed in the rendered UI scrape:
- Mission Control shell loads
- local-authenticated dashboard shell renders
- dashboard sections render, including the new `Board topology` section

## Remaining issues

### Issue 1: gateway record cannot connect from Dockerized backend to host-loopback OpenClaw gateway
Current OpenClaw gateway is serving on host loopback only:
- `127.0.0.1:18789`

From inside Docker containers, that host-loopback listener is not reachable. Gateway status API returned:
```json
{"connected":false,...,"error":"[Errno 111] Connection refused"}
```

**Exact blocker:** Mission Control backend runs in Docker; OpenClaw gateway is bound to host loopback only, so container-origin connections to that gateway fail.

**Shortest path around it:** run the OpenClaw gateway on a host-reachable address for containers, or add a deliberate bridge path (for example a host-reachable bind/interface or equivalent gateway exposure).

### Issue 2: browser verification is sensitive to `localhost` vs `127.0.0.1`
Frontend/backend local auth + CORS configuration is built around `http://localhost:3000` / `http://localhost:8000`.

When the browser session is driven through `127.0.0.1`, the shell can load but data fetches fall into an empty-state path because the origin no longer matches the configured local CORS/browser expectations.

**Exact blocker:** origin mismatch between `localhost` and `127.0.0.1` during browser automation.

**Shortest path around it:** use `http://localhost:3000` in the browser, not `127.0.0.1:3000`.

## Bottom line

What is complete:
- Mission Control stack is running locally
- backend/frontend/db/redis/worker all launched
- backend image fixed so the AA setup script exists in runtime
- AA setup/seeding executed successfully in the live runtime
- seeded org/groups/boards/gateway verified through the running API
- browser/UI shell verified locally via headless Chrome

What is not yet fully green:
- gateway health is not green because the OpenClaw gateway is bound only to host loopback
- browser automation should use `localhost` consistently to see seeded UI data instead of empty-state fallbacks

## Exact next steps

1. Open Mission Control at:
   - `http://localhost:3000`
2. Use the local auth token from `mission-control/.env`.
3. Confirm the UI from `localhost` specifically, not `127.0.0.1`.
4. Reconfigure/restart OpenClaw gateway so Mission Control containers can reach it from Docker.
5. Re-run gateway status check from Mission Control after the gateway is exposed on a host-reachable address.

If needed, the next concrete re-check commands are:
```bash
cd /home/rancho/aa-cma/mission-control
docker compose -f compose.yml ps
curl http://127.0.0.1:8000/healthz
curl -H 'Authorization: Bearer <LOCAL_AUTH_TOKEN>' 'http://127.0.0.1:8000/api/v1/gateways/status?gateway_url=ws://127.0.0.1:18789'
```
