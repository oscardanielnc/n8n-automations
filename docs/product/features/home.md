# Home `/`

**Goal:** in ten seconds, know whether anything needs attention today.

## Content

| Block | Source | Shows |
|---|---|---|
| Header chip | computed | "N flows need a look" (→ Errors), only when something failed |
| Flow tiles | n8n executions | One tile per flow: icon, name, OK/Failed tag, last run time and next run. **No history bars** |
| Daily watch | Data table `vigia` (F2) | Counts per inbox (Outlook, Gmail, Work), counters (companies replied, won, possible prizes, attention), then each mail: subject (bold), **one-line summary in plain text** (what matters beyond the subject, written by a free model), sender + inbox tag, *Open* button. Phishing gets a red tag |
| Job radar | `radar-*.json` on the VM (F4) | Latest report only: score, title, company, source, *View* button. No AI, no extra cost |
| Server | `health.json` on the VM | Disk, free RAM, backups age, containers |

## Acceptance

- Only the latest daily-watch run is shown.
- A failed flow tile links to `/errors`.
- Mail summary is plain text, visually distinct from subject and sender; long summaries wrap.
