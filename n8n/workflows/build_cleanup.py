"""Builds workflows/f2b-gmail-cleanup.json: monthly, moves messages older than 1 year to Trash in the personal and work Gmail,
and to "Deleted Items" in Outlook.com (Microsoft Graph) once OUTLOOK_LIVE is True (owner's OK). Gmail empties Trash by itself after 30 days, so anything
trashed by mistake can be recovered for a month.
Run: python build_cleanup.py [--dry]   (--dry = the two "Move to Trash" nodes are disabled: only counts)"""
import json
import sys
from pathlib import Path

DRY = "--dry" in sys.argv
TELEGRAM_CHAT_ID = "YOUR_TELEGRAM_CHAT_ID"  # the only chat the bot writes to
OUTLOOK_LIVE = True  # older than 1 year -> Deleted Items (False = count only)
OUTLOOK_CRED = {"oAuth2Api": {"id": "outlookCred00001", "name": "Outlook"}}
QUERY = "older_than:1y -in:trash"
ACCOUNTS = [  # (short name, label in Telegram, credential)
    ("personal", "📧 Gmail personal", {"gmailOAuth2": {"id": "gmailPersonal001", "name": "Gmail - personal"}}),
    ("work", "🎓 Work", {"gmailOAuth2": {"id": "gmailWorkCred001", "name": "Gmail - work"}}),
]

CHUNK = r"""
// Gmail accepts up to 1000 ids per batchModify call.
const ids = $input.all().flatMap(it => (it.json.messages || []).map(m => m.id));
const out = [];
for (let i = 0; i < ids.length; i += 1000) out.push({ json: { ids: ids.slice(i, i + 1000) } });
return out.length ? out : [{ json: { ids: [] } }];
"""

SUMMARY = r"""
const ACCOUNTS = __ACCOUNTS__;
const dry = __DRY__;
const outlookLive = __OUTLOOK_LIVE__;
const lines = [dry ? '🧹 <b>Limpieza de correo (prueba: no se borró nada)</b>' : '🧹 <b>Limpieza de correo</b>'];
for (const [name, label] of ACCOUNTS) {
  let total = 0, pages = 0;
  try { total = $(`Group ids ${name}`).all().reduce((n, it) => n + it.json.ids.length, 0); } catch (e) {}
  try { pages = $(`List old ${name}`).all().length; } catch (e) {}
  lines.push(`${label}: ${total} correos de más de 1 año ${dry ? 'encontrados' : '→ papelera'}${pages >= 20 ? ' (quedan más: siguen el próximo mes)' : ''}`);
}
let ol = 0;
try { ol = $('Group ids Outlook').all().reduce((n, it) => n + (it.json.ids || []).length, 0); } catch (e) {}
const olMore = ol >= 10000 ? ' (quedan más: siguen el próximo mes)' : '';
if (dry || !outlookLive) lines.push(`📨 Outlook: ${ol} correos de más de 1 año encontrados${olMore}${!dry && !outlookLive ? ' — <i>no se tocan hasta tu OK</i>' : ''}`);
else lines.push(`📨 Outlook: ${ol} correos de más de 1 año → Elementos eliminados${olMore}`);
if (!dry) lines.push('Gmail los borra solo en 30 días (hasta entonces se pueden recuperar).');
return [{ json: { text: lines.join('\n') } }];
"""


def node(id_, name, type_, version, pos, params, **extra):
    n = {"id": id_, "name": name, "type": type_, "typeVersion": version, "position": pos, "parameters": params}
    n.update(extra)
    return n


