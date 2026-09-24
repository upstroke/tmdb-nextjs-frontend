'use client';

import { useEffect } from 'react';
import { useError } from '@/lib/stores/errorStore';

/**
 * Central error dialog component using Fomantic-UI Modal.
 * Mirrors DialogMessage.svelte from SvelteKit project.
 *
 * @param {{ onClose?: () => void }} props
 */
export default function DialogMessage({ onClose }) {
  const { isOpen, error, closeError } = useError();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeError();
        if (onClose) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeError, onClose]);

  if (!isOpen || !error) return null;

  return (
    <div className="ui dimmer modals page transition visible active">
      <div className="ui modal transition visible active">
        <div className="header">{error.title || 'Error'}</div>
        <div className="content">
          <div className="description">{error.message}</div>
        </div>
        <div className="actions">
          <button
            className="ui button primary"
            onClick={() => {
              closeError();
              if (onClose) onClose();
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
