import type { Vigia } from '@panel/contracts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { VigiaCard } from './VigiaCard';

const vigia: Vigia = {
  runAt: '2026-11-15T23:47:00.000Z',
  counts: { outlook: 14, gmail: 21, work: 6 },
  notes: [],
  items: [
    { kind: 'reply', inbox: 'Work', from: 'Northwind Labs', subject: 'Message from Northwind Labs', link: 'https://m/1',
      summary: 'Asks for two interview slots.', phishing: false, note: '' },
    { kind: 'attention', inbox: 'Outlook', from: 'Streaming Support', subject: 'Your account is on hold', link: 'https://m/2',
      summary: 'Possible phishing.', phishing: true, note: '' },
  ],
};

function renderWith(response: Response) {
  vi.stubGlobal('fetch', vi.fn(async () => response));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <VigiaCard />
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe('VigiaCard', () => {
  it('shows the counts per inbox, a company reply first, and tags phishing in words', async () => {
    renderWith(new Response(JSON.stringify(vigia)));
    const reply = (await screen.findByText('Message from Northwind Labs')).closest('div')!.parentElement!;
    expect(within(reply).getByText('Answer today')).toBeInTheDocument();
    expect(screen.getByText('Outlook 14')).toBeInTheDocument();
    expect(screen.getByText('Looks like phishing')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open email: Your account is on hold' })).toHaveAttribute('href', 'https://m/2');
  });

  it('refuses a response that breaks the contract instead of rendering garbage', async () => {
    renderWith(new Response(JSON.stringify({ ...vigia, counts: { outlook: 'many' } })));
    expect(await screen.findByRole('button', { name: /retry/i })).toBeInTheDocument();
  });
});
