import type { Preview } from '@storybook/react-vite';
import '../src/theme.css';

const preview: Preview = {
  parameters: {
    backgrounds: { default: 'panel', values: [{ name: 'panel', value: '#f6f4ef' }] },
    a11y: { test: 'error' },
  },
};
export default preview;
