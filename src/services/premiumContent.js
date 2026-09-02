import { getSupabase, getSession } from './supabase.js';
import { isPremiumWithheld, PREMIUM_WITHHELD } from '../features/billing/premiumFields.js';

/**
 * Fetch the paid half of Pro content.
 *
 * The production build ships Pro items without their solutions, tests, hints and
 * answers — a static bundle cannot keep those secret. This module asks the
 * `premium-content` Edge Function for them, which verifies the session and the
 * subscription server-side before returning anything.
 *
 * The browser never decides entitlement here. It asks; the server answers or
 * refuses. A refusal is surfaced as a state the UI can render, never as a
 * silently-empty body that would look like missing content.
 */

/**
 * In-memory only, and keyed by user id.
 *
 * Paid payloads are deliberately never written to localStorage or sessionStorage:
 * they would outlive the session and survive a logout on a shared machine. The
 * cache is dropped whenever the signed-in user changes, so switching accounts
 * cannot serve one learner's authorised content to another.
 */
let cacheOwner = null;
let cache = new Map();

export function clearPremiumCache() {
  cacheOwner = null;
  cache = new Map();
}

function cacheFor(userId) {
  if (cacheOwner !== userId) {
    cacheOwner = userId;
    cache = new Map();
  }
  return cache;
}

/** The result shapes a caller has to handle. Deterministic, never ambiguous. */
export const PREMIUM_STATUS = Object.freeze({
  OK: 'ok',
  UNAUTHENTICATED: 'unauthenticated',
  NOT_ENTITLED: 'not_entitled',
  NOT_FOUND: 'not_found',
  UNAVAILABLE: 'unavailable',
});

const key = (kind, id) => `${kind}:${id}`;

/**
 * Ask the server for one item's protected fields.
 * Returns `{ status, content }`; `content` is only ever set when status is OK.
 */
export async function fetchPremiumContent(kind, id, { userId } = {}) {
  const supabase = getSupabase();
  if (!supabase) return { status: PREMIUM_STATUS.UNAVAILABLE, content: null };

  // Resolve the owner ourselves when the caller has not supplied one, so the
  // cache is always partitioned even when a getter deep in the registry asks.
  let owner = userId;
  if (owner === undefined) {
    const session = await getSession();
    owner = session?.user?.id ?? null;
  }
  // No session means no entitlement to check, so refuse without a round trip.
  if (!owner) return { status: PREMIUM_STATUS.UNAUTHENTICATED, content: null };

  const store = cacheFor(owner);
  const cacheKey = key(kind, id);
  if (store.has(cacheKey)) return store.get(cacheKey);

  const request = (async () => {
    try {
      const { data, error } = await supabase.functions.invoke('premium-content', {
        body: { keys: [cacheKey] },
      });
      if (error) {
        // Supabase surfaces the HTTP status on the error for non-2xx replies.
        const status = error.context?.status ?? error.status;
        if (status === 401) return { status: PREMIUM_STATUS.UNAUTHENTICATED, content: null };
        if (status === 403) return { status: PREMIUM_STATUS.NOT_ENTITLED, content: null };
        if (status === 404) return { status: PREMIUM_STATUS.NOT_FOUND, content: null };
        return { status: PREMIUM_STATUS.UNAVAILABLE, content: null };
      }
      const body = data?.content?.[cacheKey];
      if (!body) return { status: PREMIUM_STATUS.NOT_FOUND, content: null };
      return { status: PREMIUM_STATUS.OK, content: body };
    } catch {
      return { status: PREMIUM_STATUS.UNAVAILABLE, content: null };
    }
  })();

  store.set(cacheKey, request);
  const result = await request;
  // Only a success is worth remembering; a refusal should be re-asked after the
  // learner signs in or upgrades.
  if (result.status !== PREMIUM_STATUS.OK) store.delete(cacheKey);
  else store.set(cacheKey, result);
  return result;
}

/**
 * Return a body ready to use: complete items pass straight through, withheld
 * ones are completed from the server when the learner is entitled.
 */
export async function withPremiumContent(kind, item, { userId } = {}) {
  if (!isPremiumWithheld(item)) return { status: PREMIUM_STATUS.OK, item };

  const { status, content } = await fetchPremiumContent(kind, item.id, { userId });
  if (status !== PREMIUM_STATUS.OK) return { status, item: null };

  const merged = { ...item, ...content };
  delete merged[PREMIUM_WITHHELD];
  return { status: PREMIUM_STATUS.OK, item: merged };
}
