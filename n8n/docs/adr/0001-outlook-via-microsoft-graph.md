# 0001 — Outlook through Microsoft Graph with a least-privilege generic OAuth2 credential

**Status:** Accepted · 2026-11-08

## Context
The most important mailbox is a personal Outlook.com account. The daily watch (F2) and the monthly cleanup (F2b)
only covered Gmail.

## Decision
- An app registered in Microsoft Entra, audience **any Entra tenant + personal Microsoft accounts**, redirect
  `https://<n8n host>/rest/oauth2-credential/callback`.
- n8n's **generic OAuth2 API** credential against `login.microsoftonline.com/consumers`, scopes
  `offline_access User.Read Mail.ReadWrite` only; Graph is called with **HTTP Request** nodes.
- Client secret loaded with `scripts/set-outlook-oauth.ps1` (hidden prompt → SSH stdin), 24-month expiry.

## Why
- The built-in Outlook node's credential asks for send, calendar and contacts scopes. F2/F2b only read and move mail.
- `/consumers` forces a personal-account sign-in; dynamic consent needs no pre-configured API permissions.
- Graph returns `internetMessageHeaders` in the same list call → no extra request per mail for the DKIM/DMARC check.

## Consequences
- The secret expires after 24 months → [runbook](../runbooks/outlook-credential.md).
- Graph has no bulk modify: the cleanup uses JSON `$batch`, 20 moves per call.
