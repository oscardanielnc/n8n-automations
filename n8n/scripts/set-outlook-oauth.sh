#!/usr/bin/env bash
# Runs on the VM. Reads the Microsoft client secret from stdin and stores a generic n8n "OAuth2 API"
# credential for Outlook.com via Microsoft Graph (least-privilege scopes). Nothing secret is printed.
# Then click "Connect my account" in n8n.
set -euo pipefail
CRED_ID="outlookCred00001"
CLIENT_ID="00000000-0000-0000-0000-000000000000"   # your Entra app id (public value)
SCOPE="offline_access User.Read Mail.ReadWrite"
read -r CLIENT_SECRET
CLIENT_SECRET="$(printf '%s' "$CLIENT_SECRET" | tr -d '[:space:]')"
[[ "$CLIENT_SECRET" =~ ^[A-Za-z0-9~._-]{30,}$ ]] || { echo "Client secret does not look right (copy the VALUE, not the secret ID)" >&2; exit 1; }

printf '[{"id":"%s","name":"Outlook","type":"oAuth2Api","data":{"grantType":"authorizationCode","authUrl":"https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize","accessTokenUrl":"https://login.microsoftonline.com/consumers/oauth2/v2.0/token","clientId":"%s","clientSecret":"%s","scope":"%s","authQueryParameters":"prompt=select_account","authentication":"body"}}]' \
  "$CRED_ID" "$CLIENT_ID" "$CLIENT_SECRET" "$SCOPE" \
  | docker exec -i n8n-n8n-1 sh -c 'umask 077; cat > /tmp/cred.json; n8n import:credentials --input=/tmp/cred.json >/dev/null 2>&1; s=$?; rm -f /tmp/cred.json; exit $s' \
  && echo "OK: n8n credential '$CRED_ID' saved. Now click 'Connect my account' in n8n." \
  || { echo "Credential import failed" >&2; exit 1; }
