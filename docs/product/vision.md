# Vision

**What:** one private web page that shows, for **today**, what the n8n flows found and whether they ran well.

**For whom:** its owner only (single user, behind Cloudflare Access).

**Why:** one Telegram message per item was too much to read. Telegram now carries **errors only**; results live here.

**What it shows:** the daily watch (mail of the last 24 h, with a one-line summary per mail), the latest job radar
report, server health, the status of every flow, and the open failures with everything needed to fix them.

**What it is NOT:**

- Not a history or archive: only the current state.
- Not an n8n editor: flows are built in `n8n/workflows/build_*.py`.
- Not a place to resolve errors: an error disappears when the next run of its flow succeeds.
