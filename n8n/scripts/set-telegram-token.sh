#!/usr/bin/env bash
# Runs on the VM. Reads a Telegram bot token from stdin (never from argv, never printed),
# validates it, finds your chat_id from the /start message and stores the token as an
# n8n credential (encrypted by n8n with N8N_ENCRYPTION_KEY). Only the bot name and chat_id are printed.
set -euo pipefail
CRED_ID="telegramCred0001"
read -r TOKEN
TOKEN="$(printf '%s' "$TOKEN" | tr -d '[:space:]')"
[[ "$TOKEN" =~ ^[0-9]+:[A-Za-z0-9_-]+$ ]] || { echo "Invalid token format" >&2; exit 1; }

API="https://api.telegram.org/bot$TOKEN"
BOT="$(curl -fsS "$API/getMe" | python3 -c 'import json,sys; print(json.load(sys.stdin)["result"]["username"])')" \
  || { echo "Telegram rejected the token" >&2; exit 1; }
echo "Bot: @$BOT"

echo ""
echo ">>> NOW open https://t.me/$BOT and send it any message (e.g. hola). Waiting up to 2 min..."
CHAT_ID=""
for _ in $(seq 1 24); do
  CHAT_ID="$(curl -fsS "$API/getUpdates" | python3 -c '
import json,sys
ids=[u["message"]["chat"]["id"] for u in json.load(sys.stdin)["result"] if "message" in u and u["message"]["chat"]["type"]=="private"]
print(ids[-1] if ids else "")')"
  [ -n "$CHAT_ID" ] && break
  sleep 5
done
[ -n "$CHAT_ID" ] || { echo "No message received from you. Run again and message @$BOT while it waits." >&2; exit 1; }
echo "$CHAT_ID" > ~/n8n/telegram-chat-id
echo "chat_id: $CHAT_ID (saved to ~/n8n/telegram-chat-id)"

printf '[{"id":"%s","name":"Telegram - @%s","type":"telegramApi","data":{"accessToken":"%s"}}]' \
  "$CRED_ID" "$BOT" "$TOKEN" \
  | docker exec -i n8n-n8n-1 sh -c 'umask 077; cat > /tmp/cred.json; n8n import:credentials --input=/tmp/cred.json >/dev/null 2>&1; s=$?; rm -f /tmp/cred.json; exit $s' \
  && echo "OK: n8n credential '$CRED_ID' saved" \
  || { echo "Credential import failed" >&2; exit 1; }

curl -fsS -X POST "$API/sendMessage" -d chat_id="$CHAT_ID" \
  --data-urlencode text="✅ Conectado a tu n8n. Desde aquí te avisaré de tus flujos." >/dev/null
echo "Test message sent to Telegram"
