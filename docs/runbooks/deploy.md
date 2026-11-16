# Deploy to the VM

The panel runs as one container (`n8n-panel`) next to n8n on the VM, port `127.0.0.1:3110`, joined to the
`n8n_default` network. Cloudflare Tunnel routes a hostname such as `panel.example.com` to it; Cloudflare Access protects it.

## First time

1. n8n › Settings › n8n API › create a key with **only** the scopes `execution:read`, `execution:list`,
   `dataTable:read`, `dataTable:list`, `dataTable:create`, `dataTableRow:*` (no workflow or credential scopes).
2. On the PC: `powershell -File scripts/set-n8n-api-key.ps1` (hidden prompt → SSH stdin → `~/n8n-panel/deploy/.env`, chmod 600).
3. Cloudflare Zero Trust › Access › the n8n application › add the panel hostname; copy its AUD tag into
   `ACCESS_AUD` and the team domain into `ACCESS_TEAM_DOMAIN` of the same `.env`.
4. Tunnel: `/etc/cloudflared/config.yml` gets `panel.example.com → http://localhost:3110` before the 404 rule
   (backup `.bak-pre-panel`), `cloudflared tunnel ingress validate`, restart; `cloudflared tunnel route dns <tunnel> panel.example.com`.

## Every release

```sh
# on the PC, from the repo root
git archive --format=tar.gz -o /tmp/panel.tgz HEAD
scp -i ~/.ssh/vm.key /tmp/panel.tgz user@your-vm:~/
# on the VM
cd ~/n8n-panel && tar xzf ~/panel.tgz && cd deploy && docker compose up -d --build
curl -fsS http://127.0.0.1:3110/api/v1/health
```

## Rotate the n8n API key

Create the new key in n8n, run `scripts/set-n8n-api-key.ps1` again (it restarts the container), delete the old key.
