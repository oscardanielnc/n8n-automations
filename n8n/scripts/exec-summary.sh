#!/usr/bin/env bash
# Usage on the VM: ~/n8n/scripts/exec-summary.sh <workflowId> [fields-to-show-for-node=Node:field1,field2]
# Prints, for the latest execution of a workflow: status and, per node, item counts and errors (no content by default).
set -euo pipefail
WF="$1"; SHOW="${2:-}"
cd ~/n8n
q() { docker compose exec -T postgres sh -c "psql -U \$POSTGRES_USER -d \$POSTGRES_DB -tAc \"$1\""; }
ID=$(q "select id from execution_entity where \\\"workflowId\\\"='$WF' order by id desc limit 1")
echo "execution $ID: $(q "select status from execution_entity where id=$ID")"
q "select data from execution_data where \\\"executionId\\\"=$ID" > /tmp/exec.txt
docker cp /tmp/exec.txt n8n-n8n-1:/tmp/exec.txt >/dev/null; rm -f /tmp/exec.txt
docker exec -e SHOW="$SHOW" -w /usr/local/lib/node_modules/n8n n8n-n8n-1 node -e '
const {parse}=require(require.resolve("flatted",{paths:[process.cwd()]}));
const d=parse(require("fs").readFileSync("/tmp/exec.txt","utf8").trim()); const rd=d.resultData;
if (rd.error) console.log("WORKFLOW ERROR:", rd.error.message, "@", rd.error.node && rd.error.node.name);
const [sn, sf] = (process.env.SHOW||"").split(":"); const fields=(sf||"").split(",").filter(Boolean);
for (const [n, runs] of Object.entries(rd.runData)) {
  const r = runs[runs.length-1]; const out = (r.data && r.data.main) || [[]];
  const errs = (out[0]||[]).filter(x => x.json && x.json.error).length;
  console.log(`${n}: items=${JSON.stringify(out.map(b => (b||[]).length))}${r.error ? " ERR " + r.error.message.slice(0,200) : ""}${errs ? " itemErrors=" + errs + " e.g. " + JSON.stringify(out[0].find(x=>x.json.error).json.error).slice(0,200) : ""}`);
  if (n === sn) (out[0]||[]).slice(0,15).forEach(x => console.log("   ", JSON.stringify(Object.fromEntries(fields.map(f => [f, x.json[f]]))).slice(0,220)));
}'
docker exec n8n-n8n-1 rm -f /tmp/exec.txt
