import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, toneFor } from './Avatar';

const meta: Meta<typeof Avatar> = { title: 'Primitives/Avatar', component: Avatar };
export default meta;

export const Sizes: StoryObj = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar text="bcp" size="sm" tone="sky" />
      <Avatar text="Microsoft" tone="lav" />
      <Avatar text="@lashamacas.hotel" size="lg" tone={toneFor('lashamacas.hotel')} />
    </div>
  ),
};
export const EmptyText: StoryObj<typeof Avatar> = { args: { text: '' } };
