#!/usr/bin/env bash
# Daily 13:30 UTC (08:30 Lima): writes ~/n8n/shared/status/health.json for the F5 alerts flow (read-only for n8n).
# Covers what n8n cannot see from inside its container: host cron jobs (backups, job radar), disk, RAM, containers.
set -uo pipefail
OUT="$HOME/n8n/shared/status"; mkdir -p "$OUT"
mtime() { [ -n "${1:-}" ] && [ -e "$1" ] && stat -c %Y "$1" || echo 0; }
latest() { ls -t $1 2>/dev/null | head -1; }

N8N_BK=$(latest "$HOME/n8n-backups/n8n-*.dump.age")
APP_BK=$(latest "$HOME/app-backups/*.dump.age")      # any other database on the same VM
RADAR=$(ls -t "$HOME/n8n/shared/radar/"radar-20??-??-??.json 2>/dev/null | head -1)
HEALTHZ=$(curl -fsS -m 10 http://127.0.0.1:5678/healthz >/dev/null 2>&1 && echo ok || echo fail)

python3 - "$OUT/health.json.tmp" <<PY
import json, os, re, sys, time
def age_h(t): return None if not t else round((time.time() - t) / 3600, 1)
radar = "$RADAR"
st = os.statvfs("/")
disk_pct = round(100 * (1 - st.f_bavail / st.f_blocks))
mem = dict(re.findall(r"(\w+):\s+(\d+)", open("/proc/meminfo").read()))
down = [c for c in """$(docker ps -a --format '{{.Names}}|{{.Status}}' | grep -v -E '\|Up ' | cut -d'|' -f1 | tr '\n' ' ')""".split() if c]
data = {
  "generatedAt": int(time.time()),
  "backups": {
    "n8n": {"file": os.path.basename("$N8N_BK"), "ageH": age_h($(mtime "$N8N_BK"))},
    "app-db": {"file": os.path.basename("$APP_BK"), "ageH": age_h($(mtime "$APP_BK"))},
  },
  "radar": {"latest": (re.search(r"radar-(\d{4}-\d{2}-\d{2})\.json", radar) or [None, None])[1]},
  "diskPct": disk_pct,
  "memAvailMB": int(mem.get("MemAvailable", 0)) // 1024,
  "containersDown": down,
  "n8nHealthz": "$HEALTHZ",
}
json.dump(data, open(sys.argv[1], "w"), indent=1)
PY
mv "$OUT/health.json.tmp" "$OUT/health.json"
echo "$(date -u +%FT%TZ) health ok"
