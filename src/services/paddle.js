import { initializePaddle } from '@paddle/paddle-js';

/**
 * Paddle.js, for opening a checkout.
 *
 * The only Paddle credential that belongs in a browser is the client-side
 * token. The API key is an Edge Function secret and appears nowhere in this
 * bundle — a client token can open a checkout; it cannot read or write anything.
 *
 * The transaction is created by `paddle-checkout` before this is called, so
 * nothing here chooses a price, a product or a customer. Paddle.js is handed a
 * transaction id and collects payment for exactly what the server put in it.
 */

const token = String(import.meta.env?.VITE_PADDLE_CLIENT_TOKEN ?? '').trim();
const environment = String(import.meta.env?.VITE_PADDLE_ENVIRONMENT ?? '').trim().toLowerCase();

/** Only the two Paddle knows. An unrecognised value must not silently mean live. */
const ENVIRONMENTS = new Set(['sandbox', 'production']);

export function isPaddleConfigured() {
  return Boolean(token) && ENVIRONMENTS.has(environment);
}

/**
 * One instance, created lazily.
 *
 * Paddle.js injects a script and sets up global state, so initialising it more
 * than once is wasteful at best. The promise is cached rather than the
 * instance, so concurrent callers share one initialisation instead of racing.
 */
let paddlePromise = null;

/**
 * Subscribers for Paddle.js checkout lifecycle events.
 *
 * Paddle.js takes a single `eventCallback` at initialisation, so it is fanned
 * out here rather than re-initialising per caller. The set is module-level and
 * callers unsubscribe on unmount, which is what keeps a closed overlay from
 * setting state on a component that has gone away.
 */
const listeners = new Set();

export function onPaddleCheckoutEvent(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getPaddle() {
  if (!isPaddleConfigured()) return Promise.resolve(null);
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      token,
      environment,
      eventCallback: (event) => {
        for (const listener of listeners) {
          try { listener(event); } catch { /* one bad listener must not stop the rest */ }
        }
      },
    })
      .then((instance) => instance ?? null)
      .catch(() => {
        // Let a later attempt try again rather than caching the failure - a
        // blocked script or a flaky network should not disable checkout for the
        // rest of the session.
        paddlePromise = null;
        return null;
      });
  }
  return paddlePromise;
}

/** Outcomes the caller has to tell apart. */
export const PADDLE_CHECKOUT_RESULT = Object.freeze({
  OPENED: 'opened',
  UNAVAILABLE: 'unavailable',
  FAILED: 'failed',
});

/**
 * Open Paddle's overlay for a server-created transaction.
 *
 * `successUrl` brings the learner back to the pricing page, which then confirms
 * against trusted subscription state. Returning from checkout is not proof of
 * anything: the URL only starts the confirmation, and Pro still comes from the
 * server.
 */
export async function openPaddleCheckout({ transactionId, successUrl, theme = 'dark', locale = 'en' }) {
  if (!transactionId) return PADDLE_CHECKOUT_RESULT.FAILED;

  const paddle = await getPaddle();
  if (!paddle?.Checkout?.open) return PADDLE_CHECKOUT_RESULT.UNAVAILABLE;

  try {
    paddle.Checkout.open({
      transactionId,
      settings: {
        displayMode: 'overlay',
        theme,
        locale,
        ...(successUrl ? { successUrl } : {}),
      },
    });
    return PADDLE_CHECKOUT_RESULT.OPENED;
  } catch {
    return PADDLE_CHECKOUT_RESULT.FAILED;
  }
}

/** The two lifecycle events JSPath reacts to. */
export const PADDLE_EVENT = Object.freeze({
  CLOSED: 'checkout.closed',
  COMPLETED: 'checkout.completed',
});

/** Test seam: drop the cached initialisation and any subscribers. */
export function resetPaddleForTests() {
  paddlePromise = null;
  listeners.clear();
}
