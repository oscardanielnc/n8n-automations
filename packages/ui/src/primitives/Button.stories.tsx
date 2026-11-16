import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, LinkButton } from './Button';

const meta: Meta<typeof LinkButton> = { title: 'Primitives/Button', component: LinkButton };
export default meta;

export const ViewPost: StoryObj<typeof LinkButton> = { args: { href: 'https://example.com', children: 'View post' } };
export const OpenEmail: StoryObj<typeof LinkButton> = { args: { href: 'https://example.com', variant: 'ghost', children: 'Open' } };
export const Action: StoryObj = { render: () => <Button icon="plus">Add</Button> };
export const Disabled: StoryObj = { render: () => <Button icon="plus" disabled>Add</Button> };
export const CopyForClaude: StoryObj = { render: () => <Button icon="copy">Copy for Claude</Button> };
