import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '../feedback/Skeleton';
import { LinkButton } from '../primitives/Button';
import { Tag } from '../primitives/Tag';
import { ListRow } from './ListRow';
import { SectionCard } from './SectionCard';

const meta: Meta<typeof SectionCard> = { title: 'Data display/SectionCard', component: SectionCard };
export default meta;

const row = (
  <ListRow
    title="Keep your Copilot history: sign in by 31 Dec"
    summary="Sign in to Copilot once before 31 December 2026 or your old chats are deleted."
    meta={
      <>
        <span>Microsoft</span>
        <Tag tone="sky">Outlook</Tag>
      </>
    }
    action={
      <LinkButton variant="ghost" href="https://example.com">
        Open
      </LinkButton>
    }
  />
);

export const WithItems: StoryObj = {
  render: () => (
    <SectionCard tone="lav" icon="mail" title="Vigía" subtitle="Your mail of the last 24 h" aside={<Tag tone="sky">Outlook 19</Tag>}>
      {row}
      {row}
    </SectionCard>
  ),
};
export const Loading: StoryObj = {
  render: () => (
    <SectionCard tone="mint" icon="bag" title="Job radar">
      <Skeleton rows={3} />
    </SectionCard>
  ),
};
export const LongTitleWraps: StoryObj = {
  render: () => (
    <div className="max-w-sm">
      <SectionCard tone="peach" icon="ticket" title="A very long section title that has to wrap" subtitle="On a phone">
        {row}
      </SectionCard>
    </div>
  ),
};
