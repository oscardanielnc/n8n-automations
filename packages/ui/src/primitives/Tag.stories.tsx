import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './Tag';

const meta: Meta<typeof Tag> = { title: 'Primitives/Tag', component: Tag };
export default meta;

export const AllTones: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(['lav', 'peach', 'rose', 'mint', 'butter', 'sky', 'slate', 'sand', 'ok', 'fail', 'warn'] as const).map((t) => (
        <Tag key={t} tone={t}>
          {t}
        </Tag>
      ))}
    </div>
  ),
};
export const WithIcon: StoryObj<typeof Tag> = { args: { tone: 'sky', icon: 'globe', children: 'Worldwide' } };
export const Phishing: StoryObj<typeof Tag> = { args: { tone: 'fail', children: 'Looks like phishing' } };
