import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatusPill } from './StatusPill';

const meta: Meta<typeof StatusPill> = { title: 'Primitives/StatusPill', component: StatusPill };
export default meta;

export const Ok: StoryObj<typeof StatusPill> = { args: { state: 'ok' } };
export const Failed: StoryObj<typeof StatusPill> = { args: { state: 'failed' } };
export const Never: StoryObj<typeof StatusPill> = { args: { state: 'never' } };
export const LongText: StoryObj<typeof StatusPill> = {
  args: { state: 'ok', children: 'Job radar · ran Today 08:00 · next Thu 19 Nov · 08:00' },
};
export const Small: StoryObj<typeof StatusPill> = { args: { state: 'failed', small: true } };
