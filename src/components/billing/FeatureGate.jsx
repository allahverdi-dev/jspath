import { Button, Card, Icon } from '../ui/index.jsx';
import { useEntitlements } from '../../state/EntitlementProvider.jsx';
import { useT } from '../../i18n/index.jsx';

/**
 * The paid-content wall.
 *
 * Callers pass a stable `kind` token rather than a finished sentence, so the same
 * gate reads correctly in every language. A caller may still override `title`
 * and `message` outright when it needs to say something more specific.
 */
export function LockedFeature({ kind = 'content', titleKey, title, message, backTo = '/dashboard', backLabel }) {
  const t = useT();
  const kindLabel = t(`billing.kind${kind[0].toUpperCase()}${kind.slice(1)}`);
  // A caller with its own sentence passes a key, not a finished string, so the
  // wall still speaks the reader's language.
  const heading = title ?? (titleKey ? t(titleKey) : t('billing.lockedTitle', { kind: kindLabel }));
  const body = message ?? t('billing.lockedBody');
  const back = backLabel ?? t('dashboard.continueLearning');
  return (
    <div className="mx-auto max-w-2xl py-10 animate-fade-in">
      <Card className="border-primary/30 p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary-ink">
          <Icon name="lock" size={24} />
        </span>
        <p className="mt-4 font-mono text-label-caps uppercase tracking-wider text-primary-ink">Pro</p>
        <h1 className="mt-2 font-display text-headline-md text-on-surface">{heading}</h1>
        <p className="mx-auto mt-3 max-w-lg font-body-md leading-7 text-on-surface-variant">{body}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button to="/pricing" icon="workspace_premium">{t('billing.viewProOptions')}</Button>
          <Button to={backTo} variant="secondary" icon="arrow_back">{back}</Button>
        </div>
      </Card>
    </div>
  );
}

export function FeatureGate({ feature, children, fallback, ...lockedProps }) {
  const t = useT();
  const { loading, hasFeature } = useEntitlements();
  if (loading) return <p className="py-10 text-center font-body-sm text-on-surface-variant" role="status">{t('billing.checkingAccess')}</p>;
  if (hasFeature(feature)) return children;
  return fallback !== undefined ? fallback : <LockedFeature {...lockedProps} />;
}

export function ContentGate({ kind, id, children, fallback, ...lockedProps }) {
  const t = useT();
  const { loading, canAccessContent } = useEntitlements();
  if (loading) return <p className="py-10 text-center font-body-sm text-on-surface-variant" role="status">{t('billing.checkingAccess')}</p>;
  if (canAccessContent(kind, id)) return children;
  // The content kind is what makes the wall specific, and it is a stable token.
  return fallback !== undefined ? fallback : <LockedFeature kind={kind} {...lockedProps} />;
}

/** A quiet inline upsell; no modal and no hidden preview of paid results. */
export function ProPreview({ title, message }) {
  const t = useT();
  return (
    <Card className="border-primary/20 p-5">
      <h2 className="flex items-start gap-2 font-heading text-headline-sm text-on-surface">
        <Icon name="lock" size={18} className="mt-1 shrink-0 text-primary-ink" />{title}
      </h2>
      <p className="mt-2 font-body-sm text-on-surface-variant">{message}</p>
      <Button to="/pricing" variant="secondary" size="sm" className="mt-4">{t('billing.explorePro')}</Button>
    </Card>
  );
}
