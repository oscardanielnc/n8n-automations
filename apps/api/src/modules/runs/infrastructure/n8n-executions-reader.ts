import { Injectable } from '@nestjs/common';
import { N8nClient, RawExecution } from '../../../shared/infrastructure/n8n/n8n-client';
import { ExecutionsReader } from '../application/ports/executions-reader.port';
import type { RunError, RunSummary } from '../domain/run';

const FINISHED_OK = new Set(['success']);
const FINISHED_BAD = new Set(['error', 'crashed', 'canceled']);
const SECRET = /token|key|secret|password|passwd|authorization|cookie|bearer/i;

function toSummary(e: RawExecution): RunSummary {
  return {
    id: String(e.id),
    workflowId: e.workflowId,
    outcome: FINISHED_OK.has(e.status) ? 'ok' : 'failed',
    mode: e.mode,
    startedAt: new Date(e.startedAt).toISOString(),
  };
}

function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[…]';
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, SECRET.test(k) ? '[redacted]' : redact(v, depth + 1)]),
    );
  if (typeof value === 'string') return value.length > 300 ? `${value.slice(0, 300)}…` : value;
  return value;
}

type ResultData = {
  error?: { message?: string; description?: string; name?: string; stack?: string; node?: { name?: string; type?: string } };
  lastNodeExecuted?: string;
  runData?: Record<string, { source?: { previousNode?: string }[]; data?: { main?: { json?: unknown }[][] } }[]>;
};

@Injectable()
export class N8nExecutionsReader extends ExecutionsReader {
  constructor(private readonly n8n: N8nClient) {
    super();
  }

  async latestFinished(workflowId: string): Promise<RunSummary | null> {
    const runs = await this.n8n.executions({ workflowId, limit: 10 });
    const done = runs.find((e) => FINISHED_OK.has(e.status) || FINISHED_BAD.has(e.status));
    return done ? toSummary(done) : null;
  }

  async lastSuccess(workflowId: string): Promise<RunSummary | null> {
    const runs = await this.n8n.executions({ workflowId, limit: 1, status: 'success' });
    return runs[0] ? toSummary(runs[0]) : null;
  }

  async errorOf(executionId: string): Promise<RunError | null> {
    const e = await this.n8n.execution(executionId);
    const rd = (e.data as { resultData?: ResultData } | undefined)?.resultData;
    if (!rd) return null;
    const err = rd.error ?? {};
    const node = err.node?.name ?? rd.lastNodeExecuted ?? 'unknown';
    const prev = rd.runData?.[node]?.[0]?.source?.[0]?.previousNode;
    const input = prev ? (rd.runData?.[prev]?.[0]?.data?.main?.[0] ?? []).slice(0, 3).map((i) => i.json) : [];
    return {
      node,
      nodeType: err.node?.type ?? 'unknown',
      errorType: err.name ?? 'Error',
      message: err.message ?? 'no message',
      description: err.description ?? '',
      stack: err.stack ?? '',
      nodeInput: input.length ? JSON.stringify(redact(input), null, 2).slice(0, 3000) : '',
    };
  }
}
