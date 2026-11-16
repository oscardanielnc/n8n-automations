import type { FlowStatus } from '@panel/contracts';
import { StatusPill } from '@panel/ui/primitives/StatusPill';
import { Link } from 'react-router';
import { when } from '../lib/format';

/** Last run of a flow at the top of its page; a failed run links to the Errors page. */
export function RunTag({ flow }: { flow: FlowStatus | undefined }) {
  if (!flow) return null;
  const text = `${flow.name} · ${flow.status === 'never' ? 'never ran' : `ran ${when(flow.lastRunAt)}`} · next ${when(flow.nextRunAt)}`;
  const pill = <StatusPill state={flow.status}>{text}</StatusPill>;
  return flow.status === 'failed' ? (
    <Link to="/errores" aria-label={`${text}. Open errors`}>
      {pill}
    </Link>
  ) : (
    pill
  );
}
