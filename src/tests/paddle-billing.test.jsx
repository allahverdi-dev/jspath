import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import {
  BILLING_OPTIONS, isFresherThanStored, jspathUserIdFrom, normalizePaddleStatus,
  normalizePaddleSubscription, paddleApiHost, paddleEnvironment, parsePaddleSignature,
  resolveBillingOption, resolveCatalogItem, verifyPaddleSignature,
} from '../../supabase/functions/_shared/paddle.js';
import { resolveEntitlement, subscriptionGrantsPro } from '../features/billing/entitlements.js';
import {
  BILLING_PROVIDER, CHECKOUT_OPTIONS, isLegacyGumroadSubscription, subscriptionProvider,
} from '../features/billing/plans.js';
import { ManageSubscriptionButton } from '../components/billing/ManageSubscriptionButton.jsx';
import { I18nProvider } from '../i18n/index.jsx';
import en from '../i18n/locales/en.js';

/**
 * Paddle Billing.
 *
 * The security model is unchanged from Gumroad and is what these tests are for:
 * the browser can name an internal option id and nothing else, the server
 * decides what that maps to, and only a trusted subscription row grants Pro.
 *
 * The Edge Functions are Deno and cannot be imported into vitest, so their pure
 * logic is exercised directly from `_shared/paddle.js` and their trust
 * boundaries are asserted against their source — which is what stops a later
 * edit from quietly trusting a client-supplied price, customer or user id.
 */

const ENV = 'sandbox';

const CATALOG = Object.freeze({
  productId: 'pro_test_product',
  priceByInterval: Object.freeze({ monthly: 'pri_test_monthly', annual: 'pri_test_annual' }),
  intervalByPrice: Object.freeze({ pri_test_monthly: 'monthly', pri_test_annual: 'annual' }),
});

const read = (p) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');
const stripComments = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const CHECKOUT = read('supabase/functions/paddle-checkout/index.ts');
const WEBHOOK = read('supabase/functions/paddle-webhook/index.ts');
const RECONCILE = read('supabase/functions/reconcile-paddle/index.ts');
const PORTAL = read('supabase/functions/paddle-portal/index.ts');
const MIGRATION = read('supabase/migrations/202609040001_paddle_billing.sql');

const USER = '3f1a2b4c-5d6e-4f70-8a91-b2c3d4e5f607';

const subscription = (overrides = {}) => ({
  id: 'sub_test_1',
  status: 'active',
  customer_id: 'ctm_test_1',
  transaction_id: 'txn_test_1',
  custom_data: { jspath_user_id: USER, jspath_plan: 'pro', jspath_billing_interval: 'monthly' },
  items: [{ quantity: 1, price: { id: 'pri_test_monthly', product_id: 'pro_test_product' } }],
  current_billing_period: { starts_at: '2026-09-01T00:00:00Z', ends_at: '2026-10-01T00:00:00Z' },
  scheduled_change: null,
  started_at: '2026-09-01T00:00:00Z',
  updated_at: '2026-09-02T00:00:00Z',
  ...overrides,
});

/* ------------------------------------------------------------------ *
 * Environment
 * ------------------------------------------------------------------ */

describe('the Paddle environment', () => {
  it('picks the API host from configuration, not from anything a caller sends', () => {
    expect(paddleApiHost('sandbox')).toBe('https://sandbox-api.paddle.com');
    expect(paddleApiHost('production')).toBe('https://api.paddle.com');
    expect(paddleEnvironment('SANDBOX')).toBe('sandbox');
  });

  it.each(['', 'live', 'test', 'prod', undefined, 'sandbox-api.paddle.com'])(
    'fails closed on %p rather than guessing',
    (value) => {
      expect(() => paddleEnvironment(value)).toThrow(/sandbox.*production/i);
    },
  );

  it('hard-codes no environment-specific identifier in application code', () => {
    for (const source of [CHECKOUT, WEBHOOK, RECONCILE, PORTAL, read('src/features/billing/plans.js')]) {
      expect(source).not.toMatch(/\bpri_[a-z0-9]{6,}/i);
      expect(source).not.toMatch(/\bpro_[a-z0-9]{20,}/i);
    }
  });
});

/* ------------------------------------------------------------------ *
 * Checkout
 * ------------------------------------------------------------------ */

