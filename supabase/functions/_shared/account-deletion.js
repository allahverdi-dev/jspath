/**
 * When it is safe to delete an account — server copy.
 *
 * Must stay identical in behaviour to `src/features/billing/accountDeletion.js`.
 * The browser copy explains; this one decides. `accountDeletionParity.test.js`
 * drives both over the same matrix and fails if they disagree.
 *
 * Fails closed: an unrecognised status, a malformed row or a subscription list
 * that is not a list all refuse deletion rather than assuming there is nothing
 * to lose.
 */
import { subscriptionGrantsPro } from './entitlement.js';

export const DELETION_STATE = Object.freeze({
  READY: 'ready',
  FORFEITS_ACCESS: 'forfeits_access',
  ACTIVE_SUBSCRIPTION: 'active_subscription',
  UNKNOWN_STATE: 'unknown_state',
});

const RECURRING_STATUSES = new Set(['active', 'past_due']);
const WINDING_DOWN_STATUSES = new Set(['canceling']);
const SETTLED_STATUSES = new Set(['expired', 'refunded', 'revoked']);

export function accountDeletionReadiness({ subscriptions = [], now = new Date() } = {}) {
  const rows = Array.isArray(subscriptions) ? subscriptions : null;
  if (rows === null) return result(DELETION_STATE.UNKNOWN_STATE);

  let forfeits = false;

  for (const row of rows) {
    const status = row?.status;
    if (typeof status !== 'string' || !status) return result(DELETION_STATE.UNKNOWN_STATE);

    if (RECURRING_STATUSES.has(status)) return result(DELETION_STATE.ACTIVE_SUBSCRIPTION);

    if (WINDING_DOWN_STATUSES.has(status)) {
      if (subscriptionGrantsPro(row, now)) forfeits = true;
      continue;
    }

    if (!SETTLED_STATUSES.has(status)) return result(DELETION_STATE.UNKNOWN_STATE);
  }

  return result(forfeits ? DELETION_STATE.FORFEITS_ACCESS : DELETION_STATE.READY);
}

function result(state) {
  return {
    state,
    blocked: state === DELETION_STATE.ACTIVE_SUBSCRIPTION || state === DELETION_STATE.UNKNOWN_STATE,
    requiresAcknowledgement: state === DELETION_STATE.FORFEITS_ACCESS,
  };
}
