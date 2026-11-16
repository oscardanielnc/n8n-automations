# Architecture

## Infrastructure

```
You ──HTTPS──▶ Cloudflare (Zero-Trust Access + Tunnel) ──▶ ARM VM shared with other apps
                                                            ├─ n8n 2.x      Docker, 127.0.0.1:5678 only
                                                            ├─ Postgres 16  n8n data, daily pg_dump encrypted with age
                                                            ├─ panel        NestJS + React, reads n8n through its API
                                                            └─ cron         job radar engine, health.sh, backup.sh
```

- The editor sits behind Cloudflare Access (email one-time code). Only `/webhook/*` bypasses it.
- Secrets live only in the VM `.env` and in n8n credentials. Each one is loaded with `scripts/set-*.ps1`:
  hidden prompt on the PC → SSH stdin → `n8n import:credentials` on the VM. Never on disk, in argv, in chat or in git.
- n8n may read only `/data/shared` (`N8N_RESTRICT_FILE_ACCESS_TO`) and write only `/data/shared/out`.

## Flows

| Id | Name | Trigger (Lima) | What it does |
|---|---|---|---|
| F2 | Daily watch | Daily 18:47 | Reads 4 mailboxes (last 24 h, spam included) → a typed LLM sorts each mail → fixed rules decide → one Telegram message + rows for the panel, each with a one-line summary by a free model |
| F2b | Mail cleanup | Day 1, 04:00 | Mail older than a year → Trash (Gmail) / Deleted Items (Outlook), capped and paced |
| F4 | Job radar | Mon + Thu 08:00 | Reads the radar engine's JSON + LinkedIn alert emails → the LLM screens each posting → fixed thresholds → finalists `.md` |
| F5 | Alerts | On error + daily 09:00 | Error workflow of every other flow + daily VM health (backups, disk, RAM, containers, radar freshness) |

Two personal flows of the same instance are not in this repository: a giveaway radar and a social-media promo
watcher that reads public posts through a third-party scraping service.

## F2 data flow

```
Gmail personal ─▶ Gmail work ─▶ Outlook (Graph) ─▶ Combine ─▶ Prepare
   ─▶ Switch(inbox) ─┬─ work:     HTTP Gmail metadata (Authentication-Results)
                     ├─ Outlook:  Code (Graph already returned the headers)
                     └─ personal: HTTP Gmail metadata
   ─▶ Merge(3) ─▶ Jev (typed `choice`) ─▶ fixed rules ─┬▶ Telegram
                                                      └▶ free model summary ─▶ Data table `vigia` (latest run only)
```

🏆 "You won" needs Jev `prize` ≥ 0.7 **and** an allow-listed sender **and** DKIM + DMARC pass in the header written
by the receiving provider (`mx.google.com` / `mx.microsoft.com`), see [ADR 0003](adr/0003-trust-provider-auth-header.md).

## Mailboxes

| Mailbox | API | Watch (F2) | Cleanup (F2b) |
|---|---|---|---|
| Outlook.com | Microsoft Graph, generic OAuth2 credential, `Mail.ReadWrite` only | ✅ | ✅ → Deleted Items |
| Gmail personal | Gmail API (Gmail node + HTTP Request) | ✅ | ✅ → Trash |
| Gmail work | Gmail API, second credential | ✅ (job boards, LinkedIn alerts) | ✅ → Trash |

A fourth mailbox is auto-forwarded into the personal Gmail.

## F2b Outlook chain

`GET /me/messages?$select=id&$top=1000&$filter=receivedDateTime lt <now-1y>` following `@odata.nextLink` (max 10
pages) → Code packs 20 `move` requests per JSON `$batch` → `POST /$batch`, one call every 1.5 s to stay under
Outlook's per-mailbox throttling.

## Workflow as code

```
workflows/build_f2.py ──python──▶ f2-daily-watch.json   (no credentials inside, only their ids)
   ─▶ n8n import:workflow ─▶ n8n publish:workflow --id ─▶ restart n8n (the CLI does not hot-activate)
```

Every flow also has a **Run from VM** webhook with header auth, so it can be run on demand with `dryRun` or
`noTelegram` flags and compared against known cases before a new version is published.

## Technologies

n8n 2 · Docker Compose · Postgres · Cloudflare Tunnel + Access · OAuth 2.0 (Google, Microsoft Entra) · Gmail API ·
Microsoft Graph (OData filters, paging, JSON batching) · Telegram Bot API · OpenRouter (Jev typed decisions, free
chat models) · JavaScript in Code nodes · Python builders · Bash and PowerShell ops scripts · age.
