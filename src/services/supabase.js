/**
 * Supabase integration — entirely optional.
 *
 * If the Supabase URL or browser-safe API key is absent, `getSupabase()` returns
 * `null` and the whole application runs in guest mode against localStorage.
 * Nothing in the learning experience is gated on this module resolving, which
 * is what lets JSPath be reviewed and used with no backend.
 *
 * Schema and setup instructions: `docs/SUPABASE.md`.
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env?.VITE_SUPABASE_URL;
const publishableKey = import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY;
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;
const browserKey = publishableKey || anonKey;

let client = null;
let initialised = false;

export function isSupabaseConfigured() {
  return Boolean(url && browserKey && !url.includes('your-project'));
}

export function getSupabase() {
  if (initialised) return client;
  initialised = true;
  if (!isSupabaseConfigured()) return null;
  try {
    client = createClient(url, browserKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  } catch (e) {
    console.warn('[jspath] Supabase failed to initialise; continuing in local mode.', e.message);
    client = null;
  }
  return client;
}

/* ------------------------------------------------------------------ *
 * Auth — every call resolves to { data, error } and never throws
 * ------------------------------------------------------------------ */

const UNCONFIGURED = {
  message: 'Accounts are not configured for this deployment. Your progress is saved in this browser.',
  code: 'not-configured',
};

const OAUTH_PROVIDERS = new Set(['google', 'github']);

/** Build an application-owned OAuth return URL and reject external redirects. */
export function createOAuthRedirectUrl(redirectPath, origin = globalThis.window?.location?.origin) {
  if (!origin || typeof redirectPath !== 'string' || !redirectPath.startsWith('/')) {
    throw new TypeError('OAuth redirect must be an application path.');
  }

  const applicationOrigin = new URL(origin).origin;
  const redirectUrl = new URL(redirectPath, `${applicationOrigin}/`);
  if (redirectUrl.origin !== applicationOrigin) {
    throw new TypeError('OAuth redirect must stay on the JSPath origin.');
  }
  return redirectUrl.toString();
}

export async function signInWithOAuth(provider, redirectPath = '/dashboard') {
  if (!OAUTH_PROVIDERS.has(provider)) {
    return {
      data: null,
      error: { message: 'This sign-in provider is not supported.', code: 'unsupported-provider' },
    };
  }

  const supabase = getSupabase();
  if (!supabase) return { data: null, error: UNCONFIGURED };
  try {
    const redirectTo = createOAuthRedirectUrl(redirectPath);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    return { data, error };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
}

export function signInWithGoogle(redirectPath = '/dashboard') {
  return signInWithOAuth('google', redirectPath);
}

export function signInWithGitHub(redirectPath = '/dashboard') {
  return signInWithOAuth('github', redirectPath);
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) return { error: null };
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (e) {
    return { error: { message: e.message } };
  }
}

/** Outcomes of a deletion request the UI has to tell apart. */
export const DELETE_ACCOUNT_RESULT = Object.freeze({
  OK: 'ok',
  UNAUTHENTICATED: 'unauthenticated',
  ACTIVE_SUBSCRIPTION: 'active_subscription',
  UNKNOWN_SUBSCRIPTION_STATE: 'unknown_subscription_state',
  FORFEIT_NOT_ACKNOWLEDGED: 'forfeit_not_acknowledged',
  FAILED: 'failed',
  UNAVAILABLE: 'unavailable',
});

/**
 * Ask the server to delete the signed-in account.
 *
 * There is deliberately no user id to pass: the Edge Function reads it from the
 * verified token, so this cannot be aimed at anyone else. The browser also does
 * not get to decide whether deletion is safe — it sends the acknowledgement it
 * collected and the server re-checks the subscription state itself.
 *
 * Every failure is returned as a distinct result rather than thrown, because the
 * caller must not clear any local state until this says `OK`.
 */
export async function deleteAccount({ acknowledgeForfeit = false } = {}) {
  const supabase = getSupabase();
  if (!supabase) return { result: DELETE_ACCOUNT_RESULT.UNAVAILABLE };

  try {
    const { data, error } = await supabase.functions.invoke('delete-account', {
      body: { acknowledgeForfeit },
    });

    if (error) {
      const status = error.context?.status ?? error.status;
      if (status === 401) return { result: DELETE_ACCOUNT_RESULT.UNAUTHENTICATED };
      if (status === 409) {
        // The server names which of the blocking conditions it hit.
        const reason = error.context?.body?.reason ?? error.reason;
        if (reason === DELETE_ACCOUNT_RESULT.ACTIVE_SUBSCRIPTION) {
          return { result: DELETE_ACCOUNT_RESULT.ACTIVE_SUBSCRIPTION };
        }
        if (reason === DELETE_ACCOUNT_RESULT.FORFEIT_NOT_ACKNOWLEDGED) {
          return { result: DELETE_ACCOUNT_RESULT.FORFEIT_NOT_ACKNOWLEDGED };
        }
        return { result: DELETE_ACCOUNT_RESULT.UNKNOWN_SUBSCRIPTION_STATE };
      }
      return { result: DELETE_ACCOUNT_RESULT.FAILED };
    }

    // Anything short of an explicit success is treated as a failure, so a
    // changed response shape can never be read as "the account is gone".
    if (data?.ok !== true || data?.deleted !== true) return { result: DELETE_ACCOUNT_RESULT.FAILED };
    return { result: DELETE_ACCOUNT_RESULT.OK, residual: data.residual ?? null };
  } catch {
    return { result: DELETE_ACCOUNT_RESULT.UNAVAILABLE };
  }
}

export async function getSession() {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session ?? null;
  } catch {
    return null;
  }
}

export function onAuthChange(callback) {
  const supabase = getSupabase();
  if (!supabase) return () => {};
  try {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
    return () => data?.subscription?.unsubscribe();
  } catch {
    return () => {};
  }
}

/* ------------------------------------------------------------------ *
 * Progress sync
 *
 * The whole user-state document is stored as JSONB in one row per user. This is a
 * deliberate trade: it keeps the client simple and makes guest→account migration a
 * single merge, at the cost of not being able to query individual lesson rows
 * server-side — which nothing in the product needs.
 * ------------------------------------------------------------------ */

export async function loadRemoteState(userId) {
  const supabase = getSupabase();
  if (!supabase || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('state, updated_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.warn('[jspath] could not load remote progress:', error.message);
      return null;
    }
    return data?.state ?? null;
  } catch (e) {
    console.warn('[jspath] could not load remote progress:', e.message);
    return null;
  }
}

export async function saveRemoteState(userId, state) {
  const supabase = getSupabase();
  if (!supabase || !userId) return { error: null };
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({ user_id: userId, state, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) console.warn('[jspath] could not save remote progress:', error.message);
    return { error };
  } catch (e) {
    return { error: { message: e.message } };
  }
}
