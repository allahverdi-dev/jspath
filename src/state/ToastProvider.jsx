import { createContext, useCallback, useContext, useMemo, useState, useRef, useEffect } from 'react';
import { Icon } from '../components/ui/Icon.jsx';

const ToastContext = createContext(null);

const TONE_STYLES = {
  success: 'border-success/40 bg-success-container text-on-success-container',
  error: 'border-error/40 bg-error-container text-on-error-container',
  info: 'border-info/40 bg-info-container text-on-info-container',
  achievement: 'border-primary/50 bg-primary/10 text-on-surface',
};

const TONE_ICONS = {
  success: 'check_circle',
  error: 'error',
  info: 'info',
  achievement: 'emoji_events',
};

let counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback(
    ({ tone = 'info', title, message, icon, duration = 4500 }) => {
      const id = ++counter;
      setToasts((t) => [...t.slice(-3), { id, tone, title, message, icon }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Announced politely so unlocks and sync messages reach screen readers
          without interrupting whatever the learner is doing. */}
      <div
        className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex animate-slide-up items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur ${
              TONE_STYLES[t.tone] ?? TONE_STYLES.info
            }`}
          >
            <Icon name={t.icon ?? TONE_ICONS[t.tone] ?? 'info'} size={20} className="mt-0.5 shrink-0" filled />
            <div className="min-w-0 flex-1">
              {t.title && <p className="font-body-sm font-bold">{t.title}</p>}
              {t.message && <p className="font-body-sm opacity-90">{t.message}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="-mr-1 -mt-1 rounded p-1 opacity-60 transition hover:opacity-100"
              aria-label="Dismiss notification"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
