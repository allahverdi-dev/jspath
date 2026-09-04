import { useState } from 'react';
import { Button } from '../ui/index.jsx';
import { useEntitlements } from '../../state/EntitlementProvider.jsx';
import { useT } from '../../i18n/index.jsx';
import { createPaddlePortalSession } from '../../services/billing.js';
import { GUMROAD_MANAGE_URL, isLegacyGumroadSubscription } from '../../features/billing/plans.js';

/**
 * "Manage subscription", routed to whoever actually sold the subscription.
 *
 * A Paddle subscriber goes to Paddle's customer portal through an authenticated
 * link the server generates for them. A learner who bought through Gumroad
 * before the migration still manages it at Gumroad — those rows are not
 * converted, and sending them to a Paddle portal that knows nothing about their
 * purchase would be worse than useless.
 *
 * The portal link is fetched on click and never stored. It is a temporary
 * credential: caching it would mean caching access to someone's billing.
 */
export function ManageSubscriptionButton({ className = '', size = 'md' }) {
  const t = useT();
  const { subscription } = useEntitlements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  // Legacy Gumroad: a plain outbound link, exactly as before.
  if (isLegacyGumroadSubscription(subscription)) {
    return (
      <Button
        href={GUMROAD_MANAGE_URL}
        target="_blank"
        rel="noreferrer"
        variant="secondary"
        size={size}
        className={className}
      >
        {t('billing.managePlan')}
      </Button>
    );
  }

  const openPortal = async () => {
    if (busy) return;
    setBusy(true);
    setError(false);

    const { data, error: failed } = await createPaddlePortalSession();
    setBusy(false);

    if (failed || data?.ok !== true || typeof data.url !== 'string') {
      setError(true);
      return;
    }
    // `noopener` matters: the portal is authenticated, and the opened document
    // must not keep a handle back to this one.
    window.open(data.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`min-w-0 ${className}`}>
      <Button
        variant="secondary"
        size={size}
        className={className.includes('w-full') ? 'w-full' : ''}
        onClick={openPortal}
        disabled={busy}
        loading={busy}
        icon="open_in_new"
      >
        {t('billing.managePlan')}
      </Button>
      {error && (
        <p role="alert" className="mt-2 font-body-sm text-on-surface-variant">
          {t('billing.portalUnavailable')}
        </p>
      )}
    </div>
  );
}
