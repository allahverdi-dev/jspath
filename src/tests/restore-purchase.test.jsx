import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import { RestorePurchase } from '../components/billing/RestorePurchase.jsx';
import { I18nProvider } from '../i18n/index.jsx';
import { subscriptionGrantsPro, subscriptionNeedsReconciliation } from '../features/billing/entitlements.js';
import { resolveEntitlement } from '../../supabase/functions/_shared/entitlement.js';
import { SUPPORTED_LOCALES } from '../i18n/core.js';
import en from '../i18n/locales/en.js';
import az from '../i18n/locales/az.js';
import ru from '../i18n/locales/ru.js';

/**
 * Restoring a Pro purchase onto an account that has no subscription row.
 *
 * The production sequence that exposed this: a Canceling Pro learner deleted
 * their account, the cascade removed `subscriptions`, they signed up again with
 * the same identity, and nothing asked Gumroad whether the purchase still
 * existed — because the automatic trigger is
 * `subscriptions.some(needsReconciliation)`, and `[].some()` is false.
 *
 * The security model is unchanged and is the point of these tests: the browser
 * sends no email, no user id and no subscription data. `reconcile-gumroad`
 * verifies the session, requires a confirmed email, searches Gumroad by that
 * address and writes the result itself.
 */

const dictionaries = { en, az, ru };
const RECONCILE_SOURCE = fs.readFileSync(
  path.resolve(process.cwd(), 'supabase/functions/reconcile-gumroad/index.ts'), 'utf8',
);
const BILLING_SERVER_SOURCE = fs.readFileSync(
  path.resolve(process.cwd(), 'supabase/functions/_shared/billing-server.ts'), 'utf8',
);

/** Comments discuss these names deliberately; only real code counts. */
const stripComments = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

const mocks = vi.hoisted(() => ({ auth: {}, entitlements: {}, locale: 'en' }));
vi.mock('../state/AuthProvider.jsx', () => ({ useAuth: () => mocks.auth }));
vi.mock('../state/EntitlementProvider.jsx', () => ({ useEntitlements: () => mocks.entitlements }));
vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({ state: { settings: { locale: mocks.locale } }, actions: { updateSettings: vi.fn() } }),
}));

const renderRestore = (locale = 'en') => {
  mocks.locale = locale;
  return render(
    <MemoryRouter><I18nProvider><RestorePurchase /></I18nProvider></MemoryRouter>,
  );
};

const found = () => ({ data: { ok: true, matched: true }, error: null });
const none = () => ({ data: { ok: true, matched: false }, error: null });

beforeEach(() => {
  mocks.auth = { isAuthenticated: true };
  mocks.entitlements = {
    isPro: false, plan: 'free', billingConfigured: true, subscriptions: [],
    reconcile: vi.fn().mockResolvedValue(found()),
  };
  mocks.locale = 'en';
});

/* ------------------------------------------------------------------ *
 * The gap being closed
 * ------------------------------------------------------------------ */

