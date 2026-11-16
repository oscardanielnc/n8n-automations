"""Builds workflows/f5-alerts.json (F5 - Alerts). Run: python build_f5.py
1) Error Trigger: any workflow that has settings.errorWorkflow = f5ErrorAlerts001 and fails -> Telegram.
2) Daily health (09:00 Lima): reads health.json written by the VM cron (08:30) -> Telegram only if something is wrong,
   plus a short "all good" summary on Mondays so silence never hides a dead alert system."""
import json
from pathlib import Path

TG_CRED = {"telegramApi": {"id": "telegramCred0001", "name": "Telegram bot"}}
CHAT = "YOUR_TELEGRAM_CHAT_ID"
BASE = "https://n8n.example.com"

ERROR_TEXT = r"""
// Error Trigger output: { execution: { id, url, error, lastNodeExecuted, mode }, workflow: { id, name } }
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const j = $input.first().json;
const e = j.execution || {}, w = j.workflow || {};
const node = e.error?.node?.name || e.lastNodeExecuted || '?';
const msg = String(e.error?.message || e.error?.description || 'sin mensaje').slice(0, 300);
const url = e.id && w.id ? `__BASE__/workflow/${w.id}/executions/${e.id}` : (e.url || '__BASE__');
const when = $now.setZone('America/Lima').toFormat('dd/LL HH:mm');
return [{ json: { text: `❌ <b>Falló un flujo de n8n</b>\n🧩 ${esc(w.name || w.id)}\n📍 Nodo: <b>${esc(node)}</b>\n💬 ${esc(msg)}\n🕐 ${when} (${esc(e.mode || '')})\n<a href="${url}">ver la ejecución</a>` } }];
"""

HEALTH = r"""
// Rules for health.json. Ages are in hours at the time of this check (09:00 Lima).
// Telegram parses HTML: every dynamic value is escaped, otherwise a '<' in an error message -> 400 Bad Request.
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
let h = null;
try { const x = $('Parse health').first().json; h = x.data ?? x; } catch (e) { h = null; }
const now = $now.setZone('America/Lima');
const problems = [];
if (!h || !h.generatedAt) problems.push('No hay health.json: el cron health.sh de la VM no corrió');
else {
  const ageH = (Date.now() / 1000 - h.generatedAt) / 3600;
  if (ageH > 3) problems.push(`health.json tiene ${Math.round(ageH)} h: el cron health.sh no corrió hoy`);
  for (const [name, b] of Object.entries(h.backups || {}))
    if (b.ageH === null || b.ageH > 26) problems.push(`Backup de ${name}: ${b.ageH === null ? 'no hay archivos' : 'el último tiene ' + Math.round(b.ageH) + ' h'}`);
  // job radar: the latest report must be from the most recent Monday or Thursday (today included)
  let d = now; while (![1, 4].includes(d.weekday)) d = d.minus({ days: 1 });
  const expected = d.toISODate();
  if ((h.radar?.latest || '') < expected) problems.push(`Radar de empleos: el último informe es del ${h.radar?.latest || '—'}, se esperaba el ${expected}`);
  if (h.diskPct > 85) problems.push(`Disco de la VM al ${h.diskPct} % (límite 85 %)`);
  if (h.memAvailMB < 700) problems.push(`RAM libre en la VM: ${h.memAvailMB} MB (mínimo 700)`);
  if ((h.containersDown || []).length) problems.push(`Contenedores caídos: ${h.containersDown.join(', ')}`);
  if (h.n8nHealthz !== 'ok') problems.push('n8n no respondió a /healthz');
}
const force = $('Run from VM').isExecuted && $('Run from VM').first().json.body?.force === true;
const monday = now.weekday === 1;
if (!problems.length && !monday && !force) return [];
const text = problems.length
  ? `⚠️ <b>Revisión diaria: ${problems.length} problema${problems.length > 1 ? 's' : ''}</b>\n` + problems.map(p => '• ' + esc(p)).join('\n')
  : `✅ <b>Todo en orden</b> (resumen semanal)\n💾 Backups al día · 💼 radar ${esc(h.radar?.latest)}\n🖥️ Disco ${h.diskPct} % · RAM libre ${(h.memAvailMB / 1024).toFixed(1)} GB · contenedores ok`;
return [{ json: { text } }];
"""


def node(id_, name, type_, version, pos, params, **extra):
    n = {"id": id_, "name": name, "type": type_, "typeVersion": version, "position": pos, "parameters": params}
    n.update(extra)
    return n


