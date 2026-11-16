import type { ZodType } from 'zod';

/** An RFC 9457 problem returned by the API; `code` is stable, `detail` is for humans. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    detail: string,
  ) {
    super(detail);
  }
}

async function request(method: string, path: string, body?: unknown): Promise<Response> {
  const res = await fetch(`/api/v1${path}`, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'same-origin',
  });
  if (!res.ok) {
    const p = (await res.json().catch(() => ({}))) as { code?: string; detail?: string };
    throw new ApiError(res.status, p.code ?? 'http_error', p.detail ?? res.statusText);
  }
  return res;
}

/** GET + contract check: if the API ever drifts from packages/contracts, this fails loudly instead of rendering garbage. */
export async function get<T>(path: string, schema: ZodType<T>): Promise<T> {
  return schema.parse(await (await request('GET', path)).json());
}