describe('the recovery gap', () => {
  it('is not covered by the automatic trigger, because an empty list matches nothing', () => {
    // This is the root cause, asserted rather than described.
    expect([].some((item) => subscriptionNeedsReconciliation(item))).toBe(false);
    const provider = fs.readFileSync(path.resolve(__dirname, '../state/EntitlementProvider.jsx'), 'utf8');
    expect(provider).toMatch(/result\.data\?\.some\(\(item\) => subscriptionNeedsReconciliation\(item\)\)/);
  });

  it('does not reconcile automatically on render', async () => {
    renderRestore();
    // Rendering must never call Gumroad; only the click does.
    await waitFor(() => expect(screen.getByRole('button', { name: en.billing.restorePurchase })).toBeEnabled());
    expect(mocks.entitlements.reconcile).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ *
 * Who may restore
 * ------------------------------------------------------------------ */

describe('who can restore', () => {
  it('offers nothing to a guest', () => {
    mocks.auth = { isAuthenticated: false };
    const { container } = renderRestore();
    expect(container).toBeEmptyDOMElement();
    expect(mocks.entitlements.reconcile).not.toHaveBeenCalled();
  });

  it('offers nothing to an account that already has Pro', () => {
    mocks.entitlements = { ...mocks.entitlements, isPro: true };
    const { container } = renderRestore();
    expect(container).toBeEmptyDOMElement();
  });

  it('offers nothing where billing is not configured', () => {
    mocks.entitlements = { ...mocks.entitlements, billingConfigured: false };
    const { container } = renderRestore();
    expect(container).toBeEmptyDOMElement();
  });

  it('offers the action to a signed-in account with no subscription', () => {
    renderRestore();
    expect(screen.getByRole('button', { name: en.billing.restorePurchase })).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ *
 * Outcomes
 * ------------------------------------------------------------------ */

describe('restoring', () => {
  it('reports success when a purchase is matched', async () => {
    const user = userEvent.setup();
    renderRestore();
    await user.click(screen.getByRole('button', { name: en.billing.restorePurchase }));
    expect(await screen.findByRole('status')).toHaveTextContent(en.billing.restoreRestored);
    expect(mocks.entitlements.reconcile).toHaveBeenCalledTimes(1);
  });

  it('treats "no purchase" as an answer, not an error', async () => {
    mocks.entitlements.reconcile = vi.fn().mockResolvedValue(none());
    const user = userEvent.setup();
    renderRestore();
    await user.click(screen.getByRole('button', { name: en.billing.restorePurchase }));
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(en.billing.restoreNotFound);
    expect(status).not.toHaveTextContent(en.billing.restoreFailed);
    // A calm outcome, not an error box.
    expect(status.className).not.toMatch(/border-error/);
  });

  it.each([
    ['a transport error', { data: null, error: { message: 'network' } }],
    ['a server refusal', { data: { ok: false, message: 'Unauthorized.' }, error: null }],
    ['a missing body', { data: null, error: null }],
  ])('reports %s as retryable without claiming anything changed', async (_label, response) => {
    mocks.entitlements.reconcile = vi.fn().mockResolvedValue(response);
    const user = userEvent.setup();
    renderRestore();
    await user.click(screen.getByRole('button', { name: en.billing.restorePurchase }));
    expect(await screen.findByRole('status')).toHaveTextContent(en.billing.restoreFailed);
  });

  it('disables itself while checking, so a double click is one request', async () => {
    let release;
    mocks.entitlements.reconcile = vi.fn(() => new Promise((resolve) => { release = resolve; }));
    const user = userEvent.setup();
    renderRestore();
    const button = screen.getByRole('button', { name: en.billing.restorePurchase });
    await user.click(button);
    const checking = await screen.findByRole('button', { name: en.billing.restoreChecking });
    expect(checking).toBeDisabled();
    await user.click(checking);
    expect(mocks.entitlements.reconcile).toHaveBeenCalledTimes(1);
    release(found());
  });

  it('is idempotent: restoring twice asks again and stays consistent', async () => {
    const user = userEvent.setup();
    renderRestore();
    const button = screen.getByRole('button', { name: en.billing.restorePurchase });
    await user.click(button);
    await screen.findByRole('status');
    await user.click(screen.getByRole('button', { name: en.billing.restorePurchase }));
    await waitFor(() => expect(mocks.entitlements.reconcile).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole('status')).toHaveTextContent(en.billing.restoreRestored);
    // The client never passes anything that could differ between attempts.
    for (const call of mocks.entitlements.reconcile.mock.calls) expect(call).toEqual([]);
  });

  it('sends no identity, email or subscription data with the request', async () => {
    const user = userEvent.setup();
    renderRestore();
    await user.click(screen.getByRole('button', { name: en.billing.restorePurchase }));
    await screen.findByRole('status');
    expect(mocks.entitlements.reconcile).toHaveBeenCalledWith();

    // The comments explain what is not sent; the code must not send it.
    const component = stripComments(fs.readFileSync(
      path.resolve(__dirname, '../components/billing/RestorePurchase.jsx'), 'utf8',
    ));
    expect(component).not.toMatch(/user_id|userId|\bemail\b|sale_id|subscription_id/);
  });
});

/* ------------------------------------------------------------------ *
 * The server keeps deciding
 * ------------------------------------------------------------------ */

describe('the reconcile-gumroad trust boundary is unchanged', () => {
  it('requires an Authorization header and a confirmed email', () => {
    expect(RECONCILE_SOURCE).toContain("request.headers.get('authorization')");
    expect(RECONCILE_SOURCE).toContain('userClient.auth.getUser()');
    expect(RECONCILE_SOURCE).toMatch(/!user\?\.email \|\| !user\.email_confirmed_at/);
  });

  it('searches Gumroad by the authenticated email, never a supplied one', () => {
    expect(RECONCILE_SOURCE).toContain('salesForEmail(user.email)');
    // Nothing is read out of the request body at all.
    expect(RECONCILE_SOURCE).not.toMatch(/request\.json\(\)/);
    expect(RECONCILE_SOURCE).not.toMatch(/body\./);
  });

  it('keeps the product allow-list', () => {
    expect(RECONCILE_SOURCE).toContain('parseAllowedProducts');
    expect(RECONCILE_SOURCE).toContain('isAllowedProduct(allowed, sale)');
  });

  it('still requires the purchaser email to match the authenticated account', () => {
    // resolveUser compares the verified sale email against the account's.
    expect(BILLING_SERVER_SOURCE).toMatch(/verifiedEmail = String\(sale\.email \?\? ''\)/);
    expect(BILLING_SERVER_SOURCE).toMatch(/authenticatedUser\.email\?\.trim\(\)\.toLowerCase\(\) === verifiedEmail/);
    expect(BILLING_SERVER_SOURCE).toMatch(/data\.user\.email\?\.trim\(\)\.toLowerCase\(\) === verifiedEmail/);
    expect(BILLING_SERVER_SOURCE).toContain('email_confirmed_at');
  });

  it('maps a refunded or disputed sale away from an entitlement', () => {
    expect(RECONCILE_SOURCE).toMatch(/sale\.refunded \? 'refund'/);
    expect(RECONCILE_SOURCE).toMatch(/sale\.disputed \|\| sale\.chargebacked \? 'dispute'/);
    // And those statuses grant nothing.
    for (const status of ['refunded', 'revoked', 'expired']) {
      expect(subscriptionGrantsPro({ plan: 'pro', status, current_period_end: '2030-01-01T00:00:00Z' })).toBe(false);
    }
  });

  it('answers "no match" without inventing a subscription', () => {
    expect(RECONCILE_SOURCE).toMatch(/if \(sales\.length === 0\) return jsonResponse\(\{ ok: true, matched: false \}\)/);
  });

  it('writes at most one row per provider subscription', () => {
    const migration = fs.readFileSync(
      path.resolve(process.cwd(), 'supabase/migrations/202608300001_billing_subscriptions.sql'), 'utf8',
    );
    // Uniqueness is enforced by the schema, so a repeated restore cannot duplicate.
    expect(migration).toContain('subscriptions_provider_subscription_unique unique (provider, provider_subscription_id)');
    expect(migration).toContain('subscriptions_provider_sale_unique unique (provider, provider_sale_id)');
  });

  it('never touches learning data', () => {
    expect(RECONCILE_SOURCE).not.toMatch(/user_progress/);
    expect(BILLING_SERVER_SOURCE).not.toMatch(/user_progress/);
  });

  it('exposes no Gumroad token to the browser', () => {
    expect(BILLING_SERVER_SOURCE).toContain("Deno.env.get('GUMROAD_ACCESS_TOKEN')");
    const clientFiles = [];
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (/\.jsx?$/.test(entry) && !/\.test\./.test(entry)) clientFiles.push(fs.readFileSync(full, 'utf8'));
      }
    })(path.resolve(process.cwd(), 'src'));
    for (const source of clientFiles) {
      expect(source).not.toMatch(/GUMROAD_ACCESS_TOKEN|GUMROAD_WEBHOOK_TOKEN/);
    }
  });

  it('leaves the paid-through date provider-derived', () => {
    // The client reads current_period_end; it never computes or sends one.
    const component = stripComments(fs.readFileSync(
      path.resolve(__dirname, '../components/billing/RestorePurchase.jsx'), 'utf8',
    ));
    expect(component).not.toMatch(/current_period_end|paid_through|ends_at/);
    // And a row with no valid period grants nothing on a stale verification.
    expect(subscriptionGrantsPro({
      plan: 'pro', status: 'active', current_period_end: '2020-01-01T00:00:00Z',
    })).toBe(false);
  });
});

/* ------------------------------------------------------------------ *
 * Restored states, and what is not restored
 * ------------------------------------------------------------------ */

describe('what a restore produces', () => {
  const now = new Date('2026-09-03T00:00:00Z');

  it('grants Pro for a restored active subscription', () => {
    const row = { plan: 'pro', status: 'active', current_period_end: '2030-01-01T00:00:00Z' };
    expect(resolveEntitlement({ authenticated: true, subscriptions: [row], now }))
      .toMatchObject({ plan: 'pro', isPro: true });
  });

  it('grants Pro for a restored canceling subscription with time left', () => {
    const row = { plan: 'pro', status: 'canceling', current_period_end: '2030-01-01T00:00:00Z' };
    expect(resolveEntitlement({ authenticated: true, subscriptions: [row], now }))
      .toMatchObject({ plan: 'pro', isPro: true });
  });

  it('grants nothing for a refunded or disputed purchase', () => {
    for (const status of ['refunded', 'revoked']) {
      const row = { plan: 'pro', status, current_period_end: '2030-01-01T00:00:00Z' };
      expect(resolveEntitlement({ authenticated: true, subscriptions: [row], now }))
        .toMatchObject({ plan: 'free', isPro: false });
    }
  });

  it('does not restore deleted learning data', () => {
    // Entitlement and progress are separate systems and separate tables. The
    // restore path touches neither the progress table nor the local document.
    const component = stripComments(fs.readFileSync(
      path.resolve(__dirname, '../components/billing/RestorePurchase.jsx'), 'utf8',
    ));
    expect(component).not.toMatch(/user_progress|resetProgress|importState|useUserState/);
    const migration = fs.readFileSync(
      path.resolve(process.cwd(), 'supabase/migrations/202609020001_user_progress.sql'), 'utf8',
    );
    expect(migration).toContain('Never contains plan or entitlement data');
  });

  it('keeps entitlement independent of the interface language', () => {
    const row = { plan: 'pro', status: 'active', current_period_end: '2030-01-01T00:00:00Z' };
    const base = resolveEntitlement({ authenticated: true, subscriptions: [row], now });
    for (const locale of SUPPORTED_LOCALES) {
      expect(locale && resolveEntitlement({ authenticated: true, subscriptions: [row], now })).toEqual(base);
    }
    const provider = fs.readFileSync(path.resolve(__dirname, '../state/EntitlementProvider.jsx'), 'utf8');
    expect(provider).not.toMatch(/locale|i18n/i);
  });

  it('cannot carry one account’s result to the next', () => {
    // Rows are always fetched for the current user id, and the provider drops
    // them when the identity changes.
    const provider = fs.readFileSync(path.resolve(__dirname, '../state/EntitlementProvider.jsx'), 'utf8');
    expect(provider).toMatch(/loadOwnSubscriptions\(user\.id\)/);
    expect(provider).toMatch(/if \(!isAuthenticated \|\| !user\?\.id\) \{\s*setSubscriptions\(\[\]\)/);
    // And the paid payload cache is dropped on any identity change.
    const auth = fs.readFileSync(path.resolve(__dirname, '../state/AuthProvider.jsx'), 'utf8');
    expect(auth).toMatch(/clearPremiumCache\(\);\s*\n\s*setSession\(s\)/);
  });
});

/* ------------------------------------------------------------------ *
 * Languages
 * ------------------------------------------------------------------ */

describe('restore speaks every language', () => {
  it.each(SUPPORTED_LOCALES)('%s labels the action', (locale) => {
    renderRestore(locale);
    expect(screen.getByRole('button', { name: dictionaries[locale].billing.restorePurchase })).toBeInTheDocument();
  });

  it.each(SUPPORTED_LOCALES)('%s reports a missing purchase in its own words', async (locale) => {
    mocks.entitlements.reconcile = vi.fn().mockResolvedValue(none());
    const user = userEvent.setup();
    renderRestore(locale);
    await user.click(screen.getByRole('button', { name: dictionaries[locale].billing.restorePurchase }));
    expect(await screen.findByRole('status')).toHaveTextContent(dictionaries[locale].billing.restoreNotFound);
  });
});
