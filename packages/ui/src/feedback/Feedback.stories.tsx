import type { Meta, StoryObj } from '@storybook/react-vite';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Skeleton } from './Skeleton';

const meta: Meta = { title: 'Feedback/States' };
export default meta;

const box = (el: React.ReactNode) => <div className="max-w-xl rounded-[18px] border border-line bg-surface">{el}</div>;

export const Empty: StoryObj = { render: () => box(<EmptyState tone="rose" icon="pin" title="Nothing for tomorrow">The 11:30 run refreshes this list every day.</EmptyState>) };
export const AllGood: StoryObj = { render: () => box(<EmptyState tone="ok" title="Every flow's last run went fine" />) };
export const Error: StoryObj = { render: () => box(<ErrorState what="the job radar" onRetry={() => undefined} />) };
export const Loading: StoryObj = { render: () => box(<Skeleton rows={3} />) };
