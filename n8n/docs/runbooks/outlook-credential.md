# Runbook — Outlook (Microsoft Graph) credential

| Item | Value |
|---|---|
| n8n credential | `outlookCred00001`, type generic OAuth2 API |
| Scopes | `offline_access User.Read Mail.ReadWrite` · endpoint `/consumers` |
| Secret expiry | 24 months after it was created |

## Rotate the secret (or set it up again)
1. On the PC: `scripts/set-outlook-oauth.ps1` (set `$key`, `$vm` and `$appId` first).
2. The script opens Entra › *Certificates & secrets*: **New client secret** → 24 months → copy the **Value** column.
3. Paste it at the hidden prompt → it travels by SSH stdin to `set-outlook-oauth.sh`, which imports the credential.
4. In n8n › Credentials › "Outlook" → **Connect my account** → sign in → Accept.
5. Delete the old secret in Entra.

## Symptoms
- F5 alert from F2/F2b with `AADSTS7000222` (secret expired) or `invalid_grant` (refresh token revoked) → steps above.
