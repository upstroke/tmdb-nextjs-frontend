// vitest/component/FooterMain.browser.test.jsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FooterMain from '../../../components/FooterMain.jsx';

describe('FooterMain (browser)', () => {

  // Statement Coverage: Covers the entire layout rendering, text nodes, and strict verification of external attribution URLs.
  // Branch Coverage: Enters the single baseline render path (no logical branches present).
  it('renders site-wide footer with legal labels and verified external attribution links', () => {
    render(<FooterMain />);

    // Verify presence of structural legal layout texts
    expect(screen.getByText('Conditions of Use')).toBeInTheDocument();
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('© by JustWatch')).toBeInTheDocument();

    // Verify IMDb attribution link and strict security attributes
    const imdbLink = screen.getByRole('link', { name: /Content: © by IMDb\.com, Inc\./i });
    expect(imdbLink).toHaveAttribute('href', 'https://www.imdb.com/');
    expect(imdbLink).toHaveAttribute('target', '_blank');
    expect(imdbLink).toHaveAttribute('rel', 'noopener noreferrer');

    // Verify JustWatch streaming data provider link and strict security attributes
    const justWatchLink = screen.getByRole('link', { name: /Streaming-Provider/i });
    expect(justWatchLink).toHaveAttribute('href', 'https://www.justwatch.com/');
    expect(justWatchLink).toHaveAttribute('target', '_blank');
    expect(justWatchLink).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
