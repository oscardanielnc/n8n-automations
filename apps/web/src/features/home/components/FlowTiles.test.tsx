import type { FlowStatus } from '@panel/contracts';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { FlowTiles } from './FlowTiles';

const flow = (over: Partial<FlowStatus>): FlowStatus => ({
  key: 'vigia', name: 'Daily watch', schedule: 'Daily 18:47', page: 'home', status: 'ok',
  lastRunAt: '2026-11-15T23:47:00.000Z', nextRunAt: '2026-11-16T23:47:00.000Z', ...over,
});

const renderTiles = (flows: FlowStatus[]) =>
  render(
    <MemoryRouter>
      <FlowTiles flows={flows} />
    </MemoryRouter>,
  );

describe('FlowTiles', () => {
  it('a failed flow links straight to the Errors page, a healthy one to its page', () => {
    renderTiles([flow({}), flow({ key: 'jobs', name: 'Job radar', status: 'failed' })]);
    expect(screen.getByRole('link', { name: /Daily watch/ })).toHaveAttribute('href', '/');
    const failed = screen.getByRole('link', { name: /Job radar/ });
    expect(failed).toHaveAttribute('href', '/errors');
    expect(failed).toHaveTextContent('Failed');
  });

  it('says so in words when a flow never ran, not only with a colour', () => {
    renderTiles([flow({ key: 'cleanup', name: 'Mail cleanup', status: 'never', lastRunAt: null })]);
    expect(screen.getByRole('link', { name: /Mail cleanup/ })).toHaveTextContent('Never ran');
  });
});
