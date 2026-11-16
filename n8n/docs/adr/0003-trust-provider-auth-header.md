# 0003 — Trust only the Authentication-Results header written by the receiving provider

**Status:** Accepted · 2026-11-06 (Gmail) · extended 2026-11-08 (Outlook)

## Context
F2 can say "you won" (🏆). Anyone can write an email, including fake `Authentication-Results` headers, and the
LLM classifier can be prompt-injected by the email text.

## Decision
A 🏆 needs all of: Jev `prize` ≥ 0.7, sender domain on an allow-list, and `dkim=pass` + `dmarc=pass` aligned with the
sender domain **in the header whose authserv-id is the receiving provider**:
- Gmail: the header starting with `mx.google.com`, fetched with an extra Gmail API call (the Gmail node keeps only
  the last header, which is the one a sender can forge).
- Outlook: the header starting with `mx.microsoft.com`, returned by Graph `internetMessageHeaders`.

## Why
Headers added by earlier hops, or by the sender, can be forged; the one written by the final receiver cannot.
