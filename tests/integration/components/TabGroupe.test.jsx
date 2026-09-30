import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TabGroupe from '@/components/TabGroupe.jsx';
import { i18nMockDefault } from '$tests/mocks/i18n.mocks.js';

vi.mock('@/lib/stores/locale.js', () => ({
  useI18n: () => i18nMockDefault,
  useLocale: () => 'en-US',
}));

const tabs = [
  {
    id: '1',
    label: 'Season 1',
    episodes: [
      { id: 'e1', name: 'Pilot', air_date: '2024-01-15', overview: 'The first episode.' },
    ],
  },
  {
    id: '2',
    label: 'Season 2',
    episodes: [
      { id: 'e2', name: 'Return', air_date: '2025-01-20', overview: 'The second season begins.' },
    ],
  },
];

describe('TabGroupe', () => {
  it('renders all tab buttons', () => {
    render(<TabGroupe tabs={tabs} ariaLabel="Seasons" />);

    expect(screen.getByRole('tab', { name: 'Season 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Season 2' })).toBeInTheDocument();
  });

  it('shows the first tab panel by default', () => {
    render(<TabGroupe tabs={tabs} ariaLabel="Seasons" />);

    expect(screen.getByText('1. Pilot')).toBeVisible();
    expect(document.getElementById('panel-2')).not.toBeVisible();
  });

  it('switches to the clicked tab panel', async () => {
    render(<TabGroupe tabs={tabs} ariaLabel="Seasons" />);

    await userEvent.click(screen.getByRole('tab', { name: 'Season 2' }));

    expect(screen.getByText('1. Return')).toBeVisible();
  });

  it('sets aria-selected correctly after tab switch', async () => {
    render(<TabGroupe tabs={tabs} ariaLabel="Seasons" />);

    await userEvent.click(screen.getByRole('tab', { name: 'Season 2' }));

    expect(screen.getByRole('tab', { name: 'Season 2' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Season 1' })).toHaveAttribute('aria-selected', 'false');
  });

  it('moves focus to the next tab with ArrowRight', async () => {
    render(<TabGroupe tabs={tabs} ariaLabel="Seasons" />);

    screen.getByRole('tab', { name: 'Season 1' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Season 2' })).toHaveFocus();
  });

  it('wraps focus from last tab to first with ArrowRight', async () => {
    render(<TabGroupe tabs={tabs} ariaLabel="Seasons" />);

    screen.getByRole('tab', { name: 'Season 2' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Season 1' })).toHaveFocus();
  });

  it('moves focus to previous tab with ArrowLeft', async () => {
    render(<TabGroupe tabs={tabs} ariaLabel="Seasons" />);

    screen.getByRole('tab', { name: 'Season 2' }).focus();
    await userEvent.keyboard('{ArrowLeft}');

    expect(screen.getByRole('tab', { name: 'Season 1' })).toHaveFocus();
  });

  it('shows loading message when tab.loading is true', () => {
    const loadingTabs = [{ id: '1', label: 'Season 1', loading: true }];
    render(<TabGroupe tabs={loadingTabs} ariaLabel="Seasons" />);

    expect(screen.getByText('Loading\u2026')).toBeInTheDocument();
  });

  it('calls onTabSelect with the tab id when a tab is clicked', async () => {
    const onTabSelect = vi.fn();
    render(<TabGroupe tabs={tabs} ariaLabel="Seasons" onTabSelect={onTabSelect} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Season 2' }));

    expect(onTabSelect).toHaveBeenCalledWith('2');
  });

  it('renders the tablist with the provided aria-label', () => {
    render(<TabGroupe tabs={tabs} ariaLabel="TV Seasons" />);

    expect(screen.getByRole('tablist', { name: 'TV Seasons' })).toBeInTheDocument();
  });
});
