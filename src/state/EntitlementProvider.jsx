import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthProvider.jsx';
import { loadOwnSubscriptions, reconcileOwnSubscription } from '../services/billing.js';
import { resolveEntitlement, subscriptionNeedsReconciliation } from '../features/billing/entitlements.js';
import { canAccessContent, planHasFeature } from '../features/billing/access.js';
import { isBillingConfigured } from '../features/billing/plans.js';

const EntitlementContext = createContext(null);

export function EntitlementProvider({ children }) {
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(authLoading);
  const [error, setError] = useState(null);
  const reconciliationAttemptedUsers = useRef(new Set());
  const reconciliationInFlight = useRef(null);
  const loadGeneration = useRef(0);
  const billingConfigured = isBillingConfigured();

  const refresh = useCallback(async ({ keepLoading = false } = {}) => {
    const generation = ++loadGeneration.current;
    if (!isAuthenticated || !user?.id) {
      setSubscriptions([]);
      setError(null);
      setLoading(false);
      return { data: [], error: null };
    }
    setLoading(true);
    const result = await loadOwnSubscriptions(user.id);
    if (generation === loadGeneration.current) {
      if (!result.error) setSubscriptions(result.data ?? []);
      setError(result.error ?? null);
      if (!keepLoading) setLoading(false);
    }
    return result;
  }, [isAuthenticated, user?.id]);

  const reconcile = useCallback(async () => {
    const userId = user?.id;
    if (!isAuthenticated || !userId) {
      return { data: null, error: { message: 'An authenticated account is required.' } };
    }
    if (reconciliationInFlight.current?.userId === userId) {
      return reconciliationInFlight.current.promise;
    }

    reconciliationAttemptedUsers.current.add(userId);
    const promise = (async () => {
      let result;
      try {
        result = await reconcileOwnSubscription();
      } catch (caught) {
        result = { data: null, error: { message: caught?.message ?? 'Membership reconciliation failed.' } };
      }
      await refresh();
      return result;
    })();
    reconciliationInFlight.current = { userId, promise };

    try {
      return await promise;
    } finally {
      if (reconciliationInFlight.current?.promise === promise) reconciliationInFlight.current = null;
    }
  }, [isAuthenticated, user?.id, refresh]);

  useEffect(() => {
    if (authLoading) return undefined;
    let cancelled = false;

    const loadEntitlements = async () => {
      const result = await refresh({ keepLoading: true });
      if (cancelled) return;

      const needsRecovery = !result.error && result.data?.some((item) => subscriptionNeedsReconciliation(item));
      if (needsRecovery && user?.id && !reconciliationAttemptedUsers.current.has(user.id)) {
        await reconcile();
      } else {
        setLoading(false);
      }
    };

    loadEntitlements();
    return () => { cancelled = true; };
  }, [authLoading, user?.id, refresh, reconcile]);

  const resolved = useMemo(
    () => resolveEntitlement({ authenticated: isAuthenticated, subscriptions }),
    [isAuthenticated, subscriptions],
  );
  const value = useMemo(() => ({
    ...resolved,
    loading: authLoading || loading,
    error,
    billingConfigured,
    subscriptions,
    refresh,
    reconcile,
    // Checkout availability is not an entitlement and must never bypass access.
    hasFeature: (feature) => planHasFeature(resolved.plan, feature),
    canAccessContent: (kind, id) => canAccessContent({
      kind,
      id,
      plan: resolved.plan,
    }),
  }), [resolved, authLoading, loading, error, billingConfigured, subscriptions, refresh, reconcile]);

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}

export function useEntitlements() {
  const context = useContext(EntitlementContext);
  if (!context) throw new Error('useEntitlements must be used inside EntitlementProvider');
  return context;
}
