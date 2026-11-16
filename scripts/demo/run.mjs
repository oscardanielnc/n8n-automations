#!/usr/bin/env node
// `pnpm demo`: the whole panel on invented data. Builds once, then runs the fake n8n API and the real NestJS API,
// which also serves the React build on one origin, as in production (ADR 0002). Open http://localhost:3110.
import { spawn, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const shared = resolve(root, '.demo-shared');

if (!process.argv.includes('--no-build')) {
  const b = spawnSync('pnpm', ['build'], { cwd: root, stdio: 'inherit', shell: true });
  if (b.status !== 0) process.exit(b.status ?? 1);
}

const env = {
  ...process.env,
  NODE_ENV: 'development',
  PORT: '3110',
  N8N_API_URL: 'http://localhost:5679/api/v1',
  N8N_API_KEY: 'demo-key-not-a-real-n8n-key',
  N8N_PUBLIC_URL: 'http://localhost:5678',
  SHARED_DIR: shared,
  WEB_DIST: resolve(root, 'apps/web/dist'),
  AUTH_DISABLED: 'true',
};

const children = [
  spawn(process.execPath, [resolve(root, 'scripts/demo/fake-n8n.mjs')], { env: { ...env, SHARED_DIR: shared }, stdio: 'inherit' }),
  spawn(process.execPath, [resolve(root, 'apps/api/dist/main.js')], { cwd: resolve(root, 'apps/api'), env, stdio: 'inherit' }),
];
console.log('Panel demo on http://localhost:3110 (Ctrl+C to stop)');
const stop = () => children.forEach((c) => c.kill());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
