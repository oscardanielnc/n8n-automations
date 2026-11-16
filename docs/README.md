# docs — index

Engineering memory of the panel. The n8n flows themselves are documented in [`../n8n/docs/`](../n8n/docs/README.md).

| File | What it holds | Read it when |
|---|---|---|
| `product/vision.md` | What the panel is, for whom, what it is not | First time |
| `product/features/README.md` | Product rules + one file per page with acceptance criteria | Before building or changing a page |
| `architecture/overview.md` | Modules, data sources, request flow, deployment | Before touching code |
| `adr/README.md` | Decisions (accepted, proposed, discarded) | Before proposing an alternative |
| `design/direction.md` | Chosen visual direction and its history | Before any UI work |
| `design/tokens.md` | Colours, type, spacing, radii | While writing UI |
| `conventions.md` | What the linter cannot enforce | Before writing code |
| `runbooks/deploy.md` | First deploy, releases, key rotation | Deploying |

Rules: one topic per file, link instead of copying, docs change in the same PR as the code they describe.
