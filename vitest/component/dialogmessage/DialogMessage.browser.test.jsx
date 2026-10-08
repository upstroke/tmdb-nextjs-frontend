// vitest/component/DialogMessage.browser.test.jsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import DialogMessage from '../../../components/DialogMessage.jsx';

// Global mock for i18n store infrastructure inside the browser sandbox
vi.mock('@/lib/stores/locale', () => ({
  useI18n: () => ({
    messages: {
      dialogErrorTitle: 'System Error',
      dialogOk: 'OK'
    }
  })
}));

describe('DialogMessage (browser)', () => {

  // Statement Coverage: Covers DOM mount, automatic side-effect triggers (showModal), and custom title strings resolution.
  // Branch Coverage: !dialog || !message -> false; !dialog.open -> true; title ?? messages.dialogErrorTitle -> false.
  it('opens natively as a modal, renders custom title strings, and triggers the onClose callback upon submission', async () => {
    const handleClose = vi.fn();

    const { container } = render(
      <DialogMessage
        message="A critical connection error has been detected."
        title="Custom Connection Fault"
        onClose={handleClose}
      />
    );

    // 1. Verify that the native <dialog> element is rendered and open inside Chromium
    const dialogElement = container.querySelector('dialog');
    expect(dialogElement).toBeInTheDocument();
    expect(dialogElement.open).toBe(true);

    // 2. Verified via plain text because the title is rendered as a <strong> tag (not an ARIA heading role)
    expect(screen.getByText('Custom Connection Fault')).toBeInTheDocument();
    expect(screen.getByText('A critical connection error has been detected.')).toBeInTheDocument();

    // 3. Select the submission element and trigger form actions
    const okButton = screen.getByRole('button', { name: 'OK' });

    // Fire event click to invoke form submit and execute native dialog close routines
    fireEvent.click(okButton);

    // Await asynchronously for the native browser close animation frame to execute the onClose callback
    await waitFor(() => {
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  // Statement Coverage: Covers global fallback resolutions.
  // Branch Coverage: title ?? messages.dialogErrorTitle -> true.
  it('resolves and falls back to global i18n text placeholders when explicit title properties are omitted', () => {
    const { container } = render(
      <DialogMessage
        message="Session expired."
        title={undefined}
        onClose={null}
      />
    );

    const dialogElement = container.querySelector('dialog');
    expect(dialogElement.open).toBe(true);

    // Verify that the global error text placeholder got applied successfully
    expect(screen.getByText('System Error')).toBeInTheDocument();
  });

  // Statement Coverage: Covers the early exit guard clause return line.
  // Branch Coverage: !dialog || !message -> true.
  it('bypasses visual state updates and keeps the dialog hidden when message props are falsy', () => {
    const { container } = render(
      <DialogMessage
        message=""
        title="Hidden Dialog"
        onClose={null}
      />
    );

    const dialogElement = container.querySelector('dialog');
    expect(dialogElement).toBeInTheDocument();

    // Verify that the native .showModal() method was safely bypassed (dialog remains closed)
    expect(dialogElement.open).toBe(false);
  });
});
