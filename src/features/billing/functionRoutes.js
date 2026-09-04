import { BILLING_MODE, billingMode } from './plans.js';

const ROUTES = Object.freeze({
  [BILLING_MODE.GUMROAD_PRODUCTION]: Object.freeze({
    reconcilePaddle: null,
    paddleCheckout: null,
    paddlePortal: null,
    premiumContent: 'premium-content',
  }),

  [BILLING_MODE.PADDLE_SANDBOX]: Object.freeze({
    reconcilePaddle: 'reconcile-paddle-sandbox',
    paddleCheckout: 'paddle-checkout-sandbox',
    paddlePortal: 'paddle-portal-sandbox',
    premiumContent: 'premium-content-sandbox',
  }),

  [BILLING_MODE.PADDLE_PRODUCTION]: Object.freeze({
    reconcilePaddle: 'reconcile-paddle-production',
    paddleCheckout: 'paddle-checkout-production',
    paddlePortal: 'paddle-portal-production',
    premiumContent: 'premium-content-production',
  }),
});

export function billingFunctionRoutes(mode = billingMode()) {
  return ROUTES[mode] ?? ROUTES[BILLING_MODE.GUMROAD_PRODUCTION];
}
