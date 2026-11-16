# Architecture overview

Status: **accepted** (2026-11-10, Oscar).

## Request flow

```
Browser ──▶ Cloudflare Access (email OTP) ──▶ Tunnel ──▶ VM: panel container :3110
                                                         ├─ /        static React build
                                                         └─ /api/v1  NestJS
                                                               ├─ n8n public API (http://n8n:5678/api/v1, API key)
                                                               │    · executions  → flow status, errors
                                                               │    · data-tables → vigia
                                                               └─ ~/n8n/shared (read-only mount)
                                                                    · status/health.json, radar/radar-*.json
```

One origin: no CORS, one Access policy, one container (~150 MB RAM). See ADR 0001–0003.

## Monorepo

```
apps/api        NestJS 11: modules runs (flows + errors), vigia, server, overview
apps/web        React + Vite (Bulletproof React), TanStack Query, React Router 7, Tailwind
packages/contracts   Zod schemas of every API response (single source of truth)
packages/ui     components by role + Storybook
packages/config eslint / tsconfig / prettier
```

## API module shape (hexagonal)

```
domain/          FlowDefinition, RunSummary, Failure, VigiaRow…  (no framework imports)
application/
  ports/         N8nExecutions, N8nTables, SharedFiles, Clock   (abstract classes)
  use-cases/     get-flow-statuses, list-open-failures, get-vigia, get-server-health…
infrastructure/  n8n-api adapters (fetch + timeout), shared-files adapter, mappers
presentation/http controllers + DTOs from packages/contracts
```

Business rules live in use cases and pure domain functions: "open failure = latest run failed", "show only the latest
daily-watch run".

## Run it without n8n

`pnpm demo` starts `scripts/demo/fake-n8n.mjs`, a stand-in for the n8n public API with invented data, and the
real API + web against it. Only the adapter's far end is fake: every use case, contract and component is the real one.
