/**
 * Supabase integration — entirely optional.
 *
 * If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are absent, `getSupabase()`
 * returns `null` and the whole application runs in guest mode against
 * localStorage. Nothing in the learning experience is gated on this module
 * resolving, which is what lets JSPath be reviewed and used with no backend.
 *
 * Schema and setup instructions: `docs/SUPABASE.md`.
 */
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env?.VITE_SUPABASE_URL;
const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY;

let client = null;
let initialised = false;

export function isSupabaseConfigured() {
  return Boolean(url && anonKey && !url.includes('your-project'));
}

export function getSupabase() {
  if (initialised) return client;
  initialised = true;
  if (!isSupabaseConfigured()) return null;
  try {
    client = createClient(url, anonKey, {
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

export async function signUp({ email, password, displayName }) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: UNCONFIGURED };
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    return { data, error };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
}

export async function signIn({ email, password }) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: UNCONFIGURED };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
}

export async function signInWithGoogle() {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: UNCONFIGURED };
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    return { data, error };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
}

export async function resetPassword(email) {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: UNCONFIGURED };
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { data, error };
  } catch (e) {
    return { data: null, error: { message: e.message } };
  }
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
