import type { JobRadar, ServerHealth } from '@panel/contracts';

/** health.json written by the VM cron at 08:30. */
export abstract class HealthSource {
  abstract read(): Promise<ServerHealth>;
}

/** Latest radar-YYYY-MM-DD.json written by the job radar (no AI, no cost: the file already exists). */
export abstract class JobRadarSource {
  abstract latest(): Promise<JobRadar>;
}
