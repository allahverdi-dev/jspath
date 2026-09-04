import { getSupabase, isSupabaseConfigured } from "./supabase.js";
import { billingFunctionRoutes } from "../features/billing/functionRoutes.js";

export async function loadOwnSubscriptions(userId) {
  const supabase = getSupabase();
  if (!supabase || !userId) return { data: [], error: null };
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select(
        "id, plan, status, billing_interval, current_period_end, cancel_at_period_end, ended_at, last_verified_at, provider, provider_environment, updated_at",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });
    if (error && import.meta.env?.DEV) {
      console.warn(
        "[jspath] billing tables are unavailable; using Free entitlement.",
        error.message,
      );
    }
    return { data: data ?? [], error };
  } catch (caught) {
    if (import.meta.env?.DEV)
      console.warn("[jspath] entitlement lookup failed.", caught.message);
    return { data: [], error: { message: caught.message } };
  }
}

async function invoke(name, body) {
  const supabase = getSupabase();
  if (!supabase)
    return {
      data: null,
      error: { message: "Account services are unavailable." },
    };
  try {
    const { data, error } = await supabase.functions.invoke(
      name,
      body === undefined ? undefined : { body },
    );
    return { data, error };
  } catch (caught) {
    return { data: null, error: { message: caught.message } };
  }
}

/**
 * Ask the server to re-check this account's subscriptions.
 *
 * Provider-aware, Paddle first. New purchases are Paddle, so that is where a
 * missing entitlement almost always is; Gumroad is only consulted when Paddle
 * has nothing, which keeps the legacy path alive without calling it for every
 * learner who never had a Gumroad subscription in the first place.
 *
 * Neither call carries a body. The functions read the identity from the verified
 * session and, for Paddle, from a checkout mapping the server wrote itself -
 * there is no email, transaction or subscription id for a browser to supply.
 */
export async function reconcileOwnSubscription() {
  const routes = billingFunctionRoutes();
  let paddle = null;

  if (routes.reconcilePaddle) {
    paddle = await invoke(routes.reconcilePaddle);
    if (paddle.data?.ok === true && paddle.data.matched === true) {
      return paddle;
    }
  }

  const gumroad = await invoke("reconcile-gumroad");
  if (gumroad.data?.ok === true && gumroad.data.matched === true) {
    return gumroad;
  }

  if (paddle?.data?.ok === true || gumroad.data?.ok === true) {
    return { data: { ok: true, matched: false }, error: null };
  }

  return paddle?.error ? paddle : gumroad;
}

/** Start a Paddle checkout. The option id is the only thing the browser names. */
export async function startPaddleCheckout(optionId) {
  const routes = billingFunctionRoutes();

  if (!routes.paddleCheckout) {
    return {
      data: null,
      error: { message: "Paddle checkout is unavailable in this billing mode." },
    };
  }

  return invoke(routes.paddleCheckout, { option: optionId });
}

/** An authenticated, temporary Paddle customer portal link. Never cached. */
export async function createPaddlePortalSession() {
  const routes = billingFunctionRoutes();

  if (!routes.paddlePortal) {
    return {
      data: null,
      error: { message: "Paddle portal is unavailable in this billing mode." },
    };
  }

  return invoke(routes.paddlePortal);
}

export function isEntitlementBackendConfigured() {
  return isSupabaseConfigured();
}
