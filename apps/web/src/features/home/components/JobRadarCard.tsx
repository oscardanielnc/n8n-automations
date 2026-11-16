import { ListRow } from '@panel/ui/data-display/ListRow';
import { SectionCard } from '@panel/ui/data-display/SectionCard';
import { EmptyState } from '@panel/ui/feedback/EmptyState';
import { ErrorState } from '@panel/ui/feedback/ErrorState';
import { Skeleton } from '@panel/ui/feedback/Skeleton';
import { LinkButton } from '@panel/ui/primitives/Button';
import { Tag } from '@panel/ui/primitives/Tag';
import { shortDate } from '../../../lib/format';
import { useJobRadar } from '../api/queries';

export function JobRadarCard() {
  const q = useJobRadar();
  const r = q.data;
  return (
    <SectionCard
      tone="mint"
      icon="bag"
      title="Job radar"
      subtitle={r?.date ? `Report of ${shortDate(r.date)} · ${r.items.length} of ${r.fresh} new offers` : 'Latest report'}
    >
      {q.isPending && <Skeleton rows={3} />}
      {q.isError && <ErrorState what="the job radar" onRetry={() => void q.refetch()} />}
      {r && r.items.length === 0 && <EmptyState tone="mint" icon="bag" title="No candidates in the last report" />}
      {r?.items.map((j) => (
        <ListRow
          key={j.url}
          leading={
            <span
              className={`inline-flex size-11 flex-none items-center justify-center rounded-full font-mono text-sm font-semibold ${
                j.score >= 50 ? 'bg-[#1f7a52] text-white' : 'bg-mint text-mint-ink'
              }`}
              aria-label={`Score ${j.score}`}
            >
              {j.score}
            </span>
          }
          title={j.title}
          meta={
            <>
              <span>{j.company}</span>
              <Tag>{j.source}</Tag>
            </>
          }
          action={
            <LinkButton variant="ghost" href={j.url} aria-label={`View offer: ${j.title}`}>
              View
            </LinkButton>
          }
        />
      ))}
    </SectionCard>
  );
}
