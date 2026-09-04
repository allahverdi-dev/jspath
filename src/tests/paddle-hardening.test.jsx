import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_WEBHOOK_TOLERANCE_SECONDS, isSandboxTester, verifyPaddleSignature,
  webhookToleranceSeconds,
} from '../../supabase/functions/_shared/paddle.js';
import {
  BILLING_MODE, billingMode, isPaddleCheckoutMode, isSandboxCheckoutMode,
} from '../features/billing/plans.js';
import { subscriptionGrantsPro } from '../features/billing/entitlements.js';
import { subscriptionGrantsPro as serverGrantsPro } from '../../supabase/functions/_shared/entitlement.js';

/**
 * Pre-deploy hardening.
 *
 * Four things this file exists to hold in place:
 *
 *   1. the webhook replay window is Paddle's documented 5 seconds, not a number
 *      picked to pre-empt a cold start nobody measured
 *   2. secret rotation works without weakening verification
 *   3. Paddle sandbox cannot reach an ordinary production learner
 *   4. a genuinely past_due subscriber keeps Pro, and a stale row does not
 */

const read = (p) => fs.readFileSync(path.resolve(process.cwd(), p), 'utf8');
const stripComments = (source) => source
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const PADDLE_SHARED = read('supabase/functions/_shared/paddle.js');
const CHECKOUT = read('supabase/functions/paddle-checkout/index.ts');
const RECONCILE = read('supabase/functions/reconcile-paddle/index.ts');
const PORTAL = read('supabase/functions/paddle-portal/index.ts');
const MIGRATION = read('supabase/migrations/202609040001_paddle_billing.sql');

const SECRET = 'pdl_ntfset_test_secret';
const BODY = '{"event_id":"evt_1","event_type":"subscription.updated"}';

