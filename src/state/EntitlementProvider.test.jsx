import { StrictMode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EntitlementProvider, useEntitlements } from './EntitlementProvider.jsx';

const auth = vi.hoisted(() => ({
  value: {
    loading: false,
    isAuthenticated: true,
    user: { id: 'user-1', email: 'learner@example.com' },
  },
}));

const billing = vi.hoisted(() => ({
  subscriptions: [],
  loadOwnSubscriptions: vi.fn(),
  reconcileOwnSubscription: vi.fn(),
}));

vi.mock('./AuthProvider.jsx', () => ({ useAuth: () => auth.value }));
vi.mock('../services/billing.js', () => ({
  loadOwnSubscriptions: billing.loadOwnSubscriptions,
  reconcileOwnSubscription: billing.reconcileOwnSubscription,
}));

function EntitlementStatus() {
  const { plan, loading, subscriptions } = useEntitlements();
  return (
    <div>
      <span>{loading ? 'Loading' : plan}</span>
      <span>{subscriptions[0]?.last_verified_at ?? 'No subscription'}</span>
    </div>
  );
}

function renderProvider() {
  return render(
    <StrictMode>
      <EntitlementProvider><EntitlementStatus /></EntitlementProvider>
    </StrictMode>,
  );
}

const staleSubscription = (ageInDays = 2) => ({
  id: 'subscription-1',
  provider: 'gumroad',
  plan: 'pro',
  status: 'active',
  current_period_end: null,
  last_verified_at: new Date(Date.now() - (ageInDays * 24 * 60 * 60 * 1000)).toISOString(),
});

describe('automatic entitlement reconciliation', () => {
  beforeEach(() => {
    billing.subscriptions = [];
    billing.loadOwnSubscriptions.mockReset();
    billing.reconcileOwnSubscription.mockReset();
    billing.loadOwnSubscriptions.mockImplementation(async () => ({
      data: billing.subscriptions,
      error: null,
    }));
  });

  it('reconciles stale raw subscription data and reloads it once', async () => {
    const stale = staleSubscription(8);
    const fresh = { ...stale, last_verified_at: new Date().toISOString() };
    billing.subscriptions = [stale];
    billing.reconcileOwnSubscription.mockImplementation(async () => {
      billing.subscriptions = [fresh];
      return { data: { ok: true, matched: true }, error: null };
    });

    renderProvider();

    expect(await screen.findByText(fresh.last_verified_at)).toBeInTheDocument();
    expect(screen.getByText('pro')).toBeInTheDocument();
    expect(billing.reconcileOwnSubscription).toHaveBeenCalledOnce();
    expect(billing.loadOwnSubscriptions.mock.calls.length).toBeGreaterThanOrEqual(2);

    await new Promise((resolve) => { setTimeout(resolve, 25); });
    expect(billing.reconcileOwnSubscription).toHaveBeenCalledOnce();
  });

  it('preserves recent verified entitlement when automatic reconciliation fails', async () => {
    const stale = staleSubscription(2);
    billing.subscriptions = [stale];
    billing.reconcileOwnSubscription.mockRejectedValue(new Error('Gumroad is temporarily unavailable.'));

    renderProvider();

    await waitFor(() => expect(billing.reconcileOwnSubscription).toHaveBeenCalledOnce());
    expect(await screen.findByText('pro')).toBeInTheDocument();
    expect(screen.getByText(stale.last_verified_at)).toBeInTheDocument();
  });

  it('does not reconcile a Free account with no subscription row', async () => {
    renderProvider();

    expect(await screen.findByText('free')).toBeInTheDocument();
    expect(screen.getByText('No subscription')).toBeInTheDocument();
    expect(billing.reconcileOwnSubscription).not.toHaveBeenCalled();
  });
});
