'use client';

import styles from './DialogMessage.module.scss';
import { useEffect, useRef } from 'react';
import { useI18n } from '@/lib/stores/locale';

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
      className={styles['dialog-message']}
      onClose={onClose}
    >
      <div className={styles['dialog-message-content']}>
        <strong id="dialog-message-title">{resolvedTitle}</strong>
        <p>{message}</p>
        <form className={styles['dialog-message-actions']} method="dialog">
          <button className="ui button primary right floated" type="submit">{messages.dialogOk}</button>
        </form>
      </div>
    </dialog>
  );
}
