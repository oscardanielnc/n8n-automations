import { CronExpressionParser } from 'cron-parser';
import { LIMA } from '../../../shared/domain/dates';

export type FlowKey = 'vigia' | 'jobs' | 'alerts' | 'cleanup';

export type FlowDefinition = {
  key: FlowKey;
  name: string;
  /** n8n workflow id, fixed in each builder so it survives re-imports. */
  workflowId: string;
  n8nName: string;
  crons: string[];
  schedule: string;
  page: 'home';
  builder: string;
};

// Mirrors n8n/workflows/build_*.py. Changing a schedule there means changing it here.
export const FLOWS: FlowDefinition[] = [
  { key: 'vigia', name: 'Daily watch', workflowId: 'f2DailyWatch0001', n8nName: 'F2 - Daily watch (Gmail + Outlook + Jev)',
    crons: ['47 18 * * *'], schedule: 'Daily 18:47', page: 'home', builder: 'workflows/build_f2.py' },
  { key: 'jobs', name: 'Job radar', workflowId: 'f4JobRadar000001', n8nName: 'F4 - Job radar (Mon/Thu)',
    crons: ['0 8 * * 1,4'], schedule: 'Mon + Thu 08:00', page: 'home', builder: 'workflows/build_f4.py' },
  { key: 'alerts', name: 'Alerts', workflowId: 'f5ErrorAlerts001', n8nName: 'F5 - Alerts (errors + daily health)',
    crons: ['0 9 * * *'], schedule: 'On error + daily 09:00', page: 'home', builder: 'workflows/build_f5.py' },
  { key: 'cleanup', name: 'Mail cleanup', workflowId: 'f2bGmailClean001', n8nName: 'F2b - Monthly mail cleanup',
    crons: ['0 4 1 * *'], schedule: 'Day 1 · 04:00', page: 'home', builder: 'workflows/build_cleanup.py' },
];

export function nextRun(flow: FlowDefinition, now: Date): string {
  const next = flow.crons.map((c) => CronExpressionParser.parse(c, { tz: LIMA, currentDate: now }).next().getTime());
  return new Date(Math.min(...next)).toISOString();
}
