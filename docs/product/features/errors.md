# Errors `/errors`

**Goal:** give Claude everything it needs to fix a failure, in one copy.

Plain design on purpose.

## Content

- One row per **open** failure: workflow name (title), error type and message, node, time, current fix status.
- Detail drawer: link to the n8n execution and the **Copy for Claude** payload: workflow name + id, builder file, execution id + URL, mode,
  failed node + type, error type, message, description, stack (first 20 lines), the failed node's input (first 3 items,
  secrets redacted), last successful run, n8n version, Lima time.

## Rules

- **No resolve button.** A failure is open while the **latest** execution of its workflow failed. When the next run
  succeeds it disappears by itself; if a later run fails, it is back.
- Resolved failures are not listed.
- The tab shows a red badge with the open count.
