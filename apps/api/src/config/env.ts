import { z } from 'zod';

// Validated once at boot: a missing or malformed variable stops the app instead of failing on the first request.
const Env = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().default(3110),
    N8N_API_URL: z.string().url().default('http://n8n:5678/api/v1'),
    N8N_API_KEY: z.string().min(20),
    N8N_PUBLIC_URL: z.string().url().default('http://localhost:5678'),
    SHARED_DIR: z.string().default('/data/shared'),
    WEB_DIST: z.string().default('/app/web'),
    ACCESS_TEAM_DOMAIN: z.string().url().optional(),
    ACCESS_AUD: z.string().min(10).optional(),
    AUTH_DISABLED: z
      .enum(['true', 'false'])
      .default('false')
      .transform((v) => v === 'true'),
  })
  .superRefine((e, ctx) => {
    if (e.NODE_ENV === 'production' && e.AUTH_DISABLED)
      ctx.addIssue({ code: 'custom', message: 'AUTH_DISABLED is not allowed in production' });
    if (!e.AUTH_DISABLED && (!e.ACCESS_TEAM_DOMAIN || !e.ACCESS_AUD))
      ctx.addIssue({ code: 'custom', message: 'ACCESS_TEAM_DOMAIN and ACCESS_AUD are required unless AUTH_DISABLED=true' });
  });

export type Env = z.infer<typeof Env>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const parsed = Env.safeParse(source);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `- ${i.path.join('.') || 'env'}: ${i.message}`);
    throw new Error(`Invalid environment:\n${lines.join('\n')}`);
  }
  return parsed.data;
}

export const ENV = Symbol('ENV');
