'use client';

import { useEffect, useRef } from 'react';
import { useI18n } from '@/lib/stores/localeStore';

interface DialogMessageProps {
  message: string;
  title?: string;
  onClose?: () => void;
}

/**
 * Renders a native modal dialog for error messages.
 *
 * Opens automatically as soon as `message` is set.
 * Closing the dialog (via the OK button or ESC) calls `onClose`.
 *
 * @example
 * <DialogMessage message="Could not load data." onClose={() => setError(null)} />
 */
export default function DialogMessage({ message, title, onClose }: DialogMessageProps) {
  const { messages } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resolvedTitle = title ?? messages.dialogErrorTitle;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !message) return;
    if (!dialog.open) {
      dialog.showModal();
    }
  }, [message]);

  function handleClose() {
    onClose?.();
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dialog-message-title"
      aria-live="assertive"
      className="dialog-message"
      onClose={handleClose}
    >
      <div className="dialog-message-content">
        <strong id="dialog-message-title">{resolvedTitle}</strong>
        <p>{message}</p>
        <form className="dialog-message-actions" method="dialog">
          <button className="ui button primary right floated" type="submit">
            {messages.dialogOk}
          </button>
        </form>
      </div>
    </dialog>
  );
}
