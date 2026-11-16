#!/usr/bin/env node
// A stand-in for the n8n public API with invented data, so the panel runs without an n8n instance or any real mail.
// It answers only what the panel's adapters call (data-tables, executions) and writes the two VM files the panel reads
// (status/health.json, radar/radar-YYYY-MM-DD.json) into SHARED_DIR. Every timestamp is relative to "now", so the
// demo always looks like today. Used by `pnpm demo` (scripts/demo/run.mjs) and the portfolio recording.
import { mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';

const PORT = Number(process.env.FAKE_N8N_PORT ?? 5679);
const SHARED_DIR = process.env.SHARED_DIR ?? '.demo-shared';
const LIMA_OFFSET_H = 5; // America/Lima is UTC-5 all year

/** Latest moment, at or before now, that was HH:MM in Lima (optionally on a given day of the month). */
function lastLima(hh, mm, dayOfMonth) {
  const now = new Date();
  for (let back = 0; back < 62; back++) {
    const d = new Date(now.getTime() - back * 86_400_000);
    const lima = new Date(d.getTime() - LIMA_OFFSET_H * 3_600_000);
    if (dayOfMonth && lima.getUTCDate() !== dayOfMonth) continue;
    const at = new Date(Date.UTC(lima.getUTCFullYear(), lima.getUTCMonth(), lima.getUTCDate(), hh + LIMA_OFFSET_H, mm));
    if (at <= now) return at;
  }
  return now;
}
const limaDate = (d) => new Date(d.getTime() - LIMA_OFFSET_H * 3_600_000).toISOString().slice(0, 10);

// ---- Data tables -------------------------------------------------------------------------------------------------
const watchAt = lastLima(18, 47);
const runTs = Math.floor(watchAt.getTime() / 1000);
const mail = (kind, inbox, from, subject, why, extra = '', scam = false) => ({
  kind, inbox, from_name: from, subject, why, extra, scam, link: 'https://mail.example.com/', run_ts: runTs, run_at: watchAt.toISOString(),
});
const vigia = [
  mail('meta', '', '', '', '', JSON.stringify({ counts: { Outlook: 14, Gmail: 21, Work: 6 }, notes: [] })),
  mail('reply', 'Work', 'Northwind Labs', '[Senior Frontend Engineer] Message from Northwind Labs',
    'The hiring team liked the take-home and asks for two time slots this week for the technical interview.'),
  mail('job', 'Gmail', 'Lumen Health', 'Application received: Full-Stack Engineer (React, NestJS)',
    'Confirms the application; the team reviews profiles within ten days and replies either way.'),
  mail('prize', 'Gmail', 'Gleam', 'Winner notification: mechanical keyboard giveaway',
    'Says you won a keyboard. The sender is allow-listed and DKIM passes, so confirm on the organiser page before claiming.',
    'DKIM + DMARC pass'),
  mail('attention', 'Outlook', 'Microsoft account team', 'Unusual sign-in activity',
    'A sign-in from a new Windows device in Lima at 07:12; confirm it was you or reset the password.'),
  mail('attention', 'Gmail', 'Acme Bank', 'Your November card statement is ready',
    'Statement closed on the 15th; the minimum payment of USD 84.20 is due on 28 November.'),
  mail('attention', 'Outlook', 'Streaming Support', 'Your account is on hold, update your payment method',
    'Possible phishing: the sender failed DKIM and DMARC. Do not open its links; check the account from the official app.',
    '', true),
].map((r, i) => ({ id: i + 1, ...r }));

const tables = [{ id: 'demoVigiaTable01', name: 'vigia' }];
const rowsOf = { demoVigiaTable01: vigia };

// ---- Executions --------------------------------------------------------------------------------------------------
const exec = (id, workflowId, status, at, mode = 'trigger') => ({ id, workflowId, status, mode, startedAt: at.toISOString() });
const jobsAt = lastLima(8, 0);
const executions = [
  exec(412, 'f2DailyWatch0001', 'success', watchAt),
  exec(388, 'f2DailyWatch0001', 'success', new Date(watchAt.getTime() - 86_400_000)),
  exec(415, 'f4JobRadar000001', 'error', jobsAt),
  exec(371, 'f4JobRadar000001', 'success', new Date(jobsAt.getTime() - 4 * 86_400_000)),
  exec(416, 'f5ErrorAlerts001', 'success', lastLima(9, 0)),
  exec(301, 'f2bGmailClean001', 'success', lastLima(4, 0, 1)),
];
const failedRun = {
  ...executions[2],
  data: {
    resultData: {
      lastNodeExecuted: 'Send summary + .md',
      error: {
        name: 'NodeApiError',
        message: 'Gateway timed out - perhaps try again later?',
        description: '504 Gateway Timeout from api.telegram.org after 4 attempts',
        stack: 'NodeApiError: Gateway timed out\n    at ExecuteContext.execute (Telegram.node.ts:2213:12)',
        node: { name: 'Send summary + .md', type: 'n8n-nodes-base.telegram' },
      },
      runData: {
        'Send summary + .md': [{ source: [{ previousNode: 'Build report' }] }],
        'Build report': [{ data: { main: [[{ json: { finalists: 4, doubtful: 7, dropped: 12, file: 'radar-finalists.md', botToken: 'not-a-real-token' } }]] } }],
      },
    },
  },
};

// ---- VM files ----------------------------------------------------------------------------------------------------
function writeShared() {
  mkdirSync(join(SHARED_DIR, 'status'), { recursive: true });
  mkdirSync(join(SHARED_DIR, 'radar'), { recursive: true });
  writeFileSync(join(SHARED_DIR, 'status/health.json'), JSON.stringify({
    generatedAt: Math.floor(Date.now() / 1000) - 1800,
    backups: { n8n: { ageH: 9.4 }, 'app-db': { ageH: 9.3 } },
    diskPct: 64,
    memAvailMB: 2870,
    containersDown: [],
    n8nHealthz: 'ok',
  }));
  const job = (puesto, empresa, fuente, puntaje, n) => ({ puesto, empresa, fuente, puntaje, url: `https://jobs.example.com/${n}` });
  writeFileSync(join(SHARED_DIR, `radar/radar-${limaDate(jobsAt)}.json`), JSON.stringify({
    fecha: limaDate(jobsAt),
    corridas: [{ fresh: 31 }],
    candidatas: [
      job('Senior Frontend Engineer (React)', 'Northwind Labs', 'Get on Board', 86, 1),
      job('Full-Stack Engineer, AI products', 'Lumen Health', 'Remotive', 78, 2),
      job('Product Engineer (TypeScript, NestJS)', 'Tidewater', 'We Work Remotely', 71, 3),
      job('Frontend Engineer, design systems', 'Cobalt Pay', 'Himalayas', 64, 4),
      job('Software Engineer, integrations', 'Orbital Logistics', 'Get on Board', 47, 5),
    ],
  }));
}

// ---- HTTP --------------------------------------------------------------------------------------------------------
const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
};

createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const p = url.pathname.replace(/^\/api\/v1/, '');
  if (!req.headers['x-n8n-api-key']) return send(res, 401, { message: 'X-N8N-API-KEY header required' });
  if (req.method !== 'GET') return send(res, 405, { message: 'the demo is read-only' });
  if (p === '/data-tables') return send(res, 200, { data: tables, nextCursor: null });
  const rows = p.match(/^\/data-tables\/([^/]+)\/rows$/);
  if (rows) return send(res, 200, { data: rowsOf[rows[1]] ?? [], nextCursor: null });
  if (p === '/executions') {
    const wf = url.searchParams.get('workflowId');
    const status = url.searchParams.get('status');
    const limit = Number(url.searchParams.get('limit') ?? 10);
    const list = executions
      .filter((e) => e.workflowId === wf && (!status || e.status === status))
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, limit);
    return send(res, 200, { data: list, nextCursor: null });
  }
  const one = p.match(/^\/executions\/(\d+)$/);
  if (one) {
    if (Number(one[1]) === failedRun.id) return send(res, 200, failedRun);
    const e = executions.find((x) => x.id === Number(one[1]));
    return e ? send(res, 200, { ...e, data: { resultData: {} } }) : send(res, 404, { message: 'not found' });
  }
  return send(res, 404, { message: `the demo does not serve ${p}` });
}).listen(PORT, () => {
  writeShared();
  console.log(`fake n8n on http://localhost:${PORT}/api/v1 · shared files in ${SHARED_DIR}`);
});
