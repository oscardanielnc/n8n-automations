# 0002 — Outlook through IMAP, the built-in Outlook node, or forwarding to Gmail

**Status:** Discarded · 2026-11-08

| Option | Why it was discarded |
|---|---|
| IMAP with password | Outlook.com turned off basic auth for IMAP; n8n's IMAP node has no XOAUTH2 |
| Built-in "Microsoft Outlook" node | Its credential asks for send/calendar/contacts scopes → more power than needed |
| Auto-forward Outlook → Gmail | Read-only (no cleanup), and forwarding breaks the original DKIM/DMARC alignment, so the 🏆 rule (ADR 0003) could never verify an Outlook sender |

Do not retry these unless the constraint in the right column changes.
