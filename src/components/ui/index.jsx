import { forwardRef, useId, useRef, useState, createContext, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from './Icon.jsx';
import { useModalFocus } from '../../hooks/useModalFocus.js';

export { Icon };

export const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ------------------------------------------------------------------ *
 * Button — DESIGN.md: primary is JS yellow on charcoal, secondary is a
 * 1px outline, ghost is text only.
 * ------------------------------------------------------------------ */

const BUTTON_VARIANTS = {
  primary: 'bg-primary text-on-primary hover:bg-primary-fixed active:bg-primary-fixed-dim font-bold',
  secondary: 'border border-outline-variant bg-transparent text-on-surface hover:bg-surface-container-high',
  ghost: 'bg-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container',
  danger: 'bg-error text-on-error hover:opacity-90 font-bold',
  subtle: 'bg-surface-container text-on-surface hover:bg-surface-container-high',
};

const BUTTON_SIZES = {
  sm: 'min-h-8 px-3 py-1.5 text-body-sm gap-1.5',
  md: 'min-h-10 px-4 py-2 text-body-sm gap-2',
  lg: 'min-h-12 px-6 py-3 text-body-md gap-2',
  icon: 'h-9 w-9 justify-center',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', as, to, href, icon, iconRight, loading, children, disabled, ...rest },
  ref,
) {
  const classes = cx(
    'touch-target inline-flex max-w-full items-center justify-center break-normal rounded text-center font-body transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-50',
    BUTTON_VARIANTS[variant] ?? BUTTON_VARIANTS.primary,
    BUTTON_SIZES[size] ?? BUTTON_SIZES.md,
    className,
  );

  const content = (
    <>
      {loading ? <Spinner size={16} /> : icon ? <Icon name={icon} size={size === 'lg' ? 20 : 18} /> : null}
      {children}
      {iconRight && !loading ? <Icon name={iconRight} size={size === 'lg' ? 20 : 18} /> : null}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} aria-disabled={disabled || undefined} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }
  const Tag = as ?? 'button';
  // A bare <button> defaults to type="submit", so the first time one of these is
  // put inside a form every secondary action would submit it. Default to "button"
  // like the other controls in this file; `rest` still lets a caller opt in.
  const typeProp = Tag === 'button' ? { type: 'button' } : {};
  return (
    <Tag ref={ref} className={classes} disabled={disabled || loading} {...typeProp} {...rest}>
      {content}
    </Tag>
  );
});

/* ------------------------------------------------------------------ *
 * Surfaces
 * ------------------------------------------------------------------ */

