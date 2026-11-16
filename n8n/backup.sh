#!/usr/bin/env bash
# Daily encrypted pg_dump of the n8n database. Cron: 30 3 * * * UTC. Keeps 14 days.
# Encrypted with age for a public key whose private half is NOT on the VM: a stolen VM cannot read its own backups.
set -euo pipefail
cd "$HOME/n8n"
DEST="$HOME/n8n-backups"
mkdir -p "$DEST"
RECIPIENT="$(head -1 backup-recipient.txt)"
FILE="$DEST/n8n-$(date -u +%Y%m%dT%H%M%SZ).dump.age"
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' \
  | age --recipient "$RECIPIENT" > "$FILE.partial"
mv "$FILE.partial" "$FILE"
find "$DEST" -name 'n8n-*.dump.age' -mtime +14 -delete
echo "$(date -u +%FT%TZ) backup ok: $FILE ($(du -h "$FILE" | cut -f1))"
