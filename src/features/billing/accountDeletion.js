/**
 * When it is safe to delete an account.
 *
 * The danger this guards against is narrow and expensive: deleting the JSPath
 * account of someone whose Gumroad subscription still renews. JSPath does not
 * cancel Gumroad subscriptions — Gumroad owns that, and the integration is
 * read-only about it — so deleting first would leave a recurring charge with no
 * account behind it and nobody to notice.
 *
 * Three groups of status, and everything else is refused:
 *
 *   recurring     money may still be taken. Cancel at Gumroad first.
 *   winding down  renewal already stopped; paid access may remain to forfeit.
 *   settled       nothing further will be billed and nothing remains to lose.
 *
 * This file must stay identical in behaviour to
 * `supabase/functions/_shared/account-deletion.js`. The two cannot share a
 * module — one runs in Deno, one in the browser — so
 * `accountDeletionParity.test.js` drives both over the same matrix. The browser
 * copy exists to render the right explanation, never to decide: the Edge
 * Function re-runs this against rows the client cannot influence.
 */
import { subscriptionGrantsPro } from './entitlements.js';

export const DELETION_STATE = Object.freeze({
  /** Nothing in the way. */
  READY: 'ready',
  /** Allowed, but paid access that still has time left will be lost. */
  FORFEITS_ACCESS: 'forfeits_access',
  /** Refused: a subscription can still charge the learner. */
  ACTIVE_SUBSCRIPTION: 'active_subscription',
  /** Refused: a status this build does not understand. Fail closed. */
  UNKNOWN_STATE: 'unknown_state',
});

/** Renewal has not been stopped — a charge can still land. */
const RECURRING_STATUSES = new Set(['active', 'past_due']);
/** Renewal stopped; access may run to the paid-through date. */
const WINDING_DOWN_STATUSES = new Set(['canceling']);
/** Finished. No further billing, no remaining access. */
const SETTLED_STATUSES = new Set(['expired', 'refunded', 'revoked']);

export function accountDeletionReadiness({ subscriptions = [], now = new Date() } = {}) {
  const rows = Array.isArray(subscriptions) ? subscriptions : null;
  // A subscription list that is not a list is not "no subscriptions".
  if (rows === null) return result(DELETION_STATE.UNKNOWN_STATE);

  let forfeits = false;

  for (const row of rows) {
    const status = row?.status;
    if (typeof status !== 'string' || !status) return result(DELETION_STATE.UNKNOWN_STATE);

    if (RECURRING_STATUSES.has(status)) return result(DELETION_STATE.ACTIVE_SUBSCRIPTION);

    if (WINDING_DOWN_STATUSES.has(status)) {
      // Only a warning if there is genuinely access left to give up.
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
    // The server refuses this case unless the caller says, in the request, that
    // the learner was shown what they are giving up.
    requiresAcknowledgement: state === DELETION_STATE.FORFEITS_ACCESS,
  };
}
