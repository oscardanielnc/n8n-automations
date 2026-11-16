#!/usr/bin/env bash
# Runs on the VM. Reads Google OAuth client ID (line 1) and secret (line 2) from stdin and stores them
# as an n8n "Gmail OAuth2" credential. Nothing secret is printed. Then click "Sign in with Google".
set -euo pipefail
CRED_ID="gmailPersonal001"
read -r CLIENT_ID; read -r CLIENT_SECRET
CLIENT_ID="$(printf '%s' "$CLIENT_ID" | tr -d '[:space:]')"
CLIENT_SECRET="$(printf '%s' "$CLIENT_SECRET" | tr -d '[:space:]')"
[[ "$CLIENT_ID" =~ ^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$ ]] || { echo "Client ID does not look right" >&2; exit 1; }
[[ "$CLIENT_SECRET" =~ ^[A-Za-z0-9_-]{20,}$ ]] || { echo "Client secret does not look right" >&2; exit 1; }

printf '[{"id":"%s","name":"Gmail - personal","type":"gmailOAuth2","data":{"clientId":"%s","clientSecret":"%s"}}]' \
  "$CRED_ID" "$CLIENT_ID" "$CLIENT_SECRET" \
  | docker exec -i n8n-n8n-1 sh -c 'umask 077; cat > /tmp/cred.json; n8n import:credentials --input=/tmp/cred.json >/dev/null 2>&1; s=$?; rm -f /tmp/cred.json; exit $s' \
  && echo "OK: n8n credential '$CRED_ID' saved. Now open it in n8n and click 'Sign in with Google'." \
  || { echo "Credential import failed" >&2; exit 1; }
