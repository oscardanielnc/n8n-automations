import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { ReadToggle } from './ReadToggle';

const meta: Meta<typeof ReadToggle> = { title: 'Primitives/ReadToggle', component: ReadToggle };
export default meta;

export const Unread: StoryObj<typeof ReadToggle> = { args: { read: false, label: '2x1 in makis', onToggle: () => undefined } };
export const Read: StoryObj<typeof ReadToggle> = { args: { read: true, label: '2x1 in makis', onToggle: () => undefined } };

function Interactive() {
  const [read, setRead] = useState(false);
  return <ReadToggle read={read} label="2x1 in makis" onToggle={() => setRead(!read)} />;
}
export const Toggle: StoryObj = { render: () => <Interactive /> };