def send(id_, name, pos):
    return node(id_, name, "n8n-nodes-base.telegram", 1.2, pos,
                {"resource": "message", "operation": "sendMessage", "chatId": CHAT, "text": "={{ $json.text }}",
                 "additionalFields": {"appendAttribution": False, "parse_mode": "HTML", "disable_web_page_preview": True}},
                credentials=TG_CRED, retryOnFail=True, maxTries=4, waitBetweenTries=5000)  # Telegram 504s happen


U = "b7f7c0de-00{:02d}-4000-8000-0000000000{:02d}"
nodes = [
    node(U.format(1, 1), "When a workflow fails", "n8n-nodes-base.errorTrigger", 1, [0, 0], {}),
    node(U.format(2, 2), "Error message", "n8n-nodes-base.code", 2, [240, 0],
         {"mode": "runOnceForAllItems", "language": "javaScript", "jsCode": ERROR_TEXT.strip().replace("__BASE__", BASE)}),
    send(U.format(3, 3), "Send error", [480, 0]),
    node(U.format(4, 4), "Every day 09:00", "n8n-nodes-base.scheduleTrigger", 1.2, [0, 300],
         {"rule": {"interval": [{"field": "days", "daysInterval": 1, "triggerAtHour": 9, "triggerAtMinute": 0}]}}),
    node(U.format(5, 5), "Run from VM", "n8n-nodes-base.webhook", 2, [0, 460],
         {"httpMethod": "POST", "path": "run/f5-health", "authentication": "headerAuth", "responseMode": "onReceived", "options": {}},
         credentials={"httpHeaderAuth": {"id": "vmRunnerCred001", "name": "VM runner token"}},
         webhookId="5b5b5b5b-f5f5-4f5f-8f5f-0000000000f5"),
    node(U.format(6, 6), "Read health.json", "n8n-nodes-base.readWriteFile", 1, [240, 380],
         {"operation": "read", "fileSelector": "/data/shared/status/health.json", "options": {}},
         alwaysOutputData=True, onError="continueRegularOutput"),
    node(U.format(7, 7), "Parse health", "n8n-nodes-base.extractFromFile", 1, [460, 380],
         {"operation": "fromJson", "options": {}}, alwaysOutputData=True, onError="continueRegularOutput"),
    node(U.format(8, 8), "Check rules", "n8n-nodes-base.code", 2, [680, 380],
         {"mode": "runOnceForAllItems", "language": "javaScript", "jsCode": HEALTH.strip()}),
    send(U.format(9, 9), "Send health", [900, 380]),
    node("b7f7c0de-0099-4000-8000-000000000101", "Note 1", "n8n-nodes-base.stickyNote", 1, [-40, -300], {
        "width": 720, "height": 260, "content":
        "## 1. Error workflow\nEvery other flow has *Settings › Error workflow* = this one. When a **production** execution fails, n8n starts the **Error Trigger** with the workflow name, the failed node, the message and the execution id → **Code** formats it → **Telegram**.\n(Manual test runs do not trigger it.)"}),
    node("b7f7c0de-0099-4000-8000-000000000102", "Note 2", "n8n-nodes-base.stickyNote", 1, [-40, 600], {
        "width": 940, "height": 260, "content":
        "## 2. Daily health check (what n8n cannot see by itself)\nA VM cron (`health.sh`, 08:30) writes `health.json`: age of every backup, latest job radar, disk, RAM, stopped containers, n8n /healthz.\n**Code** applies the limits and returns **nothing** when all is fine (no noise) and HTML-escapes every value, so **Telegram** only fires with problems — plus a ✅ summary on Mondays, so silence never hides a dead alert system."}),
]
connections = {
    "When a workflow fails": {"main": [[{"node": "Error message", "type": "main", "index": 0}]]},
    "Error message": {"main": [[{"node": "Send error", "type": "main", "index": 0}]]},
    "Every day 09:00": {"main": [[{"node": "Read health.json", "type": "main", "index": 0}]]},
    "Run from VM": {"main": [[{"node": "Read health.json", "type": "main", "index": 0}]]},
    "Read health.json": {"main": [[{"node": "Parse health", "type": "main", "index": 0}]]},
    "Parse health": {"main": [[{"node": "Check rules", "type": "main", "index": 0}]]},
    "Check rules": {"main": [[{"node": "Send health", "type": "main", "index": 0}]]},
}
wf = {"id": "f5ErrorAlerts001", "name": "F5 - Alerts (errors + daily health)", "nodes": nodes, "connections": connections,
      "settings": {"executionOrder": "v1", "timezone": "America/Lima", "saveManualExecutions": True},
      "pinData": {}, "active": False}
Path(__file__).with_name("f5-alerts.json").write_text(json.dumps(wf, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("ok")