const sign = async (body, ts, secret = SECRET) => {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${ts}:${body}`));
  return [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
};

/* ------------------------------------------------------------------ *
 * 1. Timestamp tolerance
 * ------------------------------------------------------------------ */

describe('webhook timestamp tolerance', () => {
  const NOW = 1_780_000_000_000;
  const ts = Math.floor(NOW / 1000);

  it('defaults to the 5 seconds Paddle documents', () => {
    expect(DEFAULT_WEBHOOK_TOLERANCE_SECONDS).toBe(5);
    expect(webhookToleranceSeconds(undefined)).toBe(5);
  });

  it('accepts a delivery inside the window', async () => {
    const header = `ts=${ts};h1=${await sign(BODY, ts)}`;
    expect(await verifyPaddleSignature({ rawBody: BODY, signatureHeader: header, secret: SECRET, now: NOW }))
      .toMatchObject({ ok: true });
  });

  it('accepts one exactly on the boundary', async () => {
    const edge = ts - 5;
    const header = `ts=${edge};h1=${await sign(BODY, edge)}`;
    expect(await verifyPaddleSignature({ rawBody: BODY, signatureHeader: header, secret: SECRET, now: NOW }))
      .toMatchObject({ ok: true });
  });

  it('rejects one just outside it', async () => {
    const past = ts - 6;
    const header = `ts=${past};h1=${await sign(BODY, past)}`;
    expect(await verifyPaddleSignature({ rawBody: BODY, signatureHeader: header, secret: SECRET, now: NOW }))
      .toMatchObject({ ok: false, reason: 'stale_timestamp' });
  });

  it.each([['stale', -3600], ['future', 3600]])('rejects a %s timestamp', async (_label, offset) => {
    const skewed = ts + offset;
    const header = `ts=${skewed};h1=${await sign(BODY, skewed)}`;
    expect(await verifyPaddleSignature({ rawBody: BODY, signatureHeader: header, secret: SECRET, now: NOW }))
      .toMatchObject({ ok: false, reason: 'stale_timestamp' });
  });

  it.each(['ts=abc;h1=x', 'ts=;h1=x', 'ts=12.5.6;h1=x', 'ts=-100;h1=x'])(
    'rejects the malformed timestamp in %p',
    async (header) => {
      const result = await verifyPaddleSignature({ rawBody: BODY, signatureHeader: header, secret: SECRET, now: NOW });
      expect(result.ok).toBe(false);
    },
  );

  it.each([
    ['blank', ''], ['not a number', 'abc'], ['zero', '0'], ['negative', '-30'],
    ['absurd', '99999'], ['undefined', undefined],
  ])('falls back to 5 seconds for a %s override', (_label, value) => {
    expect(webhookToleranceSeconds(value)).toBe(DEFAULT_WEBHOOK_TOLERANCE_SECONDS);
  });

  it('allows a deliberate, bounded override', () => {
    expect(webhookToleranceSeconds('30')).toBe(30);
    expect(webhookToleranceSeconds('300')).toBe(300);
  });

  it('reads the override from a server secret, never from the browser', () => {
    expect(PADDLE_SHARED).toContain("PADDLE_WEBHOOK_TOLERANCE_SECONDS");
    expect(PADDLE_SHARED).not.toMatch(/VITE_PADDLE_WEBHOOK/);
    for (const file of ['src/services/paddle.js', 'src/features/billing/plans.js']) {
      expect(read(file)).not.toMatch(/TOLERANCE/i);
    }
  });
});

/* ------------------------------------------------------------------ *
 * 2. Secret rotation
 * ------------------------------------------------------------------ */

describe('multiple h1 signatures', () => {
  const NOW = 1_780_000_000_000;
  const ts = Math.floor(NOW / 1000);
  const verify = (header) => verifyPaddleSignature({
    rawBody: BODY, signatureHeader: header, secret: SECRET, now: NOW,
  });

  it('accepts a single valid signature', async () => {
    expect(await verify(`ts=${ts};h1=${await sign(BODY, ts)}`)).toMatchObject({ ok: true });
  });

  it('accepts when the second of two matches, as during rotation', async () => {
    const good = await sign(BODY, ts);
    expect(await verify(`ts=${ts};h1=${'0'.repeat(64)};h1=${good}`)).toMatchObject({ ok: true });
  });

  it('accepts when the first of two matches', async () => {
    const good = await sign(BODY, ts);
    expect(await verify(`ts=${ts};h1=${good};h1=${'0'.repeat(64)}`)).toMatchObject({ ok: true });
  });

  it('rejects when every candidate is wrong', async () => {
    expect(await verify(`ts=${ts};h1=${'0'.repeat(64)};h1=${'f'.repeat(64)}`))
      .toMatchObject({ ok: false, reason: 'invalid_signature' });
  });

  it.each([
    ['no h1 at all', (t) => `ts=${t}`],
    ['an empty h1', (t) => `ts=${t};h1=`],
    ['no separator', (t) => `ts${t}h1abc`],
    ['a duplicated ts', (t) => `ts=${t};ts=${t};h1=abc`],
  ])('rejects a header with %s', async (_label, build) => {
    expect((await verify(build(ts))).ok).toBe(false);
  });

  it('is not bypassed by unexpected extra components', async () => {
    // An unknown component must be ignored, not treated as a signature.
    const good = await sign(BODY, ts);
    expect(await verify(`ts=${ts};h2=${good};h1=${'0'.repeat(64)}`))
      .toMatchObject({ ok: false, reason: 'invalid_signature' });
    // And a valid h1 alongside noise still works.
    expect(await verify(`ts=${ts};alg=sha256;h1=${good}`)).toMatchObject({ ok: true });
  });

  it('computes the expected digest once and compares in constant time', () => {
    const code = stripComments(PADDLE_SHARED);
    expect(code).toMatch(/const expected = await hmacSha256Hex/);
    expect(code).toMatch(/parsed\.h1\.some\(\(candidate\) => safeEqual\(expected, candidate\)\)/);
    // No early return on a length difference.
    expect(code).toMatch(/mismatch \|?= left\.length \^ right\.length/);
  });
});

/* ------------------------------------------------------------------ *
 * 3. Sandbox cannot touch production learners
 * ------------------------------------------------------------------ */

const env = (values) => ({ get: (key) => values[key] });
const TESTER = '3f1a2b4c-5d6e-4f70-8a91-b2c3d4e5f607';
const OTHER = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d';

describe('the sandbox tester allowlist', () => {
  it('lets an allow-listed tester through in sandbox', () => {
    const e = env({ PADDLE_ENVIRONMENT: 'sandbox', PADDLE_SANDBOX_TESTER_IDS: `${TESTER}, ${OTHER}` });
    expect(isSandboxTester(TESTER, e)).toBe(true);
    expect(isSandboxTester(TESTER.toUpperCase(), e)).toBe(true);
  });

  it('refuses everyone else in sandbox', () => {
    const e = env({ PADDLE_ENVIRONMENT: 'sandbox', PADDLE_SANDBOX_TESTER_IDS: TESTER });
    expect(isSandboxTester(OTHER, e)).toBe(false);
  });

  it.each([
    ['no allowlist configured', {}],
    ['an empty allowlist', { PADDLE_SANDBOX_TESTER_IDS: '' }],
    ['whitespace only', { PADDLE_SANDBOX_TESTER_IDS: '  ,  ' }],
  ])('fails closed with %s', (_label, extra) => {
    const e = env({ PADDLE_ENVIRONMENT: 'sandbox', ...extra });
    expect(isSandboxTester(TESTER, e)).toBe(false);
    expect(isSandboxTester(OTHER, e)).toBe(false);
  });

  it.each([['', ''], ['null', null], ['undefined', undefined], ['a number', 42], ['an object', {}]])(
    'refuses %s as an identity',
    (_label, value) => {
      const e = env({ PADDLE_ENVIRONMENT: 'sandbox', PADDLE_SANDBOX_TESTER_IDS: TESTER });
      expect(isSandboxTester(value, e)).toBe(false);
    },
  );

  it('does not gate a production Paddle deployment', () => {
    // The allowlist exists to contain sandbox. After live cutover every paying
    // customer must be able to use checkout.
    const e = env({ PADDLE_ENVIRONMENT: 'production' });
    expect(isSandboxTester(OTHER, e)).toBe(true);
  });

  it('is enforced by all three authenticated Paddle functions', () => {
    for (const [name, source] of [['checkout', CHECKOUT], ['reconcile', RECONCILE], ['portal', PORTAL]]) {
      const code = stripComments(source);
      expect(code, name).toContain('isSandboxTester(user.id)');
      expect(code, name).toContain("reason: 'not_authorized'");
      // The id checked is always the verified one, never anything from the body.
      expect(code, name).not.toMatch(/isSandboxTester\((?!user\.id)/);
    }
  });

  it('never lets an email or a body field be the authorization', () => {
    expect(stripComments(PADDLE_SHARED)).not.toMatch(/isSandboxTester[\s\S]{0,400}email/);
    for (const source of [CHECKOUT, RECONCILE, PORTAL]) {
      expect(stripComments(source)).not.toMatch(/body\?\.(email|environment|provider|user_id)/);
    }
  });

  it('keeps the allowlist out of the browser', () => {
    const clientFiles = [];
    (function walk(dir) {
      for (const entry of fs.readdirSync(dir)) {
        const full = path.join(dir, entry);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (/\.jsx?$/.test(entry) && !/\.test\./.test(entry)) clientFiles.push(fs.readFileSync(full, 'utf8'));
      }
    })(path.resolve(process.cwd(), 'src'));
    for (const source of clientFiles) {
      expect(source).not.toMatch(/PADDLE_SANDBOX_TESTER_IDS/);
    }
  });
});

/* ------------------------------------------------------------------ *
 * 4. Production still buys through Gumroad
 * ------------------------------------------------------------------ */

describe('the checkout provider for this deployment', () => {
  const withMode = (value, run) => {
    const original = import.meta.env.VITE_BILLING_MODE;
    import.meta.env.VITE_BILLING_MODE = value;
    try { run(); } finally { import.meta.env.VITE_BILLING_MODE = original; }
  };

  it('defaults to production Gumroad when unset', () => {
    withMode(undefined, () => {
      expect(billingMode()).toBe(BILLING_MODE.GUMROAD_PRODUCTION);
      expect(isPaddleCheckoutMode()).toBe(false);
    });
  });

  it.each(['', 'paddle', 'sandbox', 'PADDLE-SANDBOX-X', 'true', 'production'])(
    'falls back to Gumroad for the unrecognised value %p',
    (value) => {
      // Failing closed here means failing to what production already does. A
      // typo must never promote sandbox checkout to real learners.
      withMode(value, () => expect(billingMode()).toBe(BILLING_MODE.GUMROAD_PRODUCTION));
    },
  );

  it('enables Paddle only when explicitly asked', () => {
    withMode('paddle-sandbox', () => {
      expect(billingMode()).toBe(BILLING_MODE.PADDLE_SANDBOX);
      expect(isPaddleCheckoutMode()).toBe(true);
      expect(isSandboxCheckoutMode()).toBe(true);
    });
    withMode('paddle-production', () => {
      expect(isPaddleCheckoutMode()).toBe(true);
      expect(isSandboxCheckoutMode()).toBe(false);
    });
  });

  it('keeps the real Gumroad purchase path in the code', () => {
    const plans = read('src/features/billing/plans.js');
    expect(plans).toContain('createGumroadCheckoutUrl');
    expect(plans).toContain('VITE_GUMROAD_PRO_MONTHLY_URL');
    const pricing = stripComments(read('src/pages/Pricing.jsx'));
    // Production takes the Gumroad branch before any Paddle call is made.
    expect(pricing).toMatch(/if \(!isPaddleCheckoutMode\(\)\) \{[\s\S]{0,200}createGumroadCheckoutUrl/);
    expect(pricing.indexOf('createGumroadCheckoutUrl')).toBeLessThan(pricing.indexOf('startPaddleCheckout('));
  });
});

/* ------------------------------------------------------------------ *
 * 5. Sandbox rows cannot become live entitlements
 * ------------------------------------------------------------------ */

describe('environment provenance', () => {
  const NOW = new Date('2026-09-15T12:00:00Z');
  const row = (overrides = {}) => ({
    provider: 'paddle', provider_environment: 'sandbox', plan: 'pro', status: 'active',
    current_period_end: '2026-10-01T00:00:00Z', last_verified_at: '2026-09-15T11:00:00Z',
    ...overrides,
  });

  it('refuses a sandbox row in a production deployment', () => {
    expect(subscriptionGrantsPro(row(), NOW, 'production')).toBe(false);
    expect(serverGrantsPro(row(), NOW, 'production')).toBe(false);
  });

  it('refuses a production row in a sandbox deployment', () => {
    const live = row({ provider_environment: 'production' });
    expect(subscriptionGrantsPro(live, NOW, 'sandbox')).toBe(false);
    expect(serverGrantsPro(live, NOW, 'sandbox')).toBe(false);
  });

  it('grants only when the environments agree', () => {
    expect(subscriptionGrantsPro(row(), NOW, 'sandbox')).toBe(true);
    expect(serverGrantsPro(row(), NOW, 'sandbox')).toBe(true);
  });

  it('refuses a Paddle row with no environment recorded', () => {
    const orphan = row({ provider_environment: null });
    expect(subscriptionGrantsPro(orphan, NOW, 'production')).toBe(false);
    expect(serverGrantsPro(orphan, NOW, 'sandbox')).toBe(false);
  });

  it('leaves Gumroad rows entirely alone', () => {
    const gumroad = {
      provider: 'gumroad', plan: 'pro', status: 'active',
      current_period_end: '2026-10-01T00:00:00Z', last_verified_at: '2026-09-15T11:00:00Z',
    };
    for (const environment of ['sandbox', 'production']) {
      expect(subscriptionGrantsPro(gumroad, NOW, environment)).toBe(true);
      expect(serverGrantsPro(gumroad, NOW, environment)).toBe(true);
    }
  });

  it('is required by the schema for Paddle rows', () => {
    expect(MIGRATION).toMatch(/provider <> 'paddle' or provider_environment is not null/);
    expect(MIGRATION).toMatch(/provider_environment is null or provider_environment in \('sandbox', 'production'\)/);
    expect(MIGRATION).toMatch(/billing_checkout_sessions_environment_check check \(provider_environment in \('sandbox', 'production'\)\)/);
  });

  it('is written by the server and scoped on every read', () => {
    expect(stripComments(CHECKOUT)).toContain('provider_environment: paddleEnvironment()');
    for (const [name, source] of [['reconcile', RECONCILE], ['portal', PORTAL]]) {
      expect(stripComments(source), name).toMatch(/\.eq\('provider_environment', paddleEnvironment\(\)\)/);
    }
  });
});

/* ------------------------------------------------------------------ *
 * 5b. past_due follows Paddle, not a local clock
 * ------------------------------------------------------------------ */

describe('Paddle past_due entitlement', () => {
  const NOW = new Date('2026-09-15T12:00:00Z');
  const ELAPSED = '2026-09-01T00:00:00Z';

  /** Realistic: a past_due subscription always has an elapsed period. */
  const overdue = (overrides = {}) => ({
    provider: 'paddle', provider_environment: 'sandbox', plan: 'pro', status: 'past_due',
    current_period_end: ELAPSED, last_verified_at: '2026-09-15T11:00:00Z',
    ...overrides,
  });

  const both = (row, environment = 'sandbox') => {
    const browser = subscriptionGrantsPro(row, NOW, environment);
    const deno = serverGrantsPro(row, NOW, environment);
    // Parity is asserted on every case rather than once, so a divergence cannot
    // hide in a branch the parity test happens not to cover.
    expect(deno).toBe(browser);
    return browser;
  };

  it('grants Pro with an elapsed period end', () => {
    expect(Date.parse(ELAPSED)).toBeLessThan(NOW.getTime());
    expect(both(overdue())).toBe(true);
  });

  it.each([
    ['recently verified', '2026-09-15T11:00:00Z'],
    ['verified months ago', '2026-01-01T00:00:00Z'],
    ['verified years ago', '2024-01-01T00:00:00Z'],
    ['never verified', null],
  ])('grants Pro when %s', (_label, lastVerifiedAt) => {
    // No staleness cutoff of any kind: Paddle decides when past_due ends.
    expect(both(overdue({ last_verified_at: lastVerifiedAt }))).toBe(true);
  });

  it('is not revoked by the period end however long ago it was', () => {
    expect(subscriptionGrantsPro(overdue(), new Date('2028-01-01T00:00:00Z'), 'sandbox')).toBe(true);
    expect(serverGrantsPro(overdue(), new Date('2028-01-01T00:00:00Z'), 'sandbox')).toBe(true);
  });

  it('grants nothing once Paddle moves the subscription on', () => {
    // canceled normalises to expired; paused stays paused. Either way Paddle,
    // not JSPath, is what ended the access.
    expect(both(overdue({ status: 'expired' }))).toBe(false);
    expect(both(overdue({ status: 'paused' }))).toBe(false);
    expect(both(overdue({ status: 'revoked' }))).toBe(false);
  });

  it('still grants Pro for an ordinary active subscription', () => {
    expect(both(overdue({ status: 'active', current_period_end: '2026-10-01T00:00:00Z' }))).toBe(true);
  });

  it('still ends a scheduled cancellation on its effective date', () => {
    // The cancellation model is untouched by the past_due change.
    expect(both(overdue({ status: 'canceling', current_period_end: '2026-10-01T00:00:00Z' }))).toBe(true);
    expect(both(overdue({ status: 'canceling', current_period_end: ELAPSED }))).toBe(false);
  });

  it('still refuses a sandbox row in a production deployment', () => {
    expect(both(overdue(), 'production')).toBe(false);
  });

  it('leaves Gumroad judged on its period end', () => {
    const gumroad = (end) => ({
      provider: 'gumroad', plan: 'pro', status: 'past_due',
      current_period_end: end, last_verified_at: '2026-09-15T11:00:00Z',
    });
    expect(both(gumroad(ELAPSED))).toBe(false);
    expect(both(gumroad('2026-10-01T00:00:00Z'))).toBe(true);
  });

  it('invents no grace period anywhere in either mirror', () => {
    for (const file of ['src/features/billing/entitlements.js',
      'supabase/functions/_shared/entitlement.js']) {
      const code = stripComments(read(file));
      // The past_due branch returns true outright - no arithmetic on it.
      expect(code, file).toMatch(/status === 'past_due' && subscription\.provider === 'paddle'\) return true;/);
      expect(code, file).not.toMatch(/GRACE|grace_?period/i);
    }
  });

  it('keeps the two mirrors byte-identical in this function', () => {
    const slice = (file) => {
      const source = read(file);
      const start = source.indexOf('export function subscriptionGrantsPro');
      return source.slice(start, source.indexOf('\n}', start));
    };
    expect(slice('supabase/functions/_shared/entitlement.js'))
      .toBe(slice('src/features/billing/entitlements.js'));
  });
});

/* ------------------------------------------------------------------ *
 * 6. Closing the overlay gives the page back
 * ------------------------------------------------------------------ */

const mocks = vi.hoisted(() => ({
  auth: {}, entitlements: {}, startCheckout: vi.fn(), openCheckout: vi.fn(), listeners: new Set(),
}));

vi.mock('../state/AuthProvider.jsx', () => ({ useAuth: () => mocks.auth }));
vi.mock('../state/EntitlementProvider.jsx', () => ({ useEntitlements: () => mocks.entitlements }));
vi.mock('../state/UserStateProvider.jsx', () => ({
  useUserState: () => ({ state: { settings: { locale: 'en' } }, actions: { updateSettings: vi.fn() } }),
}));
vi.mock('../services/billing.js', () => ({
  startPaddleCheckout: (...a) => mocks.startCheckout(...a),
  createPaddlePortalSession: vi.fn().mockResolvedValue({ data: { ok: false }, error: null }),
}));
vi.mock('../services/paddle.js', () => ({
  openPaddleCheckout: (...a) => mocks.openCheckout(...a),
  PADDLE_CHECKOUT_RESULT: { OPENED: 'opened', UNAVAILABLE: 'unavailable', FAILED: 'failed' },
  PADDLE_EVENT: { CLOSED: 'checkout.closed', COMPLETED: 'checkout.completed' },
  onPaddleCheckoutEvent: (listener) => {
    mocks.listeners.add(listener);
    return () => mocks.listeners.delete(listener);
  },
}));

const emit = (name) => { for (const l of [...mocks.listeners]) l({ name }); };

let Pricing;
beforeEach(async () => {
  import.meta.env.VITE_BILLING_MODE = 'paddle-sandbox';
  import.meta.env.VITE_PADDLE_CLIENT_TOKEN = 'test_token';
  mocks.listeners.clear();
  mocks.auth = { isAuthenticated: true, user: { id: TESTER, email: 'tester@example.com' } };
  mocks.entitlements = {
    plan: 'free', isPro: false, subscription: null, loading: false, billingConfigured: true,
    reconcile: vi.fn().mockResolvedValue({ data: { ok: true, matched: false }, error: null }),
    refresh: vi.fn().mockResolvedValue({ data: [], error: null }),
  };
  mocks.startCheckout = vi.fn().mockResolvedValue({ data: { ok: true, transactionId: 'txn_1' }, error: null });
  mocks.openCheckout = vi.fn().mockResolvedValue('opened');
  ({ default: Pricing } = await import('../pages/Pricing.jsx'));
});

afterEach(() => {
  import.meta.env.VITE_BILLING_MODE = undefined;
  import.meta.env.VITE_PADDLE_CLIENT_TOKEN = undefined;
});

const renderPricing = async () => {
  const { I18nProvider } = await import('../i18n/index.jsx');
  return render(<MemoryRouter><I18nProvider><Pricing /></I18nProvider></MemoryRouter>);
};

describe('closing the Paddle overlay', () => {
  const monthly = () => screen.getByRole('button', { name: /4\.99/ });

  it('returns the button to a usable state and allows a retry', async () => {
    const user = userEvent.setup();
    await renderPricing();

    await user.click(monthly());
    await waitFor(() => expect(mocks.openCheckout).toHaveBeenCalledTimes(1));
    // While the overlay is up the button stays busy.
    await waitFor(() => expect(monthly()).toBeDisabled());

    emit('checkout.closed');
    await waitFor(() => expect(monthly()).toBeEnabled());

    // And a second attempt actually starts a second checkout.
    await user.click(monthly());
    await waitFor(() => expect(mocks.startCheckout).toHaveBeenCalledTimes(2));
  });

  it('grants nothing and shows no success when the overlay is dismissed', async () => {
    const user = userEvent.setup();
    const { container } = await renderPricing();
    await user.click(monthly());
    await waitFor(() => expect(mocks.openCheckout).toHaveBeenCalled());

    emit('checkout.closed');
    await waitFor(() => expect(monthly()).toBeEnabled());

    expect(container.textContent).not.toMatch(/membership is confirmed|confirmed/i);
    expect(mocks.entitlements.reconcile).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('resets the button when the overlay fails to open at all', async () => {
    mocks.openCheckout = vi.fn().mockResolvedValue('unavailable');
    const user = userEvent.setup();
    await renderPricing();
    await user.click(monthly());
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await waitFor(() => expect(monthly()).toBeEnabled());
  });

  it('resets the button when the server refuses to create a transaction', async () => {
    mocks.startCheckout = vi.fn().mockResolvedValue({ data: { ok: false }, error: null });
    const user = userEvent.setup();
    await renderPricing();
    await user.click(monthly());
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await waitFor(() => expect(monthly()).toBeEnabled());
    expect(mocks.openCheckout).not.toHaveBeenCalled();
  });

  it('unsubscribes on unmount, so a late close cannot set state', async () => {
    const user = userEvent.setup();
    const { unmount } = await renderPricing();
    await user.click(monthly());
    await waitFor(() => expect(mocks.openCheckout).toHaveBeenCalled());

    expect(mocks.listeners.size).toBe(1);
    unmount();
    expect(mocks.listeners.size).toBe(0);
    // Nothing is listening, so this is inert rather than a state update on a
    // component that has gone away.
    expect(() => emit('checkout.closed')).not.toThrow();
  });
});

/* ------------------------------------------------------------------ *
 * 7. The portal link is a credential, not a record
 * ------------------------------------------------------------------ */

describe('portal session handling', () => {
  it('creates a fresh session per request and stores nothing', () => {
    const code = stripComments(PORTAL);
    expect(code).toContain('portal-sessions');
    // No write of any kind: not to subscriptions, not to a cache table.
    expect(code).not.toMatch(/\.upsert\(|\.insert\(|\.update\(/);
    expect(code).not.toMatch(/portal_url|portal_token|cache/i);
  });

  it('never logs the authenticated URL', () => {
    expect(stripComments(PORTAL)).not.toMatch(/console\.|log\(/);
  });

  it('is not persisted or cached on the client either', () => {
    const button = stripComments(read('src/components/billing/ManageSubscriptionButton.jsx'));
    expect(button).not.toMatch(/localStorage|sessionStorage|useRef\(|useMemo\(/);
    // Opened immediately, and the value is not kept in state.
    expect(button).toMatch(/window\.open\(data\.url/);
    expect(button).not.toMatch(/setUrl|setPortal/);
  });

  it('cannot be pointed at another learner', () => {
    const code = stripComments(PORTAL);
    expect(code).toMatch(/\.eq\('user_id', user\.id\)/);
    expect(code).not.toMatch(/request\.json\(\)|body\./);
  });
});
