import type { FlowDefinition } from './flow-catalog';
import type { RunError, RunSummary } from './run';

/** The text pasted into a coding agent (or read by a person): everything needed to fix the failure without opening n8n. */
export function failureReport(input: {
  flow: FlowDefinition;
  run: RunSummary;
  error: RunError | null;
  lastSuccess: RunSummary | null;
  executionUrl: string;
  n8nVersion: string;
}): string {
  const { flow, run, error, lastSuccess } = input;
  const lima = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', { timeZone: 'America/Lima', dateStyle: 'medium', timeStyle: 'short' });
  const stack = (error?.stack ?? '').split('\n').slice(0, 20).join('\n');
  return [
    `Workflow: ${flow.n8nName} (${flow.workflowId})`,
    `Builder: ${flow.builder}`,
    `Execution: #${run.id} · mode ${run.mode} · ${lima(run.startedAt)} Lima`,
    `URL: ${input.executionUrl}`,
    `Failed node: ${error?.node ?? 'unknown'} [${error?.nodeType ?? '?'}]`,
    `Error: ${error?.errorType ?? 'unknown'}`,
    `Message: ${error?.message ?? 'no message'}`,
    error?.description ? `Description: ${error.description}` : null,
    stack ? `Stack (first 20 lines):\n${stack}` : null,
    error?.nodeInput ? `Node input (first 3 items, secrets redacted):\n${error.nodeInput}` : null,
    `Last successful run: ${lastSuccess ? `#${lastSuccess.id} · ${lima(lastSuccess.startedAt)} Lima` : 'none in the kept history (14 days)'}`,
    `n8n version: ${input.n8nVersion}`,
  ]
    .filter((l): l is string => l !== null)
    .join('\n');
}
