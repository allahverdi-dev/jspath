import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Button, Card, Icon, SectionLabel } from '../components/ui/index.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import {
  CHECKOUT_OPTIONS, GUMROAD_MANAGE_URL, PLAN_DEFINITIONS, createCheckoutUrl, createUpgradeAuthPath, getCheckoutOption,
} from '../features/billing/plans.js';
import { subscriptionGrantsPro } from '../features/billing/entitlements.js';
import { CONTENT_ALLOCATION as allocation } from '../features/billing/contentAllocation.js';

const PRO_BENEFITS = [
  'Everything in Free, plus:',
  `All ${allocation.exercise.total} exercises`,
  `All ${allocation.challenge.total} coding challenges`,
  `All ${allocation.project.total} guided projects`,
  `All ${allocation.interview.total} interview questions`,
  'Interview Practice Sessions and Guided Practice Sessions',
  'Advanced Analytics: topic mastery, weak areas and assessment evidence',
];

const FREE_BENEFITS = [
  `Complete ${allocation.module.free}-module JavaScript curriculum · all ${allocation.lesson.free} lessons`,
  `${allocation.exercise.free} exercises`,
  `${allocation.challenge.free} coding challenges`,
  `${allocation.project.free} guided projects`,
  `${allocation.interview.free} interview questions`,
  `All ${allocation.reference.free} reference entries and all ${allocation.cheatsheet.free} cheat sheets`,
  'Placement assessment to find your starting point',
  'JavaScript playground and basic progress tracking',
  'Cloud progress sync with a free account',
  'Bookmarks and achievements',
];

const formatDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const { plan, isPro, subscription, loading, billingConfigured, reconcile, refresh } = useEntitlements();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [confirmation, setConfirmation] = useState(params.get('purchase') === 'success' ? 'confirming' : 'idle');
  const startedConfirmation = useRef(false);
  const selectedOption = getCheckoutOption(params.get('checkout'));

  useEffect(() => {
    if (params.get('purchase') !== 'success' || !isAuthenticated || startedConfirmation.current) return undefined;
    startedConfirmation.current = true;
    let cancelled = false;
    let timer;

    const confirm = async () => {
      await reconcile();
      for (let attempt = 0; attempt < 4 && !cancelled; attempt += 1) {
        const result = await refresh();
        const confirmed = result.data?.some((item) => subscriptionGrantsPro(item));
        if (confirmed) {
          setConfirmation('confirmed');
          return;
        }
        await new Promise((resolve) => { timer = setTimeout(resolve, 1500); });
      }
      if (!cancelled) setConfirmation('pending');
    };
    confirm();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [params, isAuthenticated, reconcile, refresh]);

  useEffect(() => {
    if (isPro && confirmation === 'confirming') setConfirmation('confirmed');
  }, [isPro, confirmation]);

  const statusMessage = useMemo(() => {
    if (!subscription) return null;
    const until = formatDate(subscription.current_period_end);
    if (subscription.status === 'canceling') return `Canceled — Pro access continues${until ? ` until ${until}` : ' through the paid period'}.`;
    if (subscription.status === 'past_due') return `Payment issue${until ? ` — access is currently available until ${until}` : ''}.`;
    return until ? `Next renewal or access review: ${until}.` : 'Your membership is active.';
  }, [subscription]);

  const startCheckout = (option) => {
    if (!isAuthenticated) {
      navigate(createUpgradeAuthPath(option.id));
      return;
    }
    const checkoutUrl = createCheckoutUrl(option, user);
    if (checkoutUrl) window.location.assign(checkoutUrl);
  };

  const retryConfirmation = async () => {
    setConfirmation('confirming');
    await reconcile();
    const result = await refresh();
    setConfirmation(result.data?.some((item) => subscriptionGrantsPro(item)) ? 'confirmed' : 'pending');
  };

  return (
    <div className="mx-auto max-w-5xl animate-fade-in">
      <div className="text-center">
        <Badge tone="primary">Simple plans</Badge>
        <h1 className="mt-4 font-display text-display-lg text-on-surface">Learn JavaScript for free. Go Pro when you want to master it.</h1>
        <p className="mx-auto mt-3 max-w-2xl font-body-lg text-on-surface-variant">
          Your account and learning progress are always yours. A plan change controls access only—it never deletes progress.
        </p>
      </div>

      {confirmation !== 'idle' && (
        <Card className="mx-auto mt-6 max-w-2xl border-info/30 bg-info/5 p-4" role="status">
          <p className="font-body-md font-semibold text-on-surface">
            {confirmation === 'confirmed' ? 'Your Pro membership is confirmed.' : confirmation === 'confirming' ? 'Confirming your membership…' : 'Checkout returned. We are still confirming your membership.'}
          </p>
          {confirmation === 'pending' && (
            <Button className="mt-3" size="sm" variant="secondary" onClick={retryConfirmation}>
              Retry confirmation
            </Button>
          )}
        </Card>
      )}

      {!billingConfigured && (
        <Card className="mx-auto mt-6 max-w-2xl border-warning/30 bg-warning/5 p-4">
          <p className="font-body-sm text-on-surface-variant">
            <Icon name="info" size={16} className="mr-1.5 inline text-warning" />
            Billing is not configured for this deployment. Free and guest learning remain available.
          </p>
        </Card>
      )}

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Card className="flex flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <div><SectionLabel>Free</SectionLabel><h2 className="mt-2 font-display text-headline-md text-on-surface">$0</h2></div>
            {plan !== 'pro' && <Badge tone="success">{plan === 'guest' ? 'Guest access' : 'Current plan'}</Badge>}
          </div>
          <p className="mt-3 font-body-md text-on-surface-variant">{PLAN_DEFINITIONS.free.description}</p>
          <ul className="mt-6 flex-1 space-y-3">
            {FREE_BENEFITS.map((item) => <li key={item} className="flex gap-2 font-body-sm text-on-surface-variant"><Icon name="check" size={17} className="mt-0.5 text-success" />{item}</li>)}
          </ul>
          {!isAuthenticated && <Button to="/signup" variant="secondary" className="mt-6 w-full">Create a free account</Button>}
        </Card>

        <Card className="flex flex-col border-primary/40 p-6">
          <div className="flex items-start justify-between gap-3">
            <div><SectionLabel>Pro</SectionLabel><h2 className="mt-2 font-display text-headline-md text-on-surface">Flexible billing</h2></div>
            {isPro && <Badge tone="primary" icon="workspace_premium">Current plan</Badge>}
          </div>
          <p className="mt-3 font-body-md text-on-surface-variant">{statusMessage ?? PLAN_DEFINITIONS.pro.description}</p>
          <ul className="mt-6 space-y-3">
            {PRO_BENEFITS.map((item) => <li key={item} className="flex gap-2 font-body-sm text-on-surface-variant"><Icon name="check" size={17} className="mt-0.5 text-primary-ink" />{item}</li>)}
          </ul>
          {isPro ? (
            <Button href={GUMROAD_MANAGE_URL} target="_blank" rel="noreferrer" variant="secondary" className="mt-6 w-full">Manage subscription</Button>
          ) : (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {Object.values(CHECKOUT_OPTIONS).map((option) => (
                <Button
                  key={option.id}
                  variant={selectedOption?.id === option.id ? 'primary' : 'secondary'}
                  disabled={!option.checkoutUrl || loading}
                  onClick={() => startCheckout(option)}
                >
                  {option.billingInterval === 'annual' ? 'Choose annual' : 'Choose monthly'}
                </Button>
              ))}
            </div>
          )}
          <p className="mt-3 text-center font-body-sm text-on-surface-variant">Prices and payment details are shown securely by Gumroad.</p>
        </Card>
      </div>
    </div>
  );
}