export function Card({ as: Tag = 'div', className = '', interactive = false, children, ...rest }) {
  return (
    <Tag
      className={cx(
        'min-w-0 max-w-full rounded-lg border border-outline-variant bg-surface-container-low',
        interactive && 'transition-colors hover:border-outline hover:bg-surface-container',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action, icon, className = '' }) {
  return (
    <div className={cx('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 font-heading text-title-md text-on-surface">
          {icon && <Icon name={icon} size={18} className="text-on-surface-variant" />}
          {title}
        </h3>
        {description && <p className="mt-1 font-body-sm text-on-surface-variant">{description}</p>}
      </div>
      {action}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Badges & chips — label-caps typography per DESIGN.md
 * ------------------------------------------------------------------ */

const BADGE_TONES = {
  neutral: 'border-outline-variant bg-surface-container text-on-surface-variant',
  primary: 'border-primary/40 bg-primary/10 text-primary-ink',
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  error: 'border-error/40 bg-error/10 text-error',
  info: 'border-info/40 bg-info/10 text-info',
};

export function Badge({ tone = 'neutral', className = '', icon, children, ...rest }) {
  return (
    <span
      className={cx(
        'inline-flex max-w-full items-center gap-1 rounded border px-2 py-0.5',
        'font-mono text-label-caps uppercase tracking-wider',
        BADGE_TONES[tone] ?? BADGE_TONES.neutral,
        className,
      )}
      {...rest}
    >
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}

const DIFFICULTY_TONES = {
  beginner: 'success',
  easy: 'info',
  medium: 'warning',
  hard: 'error',
  expert: 'primary',
};

export function DifficultyBadge({ difficulty, ...rest }) {
  return (
    <Badge tone={DIFFICULTY_TONES[difficulty] ?? 'neutral'} {...rest}>
      {difficulty}
    </Badge>
  );
}

/* ------------------------------------------------------------------ *
 * Progress — thin 4px bars, track outline-variant, fill primary
 * ------------------------------------------------------------------ */

export function ProgressBar({ value, className = '', height = 4, label, tone = 'primary' }) {
  const pct = Math.round(Math.max(0, Math.min(1, value || 0)) * 100);
  const fill = tone === 'primary' ? 'bg-primary' : tone === 'success' ? 'bg-success' : 'bg-on-surface-variant';
  return (
    <div
      className={cx('w-full overflow-hidden rounded-full bg-surface-container-highest', className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={cx('h-full rounded-full transition-[width] duration-500', fill)} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 64, stroke = 4, children, className = '' }) {
  const pct = Math.max(0, Math.min(1, value || 0));
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  return (
    <div className={cx('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          className="stroke-surface-container-highest"
        />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          className="stroke-primary transition-[stroke-dashoffset] duration-700"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Feedback states
 * ------------------------------------------------------------------ */

export function Spinner({ size = 20, className = '' }) {
  return (
    <span
      className={cx('inline-block animate-spin rounded-full border-2 border-current border-t-transparent', className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}

export function Skeleton({ className = '', ...rest }) {
  return (
    <div
      className={cx('animate-pulse rounded bg-surface-container-high', className)}
      aria-hidden="true"
      {...rest}
    />
  );
}

export function EmptyState({ icon = 'inbox', title, message, action, className = '' }) {
  return (
    <div className={cx('flex flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant px-6 py-14 text-center', className)}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container">
        <Icon name={icon} size={24} className="text-on-surface-variant" />
      </div>
      <h3 className="font-heading text-title-md text-on-surface">{title}</h3>
      {message && <p className="mt-2 max-w-sm font-body-sm text-on-surface-variant">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry, className = '' }) {
  return (
    <div className={cx('rounded-lg border border-error/30 bg-error/5 p-6', className)} role="alert">
      <div className="flex items-start gap-3">
        <Icon name="error" size={22} className="mt-0.5 text-error" />
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-title-md text-on-surface">{title}</h3>
          {message && <p className="mt-1 font-body-sm text-on-surface-variant">{message}</p>}
          {onRetry && (
            <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry} icon="refresh">
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Form controls
 * ------------------------------------------------------------------ */

export const Input = forwardRef(function Input(
  { label, hint, error, className = '', id: providedId, icon, ...rest },
  ref,
) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block font-body-sm font-medium text-on-surface">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <Icon name={icon} size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={cx(
            'min-h-11 min-w-0 w-full rounded border bg-surface px-3 py-2 font-body-sm text-on-surface',
            'placeholder:text-on-surface-variant/70',
            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
            icon && 'pl-9',
            error ? 'border-error' : 'border-outline-variant',
            className,
          )}
          {...rest}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 flex items-center gap-1 font-body-sm text-error">
          <Icon name="error" size={14} />
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1.5 font-body-sm text-on-surface-variant">
          {hint}
        </p>
      )}
    </div>
  );
});

export function Select({ label, className = '', id: providedId, children, hint, ...rest }) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block font-body-sm font-medium text-on-surface">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cx(
          'min-h-11 min-w-0 w-full rounded border border-outline-variant bg-surface px-3 py-2 font-body-sm text-on-surface',
          'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      {hint && <p className="mt-1.5 font-body-sm text-on-surface-variant">{hint}</p>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, description, id: providedId, disabled }) {
  const generatedId = useId();
  const id = providedId ?? generatedId;
  return (
    <div className="flex items-start justify-between gap-6 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="font-body-sm font-medium text-on-surface">
          {label}
        </label>
        {description && <p className="mt-0.5 font-body-sm text-on-surface-variant">{description}</p>}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative flex h-11 w-11 shrink-0 items-center rounded disabled:opacity-50"
      >
        <span aria-hidden="true" className={cx('relative h-6 w-11 rounded-full border transition-colors', checked ? 'border-primary bg-primary' : 'border-outline-variant bg-surface-container-highest')}>
          <span
            className={cx(
              'absolute left-0 top-0.5 h-4 w-4 rounded-full transition-transform',
              checked ? 'translate-x-6 bg-on-primary' : 'translate-x-1 bg-on-surface-variant',
            )}
          />
        </span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Tabs — roving focus, arrow-key navigable
 * ------------------------------------------------------------------ */

export function Tabs({ tabs, value, onChange, className = '', size = 'md' }) {
  const refs = useRef([]);

  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.value === value);
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      onKeyDown={onKeyDown}
      className={cx('thin-scrollbar flex min-w-0 max-w-full items-center gap-1 overflow-x-auto pb-1', className)}
    >
      {tabs.map((tab, i) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cx(
              'shrink-0 whitespace-nowrap rounded border font-mono uppercase tracking-wider transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-label-caps' : 'px-3 py-1.5 text-label-caps',
              active
                ? 'border-primary/50 bg-primary/10 text-primary-ink'
                : 'border-outline-variant bg-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
            )}
          >
            {tab.label}
            {tab.count != null && <span className="ml-1.5 opacity-60">{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Dialog — focus trapped, Escape to close, scroll locked
 * ------------------------------------------------------------------ */

export function Dialog({ open, onClose, title, description, children, footer, size = 'md' }) {
  const panelRef = useRef(null);
  const titleId = useId();
  useModalFocus(open, panelRef, onClose);

  if (!open) return null;

  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cx(
          'overlay-panel relative z-10 flex min-w-0 w-full flex-col overflow-hidden rounded-lg border border-outline-variant',
          'bg-surface-container-high shadow-2xl animate-slide-up focus:outline-none',
          widths[size],
        )}
      >
        {title && (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-outline-variant px-4 py-3 sm:px-6 sm:py-4">
            <div>
              <h2 id={titleId} className="font-heading text-title-md text-on-surface">{title}</h2>
              {description && <p className="mt-1 font-body-sm text-on-surface-variant">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="-mr-2 rounded p-2 text-on-surface-variant transition hover:bg-surface-container hover:text-on-surface"
              aria-label="Close dialog"
            >
              <Icon name="close" size={20} />
            </button>
          </div>
        )}
        <div className="thin-scrollbar min-h-0 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6 sm:py-5">{children}</div>
        {footer && <div className="shrink-0 border-t border-outline-variant px-4 py-3 sm:px-6 sm:py-4">{footer}</div>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Collapsible section
 * ------------------------------------------------------------------ */

export function Disclosure({ title, defaultOpen = false, children, icon, className = '', tone = 'default' }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div
      className={cx(
        'overflow-hidden rounded-lg border',
        tone === 'default' ? 'border-outline-variant bg-surface-container-low' : 'border-primary/30 bg-primary/5',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-surface-container"
      >
        {icon && <Icon name={icon} size={18} className="text-on-surface-variant" />}
        <span className="flex-1 font-body-sm font-medium text-on-surface">{title}</span>
        <Icon name="expand_more" size={20} className={cx('text-on-surface-variant transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div id={id} className="border-t border-outline-variant px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Page scaffolding
 * ------------------------------------------------------------------ */

export function PageHeader({ title, description, actions, breadcrumbs, className = '' }) {
  return (
    <div className={cx('mb-8', className)}>
      {breadcrumbs && <div className="mb-3">{breadcrumbs}</div>}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-display-lg text-on-surface">{title}</h1>
          {description && <p className="mt-2 max-w-2xl font-body-lg text-on-surface-variant">{description}</p>}
        </div>
        {actions && <div className="flex max-w-full flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function SectionLabel({ children, className = '' }) {
  return (
    <p className={cx('font-mono text-label-caps uppercase tracking-wider text-on-surface-variant', className)}>
      {children}
    </p>
  );
}

export function Stat({ label, value, icon, tone = 'default', hint }) {
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <div className="flex items-center gap-1.5">
        {icon && <Icon name={icon} size={14} className="text-on-surface-variant" />}
        <SectionLabel>{label}</SectionLabel>
      </div>
      <p className={cx('mt-1.5 font-heading text-headline-sm', tone === 'primary' ? 'text-primary-ink' : 'text-on-surface')}>
        {value}
      </p>
      {hint && <p className="mt-0.5 font-body-sm text-on-surface-variant">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Tooltip-free accessible hint used by mastery bars
 * ------------------------------------------------------------------ */

const MasteryContext = createContext(null);
export const useMasteryTone = () => useContext(MasteryContext);

export const MASTERY_TONE = {
  notStarted: { label: 'Not Started', className: 'text-on-surface-variant', bar: 'bg-surface-container-highest' },
  learning: { label: 'Learning', className: 'text-info', bar: 'bg-info' },
  practicing: { label: 'Practicing', className: 'text-warning', bar: 'bg-warning' },
  mastered: { label: 'Mastered', className: 'text-success', bar: 'bg-success' },
};

export function MasteryBadge({ level, ...rest }) {
  const tone = { notStarted: 'neutral', learning: 'info', practicing: 'warning', mastered: 'success' }[level];
  return (
    <Badge tone={tone} {...rest}>
      {MASTERY_TONE[level]?.label ?? level}
    </Badge>
  );
}
