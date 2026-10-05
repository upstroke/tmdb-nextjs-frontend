'use client';

import { useEffect, useRef } from 'react';
import { useI18n } from '@/lib/stores/locale';

/**
 * Shared error/info dialog rendered as a native `<dialog>` element.
 *
 * Opens automatically via `showModal()` whenever `message` is set.
 * Calls `onClose` when the dialog is dismissed through the OK button
 * or the browser's native close mechanism.
 *
 * @param {object} props
 * @param {string} props.message - Body text displayed inside the dialog.
 *   The dialog is not opened when this value is falsy.
 * @param {string} [props.title] - Optional dialog heading. Defaults to the
 *   localised `dialogErrorTitle` message when omitted.
 * @param {Function} [props.onClose] - Callback invoked when the dialog closes.
 * @returns {JSX.Element}
 */
export default function DialogMessage({ message, title, onClose }) {
  const { messages } = useI18n();
  const dialogRef = useRef(null);
  const resolvedTitle = title ?? messages.dialogErrorTitle;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !message) return;
    if (!dialog.open) dialog.showModal();
  }, [message]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="dialog-message-title"
      aria-live="assertive"
      className="dialog-message"
      onClose={onClose}
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
