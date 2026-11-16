import type { Failure } from '@panel/contracts';
import { Icon } from '@panel/ui/icons/Icon';
import { Button } from '@panel/ui/primitives/Button';
import { useEffect, useRef, useState } from 'react';

/** Side drawer with everything Claude needs; its URL (?id=) can be pasted too. Escape or the backdrop closes it. */
export function FailureDrawer({ failure, onClose }: { failure: Failure; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(failure.report);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(31,29,26,.35)]" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Error in ${failure.workflowName}`}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[620px] flex-col gap-3.5 overflow-y-auto bg-surface p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-serif text-[22px] font-semibold">{failure.workflowName}</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="inline-flex size-9 items-center justify-center rounded-[10px] text-muted hover:bg-bg">
            <Icon name="close" />
          </button>
        </div>
        {failure.executionUrl && (
          <a href={failure.executionUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-[13px] text-[#3b4fd8] underline">
            Execution #{failure.executionId} in n8n
          </a>
        )}
        <pre className="m-0 whitespace-pre-wrap break-words rounded-xl bg-bg p-3.5 font-mono text-xs leading-relaxed">{failure.report}</pre>
        <div>
          <Button icon={copied ? 'check' : 'copy'} onClick={() => void copy()}>
            {copied ? 'Copied' : 'Copy for Claude'}
          </Button>
        </div>
      </aside>
    </div>
  );
}
