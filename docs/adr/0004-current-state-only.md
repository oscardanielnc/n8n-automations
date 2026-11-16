# 0004 — Current state only, no history

**Status:** Accepted · 2026-11-10 (Oscar)

## Context
The owner wants to be up to date with today's mail, jobs and flows, the way the Telegram messages did, not to keep a record.

## Decision
Each flow run replaces its panel rows; expired and past rows are deleted. The Vigía shows only its latest run; the job
radar only its latest report. Internal dedupe keys (such as `li_vistos`) stay because they avoid processing the same item twice, but the panel
never shows them.

## Consequences
No archive pages, no date pickers, no growth of panel tables.
