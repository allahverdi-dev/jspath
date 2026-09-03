import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Button, Card, Icon, SectionLabel } from '../components/ui/index.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import {
  CHECKOUT_OPTIONS, GUMROAD_MANAGE_URL, createCheckoutUrl, createUpgradeAuthPath, getCheckoutOption,
} from '../features/billing/plans.js';
import { subscriptionGrantsPro } from '../features/billing/entitlements.js';
import { CONTENT_ALLOCATION as allocation } from '../features/billing/contentAllocation.js';
import { useI18n } from '../i18n/index.jsx';

const proBenefits = (t) => [
  t('billing.benefitEverythingInFree'),
  t('billing.benefitAllExercises', { count: allocation.exercise.total }),
  t('billing.benefitAllChallenges', { count: allocation.challenge.total }),
  t('billing.benefitAllProjects', { count: allocation.project.total }),
  t('billing.benefitAllInterview', { count: allocation.interview.total }),
  t('billing.benefitSessions'),
  t('billing.benefitAnalytics'),
];

const freeBenefits = (t) => [
  t('billing.benefitCurriculum', { modules: allocation.module.free, lessons: allocation.lesson.free }),
  t('common.exerciseCount', { count: allocation.exercise.free }),
  t('billing.benefitSomeChallenges', { count: allocation.challenge.free }),
  t('billing.benefitSomeProjects', { count: allocation.project.free }),
  t('billing.benefitSomeInterview', { count: allocation.interview.free }),
  t('billing.benefitReferenceAndSheets', {
    reference: allocation.reference.free,
    sheets: allocation.cheatsheet.free,
  }),
  t('billing.benefitPlacement'),
  t('billing.benefitPlayground'),
  t('billing.benefitSync'),
  t('billing.benefitBookmarks'),
];

export default function Pricing() {
  const { user, isAuthenticated } = useAuth();
  const { plan, isPro, subscription, loading, billingConfigured, reconcile, refresh } = useEntitlements();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t, formatDate } = useI18n();
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

  // Dates follow the app locale, not the browser's: the learner chose a language
  // in Settings and a renewal date in another format reads as a different product.
  const statusMessage = useMemo(() => {
    if (!subscription) return null;
    const until = subscription.current_period_end
      ? formatDate(subscription.current_period_end, { dateStyle: 'medium' })
      : null;
    if (subscription.status === 'canceling') {
      return until
        ? t('billing.pendingCancellation', { date: until })
        : t('billing.cancelingNoDate');
    }
    if (subscription.status === 'past_due') {
      return until
        ? t('billing.pastDueUntil', { date: until })
        : t('billing.pastDueNoDate');
    }
    return until ? t('billing.renewalOn', { date: until }) : t('billing.membershipActive');
  }, [subscription, t, formatDate]);

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
        <Badge tone="primary">{t('billing.simplePlans')}</Badge>
        <h1 className="mt-4 font-display text-display-lg text-on-surface">{t('billing.pricingHeadline')}</h1>
        <p className="mx-auto mt-3 max-w-2xl font-body-lg text-on-surface-variant">
          {t('billing.pricingSubtitle')}
        </p>
      </div>

      {confirmation !== 'idle' && (
        <Card className="mx-auto mt-6 max-w-2xl border-info/30 bg-info/5 p-4" role="status">
          <p className="font-body-md font-semibold text-on-surface">
            {confirmation === 'confirmed'
              ? t('billing.membershipConfirmed')
              : confirmation === 'confirming'
                ? t('billing.confirmingMembership')
                : t('billing.stillConfirming')}
          </p>
          {confirmation === 'pending' && (
            <Button className="mt-3" size="sm" variant="secondary" onClick={retryConfirmation}>
              {t('billing.retryConfirmation')}
            </Button>
          )}
        </Card>
      )}

      {!billingConfigured && (
        <Card className="mx-auto mt-6 max-w-2xl border-warning/30 bg-warning/5 p-4">
          <p className="font-body-sm text-on-surface-variant">
            <Icon name="info" size={16} className="mr-1.5 inline text-warning" />
            {t('billing.notConfiguredNotice')}
          </p>
        </Card>
      )}

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <Card className="flex flex-col p-6">
          <div className="flex items-start justify-between gap-3">
            <div><SectionLabel>{t('common.free')}</SectionLabel><h2 className="mt-2 font-display text-headline-md text-on-surface">$0</h2></div>
            {plan !== 'pro' && (
              <Badge tone="success">{plan === 'guest' ? t('billing.guestAccess') : t('billing.currentPlan')}</Badge>
            )}
          </div>
          <p className="mt-3 font-body-md text-on-surface-variant">{t('billing.freePlanDescription')}</p>
          <ul className="mt-6 flex-1 space-y-3">
            {freeBenefits(t).map((item) => <li key={item} className="flex gap-2 font-body-sm text-on-surface-variant"><Icon name="check" size={17} className="mt-0.5 text-success" />{item}</li>)}
          </ul>
          {!isAuthenticated && <Button to="/signup" variant="secondary" className="mt-6 w-full">{t('billing.createFreeAccount')}</Button>}
        </Card>

        <Card className="flex flex-col border-primary/40 p-6">
          <div className="flex items-start justify-between gap-3">
            <div><SectionLabel>{t('common.pro')}</SectionLabel><h2 className="mt-2 font-display text-headline-md text-on-surface">{t('billing.flexibleBilling')}</h2></div>
            {isPro && <Badge tone="primary" icon="workspace_premium">{t('billing.currentPlan')}</Badge>}
          </div>
          <p className="mt-3 font-body-md text-on-surface-variant">{statusMessage ?? t('billing.proPlanDescription')}</p>
          <ul className="mt-6 space-y-3">
            {proBenefits(t).map((item) => <li key={item} className="flex gap-2 font-body-sm text-on-surface-variant"><Icon name="check" size={17} className="mt-0.5 text-primary-ink" />{item}</li>)}
          </ul>
          {isPro ? (
            <Button href={GUMROAD_MANAGE_URL} target="_blank" rel="noreferrer" variant="secondary" className="mt-6 w-full">{t('billing.managePlan')}</Button>
          ) : (
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              {Object.values(CHECKOUT_OPTIONS).map((option) => (
                <Button
                  key={option.id}
                  variant={selectedOption?.id === option.id ? 'primary' : 'secondary'}
                  disabled={!option.checkoutUrl || loading}
                  onClick={() => startCheckout(option)}
                >
                  {option.billingInterval === 'annual' ? t('billing.chooseAnnual') : t('billing.chooseMonthly')}
                </Button>
              ))}
            </div>
          )}
          <p className="mt-3 text-center font-body-sm text-on-surface-variant">{t('billing.gumroadNotice')}</p>
        </Card>
      </div>
    </div>
  );
}
