import type { RunError, RunSummary } from '../../domain/run';

export abstract class ExecutionsReader {
  /** Latest execution that finished (running ones are skipped), or null if the workflow never ran. */
  abstract latestFinished(workflowId: string): Promise<RunSummary | null>;
  abstract lastSuccess(workflowId: string): Promise<RunSummary | null>;
  abstract errorOf(executionId: string): Promise<RunError | null>;
}
