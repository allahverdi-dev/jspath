import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthProvider.jsx';
import { loadOwnSubscriptions, reconcileOwnSubscription } from '../services/billing.js';
import { resolveEntitlement } from '../features/billing/entitlements.js';
import { canAccessContent, planHasFeature } from '../features/billing/access.js';
import { isBillingConfigured } from '../features/billing/plans.js';

const EntitlementContext = createContext(null);

export function EntitlementProvider({ children }) {
  const { loading: authLoading, isAuthenticated, user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(authLoading);
  const [error, setError] = useState(null);
  const billingConfigured = isBillingConfigured();

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setSubscriptions([]);
      setError(null);
      setLoading(false);
      return { data: [], error: null };
    }
    setLoading(true);
    const result = await loadOwnSubscriptions(user.id);
    setSubscriptions(result.data ?? []);
    setError(result.error ?? null);
    setLoading(false);
    return result;
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  const reconcile = useCallback(async () => {
    const result = await reconcileOwnSubscription();
    await refresh();
    return result;
  }, [refresh]);

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
    hasFeature: (feature) => !billingConfigured || planHasFeature(resolved.plan, feature),
    canAccessContent: (kind, id) => canAccessContent({
      kind,
      id,
      plan: resolved.plan,
      enforcePaidAccess: billingConfigured,
    }),
  }), [resolved, authLoading, loading, error, billingConfigured, subscriptions, refresh, reconcile]);

  return <EntitlementContext.Provider value={value}>{children}</EntitlementContext.Provider>;
}

export function useEntitlements() {
  const context = useContext(EntitlementContext);
  if (!context) throw new Error('useEntitlements must be used inside EntitlementProvider');
  return context;
}