nodes = [
    node("d3b3c0de-0001-4000-8000-000000000001", "Day 1 of each month 04:00", "n8n-nodes-base.scheduleTrigger", 1.2, [0, 0],
         {"rule": {"interval": [{"field": "months", "monthsInterval": 1, "triggerAtDayOfMonth": 1, "triggerAtHour": 4, "triggerAtMinute": 0}]}}),
    node("d3b3c0de-0002-4000-8000-000000000002", "Test now", "n8n-nodes-base.manualTrigger", 1, [0, 200], {}),
]
connections = {}
prev = None
for k, (name, label, cred) in enumerate(ACCOUNTS):
    y = 100 + k * 220
    base = f"d3b3c0de-{k + 1:02d}"
    nodes += [
        node(f"{base}03-4000-8000-0000000000{k}3", f"List old {name}", "n8n-nodes-base.httpRequest", 4.2, [240, y],
             {"method": "GET", "url": "https://gmail.googleapis.com/gmail/v1/users/me/messages",
              "authentication": "predefinedCredentialType", "nodeCredentialType": "gmailOAuth2",
              "sendQuery": True,
              "queryParameters": {"parameters": [{"name": "q", "value": QUERY}, {"name": "maxResults", "value": "500"},
                                                 {"name": "includeSpamTrash", "value": "true"}]},
              "options": {"pagination": {"pagination": {
                  "paginationMode": "updateAParameterInEachRequest",
                  "parameters": {"parameters": [{"type": "qs", "name": "pageToken", "value": "={{ $response.body.nextPageToken }}"}]},
                  "paginationCompleteWhen": "other", "completeExpression": "={{ !$response.body.nextPageToken }}",
                  "limitPagesFetched": True, "maxRequests": 20}}}},
             credentials=cred, executeOnce=True, onError="continueRegularOutput"),
        node(f"{base}04-4000-8000-0000000000{k}4", f"Group ids {name}", "n8n-nodes-base.code", 2, [480, y],
             {"mode": "runOnceForAllItems", "language": "javaScript", "jsCode": CHUNK.strip()}),
        node(f"{base}05-4000-8000-0000000000{k}5", f"Move to Trash {name}", "n8n-nodes-base.httpRequest", 4.2, [720, y],
             {"method": "POST", "url": "https://gmail.googleapis.com/gmail/v1/users/me/messages/batchModify",
              "authentication": "predefinedCredentialType", "nodeCredentialType": "gmailOAuth2",
              "sendBody": True, "specifyBody": "json",
              "jsonBody": "={{ JSON.stringify({ ids: $json.ids, addLabelIds: ['TRASH'] }) }}", "options": {}},
             credentials=cred, disabled=DRY, onError="continueRegularOutput"),
    ]
    connections[f"List old {name}"] = {"main": [[{"node": f"Group ids {name}", "type": "main", "index": 0}]]}
    connections[f"Group ids {name}"] = {"main": [[{"node": f"Move to Trash {name}", "type": "main", "index": 0}]]}
    if prev is None:
        for t in ("Day 1 of each month 04:00", "Test now"):
            connections[t] = {"main": [[{"node": f"List old {name}", "type": "main", "index": 0}]]}
    else:
        connections[f"Move to Trash {prev}"] = {"main": [[{"node": f"List old {name}", "type": "main", "index": 0}]]}
    prev = name
OL_LIST_URL = ("=https://graph.microsoft.com/v1.0/me/messages?$select=id&$top=1000&$filter=receivedDateTime%20lt%20"
               "{{ $now.minus({ years: 1 }).toUTC().toFormat(\"yyyy-MM-dd'T'HH:mm:ss'Z'\") }}")