describe('paddle-checkout', () => {
  it('accepts only the two internal option ids', () => {
    expect(Object.keys(BILLING_OPTIONS)).toEqual(['pro-monthly', 'pro-annual']);
    expect(resolveBillingOption('pro-monthly')).toEqual({ plan: 'pro', billingInterval: 'monthly' });
    expect(resolveBillingOption('pro-annual')).toEqual({ plan: 'pro', billingInterval: 'annual' });
  });

  it.each(['pri_test_monthly', 'pro-lifetime', '__proto__', 'constructor', '', null, 'PRO-MONTHLY'])(
    'rejects %p',
    (option) => { expect(resolveBillingOption(option)).toBeNull(); },
  );

  it('requires POST and an authenticated, confirmed account', () => {
    expect(CHECKOUT).toMatch(/request\.method !== 'POST'/);
    expect(CHECKOUT).toContain("request.headers.get('authorization')");
    expect(CHECKOUT).toContain('userClient.auth.getUser()');
    expect(CHECKOUT).toMatch(/!user\?\.id \|\| !user\.email_confirmed_at/);
  });

  it('takes the user id from the token and the price from configuration', () => {
    const code = stripComments(CHECKOUT);
    expect(code).toContain('jspath_user_id: user.id');
    expect(code).toContain('catalog.priceByInterval[option.billingInterval]');
    expect(code).toContain('quantity: 1');
    // Nothing about identity or catalogue is read from the request body.
    expect(code).toMatch(/body\?\.option/);
    expect(code).not.toMatch(/body\?\.(price|price_id|user_id|customer|custom_data|quantity)/);
  });

  it('never lets the browser supply custom data', () => {
    const code = stripComments(CHECKOUT);
    const customData = code.slice(code.indexOf('custom_data'), code.indexOf('custom_data') + 300);
    expect(customData).not.toMatch(/body/);
  });

  it('records the checkout against the authenticated user before returning it', () => {
    const code = stripComments(CHECKOUT);
    expect(code).toMatch(/from\('billing_checkout_sessions'\)/);
    expect(code).toContain('user_id: user.id');
    // The mapping is the only recovery path, so a failure to write it fails the
    // request rather than handing back a transaction nobody can reconcile.
    expect(code).toContain("reason: 'mapping_failed'");
    expect(code.indexOf('mapping_failed')).toBeLessThan(code.indexOf('transactionId }'));
  });

  it('returns only the transaction id', () => {
    expect(stripComments(CHECKOUT)).toMatch(/jsonResponse\(\{ ok: true, transactionId \}\)/);
  });

  it('handles a provider failure without inventing a checkout', () => {
    expect(CHECKOUT).toContain("reason: 'provider_unavailable'");
  });
});

/* ------------------------------------------------------------------ *
 * Webhook signature
 * ------------------------------------------------------------------ */

