export type RunOutcome = 'ok' | 'failed';

export type RunSummary = { id: string; workflowId: string; outcome: RunOutcome; mode: string; startedAt: string };

export type RunError = {
  node: string;
  nodeType: string;
  errorType: string;
  message: string;
  description: string;
  stack: string;
  /** First items the failed node received, secrets already redacted, as pretty JSON. */
  nodeInput: string;
};
