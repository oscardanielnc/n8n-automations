# Conventions (what the linter cannot enforce)

## API

- One use case per file, one class, one `execute()`. Ports are abstract classes in `application/ports/`.
- Business rules ("closed before today", "latest run failed", "which week") live in `domain/` as pure functions with tests.
- n8n rows are mapped to domain types inside the adapter; n8n column names (`from_name`, `run_ts`…) never leave `infrastructure/`.
- Tables are read by **exact name** through `N8nClient.tableId` (n8n's own lookup is a partial match).
- Every response is parsed with its `@panel/contracts` schema before it leaves the controller.
- Errors: throw `DomainError(code, message, status)`; `ProblemDetailsFilter` turns everything into RFC 9457.

## Web

- Data only through TanStack Query hooks in `features/<f>/api/queries.ts`; every GET parses its contract.
- Every block has its four states: loading (Skeleton), error (ErrorState + Retry), empty (EmptyState), data.
- Interface text in English; colours only through `@panel/ui` tones (Tailwind cannot see dynamic class names).

## Enforced by tools

ESLint (`eslint.config.mjs`): domain → nothing outside it; application → no adapters; modules/features never import
each other; the design system never imports data or routing. Husky: Unicode check, lint, typecheck before each commit;
AI signatures stripped from commit messages. CI repeats all of it plus gitleaks, tests and build.
