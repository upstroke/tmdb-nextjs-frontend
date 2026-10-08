// vitest/component/MediaTypeLabel.browser.test.jsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MediaTypeLabel from '../../components/MediaTypeLabel';

vi.mock('@/lib/stores/locale', () => ({
  useI18n: () => ({
    labels: {
      movie: 'Movie',
      tvShow: 'TV Show',
    },
  }),
}));

describe('MediaTypeLabel (browser)', () => {
  // Statement Coverage: Covers the movie branch and the default empty className value.
  it('renders a blue movie label with translated movie text', () => {
    render(<MediaTypeLabel mediaType="movie" />);

    const label = screen.getByText('Movie');

    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('ui', 'label', 'blue');
  });

  // Statement Coverage: Covers the TV branch and appends a custom className.
  it('renders a teal tv label with translated tv text and custom className', () => {
    render(<MediaTypeLabel mediaType="tv" className="custom-class" />);

    const label = screen.getByText('TV Show');

    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('ui', 'label', 'teal', 'custom-class');
  });

  // Statement Coverage: Covers the guard clause that returns null for unsupported media types.
  it('renders nothing for an unsupported media type', () => {
    const { container } = render(<MediaTypeLabel mediaType="podcast" />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByText('Movie')).not.toBeInTheDocument();
    expect(screen.queryByText('TV Show')).not.toBeInTheDocument();
  });
});
