import { Button, Card, Icon } from '../ui/index.jsx';
import { useEntitlements } from '../../state/EntitlementProvider.jsx';

export function LockedFeature({
  title = 'This is included with JSPath Pro',
  message = 'Upgrade to unlock the complete guided experience while keeping all of your existing progress.',
  backTo = '/dashboard',
  backLabel = 'Continue learning',
}) {
  return (
    <div className="mx-auto max-w-2xl py-10 animate-fade-in">
      <Card className="border-primary/30 p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary-ink">
          <Icon name="lock" size={24} />
        </span>
        <p className="mt-4 font-mono text-label-caps uppercase tracking-wider text-primary-ink">Pro</p>
        <h1 className="mt-2 font-display text-headline-md text-on-surface">{title}</h1>
        <p className="mx-auto mt-3 max-w-lg font-body-md leading-7 text-on-surface-variant">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button to="/pricing" icon="workspace_premium">View Pro options</Button>
          <Button to={backTo} variant="secondary" icon="arrow_back">{backLabel}</Button>
        </div>
      </Card>
    </div>
  );
}

export function FeatureGate({ feature, children, fallback, ...lockedProps }) {
  const { loading, hasFeature } = useEntitlements();
  if (loading) return <p className="py-10 text-center font-body-sm text-on-surface-variant" role="status">Checking access…</p>;
  if (hasFeature(feature)) return children;
  return fallback !== undefined ? fallback : <LockedFeature {...lockedProps} />;
}

export function ContentGate({ kind, id, children, fallback, ...lockedProps }) {
  const { loading, canAccessContent } = useEntitlements();
  if (loading) return <p className="py-10 text-center font-body-sm text-on-surface-variant" role="status">Checking access…</p>;
  if (canAccessContent(kind, id)) return children;
  return fallback !== undefined ? fallback : <LockedFeature {...lockedProps} />;
}

/** A quiet inline upsell; no modal and no hidden preview of paid results. */
export function ProPreview({ title, message }) {
  return (
    <Card className="border-primary/20 p-5">
      <h2 className="flex items-start gap-2 font-heading text-headline-sm text-on-surface">
        <Icon name="lock" size={18} className="mt-1 shrink-0 text-primary-ink" />{title}
      </h2>
      <p className="mt-2 font-body-sm text-on-surface-variant">{message}</p>
      <Button to="/pricing" variant="secondary" size="sm" className="mt-4">Explore Pro</Button>
    </Card>
  );
}
