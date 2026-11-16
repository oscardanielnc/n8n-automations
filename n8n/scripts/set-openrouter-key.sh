#!/usr/bin/env bash
# Runs on the VM. Reads an OpenRouter API key from stdin, checks it against OpenRouter and stores it as an
# n8n "Header Auth" credential (Authorization: Bearer ...). Only the remaining credit is printed.
set -euo pipefail
CRED_ID="openrouterCred01"
read -r KEY
KEY="$(printf '%s' "$KEY" | tr -d '[:space:]')"
[[ "$KEY" =~ ^sk-or-[A-Za-z0-9_-]+$ ]] || { echo "Key does not look like an OpenRouter key (sk-or-...)" >&2; exit 1; }

curl -fsS -H "Authorization: Bearer $KEY" https://openrouter.ai/api/v1/key \
  | python3 -c 'import json,sys; d=json.load(sys.stdin)["data"]; print("Key OK. Limit remaining:", d.get("limit_remaining"), "| usage so far:", d.get("usage"))' \
  || { echo "OpenRouter rejected the key" >&2; exit 1; }

printf '[{"id":"%s","name":"OpenRouter (Jev)","type":"httpHeaderAuth","data":{"name":"Authorization","value":"Bearer %s"}}]' \
  "$CRED_ID" "$KEY" \
  | docker exec -i n8n-n8n-1 sh -c 'umask 077; cat > /tmp/cred.json; n8n import:credentials --input=/tmp/cred.json >/dev/null 2>&1; s=$?; rm -f /tmp/cred.json; exit $s' \
  && echo "OK: n8n credential '$CRED_ID' saved" \
  || { echo "Credential import failed" >&2; exit 1; }
