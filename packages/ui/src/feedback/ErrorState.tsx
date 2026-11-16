import { Button } from '../primitives/Button';

/** Shown when a block could not load; the rest of the page keeps working. */
export function ErrorState({ what, onRetry }: { what: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-[13px] text-fail-ink">
      <span>Could not load {what}. n8n may be restarting.</span>
      {onRetry && (
        <Button variant="ghost" icon="refresh" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