describe('webhook signatures', () => {
  const SECRET = 'pdl_ntfset_test_secret';
  const BODY = '{"event_id":"evt_1","event_type":"subscription.created"}';

  const sign = async (body, ts, secret = SECRET) => {
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
    );
    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}:${body}`));
    return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  it('parses the documented header shape', () => {
    expect(parsePaddleSignature('ts=1671552777;h1=abc')).toEqual({ ts: '1671552777', h1: ['abc'] });
    // Multiple h1 values occur while a secret is rotated.
    expect(parsePaddleSignature('ts=1;h1=a;h1=b').h1).toEqual(['a', 'b']);
  });

  it.each([
    ['missing', null], ['empty', ''], ['no ts', 'h1=abc'], ['no h1', 'ts=1'],
    ['non-numeric ts', 'ts=abc;h1=def'], ['no separator', 'ts1671552777h1abc'],
    ['duplicated ts', 'ts=1;ts=2;h1=abc'], ['empty value', 'ts=;h1=abc'],
  ])('rejects a %s header', (_label, header) => {
    expect(parsePaddleSignature(header)).toBeNull();
  });

  it('accepts a correct signature over ts + ":" + raw body', async () => {
    const ts = Math.floor(Date.now() / 1000);
    const result = await verifyPaddleSignature({
      rawBody: BODY, signatureHeader: `ts=${ts};h1=${await sign(BODY, ts)}`, secret: SECRET,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects a signature computed over a different body', async () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = `ts=${ts};h1=${await sign(BODY, ts)}`;
    const tampered = BODY.replace('evt_1', 'evt_2');
    expect(await verifyPaddleSignature({ rawBody: tampered, signatureHeader: header, secret: SECRET }))
      .toMatchObject({ ok: false, reason: 'invalid_signature' });
  });

  it('rejects a signature made with another secret', async () => {
    const ts = Math.floor(Date.now() / 1000);
    const header = `ts=${ts};h1=${await sign(BODY, ts, 'wrong_secret')}`;
    expect(await verifyPaddleSignature({ rawBody: BODY, signatureHeader: header, secret: SECRET }))
      .toMatchObject({ ok: false, reason: 'invalid_signature' });
  });

  it('rejects a replayed delivery outside the tolerance', async () => {
    const stale = Math.floor(Date.now() / 1000) - 3600;
    const header = `ts=${stale};h1=${await sign(BODY, stale)}`;
    expect(await verifyPaddleSignature({ rawBody: BODY, signatureHeader: header, secret: SECRET }))
      .toMatchObject({ ok: false, reason: 'stale_timestamp' });
  });

  it('rejects a future timestamp too, not just an old one', async () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const header = `ts=${future};h1=${await sign(BODY, future)}`;
    expect(await verifyPaddleSignature({ rawBody: BODY, signatureHeader: header, secret: SECRET }))
      .toMatchObject({ ok: false, reason: 'stale_timestamp' });
  });

  it('refuses to verify anything when no secret is configured', async () => {
    expect(await verifyPaddleSignature({ rawBody: BODY, signatureHeader: 'ts=1;h1=a', secret: '' }))
      .toMatchObject({ ok: false, reason: 'not_configured' });
  });

  it('verifies before parsing, and parses the raw body it verified', () => {
    const code = stripComments(WEBHOOK);
    expect(code.indexOf('verifyPaddleSignature')).toBeLessThan(code.indexOf('JSON.parse'));
    expect(code).toContain('await request.text()');
    expect(code).toMatch(/JSON\.parse\(rawBody\)/);
    // Deployed without Supabase JWT verification, so the signature is the gate.
    expect(code).not.toContain('auth.getUser()');
  });
});

/* ------------------------------------------------------------------ *
 * Catalogue and status
 * ------------------------------------------------------------------ */

describe('what actually grants Pro', () => {
  it('accepts the configured product at either configured price', () => {
    expect(resolveCatalogItem(subscription(), CATALOG)).toEqual({
      priceId: 'pri_test_monthly', billingInterval: 'monthly',
    });
    const annual = subscription({ items: [{ quantity: 1, price: { id: 'pri_test_annual', product_id: 'pro_test_product' } }] });
    expect(resolveCatalogItem(annual, CATALOG).billingInterval).toBe('annual');
  });

  it.each([
    ['another product', { items: [{ quantity: 1, price: { id: 'pri_test_monthly', product_id: 'pro_someone_else' } }] }],
    ['an unknown price', { items: [{ quantity: 1, price: { id: 'pri_not_ours', product_id: 'pro_test_product' } }] }],
    ['no items', { items: [] }],
    ['a quantity we do not sell', { items: [{ quantity: 5, price: { id: 'pri_test_monthly', product_id: 'pro_test_product' } }] }],
    ['two matching items', { items: [
      { quantity: 1, price: { id: 'pri_test_monthly', product_id: 'pro_test_product' } },
      { quantity: 1, price: { id: 'pri_test_annual', product_id: 'pro_test_product' } },
    ] }],
  ])('refuses %s', (_label, overrides) => {
    expect(resolveCatalogItem(subscription(overrides), CATALOG)).toBeNull();
    expect(normalizePaddleSubscription({ subscription: subscription(overrides), catalog: CATALOG, environment: ENV })).toBeNull();
  });

  it('never takes the purchased product from custom_data', () => {
    // custom_data insists on Pro; the items say otherwise, and the items win.
    const lying = subscription({
      custom_data: { jspath_user_id: USER, jspath_plan: 'pro' },
      items: [{ quantity: 1, price: { id: 'pri_not_ours', product_id: 'pro_not_ours' } }],
    });
    expect(normalizePaddleSubscription({ subscription: lying, catalog: CATALOG, environment: ENV })).toBeNull();
  });

  it('maps an active subscription to Pro with the provider period end', () => {
    const record = normalizePaddleSubscription({ subscription: subscription(), catalog: CATALOG, environment: ENV });
    expect(record).toMatchObject({
      provider: 'paddle', provider_environment: ENV, plan: 'pro', status: 'active',
      billing_interval: 'monthly', provider_customer_id: 'ctm_test_1',
      provider_product_id: 'pro_test_product', provider_variant: 'pri_test_monthly',
      current_period_end: '2026-10-01T00:00:00Z', cancel_at_period_end: false,
      provider_sale_id: null,
    });
    expect(resolveEntitlement({ authenticated: true, subscriptions: [record], now: new Date('2026-09-15'), environment: ENV }).isPro).toBe(true);
  });

  it('keeps access to the paid-through date when cancellation is only scheduled', () => {
    // Paddle leaves status "active" and hangs a scheduled_change off it.
    const scheduled = subscription({
      status: 'active',
      scheduled_change: { action: 'cancel', effective_at: '2026-10-01T00:00:00Z' },
    });
    const record = normalizePaddleSubscription({ subscription: scheduled, catalog: CATALOG, environment: ENV });
    expect(record).toMatchObject({ status: 'canceling', cancel_at_period_end: true, current_period_end: '2026-10-01T00:00:00Z' });
    // Still Pro before the effective date, and not after.
    expect(resolveEntitlement({ authenticated: true, subscriptions: [record], now: new Date('2026-09-20'), environment: ENV }).isPro).toBe(true);
    expect(resolveEntitlement({ authenticated: true, subscriptions: [record], now: new Date('2026-10-05'), environment: ENV }).isPro).toBe(false);
  });

  it('does not treat a scheduled pause as an immediate loss', () => {
    const scheduled = subscription({ scheduled_change: { action: 'pause', effective_at: '2026-10-01T00:00:00Z' } });
    expect(normalizePaddleStatus(scheduled).status).toBe('active');
  });

  it.each([
    ['canceled', 'expired'],
    ['paused', 'paused'],
    ['past_due', 'past_due'],
    ['active', 'active'],
    ['trialing', 'active'],
  ])('maps Paddle %s to %s', (paddleStatus, expected) => {
    expect(normalizePaddleStatus(subscription({ status: paddleStatus })).status).toBe(expected);
  });

  it.each(['', null, 'unknown_future_state', 'deleted'])('fails closed on the %p status', (status) => {
    const record = normalizePaddleSubscription({ subscription: subscription({ status }), catalog: CATALOG, environment: ENV });
    expect(record.status).toBe('revoked');
    expect(resolveEntitlement({ authenticated: true, subscriptions: [record], now: new Date('2026-09-15'), environment: ENV }).isPro).toBe(false);
  });

  it.each(['canceled', 'paused'])('removes Pro for a %s subscription', (status) => {
    const record = normalizePaddleSubscription({ subscription: subscription({ status }), catalog: CATALOG, environment: ENV });
    expect(resolveEntitlement({ authenticated: true, subscriptions: [record], now: new Date('2026-09-15'), environment: ENV }).isPro).toBe(false);
  });

  it('keeps Pro during dunning, with the period end already elapsed', () => {
    /*
     * The elapsed period is the whole point. A past_due subscription has one by
     * definition - that is *why* payment is due - and an earlier version of this
     * test used a period end in the *future*, which no real past_due
     * subscription has. It passed while the code revoked Pro the moment a
     * renewal failed. Keep this fixture realistic.
     */
    const overdue = subscription({
      status: 'past_due',
      current_billing_period: { starts_at: '2026-08-01T00:00:00Z', ends_at: '2026-09-01T00:00:00Z' },
    });
    const record = normalizePaddleSubscription({ subscription: overdue, catalog: CATALOG, environment: ENV });
    expect(record.status).toBe('past_due');
    expect(Date.parse(record.current_period_end)).toBeLessThan(Date.parse('2026-09-15'));

    expect(resolveEntitlement({
      authenticated: true, subscriptions: [record], now: new Date('2026-09-15T12:00:00Z'), environment: ENV,
    }).isPro).toBe(true);
  });

  it('follows Paddle out of past_due rather than timing it out locally', () => {
    /*
     * Paddle owns the recovery window: it retries, and either the payment
     * succeeds and the subscription returns to active, or recovery is exhausted
     * and Paddle moves it to canceled. JSPath adds no second timeout of its own,
     * so nothing about how old the local row is changes the answer.
     */
    const overdue = subscription({
      status: 'past_due',
      current_billing_period: { starts_at: '2026-08-01T00:00:00Z', ends_at: '2026-09-01T00:00:00Z' },
    });
    const record = normalizePaddleSubscription({ subscription: overdue, catalog: CATALOG, environment: ENV });
    const at = (verified) => resolveEntitlement({
      authenticated: true,
      subscriptions: [{ ...record, last_verified_at: verified }],
      now: new Date('2026-09-15T12:00:00Z'),
      environment: ENV,
    }).isPro;

    expect(at('2026-09-15T11:00:00Z')).toBe(true);   // verified minutes ago
    expect(at('2026-01-01T00:00:00Z')).toBe(true);   // and months ago
    expect(at(null)).toBe(true);                     // and never recorded

    // Access ends because Paddle says so, not because a clock ran out here.
    const canceled = normalizePaddleSubscription({
      subscription: subscription({ status: 'canceled' }), catalog: CATALOG, environment: ENV,
    });
    expect(resolveEntitlement({
      authenticated: true, subscriptions: [canceled], now: new Date('2026-09-15T12:00:00Z'), environment: ENV,
    }).isPro).toBe(false);
  });

  it('does not let the period end independently revoke a past_due subscription', () => {
    const overdue = subscription({
      status: 'past_due',
      current_billing_period: { starts_at: '2026-08-01T00:00:00Z', ends_at: '2026-09-01T00:00:00Z' },
    });
    const record = normalizePaddleSubscription({ subscription: overdue, catalog: CATALOG, environment: ENV });
    // Long after the period ended, and still entitled - Paddle has not said stop.
    expect(subscriptionGrantsPro(record, new Date('2027-06-01T00:00:00Z'), ENV)).toBe(true);
  });

  it('leaves Gumroad past_due semantics untouched', () => {
    // Gumroad derives past_due from a failure date and is judged on the period
    // end, exactly as before. The Paddle rule is scoped to Paddle.
    const gumroad = {
      provider: 'gumroad', plan: 'pro', status: 'past_due',
      current_period_end: '2026-09-01T00:00:00Z', last_verified_at: '2026-09-15T11:00:00Z',
    };
    expect(subscriptionGrantsPro(gumroad, new Date('2026-09-15T12:00:00Z'), ENV)).toBe(false);
    // A Gumroad row still inside its period is still entitled.
    expect(subscriptionGrantsPro(
      { ...gumroad, current_period_end: '2026-10-01T00:00:00Z' },
      new Date('2026-09-15T12:00:00Z'), ENV,
    )).toBe(true);
  });
});

/* ------------------------------------------------------------------ *
 * User binding
 * ------------------------------------------------------------------ */

describe('user binding', () => {
  it('accepts a UUID written by the server', () => {
    expect(jspathUserIdFrom({ jspath_user_id: USER })).toBe(USER);
    expect(jspathUserIdFrom({ jspath_user_id: USER.toUpperCase() })).toBe(USER);
  });

  it.each([
    ['a non-UUID', 'user-123'], ['SQL-ish input', "' or 1=1--"], ['an email', 'a@b.c'],
    ['empty', ''], ['missing', undefined], ['a number', 12345], ['an object', { id: USER }],
  ])('refuses %s', (_label, value) => {
    expect(jspathUserIdFrom({ jspath_user_id: value })).toBeNull();
  });

  it('confirms the account exists before crediting it', () => {
    expect(stripComments(WEBHOOK)).toContain('admin.auth.admin.getUserById(userId)');
  });

  it('falls back only to a mapping the server wrote itself', () => {
    const code = stripComments(WEBHOOK);
    expect(code).toMatch(/from\('billing_checkout_sessions'\)[\s\S]{0,200}provider_transaction_id/);
    // Never an email search, and never an id from the request.
    expect(code).not.toMatch(/salesForEmail|customer_email.*eq\(/);
  });
});

/* ------------------------------------------------------------------ *
 * Idempotency and ordering
 * ------------------------------------------------------------------ */

describe('duplicate and out-of-order deliveries', () => {
  it('keys the ledger on the Paddle event id', () => {
    const code = stripComments(WEBHOOK);
    expect(code).toMatch(/event_key: eventId/);
    expect(code).toMatch(/provider: 'paddle'/);
    expect(code).toContain('payload_sha256');
    // The unique constraint is what makes the claim atomic.
    expect(read('supabase/migrations/202608300001_billing_subscriptions.sql'))
      .toContain('billing_events_provider_key_unique unique (provider, event_key)');
  });

  it('treats a second delivery of a finished event as a no-op', () => {
    expect(stripComments(WEBHOOK)).toMatch(/\['processed', 'duplicate', 'rejected'\]\.includes/);
    expect(stripComments(WEBHOOK)).toMatch(/ok: true, duplicate: true/);
  });

  it('leaves a failed event retryable rather than terminal', () => {
    expect(stripComments(WEBHOOK)).toMatch(/finish\('failed'/);
  });

  it('refuses to let an older event overwrite newer state', () => {
    expect(isFresherThanStored('2026-09-02T00:00:00Z', '2026-09-01T00:00:00Z')).toBe(true);
    expect(isFresherThanStored('2026-09-01T00:00:00Z', '2026-09-02T00:00:00Z')).toBe(false);
    // Equal timestamps are a retry of the same state, which is safe to apply.
    expect(isFresherThanStored('2026-09-02T00:00:00Z', '2026-09-02T00:00:00Z')).toBe(true);
    // Unknown timestamps must not silently drop a delivery.
    expect(isFresherThanStored(null, null)).toBe(true);
    expect(isFresherThanStored('nonsense', '2026-09-02T00:00:00Z')).toBe(true);
    expect(stripComments(WEBHOOK)).toContain('isFresherThanStored');
  });
});

/* ------------------------------------------------------------------ *
 * Reconciliation and portal
 * ------------------------------------------------------------------ */

describe('reconcile-paddle', () => {
  it('requires an authenticated, confirmed account', () => {
    expect(RECONCILE).toContain("request.headers.get('authorization')");
    expect(RECONCILE).toMatch(/!user\?\.id \|\| !user\.email_confirmed_at/);
  });

  it('reads nothing from the request body', () => {
    const code = stripComments(RECONCILE);
    expect(code).not.toMatch(/request\.json\(\)/);
    expect(code).not.toMatch(/\bbody\b/);
  });

  it('only ever looks at this user’s own rows and mappings', () => {
    const code = stripComments(RECONCILE);
    const scoped = [...code.matchAll(/\.eq\('user_id', ([^)]+)\)/g)].map((m) => m[1]);
    expect(scoped.length).toBeGreaterThan(0);
    for (const value of scoped) expect(value).toBe('user.id');
  });

  it('never searches the provider by email', () => {
    expect(stripComments(RECONCILE)).not.toMatch(/salesForEmail|\/customers\?|email=/);
  });

  it('refuses a subscription bound to a different account', () => {
    expect(stripComments(RECONCILE)).toMatch(/boundUserId && boundUserId !== user\.id/);
  });

  it('recovers a completed checkout through the server-owned mapping', () => {
    const code = stripComments(RECONCILE);
    expect(code).toMatch(/from\('billing_checkout_sessions'\)/);
    expect(code).toContain("getPaddleTransaction(session.provider_transaction_id)");
    expect(code).toContain('transaction?.subscription_id');
  });
});

describe('paddle-portal', () => {
  it('requires authentication and sends no client-supplied ids', () => {
    expect(PORTAL).toContain("request.headers.get('authorization')");
    const code = stripComments(PORTAL);
    expect(code).not.toMatch(/request\.json\(\)/);
    expect(code).not.toMatch(/body\./);
  });

  it('resolves the customer from this user’s own trusted row', () => {
    const code = stripComments(PORTAL);
    expect(code).toMatch(/\.eq\('user_id', user\.id\)/);
    expect(code).toMatch(/\.eq\('provider', 'paddle'\)/);
    expect(code).toContain('/customers/${encodeURIComponent(row.provider_customer_id)}/portal-sessions');
  });

  it('returns the temporary link without storing it', () => {
    const code = stripComments(PORTAL);
    expect(code).not.toMatch(/upsert|insert|update\(/);
  });

  it('has nothing to offer an account with no Paddle subscription', () => {
    expect(PORTAL).toContain("reason: 'no_paddle_subscription'");
  });
});

/* ------------------------------------------------------------------ *
 * Gumroad stays alive
 * ------------------------------------------------------------------ */

describe('legacy Gumroad', () => {
  it('keeps its functions in the repository', () => {
    expect(fs.existsSync(path.resolve(process.cwd(), 'supabase/functions/gumroad-webhook/index.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(process.cwd(), 'supabase/functions/reconcile-gumroad/index.ts'))).toBe(true);
  });

  it('still grants Pro from an existing Gumroad row', () => {
    const row = {
      provider: 'gumroad', plan: 'pro', status: 'active',
      current_period_end: '2030-01-01T00:00:00Z', last_verified_at: '2026-09-01T00:00:00Z',
    };
    expect(resolveEntitlement({ authenticated: true, subscriptions: [row], now: new Date('2026-09-15'), environment: ENV }).isPro).toBe(true);
  });

  it('is told apart from Paddle for subscription management', () => {
    expect(subscriptionProvider({ provider: 'gumroad' })).toBe(BILLING_PROVIDER.GUMROAD);
    expect(subscriptionProvider({ provider: 'paddle' })).toBe(BILLING_PROVIDER.PADDLE);
    expect(subscriptionProvider({ provider: 'stripe' })).toBeNull();
    expect(isLegacyGumroadSubscription({ provider: 'gumroad' })).toBe(true);
    expect(isLegacyGumroadSubscription({ provider: 'paddle' })).toBe(false);
    // An unknown provider must not be treated as legacy Gumroad.
    expect(isLegacyGumroadSubscription({ provider: 'stripe' })).toBe(false);
  });

  it('reconciles Paddle first and falls back to Gumroad', () => {
    const service = stripComments(read('src/services/billing.js'));

    const paddleIndex = service.indexOf("invoke(routes.reconcilePaddle)");
    const gumroadIndex = service.search(/invoke\((['"])reconcile-gumroad\1\)/);

    expect(paddleIndex).toBeGreaterThanOrEqual(0);
    expect(gumroadIndex).toBeGreaterThanOrEqual(0);
    expect(paddleIndex).toBeLessThan(gumroadIndex);
  });
});

/* ------------------------------------------------------------------ *
 * Database
 * ------------------------------------------------------------------ */

describe('the migration', () => {
  it('widens the provider set without opening it up', () => {
    expect(MIGRATION).toContain("check (provider in ('gumroad', 'paddle'))");
    expect(MIGRATION).not.toMatch(/drop table|delete from|truncate/i);
  });

  it('keeps Gumroad’s guarantees on Gumroad rows', () => {
    expect(MIGRATION).toMatch(/provider <> 'gumroad' or \(provider_sale_id is not null and customer_email is not null\)/);
  });

  it('requires a Paddle customer id on Paddle rows', () => {
    expect(MIGRATION).toMatch(/provider <> 'paddle' or provider_customer_id is not null/);
  });

  it('adds paused to the status vocabulary', () => {
    expect(MIGRATION).toMatch(/status in \('active', 'canceling', 'expired', 'past_due', 'paused', 'refunded', 'revoked'\)/);
    expect(en.billing.statusPaused).toBeTruthy();
  });

  it('keeps the checkout mapping out of the browser entirely', () => {
    expect(MIGRATION).toContain('alter table public.billing_checkout_sessions enable row level security');
    expect(MIGRATION).toMatch(/revoke all on table public\.billing_checkout_sessions from anon, authenticated/);
    // No policy grants the browser anything on it.
    expect(MIGRATION).not.toMatch(/create policy[\s\S]*billing_checkout_sessions/);
  });

  it('does not weaken the existing policies', () => {
    expect(MIGRATION).not.toMatch(/drop policy/i);
    expect(MIGRATION).not.toMatch(/grant .* on table public\.subscriptions/i);
  });
});

/* ------------------------------------------------------------------ *
 * No secret reaches the browser
 * ------------------------------------------------------------------ */

describe('credentials', () => {
  it('keeps the API key and webhook secret server-side', () => {
    const clientFiles = [];
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (/\.jsx?$/.test(entry) && !/\.test\./.test(entry)) clientFiles.push(fs.readFileSync(full, 'utf8'));
      }
    })(path.resolve(process.cwd(), 'src'));

    for (const source of clientFiles) {
      expect(source).not.toMatch(/PADDLE_API_KEY|PADDLE_WEBHOOK_SECRET/);
      // Only the client token and environment are browser-visible.
      for (const match of source.match(/VITE_PADDLE_[A-Z_]+/g) ?? []) {
        expect(['VITE_PADDLE_CLIENT_TOKEN', 'VITE_PADDLE_ENVIRONMENT']).toContain(match);
      }
    }
  });

  it('commits no live-looking credential anywhere', () => {
    for (const source of [CHECKOUT, WEBHOOK, RECONCILE, PORTAL, read('src/services/paddle.js'), read('.env.example')]) {
      expect(source).not.toMatch(/pdl_(sdbx|live)_[A-Za-z0-9]/);
      expect(source).not.toMatch(/pdl_ntfset_[A-Za-z0-9]{10,}/);
    }
  });

  it('names the server secrets in .env.example without values', () => {
    const env = read('.env.example');
    for (const name of ['PADDLE_API_KEY', 'PADDLE_ENVIRONMENT', 'PADDLE_PRODUCT_ID',
      'PADDLE_PRO_MONTHLY_PRICE_ID', 'PADDLE_PRO_ANNUAL_PRICE_ID', 'PADDLE_WEBHOOK_SECRET']) {
      expect(env).toContain(name);
      // Anchored: the browser-safe VITE_PADDLE_ENVIRONMENT line must not match.
      expect(env).not.toMatch(new RegExp(`^${name}\\s*=\\s*\\S`, 'm'));
    }
    expect(env).toContain('VITE_PADDLE_CLIENT_TOKEN=');
  });
});

/* ------------------------------------------------------------------ *
 * Manage subscription
 * ------------------------------------------------------------------ */

const mocks = vi.hoisted(() => ({ entitlements: {}, portal: vi.fn() }));
vi.mock('../state/EntitlementProvider.jsx', () => ({ useEntitlements: () => mocks.entitlements }));
vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({ state: { settings: { locale: 'en' } }, actions: { updateSettings: vi.fn() } }),
}));
vi.mock('../services/billing.js', () => ({ createPaddlePortalSession: (...args) => mocks.portal(...args) }));

const renderManage = () => render(
  <MemoryRouter><I18nProvider><ManageSubscriptionButton /></I18nProvider></MemoryRouter>,
);

beforeEach(() => {
  mocks.entitlements = { subscription: { provider: 'paddle' } };
  mocks.portal = vi.fn().mockResolvedValue({ data: { ok: true, url: 'https://sandbox-customer-portal.paddle.com/xyz' }, error: null });
  window.open = vi.fn();
});

describe('the manage-subscription control', () => {
  it('sends a legacy Gumroad subscriber to Gumroad', () => {
    mocks.entitlements = { subscription: { provider: 'gumroad' } };
    renderManage();
    expect(screen.getByRole('link', { name: en.billing.managePlan }))
      .toHaveAttribute('href', 'https://gumroad.com/library');
    expect(mocks.portal).not.toHaveBeenCalled();
  });

  it('opens an authenticated Paddle portal link for a Paddle subscriber', async () => {
    const user = userEvent.setup();
    renderManage();
    await user.click(screen.getByRole('button', { name: en.billing.managePlan }));
    await waitFor(() => expect(mocks.portal).toHaveBeenCalledTimes(1));
    // No arguments: the server resolves the customer from the trusted row.
    expect(mocks.portal).toHaveBeenCalledWith();
    expect(window.open).toHaveBeenCalledWith(
      'https://sandbox-customer-portal.paddle.com/xyz', '_blank', 'noopener,noreferrer',
    );
  });

  it('says so plainly when the portal cannot be opened', async () => {
    mocks.portal = vi.fn().mockResolvedValue({ data: { ok: false }, error: null });
    const user = userEvent.setup();
    renderManage();
    await user.click(screen.getByRole('button', { name: en.billing.managePlan }));
    expect(await screen.findByRole('alert')).toHaveTextContent(en.billing.portalUnavailable);
    expect(window.open).not.toHaveBeenCalled();
  });
});

/* ------------------------------------------------------------------ *
 * The pricing options the browser holds
 * ------------------------------------------------------------------ */

describe('client-side checkout options', () => {
  it('carries no price, product or provider identifier', () => {
    for (const option of Object.values(CHECKOUT_OPTIONS)) {
      expect(option).not.toHaveProperty('checkoutUrl');
      expect(option).not.toHaveProperty('priceId');
      expect(JSON.stringify(option)).not.toMatch(/pri_|pro_[a-z0-9]{10,}/i);
    }
  });

  it('matches the server-side option set exactly', () => {
    expect(Object.keys(CHECKOUT_OPTIONS).sort()).toEqual(Object.keys(BILLING_OPTIONS).sort());
    for (const [id, option] of Object.entries(CHECKOUT_OPTIONS)) {
      expect(option.billingInterval).toBe(BILLING_OPTIONS[id].billingInterval);
    }
  });

  it('never treats the purchase query parameter as an entitlement', () => {
    const pricing = stripComments(read('src/pages/Pricing.jsx'));
    // The query only starts confirmation; Pro comes from refreshed rows.
    expect(pricing).toMatch(/subscriptionGrantsPro/);
    expect(pricing).not.toMatch(/purchase.*===.*success[\s\S]{0,120}setConfirmation\('confirmed'\)/);
  });
});
