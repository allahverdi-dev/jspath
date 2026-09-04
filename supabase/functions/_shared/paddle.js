/**
 * Paddle Billing, server side.
 *
 * Everything that talks to Paddle goes through here: the environment decides the
 * API host, the catalogue is configuration rather than literals, and the
 * normalisation that turns a Paddle subscription into a JSPath row lives in one
 * place so the webhook and the reconciler cannot drift apart.
 *
 * Two rules this file exists to enforce:
 *
 *   1. The API key never leaves the server. It is read from an Edge Function
 *      secret, never from anything prefixed VITE_.
 *   2. Product and price identity is checked against configuration, not against
 *      what the payload claims. `custom_data` says who the learner is; it does
 *      not get to say what they bought.
 */

/* ------------------------------------------------------------------ *
 * Environment
 * ------------------------------------------------------------------ */

/** The Edge runtime's environment, or nothing when running anywhere else. */
const denoEnv = () => globalThis.Deno?.env ?? null;

const API_HOSTS = Object.freeze({
  sandbox: 'https://sandbox-api.paddle.com',
  production: 'https://api.paddle.com',
});

const ENV_PREFIX = Object.freeze({
  sandbox: 'PADDLE_SANDBOX',
  production: 'PADDLE_LIVE',
});

function paddleConfigName(environment, suffix) {
  const resolved = paddleEnvironment(environment);
  return `${ENV_PREFIX[resolved]}_${suffix}`;
}

function legacyEnvironmentMatches(environment, env = denoEnv()) {
  try {
    return paddleEnvironment(env?.get('PADDLE_ENVIRONMENT'))
      === paddleEnvironment(environment);
  } catch {
    return false;
  }
}

function paddleConfigValue(
  environment,
  suffix,
  legacyName,
  env = denoEnv(),
) {
  const resolved = paddleEnvironment(environment);

  const named = String(
    env?.get(paddleConfigName(resolved, suffix)) ?? '',
  ).trim();

  if (named) return named;

  // Temporary migration compatibility:
  // legacy single-environment secrets may only be used when their global
  // PADDLE_ENVIRONMENT agrees with the explicitly requested environment.
  if (legacyName && legacyEnvironmentMatches(resolved, env)) {
    return String(env?.get(legacyName) ?? '').trim();
  }

  return '';
}

export function paddleApiKey(environment, env = denoEnv()) {
  const resolved = paddleEnvironment(environment);
  const value = paddleConfigValue(
    resolved,
    'API_KEY',
    'PADDLE_API_KEY',
    env,
  );

  if (!value) {
    throw new Error(`Paddle ${resolved} API key is not configured.`);
  }

  return value;
}

export function paddleWebhookSecret(environment, env = denoEnv()) {
  return paddleConfigValue(
    environment,
    'WEBHOOK_SECRET',
    'PADDLE_WEBHOOK_SECRET',
    env,
  );
}

/**
 * Fail closed on a bad environment.
 *
 * A typo here would otherwise mean sandbox code talking to the live API, or the
 * reverse. Neither is something to discover from a customer.
 */
export function paddleEnvironment(env = denoEnv()?.get('PADDLE_ENVIRONMENT')) {
  const value = String(env ?? '').trim().toLowerCase();
  if (!Object.prototype.hasOwnProperty.call(API_HOSTS, value)) {
    throw new Error('PADDLE_ENVIRONMENT must be exactly "sandbox" or "production".');
  }
  return value;
}

export function paddleApiHost(env) {
  return API_HOSTS[paddleEnvironment(env)];
}

/** The allowed catalogue, from configuration. Live IDs differ from sandbox. */
export function paddleCatalogFor(environment, env = denoEnv()) {
  const resolved = paddleEnvironment(environment);

  const productId = paddleConfigValue(
    resolved,
    'PRODUCT_ID',
    'PADDLE_PRODUCT_ID',
    env,
  );
  const monthly = paddleConfigValue(
    resolved,
    'PRO_MONTHLY_PRICE_ID',
    'PADDLE_PRO_MONTHLY_PRICE_ID',
    env,
  );
  const annual = paddleConfigValue(
    resolved,
    'PRO_ANNUAL_PRICE_ID',
    'PADDLE_PRO_ANNUAL_PRICE_ID',
    env,
  );

  if (!productId || !monthly || !annual) {
    throw new Error(`Paddle ${resolved} catalogue is not configured.`);
  }

  return Object.freeze({
    productId,
    priceByInterval: Object.freeze({ monthly, annual }),
    intervalByPrice: Object.freeze({ [monthly]: 'monthly', [annual]: 'annual' }),
  });
}

