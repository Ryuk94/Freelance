import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

let nextToastId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, onUndo) => {
    const id = nextToastId++;
    const hasUndo = typeof onUndo === 'function';
    const duration = hasUndo ? 5000 : 3000;

    setToasts((current) => [...current, { id, message, onUndo: hasUndo ? onUndo : null }]);

    const timer = window.setTimeout(() => {
      dismissToast(id);
    }, duration);

    timersRef.current.set(id, timer);
    return id;
  }, [dismissToast]);

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        window.clearTimeout(timer);
      }
      timersRef.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }

  return context;
}

function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,26rem)] flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const hasUndo = typeof toast.onUndo === 'function';
  const toneClass = hasUndo ? 'bg-[#f97316]' : 'bg-[#f97316]';

  const handleUndo = () => {
    toast.onUndo?.();
    onDismiss(toast.id);
  };

  return (
    <div className={`pointer-events-auto relative overflow-hidden rounded-xl border border-black/60 px-4 py-4 ${toneClass} text-black shadow-[8px_8px_0_#000]`}>
      <div className="pr-12 text-[11px] font-black uppercase tracking-[0.35em] leading-snug">
        {toast.message}
      </div>
      {hasUndo ? (
        <button
          type="button"
          onClick={handleUndo}
          className="mt-3 rounded-xl border border-black bg-black px-3 py-2 text-[10px] font-black uppercase tracking-[0.55em] text-[#f97316] transition hover:bg-neutral-900"
        >
          undo
        </button>
      ) : null}
      <div className="absolute bottom-2 right-3 text-[10px] font-black uppercase tracking-[0.45em] text-black/70">
        [//]
      </div>
    </div>
  );
}
