# 0001 — n8n is the system of record, reached through its public API

**Status:** Accepted · 2026-11-10 (Oscar)

## Context
Every result already lands in n8n Data tables or in n8n executions. n8n 2.46 exposes `/api/v1/executions` and full
row CRUD on `/api/v1/data-tables/{id}/rows` (checked on the instance, 2026-11-10).

## Options
1. **n8n public API** behind ports (chosen).
2. Read n8n's Postgres directly: couples to internal table names (`data_table_user_<id>`) that change between versions.
3. Own Postgres + Prisma, synced from n8n: two copies of the same data, a sync job to keep alive, and history we do not want (ADR 0004).

## Decision
Adapters `N8nExecutions` and `N8nTables` call the public API with an API key stored only in the VM `.env`.
Tables are addressed by **id** (n8n resolves names by partial match: `vistos` hit `li_vistos`, 2026-11-10).

## Consequences
- No migrations, no ORM: the standard's Prisma row does not apply (ADR 0003).
- The public version of the panel only reads; writes would be row updates through the same API.
- Integration tests run against a throwaway n8n container.