/**
 * Legacy wrapper while the generic sandbox functions still exist.
 * New fixed-environment endpoints use paddleCatalogFor(environment) directly.
 */
export function paddleCatalog(env = denoEnv()) {
  return paddleCatalogFor(env?.get('PADDLE_ENVIRONMENT'), env);
}

/** The internal option ids the browser is allowed to name. Nothing else. */
export const BILLING_OPTIONS = Object.freeze({
  'pro-monthly': { plan: 'pro', billingInterval: 'monthly' },
  'pro-annual': { plan: 'pro', billingInterval: 'annual' },
});

export function resolveBillingOption(optionId) {
  return Object.prototype.hasOwnProperty.call(BILLING_OPTIONS, optionId)
    ? BILLING_OPTIONS[optionId]
    : null;
}

/* ------------------------------------------------------------------ *
 * Sandbox exposure
 * ------------------------------------------------------------------ */

/**
 * Who may use Paddle *sandbox* checkout.
 *
 * A sandbox payment costs nothing. If the sandbox functions were reachable by
 * any signed-in learner while pointed at the production database, anyone could
 * mint themselves Pro. The frontend billing mode decides which UI is drawn; this
 * is the boundary that actually holds, because a learner can edit their own
 * bundle but not this.
 *
 * `PADDLE_SANDBOX_TESTER_IDS` is a comma-separated list of Supabase user UUIDs.
 * The id compared against it always comes from the verified JWT - never from a
 * request body, and never an email, which a browser could otherwise choose.
 *
 * Fails closed in the way that matters: in sandbox with no allowlist configured,
 * nobody is authorised. Production is unaffected because these functions are not
 * the production checkout path at all.
 */
export function canUsePaddleEnvironment(
  userId,
  environment,
  env = denoEnv(),
) {
  const resolved = paddleEnvironment(environment);
  if (resolved !== 'sandbox') return true;

  const raw = String(env?.get('PADDLE_SANDBOX_TESTER_IDS') ?? '').trim();
  if (!raw) return false;

  const allowed = new Set(
    raw.split(',').map((entry) => entry.trim().toLowerCase()).filter(Boolean),
  );
  const id = typeof userId === 'string' ? userId.trim().toLowerCase() : '';
  return Boolean(id) && allowed.has(id);
}

/**
 * Legacy wrapper for the current generic Paddle functions.
 * Fixed endpoints must call canUsePaddleEnvironment(userId, environment).
 */
export function isSandboxTester(userId, env = denoEnv()) {
  return canUsePaddleEnvironment(
    userId,
    env?.get('PADDLE_ENVIRONMENT'),
    env,
  );
}

/* ------------------------------------------------------------------ *
 * API
 * ------------------------------------------------------------------ */

