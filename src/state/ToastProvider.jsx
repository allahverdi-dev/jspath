import { createContext, useCallback, useContext, useMemo, useState, useRef, useEffect } from 'react';
import { Icon } from '../components/ui/Icon.jsx';
import { useT } from '../i18n/index.jsx';

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

/**
 * Toast state.
 *
 * This provider sits *outside* `I18nProvider` because `UserStateProvider` raises
 * toasts and the locale preference lives in user state — so the ordering cannot
 * be reversed. Callers therefore pass translation keys rather than finished
 * sentences, and `ToastViewport`, which is mounted inside the i18n context,
 * resolves them at render time. A toast raised before a language change is
 * displayed in the new language, which is the behaviour you would expect.
 */
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
    ({ tone = 'info', titleKey, messageKey, vars, title, message, icon, duration = 4500 }) => {
      const id = ++counter;
      setToasts((t) => [...t.slice(-3), { id, tone, titleKey, messageKey, vars, title, message, icon }]);
      timers.current.set(id, setTimeout(() => dismiss(id), duration));
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  const value = useMemo(() => ({ show, dismiss, toasts }), [show, dismiss, toasts]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

/**
 * The visible toast stack. Mounted inside `I18nProvider` so it can translate.
 *
 * Announced politely so unlocks and sync messages reach screen readers without
 * interrupting whatever the learner is doing.
 */
export function ToastViewport() {
  const { toasts, dismiss } = useToast();
  const t = useT();

  return (
    <div
      className="toast-stack pointer-events-none fixed right-4 z-[80] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        // A literal `title`/`message` still works, for values that are already
        // data rather than copy (an achievement name resolved by the caller).
        const title = toast.titleKey ? t(toast.titleKey, toast.vars) : toast.title;
        const message = toast.messageKey ? t(toast.messageKey, toast.vars) : toast.message;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex animate-slide-up items-start gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur ${
              TONE_STYLES[toast.tone] ?? TONE_STYLES.info
            }`}
          >
            <Icon name={toast.icon ?? TONE_ICONS[toast.tone] ?? 'info'} size={20} className="mt-0.5 shrink-0" filled />
            <div className="min-w-0 flex-1">
              {title && <p className="font-body-sm font-bold">{title}</p>}
              {message && <p className="font-body-sm opacity-90">{message}</p>}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="-mr-1 -mt-1 rounded p-1 opacity-60 transition hover:opacity-100"
              aria-label={t('common.dismiss')}
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
