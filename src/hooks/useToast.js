import { useCallback } from 'react';
import { useToastContext } from '../components/ToastContext';

export function useToast() {
  const { showToast } = useToastContext();

  return useCallback(
    (message, onUndo) => showToast(message, onUndo),
    [showToast],
  );
}
