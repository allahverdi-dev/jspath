import { getSupabase, isSupabaseConfigured } from './supabase.js';

export async function loadOwnSubscriptions(userId) {
  const supabase = getSupabase();
  if (!supabase || !userId) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, plan, status, billing_interval, current_period_end, cancel_at_period_end, ended_at, last_verified_at, provider, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error && import.meta.env?.DEV) {
      console.warn('[jspath] billing tables are unavailable; using Free entitlement.', error.message);
    }
    return { data: data ?? [], error };
  } catch (caught) {
    if (import.meta.env?.DEV) console.warn('[jspath] entitlement lookup failed.', caught.message);
    return { data: [], error: { message: caught.message } };
  }
}

export async function reconcileOwnSubscription() {
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: { message: 'Account services are unavailable.' } };
  try {
    const { data, error } = await supabase.functions.invoke('reconcile-gumroad');
    return { data, error };
  } catch (caught) {
    return { data: null, error: { message: caught.message } };
  }
}

export function isEntitlementBackendConfigured() {
  return isSupabaseConfigured();
}
