import { Inject, Injectable } from '@nestjs/common';
import { ENV, Env } from '../../../config/env';

export type Row = Record<string, unknown> & { id: number };
export type ColumnType = 'string' | 'number' | 'boolean' | 'date';
type Condition = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'isEmpty' | 'isNotEmpty';
export type RowFilter = { columnName: string; condition: Condition; value?: unknown }[];

export class N8nUnavailableError extends Error {}

/**
 * Thin HTTP client for the n8n public API (ADR 0001). Knows URLs and paging, nothing about the panel's rules.
 * Tables are resolved by EXACT name to their id once (n8n's own name lookup is a partial match).
 */
@Injectable()
export class N8nClient {
  private tableIds = new Map<string, string>();

  constructor(@Inject(ENV) private readonly env: Env) {}

  private async call<T>(method: string, path: string, body?: unknown): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${this.env.N8N_API_URL}${path}`, {
        method,
        headers: { 'X-N8N-API-KEY': this.env.N8N_API_KEY, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (e) {
      throw new N8nUnavailableError(`n8n did not answer ${method} ${path}: ${(e as Error).message}`);
    }
    if (!res.ok) throw new N8nUnavailableError(`n8n ${method} ${path} -> ${res.status} ${(await res.text()).slice(0, 200)}`);
    const text = await res.text();
    return (text ? JSON.parse(text) : null) as T;
  }

  async tableId(name: string): Promise<string | null> {
    const cached = this.tableIds.get(name);
    if (cached) return cached;
    let cursor: string | undefined;
    for (let page = 0; page < 10; page++) {
      const q = new URLSearchParams({ limit: '100', ...(cursor ? { cursor } : {}) });
      const r = await this.call<{ data: { id: string; name: string }[]; nextCursor?: string | null }>(
        'GET',
        `/data-tables?${q}`,
      );
      for (const t of r.data) this.tableIds.set(t.name, t.id);
      if (!r.nextCursor) break;
      cursor = r.nextCursor;
    }
    return this.tableIds.get(name) ?? null;
  }

  async ensureTable(name: string, columns: { name: string; type: ColumnType }[]): Promise<string> {
    const existing = await this.tableId(name);
    if (existing) return existing;
    const created = await this.call<{ id: string }>('POST', '/data-tables', { name, columns });
    this.tableIds.set(name, created.id);
    return created.id;
  }

  /** All rows of a table (paged), optionally filtered. A table that does not exist yet reads as empty. */
  async rows(table: string, filter?: RowFilter): Promise<Row[]> {
    const id = await this.tableId(table);
    if (!id) return [];
    const out: Row[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 50; page++) {
      const q = new URLSearchParams({ limit: '250' });
      if (cursor) q.set('cursor', cursor);
      if (filter?.length) q.set('filter', JSON.stringify({ type: 'and', filters: filter }));
      const r = await this.call<{ data: Row[]; nextCursor?: string | null }>('GET', `/data-tables/${id}/rows?${q}`);
      out.push(...r.data);
      if (!r.nextCursor) break;
      cursor = r.nextCursor;
    }
    return out;
  }

  async insert(table: string, data: Record<string, unknown>[]): Promise<void> {
    const id = await this.tableId(table);
    if (!id) throw new N8nUnavailableError(`table ${table} does not exist`);
    await this.call('POST', `/data-tables/${id}/rows`, { data, returnType: 'count' });
  }

  async update(table: string, filter: RowFilter, data: Record<string, unknown>): Promise<void> {
    const id = await this.tableId(table);
    if (!id) throw new N8nUnavailableError(`table ${table} does not exist`);
    await this.call('PATCH', `/data-tables/${id}/rows/update`, { filter: { type: 'and', filters: filter }, data });
  }

  async delete(table: string, filter: RowFilter): Promise<void> {
    const id = await this.tableId(table);
    if (!id) return;
    const q = new URLSearchParams({ filter: JSON.stringify({ type: 'and', filters: filter }) });
    await this.call('DELETE', `/data-tables/${id}/rows/delete?${q}`);
  }

  executions(params: { workflowId: string; limit: number; status?: string; includeData?: boolean }) {
    const q = new URLSearchParams({ workflowId: params.workflowId, limit: String(params.limit) });
    if (params.status) q.set('status', params.status);
    if (params.includeData) q.set('includeData', 'true');
    return this.call<{ data: RawExecution[] }>('GET', `/executions?${q}`).then((r) => r.data);
  }

  execution(id: string) {
    return this.call<RawExecution>('GET', `/executions/${id}?includeData=true`);
  }
}

export type RawExecution = {
  id: string | number;
  workflowId: string;
  mode: string;
  status: string;
  startedAt: string;
  stoppedAt?: string | null;
  data?: unknown;
};
