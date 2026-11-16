import { z } from 'zod';

// Every API response is defined once here; the API validates what it returns, the web parses what it gets.

export const FlowKey = z.enum(['vigia', 'jobs', 'alerts', 'cleanup']);
export const Page = z.enum(['home']);
export const RunStatus = z.enum(['ok', 'failed', 'never']);

export const FlowStatus = z.object({
  key: FlowKey,
  name: z.string(),
  schedule: z.string(),
  page: Page,
  status: RunStatus,
  lastRunAt: z.string().nullable(),
  nextRunAt: z.string().nullable(),
});
export type FlowStatus = z.infer<typeof FlowStatus>;

export const Overview = z.object({
  flows: z.array(FlowStatus),
  openFailures: z.number().int(),
});
export type Overview = z.infer<typeof Overview>;

export const Failure = z.object({
  workflowId: z.string(),
  workflowName: z.string(),
  executionId: z.string(),
  executionUrl: z.string(),
  startedAt: z.string(),
  mode: z.string(),
  node: z.string(),
  errorType: z.string(),
  message: z.string(),
  report: z.string(),
});
export type Failure = z.infer<typeof Failure>;

export const MailKind = z.enum(['reply', 'win', 'prize', 'job', 'attention']);
export const VigiaItem = z.object({
  kind: MailKind,
  inbox: z.string(),
  from: z.string(),
  subject: z.string(),
  link: z.string(),
  summary: z.string(),
  phishing: z.boolean(),
  note: z.string(),
});
export type VigiaItem = z.infer<typeof VigiaItem>;

export const Vigia = z.object({
  runAt: z.string().nullable(),
  counts: z.object({ outlook: z.number().int(), gmail: z.number().int(), work: z.number().int() }),
  notes: z.array(z.string()),
  items: z.array(VigiaItem),
});
export type Vigia = z.infer<typeof Vigia>;

export const JobRadar = z.object({
  date: z.string().nullable(),
  fresh: z.number().int(),
  items: z.array(
    z.object({ title: z.string(), company: z.string(), source: z.string(), score: z.number(), url: z.string() }),
  ),
});
export type JobRadar = z.infer<typeof JobRadar>;

export const ServerHealth = z.object({
  checkedAt: z.string().nullable(),
  diskPct: z.number().nullable(),
  memAvailMb: z.number().nullable(),
  backups: z.array(z.object({ name: z.string(), ageHours: z.number().nullable() })),
  containersDown: z.array(z.string()),
  n8nHealthy: z.boolean(),
});
export type ServerHealth = z.infer<typeof ServerHealth>;