export async function paddleFetch(
  path,
  {
    method = 'GET',
    body,
    environment,
    env = denoEnv(),
  } = {},
) {
  const resolved = paddleEnvironment(
    environment ?? env?.get('PADDLE_ENVIRONMENT'),
  );
  const key = paddleApiKey(resolved, env);

  const response = await fetch(`${paddleApiHost(resolved)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    // Paddle's error detail can quote request data; keep it out of our logs and
    // out of anything a caller might surface.
    const code = payload?.error?.code ?? 'unknown';
    throw new Error(`Paddle API ${method} ${path} failed (${response.status}/${code}).`);
  }
  return payload?.data ?? payload;
}

export const getPaddleSubscription = (id, environment) =>
  paddleFetch(`/subscriptions/${encodeURIComponent(id)}`, { environment });

export const getPaddleTransaction = (id, environment) =>
  paddleFetch(`/transactions/${encodeURIComponent(id)}`, { environment });

/* ------------------------------------------------------------------ *
 * Webhook signatures
 * ------------------------------------------------------------------ */

/** `ts=1671552777;h1=eb4d0dc...` — order is not guaranteed, so parse by key. */
export function parsePaddleSignature(header) {
  if (typeof header !== 'string' || !header.trim()) return null;
  const parts = header.split(';').map((part) => part.trim()).filter(Boolean);
  let ts = null;
  const h1 = [];
  for (const part of parts) {
    const index = part.indexOf('=');
    if (index < 1) return null;
    const key = part.slice(0, index);
    const value = part.slice(index + 1);
    if (!value) return null;
    if (key === 'ts') { if (ts !== null) return null; ts = value; }
    // More than one h1 is legitimate while a secret is being rotated.
    else if (key === 'h1') h1.push(value);
  }
  if (ts === null || h1.length === 0 || !/^\d+$/.test(ts)) return null;
  return { ts, h1 };
}

/** Length-independent, value-independent comparison. */
function safeEqual(a, b) {
  const left = new TextEncoder().encode(a);
  const right = new TextEncoder().encode(b);
  // Fold the length difference in rather than returning early on it.
  let mismatch = left.length ^ right.length;
  const max = Math.max(left.length, right.length);
  for (let i = 0; i < max; i += 1) mismatch |= (left[i] ?? 0) ^ (right[i] ?? 0);
  return mismatch === 0;
}

async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a Paddle webhook.
 *
 * The signed payload is `ts + ":" + raw body`, HMAC-SHA256 with the destination
 * secret. `rawBody` must be the bytes as received — parsing and re-serialising
 * JSON changes them and the signature will not match, which is the whole point.
 *
 * The tolerance is Paddle's documented default of 5 seconds. An earlier draft
 * used 300s on the theory that a cold Edge Function start might not meet 5s -
 * that was speculation, not measurement, and it widened the replay window by
 * sixty times for a problem nobody had observed. Paddle signs retries normally,
 * so a retry arrives with a fresh timestamp and does not need a wider window.
 *
 * `PADDLE_WEBHOOK_TOLERANCE_SECONDS` can raise it if real deliveries are ever
 * measured to be rejected. It is a server-side Edge Function secret, never a
 * VITE_ variable, and an unparseable or out-of-range value falls back to 5
 * rather than being honoured - a typo must not silently open the window.
 */
export const DEFAULT_WEBHOOK_TOLERANCE_SECONDS = 5;
const MAX_WEBHOOK_TOLERANCE_SECONDS = 300;

export function webhookToleranceSeconds(raw) {
  const value = Number(String(raw ?? '').trim());
  if (!Number.isFinite(value) || value <= 0 || value > MAX_WEBHOOK_TOLERANCE_SECONDS) {
    return DEFAULT_WEBHOOK_TOLERANCE_SECONDS;
  }
  return value;
}

export async function verifyPaddleSignature({
  rawBody,
  signatureHeader,
  secret,
  toleranceSeconds = webhookToleranceSeconds(denoEnv()?.get('PADDLE_WEBHOOK_TOLERANCE_SECONDS')),
  now = Date.now(),
}) {
  if (!secret) return { ok: false, reason: 'not_configured' };
  const parsed = parsePaddleSignature(signatureHeader);
  if (!parsed) return { ok: false, reason: 'malformed_signature' };

  const skew = Math.abs(now / 1000 - Number(parsed.ts));
  if (!Number.isFinite(skew) || skew > toleranceSeconds) return { ok: false, reason: 'stale_timestamp' };

  const expected = await hmacSha256Hex(secret, `${parsed.ts}:${rawBody}`);
  const matched = parsed.h1.some((candidate) => safeEqual(expected, candidate));
  return matched ? { ok: true, ts: parsed.ts } : { ok: false, reason: 'invalid_signature' };
}

/* ------------------------------------------------------------------ *
 * Normalisation
 * ------------------------------------------------------------------ */

const text = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** The user binding. It must look like a UUID before it is used to look one up. */
export function jspathUserIdFrom(customData) {
  const id = text(customData?.jspath_user_id);
  return id && UUID.test(id) ? id.toLowerCase() : null;
}

/**
 * Which of our prices this subscription is actually for.
 *
 * Checked against the configured catalogue, never against `custom_data`. A
 * subscription for some other product, or for a price we do not sell, resolves
 * to null and grants nothing — that is the "never grant Pro because a webhook
 * said plan=pro" rule, enforced here rather than trusted.
 */
export function resolveCatalogItem(subscription, catalog) {
  const items = Array.isArray(subscription?.items) ? subscription.items : [];
  const matches = items.filter((item) => {
    const priceId = text(item?.price?.id);
    const productId = text(item?.price?.product_id) ?? text(item?.product?.id);
    return Boolean(priceId)
      && productId === catalog.productId
      && Object.prototype.hasOwnProperty.call(catalog.intervalByPrice, priceId);
  });

  if (matches.length !== 1) return null;
  const item = matches[0];
  // Pro is one seat. A quantity we did not sell is not a Pro subscription.
  if (Number(item.quantity ?? 1) !== 1) return null;

  return {
    priceId: text(item.price.id),
    billingInterval: catalog.intervalByPrice[text(item.price.id)],
  };
}

/**
 * Paddle status -> JSPath status.
 *
 * The subtle one is a scheduled cancellation: Paddle keeps the subscription
 * `active` and hangs a `scheduled_change` off it, so reading `status` alone
 * would leave a leaving customer looking like a renewing one, and reacting to
 * the word "cancel" alone would cut their access off on the day they asked
 * rather than the day they paid through.
 */
export function normalizePaddleStatus(subscription) {
  const status = text(subscription?.status);
  const change = subscription?.scheduled_change ?? null;
  const changeAction = text(change?.action);
  const effectiveAt = text(change?.effective_at);
  const periodEnd = text(subscription?.current_billing_period?.ends_at);

  if (status === 'canceled') return { status: 'expired', endsAt: text(subscription?.canceled_at) ?? periodEnd };
  if (status === 'paused') return { status: 'paused', endsAt: text(subscription?.paused_at) ?? periodEnd };

  if (status === 'active' || status === 'trialing') {
    if (changeAction === 'cancel') {
      // Access runs to the effective date, which is normally the period end.
      return { status: 'canceling', endsAt: effectiveAt ?? periodEnd };
    }
    if (changeAction === 'pause') {
      // Still active and still paid for until the pause actually lands.
      return { status: 'active', endsAt: effectiveAt ?? periodEnd };
    }
    return { status: 'active', endsAt: periodEnd };
  }

  // Paddle retries payment during dunning and the customer keeps their plan, so
  // JSPath keeps access too - past_due is already an entitling status here.
  if (status === 'past_due') return { status: 'past_due', endsAt: periodEnd };

  // Anything this build does not recognise entitles nothing.
  return { status: 'revoked', endsAt: periodEnd };
}

/** A Paddle subscription as a `public.subscriptions` row. */
export function normalizePaddleSubscription({
  subscription, catalog, customerEmail = null, environment = paddleEnvironment(), now = new Date(),
}) {
  const item = resolveCatalogItem(subscription, catalog);
  if (!item) return null;

  const { status, endsAt } = normalizePaddleStatus(subscription);
  const ended = ['expired', 'refunded', 'revoked'].includes(status);

  return {
    provider: 'paddle',
    // Which Paddle account this came from. A sandbox subscription must never be
    // mistaken for a paid one after live cutover just because provider='paddle'.
    provider_environment: environment,
    provider_subscription_id: text(subscription?.id),
    // Paddle has no per-sale identifier at this level; the transaction that
    // created the subscription is tracked in billing_checkout_sessions instead.
    provider_sale_id: null,
    provider_product_id: catalog.productId,
    provider_variant: item.priceId,
    provider_customer_id: text(subscription?.customer_id),
    plan: 'pro',
    status,
    billing_interval: item.billingInterval,
    customer_email: customerEmail ? customerEmail.toLowerCase() : null,
    started_at: text(subscription?.started_at) ?? text(subscription?.created_at),
    current_period_end: endsAt,
    cancel_at_period_end: status === 'canceling',
    ended_at: ended ? (endsAt ?? now.toISOString()) : null,
    provider_updated_at: text(subscription?.updated_at),
    last_verified_at: now.toISOString(),
    updated_at: now.toISOString(),
  };
}

/**
 * Should this delivery be written?
 *
 * Webhooks can arrive out of order, and a retry of an older event after a newer
 * one has landed would otherwise roll the subscription backwards. Compare the
 * provider's own timestamps; only refuse when the incoming one is definitely
 * older, so a missing timestamp still gets written rather than silently dropped.
 */
export function isFresherThanStored(incomingUpdatedAt, storedUpdatedAt) {
  if (!storedUpdatedAt) return true;
  const incoming = Date.parse(incomingUpdatedAt ?? '');
  const stored = Date.parse(storedUpdatedAt);
  if (!Number.isFinite(incoming) || !Number.isFinite(stored)) return true;
  return incoming >= stored;
}

/** SHA-256 hex, for the idempotency ledger's payload fingerprint. */
export async function sha256Hex(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