OL_GROUP = r"""
// Graph has no bulk move: one JSON $batch call carries up to 20 "move" requests.
const ids = $input.all().flatMap(it => (it.json.value || []).map(m => m.id));
const out = [];
for (let i = 0; i < ids.length; i += 20) {
  const chunk = ids.slice(i, i + 20);
  out.push({ json: { ids: chunk, body: { requests: chunk.map((id, k) => ({
    id: String(k + 1), method: 'POST', url: `/me/messages/${id}/move`,
    headers: { 'Content-Type': 'application/json' }, body: { destinationId: 'deleteditems' } })) } } });
}
return out.length ? out : [{ json: { ids: [] } }];
"""
nodes += [
    node("d3b3c0de-0303-4000-8000-000000000033", "List old Outlook", "n8n-nodes-base.httpRequest", 4.2, [240, 540],
         {"method": "GET", "url": OL_LIST_URL,
          "authentication": "genericCredentialType", "genericAuthType": "oAuth2Api",
          "options": {"pagination": {"pagination": {
              "paginationMode": "responseContainsNextURL", "nextURL": "={{ $response.body['@odata.nextLink'] }}",
              "paginationCompleteWhen": "other", "completeExpression": "={{ !$response.body['@odata.nextLink'] }}",
              "limitPagesFetched": True, "maxRequests": 10}}}},
         credentials=OUTLOOK_CRED, executeOnce=True, onError="continueRegularOutput"),
    node("d3b3c0de-0304-4000-8000-000000000034", "Group ids Outlook", "n8n-nodes-base.code", 2, [480, 540],
         {"mode": "runOnceForAllItems", "language": "javaScript", "jsCode": OL_GROUP.strip()}),
    node("d3b3c0de-0305-4000-8000-000000000035", "Move to Deleted Outlook", "n8n-nodes-base.httpRequest", 4.2, [720, 540],
         {"method": "POST", "url": "https://graph.microsoft.com/v1.0/$batch",
          "authentication": "genericCredentialType", "genericAuthType": "oAuth2Api",
          "sendBody": True, "specifyBody": "json", "jsonBody": "={{ JSON.stringify($json.body) }}",
          "options": {"batching": {"batch": {"batchSize": 1, "batchInterval": 1500}}}},
         credentials=OUTLOOK_CRED, disabled=DRY or not OUTLOOK_LIVE, onError="continueRegularOutput"),
]
connections[f"Move to Trash {prev}"] = {"main": [[{"node": "List old Outlook", "type": "main", "index": 0}]]}
connections["List old Outlook"] = {"main": [[{"node": "Group ids Outlook", "type": "main", "index": 0}]]}
connections["Group ids Outlook"] = {"main": [[{"node": "Move to Deleted Outlook", "type": "main", "index": 0}]]}
connections["Move to Deleted Outlook"] = {"main": [[{"node": "Summary", "type": "main", "index": 0}]]}
connections["Summary"] = {"main": [[{"node": "Send to Telegram", "type": "main", "index": 0}]]}
nodes += [
    node("d3b3c0de-0006-4000-8000-000000000006", "Summary", "n8n-nodes-base.code", 2, [960, 200],
         {"mode": "runOnceForAllItems", "language": "javaScript",
          "jsCode": SUMMARY.strip().replace("__ACCOUNTS__", json.dumps([[a, b] for a, b, _ in ACCOUNTS], ensure_ascii=False))
                                   .replace("__DRY__", "true" if DRY else "false")
                                   .replace("__OUTLOOK_LIVE__", "true" if OUTLOOK_LIVE else "false")}),
    node("d3b3c0de-0007-4000-8000-000000000007", "Send to Telegram", "n8n-nodes-base.telegram", 1.2, [1200, 200],
         {"resource": "message", "operation": "sendMessage", "chatId": TELEGRAM_CHAT_ID, "text": "={{ $json.text }}",
          "additionalFields": {"appendAttribution": False, "parse_mode": "HTML"}},
         credentials={"telegramApi": {"id": "telegramCred0001", "name": "Telegram bot"}}),
    node("d3b3c0de-0099-4000-8000-000000000101", "Note 1", "n8n-nodes-base.stickyNote", 1, [200, -320],
         {"width": 760, "height": 360, "content":
          "## Monthly mail cleanup (Gmail personal + work + Outlook)\n"
          f"Same 3 nodes per account, one after the other: **HTTP Request + pagination** lists ids matching `{QUERY}` "
          "(500 per page, max 20 pages = 10,000 per run) → **Code** groups them by 1000 → **HTTP batchModify** adds the "
          "`TRASH` label (moves to Trash, not a permanent delete). Each chain uses its own **credential**.\n"
          "Gmail empties Trash after 30 days → one month to recover anything.\n"
          "**Outlook** (Microsoft Graph): list ids with `@odata.nextLink` pagination (1000 per page, max 10 pages) → **Code** packs "
          "20 `move` requests per **JSON $batch** call → *Deleted Items* (one call every 1.5 s, Outlook rate limits)."}),
]
wf = {"id": "f2bGmailClean001", "name": "F2b - Monthly mail cleanup", "nodes": nodes, "connections": connections,
      "settings": {"executionOrder": "v1", "timezone": "America/Lima", "saveManualExecutions": True, "errorWorkflow": "f5ErrorAlerts001"},
      "pinData": {}, "active": False}
Path(__file__).with_name("f2b-gmail-cleanup.json").write_text(json.dumps(wf, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print("ok dry=" + str(DRY))
