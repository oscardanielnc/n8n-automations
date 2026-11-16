import { useQuery } from '@tanstack/react-query';
import { Failure } from '@panel/contracts';
import { EmptyState } from '@panel/ui/feedback/EmptyState';
import { ErrorState } from '@panel/ui/feedback/ErrorState';
import { Skeleton } from '@panel/ui/feedback/Skeleton';
import { useSearchParams } from 'react-router';
import { z } from 'zod';
import { PageTitle } from '../../components/PageTitle';
import { get } from '../../lib/api';
import { when } from '../../lib/format';
import { FailureDrawer } from './components/FailureDrawer';

/** Plain on purpose. No resolve button: a failure leaves when the next run of its flow succeeds. */
export function ErrorsPage() {
  const q = useQuery({ queryKey: ['failures'], queryFn: () => get('/failures', z.array(Failure)), refetchInterval: 60_000 });
  const [params, setParams] = useSearchParams();
  const open = q.data?.find((f) => f.executionId === params.get('id'));

  return (
    <div className="flex flex-col gap-4">
      <PageTitle eyebrow="What failed in the latest run of each flow" title="Errors" />
      <section aria-label="Open errors" className="overflow-hidden rounded-[18px] border border-line bg-surface">
        <div className="px-5 py-3.5 font-bold">Open · {q.data?.length ?? '…'}</div>
        {q.isPending && <Skeleton rows={2} />}
        {q.isError && <ErrorState what="errors" onRetry={() => void q.refetch()} />}
        {q.data?.length === 0 && <EmptyState tone="ok" title="Every flow's last run went fine" />}
        {q.data?.map((f) => (
          <button
            key={f.workflowId + f.executionId}
            type="button"
            onClick={() => setParams({ id: f.executionId })}
            className="flex w-full flex-col gap-1 border-t border-line-soft px-5 py-3.5 text-left hover:bg-bg"
          >
            <span className="font-bold">{f.workflowName}</span>
            <span className="break-words font-mono text-xs text-fail-ink">
              {f.errorType}: {f.message}
            </span>
            <span className="text-xs text-muted">
              Node {f.node} · {when(f.startedAt)} · {f.mode}
            </span>
          </button>
        ))}
      </section>
      <p className="text-[13px] text-muted">An error leaves this list by itself when the next run of its flow succeeds. If it fails again, it comes back.</p>
      {open && <FailureDrawer failure={open} onClose={() => setParams({})} />}
    </div>
  );
}
