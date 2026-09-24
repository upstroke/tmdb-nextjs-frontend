'use client';

import { createContext, useContext, useState } from 'react';
import DialogMessage from '@/components/DialogMessage';

const ErrorContext = createContext();

/**
 * Provides global error state and renders the error dialog.
 *
 * Wrap the application (or a subtree) with this provider to enable
 * the global error dialog. The dialog opens automatically as soon
 * as an error is set via `showError`.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function ErrorProvider({ children }) {
  const [error, setError] = useState(null);

  /**
   * Opens the error dialog with the given message and optional title.
   *
   * @param {string} message - Error message to display.
   * @param {string} [title] - Optional dialog heading.
   */
  function showError(message, title) {
    setError({ message, title });
  }

  /**
   * Closes the error dialog and clears the current error.
   */
  function closeError() {
    setError(null);
  }

  return (
    <ErrorContext.Provider value={{ error, showError, closeError }}>
      {children}
      {error && (
        <DialogMessage
          message={error.message}
          title={error.title}
          onClose={closeError}
        />
      )}
    </ErrorContext.Provider>
  );
}

/**
 * Hook to access the global error store.
 *
 * Must be used within an `ErrorProvider`.
 *
 * @returns {{ error: {message: string, title?: string}|null, showError: Function, closeError: Function }}
 */
export function useError() {
  const context = useContext(ErrorContext);
  if (!context) throw new Error('useError must be used within ErrorProvider');
  return context;
}
