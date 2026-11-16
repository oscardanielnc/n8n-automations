import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { Segmented } from './Segmented';

const meta: Meta = { title: 'Navigation/Segmented' };
export default meta;

function Demo() {
  const [v, setV] = useState<'today' | 'tomorrow' | 'week' | 'next'>('today');
  return (
    <Segmented
      label="When"
      value={v}
      onChange={setV}
      options={[
        { value: 'today', label: 'Today', count: 4 },
        { value: 'tomorrow', label: 'Tomorrow', count: 0 },
        { value: 'week', label: 'This week', count: 2 },
        { value: 'next', label: 'Next week', count: 1 },
      ]}
    />
  );
}

export const WhenTabs: StoryObj = { render: () => <Demo /> };
