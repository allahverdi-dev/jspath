import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Button, Card, Icon, SectionLabel } from '../components/ui/index.jsx';
import { useAuth } from '../state/AuthProvider.jsx';
import { useEntitlements } from '../state/EntitlementProvider.jsx';
import {
  ANNUAL_SAVING, CHECKOUT_OPTIONS, createGumroadCheckoutUrl, createUpgradeAuthPath,
  getCheckoutOption, isBillingConfigured as isCheckoutConfigured, isPaddleCheckoutMode,
} from '../features/billing/plans.js';
import { startPaddleCheckout } from '../services/billing.js';
import {
  onPaddleCheckoutEvent, openPaddleCheckout, PADDLE_CHECKOUT_RESULT, PADDLE_EVENT,
} from '../services/paddle.js';
import { ManageSubscriptionButton } from '../components/billing/ManageSubscriptionButton.jsx';
import { subscriptionGrantsPro } from '../features/billing/entitlements.js';
import { CONTENT_ALLOCATION as allocation } from '../features/billing/contentAllocation.js';
import { useI18n } from '../i18n/index.jsx';
import { RestorePurchase } from '../components/billing/RestorePurchase.jsx';

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
  const { t, formatDate, locale } = useI18n();
  const [confirmation, setConfirmation] = useState(params.get('purchase') === 'success' ? 'confirming' : 'idle');
  const [checkoutBusy, setCheckoutBusy] = useState(null);
  const [checkoutError, setCheckoutError] = useState(null);
  const checkoutConfigured = isCheckoutConfigured();
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

  /*
   * Closing Paddle's overlay without paying has to give the page back. Without
   * this the button stays in its loading state and the learner cannot retry -
   * the checkout is gone but the UI still thinks one is in flight.
   *
   * Closing is explicitly *not* a purchase: it clears the busy state and does
   * nothing else. A completed checkout is not trusted here either - it only
   * redirects to `?purchase=success`, and Pro still comes from reconciling
   * against trusted subscription state.
   */
  useEffect(() => onPaddleCheckoutEvent((event) => {
    if (event?.name === PADDLE_EVENT.CLOSED) {
      setCheckoutBusy(null);
      setCheckoutError(null);
    }
  }), []);

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
      /*
       * Deliberately dateless. The period end has already elapsed for a
       * past_due subscription, and it is not what bounds access - the provider
       * is, by retrying and then either restoring or cancelling. Quoting that
       * date would tell the learner their access ends on a day already past.
       */
      return t('billing.pastDueRetrying');
    }
    return until ? t('billing.renewalOn', { date: until }) : t('billing.membershipActive');
  }, [subscription, t, formatDate]);

  /*
   * Checkout is created by the server, then opened by Paddle.js.
   *
   * The browser names an internal option id and nothing else - no price, no
   * product, no user. `paddle-checkout` maps that to a configured price and
   * writes the account binding into the transaction, so what opens is exactly
   * what the server decided to sell.
   */
  const startCheckout = async (option) => {
    if (!isAuthenticated) {
      navigate(createUpgradeAuthPath(option.id));
      return;
    }
    if (checkoutBusy) return;

    /*
     * Production still buys through Gumroad. Paddle is sandbox-only until live
     * cutover is approved, and a sandbox payment costs nothing - letting an
     * ordinary production learner reach it would be giving Pro away.
     */
    if (!isPaddleCheckoutMode()) {
      const url = createGumroadCheckoutUrl(option, user);
      if (url) window.location.assign(url);
      else setCheckoutError('billing.checkoutFailed');
      return;
    }

    setCheckoutBusy(option.id);
    setCheckoutError(null);

    const { data, error } = await startPaddleCheckout(option.id);
    if (error || data?.ok !== true || !data.transactionId) {
      setCheckoutBusy(null);
      setCheckoutError('billing.checkoutFailed');
      return;
    }

    const opened = await openPaddleCheckout({
      transactionId: data.transactionId,
      successUrl: `${window.location.origin}/pricing?purchase=success`,
      locale,
    });
    // Returning from the overlay proves nothing on its own; entitlement still
    // comes from the confirmation flow below reading trusted state.
    if (opened !== PADDLE_CHECKOUT_RESULT.OPENED) {
      setCheckoutBusy(null);
      setCheckoutError('billing.checkoutUnavailable');
    }
    // When it did open, `checkout.closed` clears the busy state on dismissal and
    // a completed payment navigates away, so it is not cleared here.
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
            <ManageSubscriptionButton className="mt-6 w-full" />
          ) : (
            <>
              <div className="mt-6 grid gap-2 sm:grid-cols-2">
                {Object.values(CHECKOUT_OPTIONS).map((option) => (
                  <Button
                    key={option.id}
                    variant={selectedOption?.id === option.id ? 'primary' : 'secondary'}
                    disabled={!checkoutConfigured || loading || Boolean(checkoutBusy)}
                    loading={checkoutBusy === option.id}
                    onClick={() => startCheckout(option)}
                  >
                    {option.billingInterval === 'annual'
                      ? t('billing.chooseAnnualPriced', { amount: option.amount })
                      : t('billing.chooseMonthlyPriced', { amount: option.amount })}
                  </Button>
                ))}
              </div>
              <p className="mt-2 text-center font-body-sm text-on-surface-variant">
                {checkoutConfigured
                  ? t('billing.annualSaving', { amount: ANNUAL_SAVING })
                  : t('billing.billingUnavailable')}
              </p>
              {checkoutError && (
                <p role="alert" className="mt-3 rounded border border-error/30 bg-error/5 px-3 py-2 font-body-sm text-on-surface">
                  {t(checkoutError)}
                </p>
              )}
            </>
          )}
          {/* Renders itself only for a signed-in learner without Pro. */}
          <RestorePurchase className="mt-5" />
          <p className="mt-3 text-center font-body-sm text-on-surface-variant">
            {t('billing.checkoutNotice')}{' '}
            <Link to="/refund-policy" className="text-primary-ink underline underline-offset-2">
              {t('legal.refund')}
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
