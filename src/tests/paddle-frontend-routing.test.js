import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BILLING_MODE } from '../features/billing/plans.js';
import { billingFunctionRoutes } from '../features/billing/functionRoutes.js';

const read = (file) =>
  fs.readFileSync(path.resolve(process.cwd(), file), 'utf8');

const BILLING = read('src/services/billing.js');
const PREMIUM = read('src/services/premiumContent.js');

describe('frontend billing function routing', () => {
  it('keeps Gumroad production on the legacy premium endpoint', () => {
    expect(
      billingFunctionRoutes(BILLING_MODE.GUMROAD_PRODUCTION),
    ).toEqual({
      reconcilePaddle: null,
      paddleCheckout: null,
      paddlePortal: null,
      premiumContent: 'premium-content',
    });
  });

  it('routes sandbox billing only to sandbox functions', () => {
    expect(
      billingFunctionRoutes(BILLING_MODE.PADDLE_SANDBOX),
    ).toEqual({
      reconcilePaddle: 'reconcile-paddle-sandbox',
      paddleCheckout: 'paddle-checkout-sandbox',
      paddlePortal: 'paddle-portal-sandbox',
      premiumContent: 'premium-content-sandbox',
    });
  });

  it('routes production Paddle only to production functions', () => {
    expect(
      billingFunctionRoutes(BILLING_MODE.PADDLE_PRODUCTION),
    ).toEqual({
      reconcilePaddle: 'reconcile-paddle-production',
      paddleCheckout: 'paddle-checkout-production',
      paddlePortal: 'paddle-portal-production',
      premiumContent: 'premium-content-production',
    });
  });

  it('billing service uses the central route selector', () => {
    expect(BILLING).toContain('billingFunctionRoutes()');
    expect(BILLING).toContain('invoke(routes.reconcilePaddle)');
    expect(BILLING).toContain('invoke(routes.paddleCheckout');
    expect(BILLING).toContain('invoke(routes.paddlePortal)');
  });

  it('premium content uses the central route selector', () => {
    expect(PREMIUM).toContain('billingFunctionRoutes()');
    expect(PREMIUM).toContain(
      'supabase.functions.invoke(routes.premiumContent',
    );
  });

  it('billing service contains no legacy generic Paddle invoke', () => {
    expect(BILLING).not.toMatch(
      /invoke\((['"])(reconcile-paddle|paddle-checkout|paddle-portal)\1/,
    );
  });
});