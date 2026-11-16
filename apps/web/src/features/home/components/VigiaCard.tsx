import type { Vigia, VigiaItem } from '@panel/contracts';
import { ListRow } from '@panel/ui/data-display/ListRow';
import { SectionCard } from '@panel/ui/data-display/SectionCard';
import { EmptyState } from '@panel/ui/feedback/EmptyState';
import { ErrorState } from '@panel/ui/feedback/ErrorState';
import { Skeleton } from '@panel/ui/feedback/Skeleton';
import { Avatar } from '@panel/ui/primitives/Avatar';
import { LinkButton } from '@panel/ui/primitives/Button';
import { Tag } from '@panel/ui/primitives/Tag';
import { type Tone, toneBg } from '@panel/ui/tone';
import { when } from '../../../lib/format';
import { useVigia } from '../api/queries';

const INBOX_TONE: Record<string, Tone> = { Outlook: 'sky', Gmail: 'rose', Work: 'lav' };
const GROUPS: { kind: VigiaItem['kind']; label: string; tone: Tone }[] = [
  { kind: 'reply', label: 'Companies replied', tone: 'rose' },
  { kind: 'win', label: 'You won', tone: 'mint' },
  { kind: 'prize', label: 'Possible prizes', tone: 'peach' },
  { kind: 'attention', label: 'Attention', tone: 'butter' },
];

export function VigiaCard() {
  const q = useVigia();
  const v = q.data;
  return (
    <SectionCard
      tone="lav"
      icon="mail"
      title="Daily watch"
      subtitle={v?.runAt ? `Your mail of the last 24 h · ${when(v.runAt)}` : 'Your mail of the last 24 h'}
      aside={
        v && (
          <>
            <Tag tone="sky">Outlook {v.counts.outlook}</Tag>
            <Tag tone="rose">Gmail {v.counts.gmail}</Tag>
            <Tag tone="lav">Work {v.counts.work}</Tag>
          </>
        )
      }
    >
      {q.isPending && <Skeleton rows={4} />}
      {q.isError && <ErrorState what="the daily watch" onRetry={() => void q.refetch()} />}
      {v && <VigiaBody v={v} />}
    </SectionCard>
  );
}

function VigiaBody({ v }: { v: Vigia }) {
  if (!v.runAt) return <EmptyState title="No run yet">It runs every day at 18:47.</EmptyState>;
  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2.5 px-5 py-4">
        {GROUPS.map((g) => {
          const n = v.items.filter((i) => i.kind === g.kind).length;
          return (
            <div key={g.kind} className={`rounded-[14px] px-3.5 py-3 ${toneBg[g.tone]} ${n ? '' : 'opacity-70'}`}>
              <div className="text-xs font-semibold">{g.label}</div>
              <div className="font-serif text-[26px] font-semibold">{n}</div>
            </div>
          );
        })}
      </div>
      {v.notes.length > 0 && (
        <ul className="px-5 pb-3 text-[13px] text-muted">
          {v.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      )}
      {v.items.length === 0 ? (
        <EmptyState tone="mint" title="Nothing important today" />
      ) : (
        <div>
          {v.items.map((m, i) => (
            <ListRow
              key={`${m.link}-${i}`}
              leading={<Avatar text={m.from} tone={INBOX_TONE[m.inbox] ?? 'sand'} />}
              title={m.subject}
              summary={m.summary || undefined}
              meta={
                <>
                  <span>{m.from}</span>
                  <Tag tone={INBOX_TONE[m.inbox] ?? 'sand'}>{m.inbox}</Tag>
                  {m.phishing && <Tag tone="fail">Looks like phishing</Tag>}
                  {m.kind === 'reply' && <Tag tone="rose">Answer today</Tag>}
                  {m.note && <span className="text-xs">{m.note}</span>}
                </>
              }
              action={
                <LinkButton variant="ghost" href={m.link} aria-label={`Open email: ${m.subject}`}>
                  Open
                </LinkButton>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
