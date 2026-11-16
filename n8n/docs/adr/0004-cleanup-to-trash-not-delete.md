# 0004 — Monthly cleanup moves mail to Trash / Deleted Items instead of deleting it

**Status:** Accepted · 2026-11-06 (Gmail) · 2026-11-08 (Outlook)

## Decision
On day 1 of each month at 04:00 (Lima), F2b moves every message older than one year, spam included, to:
- Gmail: Trash (`batchModify` adds `TRASH`, 1,000 ids per call). Gmail empties Trash after 30 days.
- Outlook: Deleted Items (Graph `move` with `destinationId: deleteditems`, 20 per `$batch`, one call every 1.5 s).

Cap: 10,000 messages per mailbox per run; the rest go the following month.

## Why
- A recoverable step protects against a bad filter: there is a month to undo it.
- Caps and pacing avoid provider throttling (Gmail returned 500s when going faster; Outlook throttles per mailbox).
