#!/usr/bin/env bash
# VM side of set-n8n-api-key.ps1: reads the key from stdin, never echoes it.
set -euo pipefail
ENV_FILE="$HOME/n8n-panel/deploy/.env"
read -r KEY
if [ "${#KEY}" -lt 20 ]; then echo "That does not look like an n8n API key" >&2; exit 1; fi
[ -f "$ENV_FILE" ] || cp "$HOME/n8n-panel/deploy/env.example" "$ENV_FILE"
chmod 600 "$ENV_FILE"
grep -v '^N8N_API_KEY=' "$ENV_FILE" > "$ENV_FILE.tmp" || true
printf 'N8N_API_KEY=%s\n' "$KEY" >> "$ENV_FILE.tmp"
mv "$ENV_FILE.tmp" "$ENV_FILE" && chmod 600 "$ENV_FILE"
unset KEY
cd "$HOME/n8n-panel/deploy" && docker compose up -d --force-recreate >/dev/null 2>&1 || true
sleep 8
if curl -fsS http://127.0.0.1:3110/api/v1/health >/dev/null; then echo "Key saved. Panel is up."; else echo "Key saved. Panel is not up yet: tell Claude 'la web no levanta'."; fi
