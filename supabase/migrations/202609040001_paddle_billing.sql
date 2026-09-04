-- Paddle Billing alongside Gumroad.
------------------------------------
--
-- New paid subscriptions move to Paddle. Existing Gumroad rows keep working
-- unchanged and keep granting Pro until they end on their own, so this migration
-- only widens what is allowed - it drops no data and tightens nothing that
-- Gumroad relies on.
--
-- Two Gumroad-era NOT NULLs cannot hold for Paddle:
--
--   provider_sale_id   Gumroad sells a "sale" that owns a subscription. Paddle
--                      has no equivalent at subscription.created; the closest
--                      thing is the transaction that caused it, which is a
--                      different concept and is tracked separately below.
--   customer_email     Paddle's subscription payload carries customer_id, not an
--                      address. Fetching the customer just to satisfy a column
--                      would add an API call to the entitlement write path.
--
-- Rather than fabricate values, both become nullable and a per-provider CHECK
-- re-imposes the old requirement on Gumroad rows exactly. Nothing that was true
-- of a Gumroad row before this migration stops being true after it.

-- 1. Both providers are allowed; the field stays a closed set.
alter table public.subscriptions drop constraint if exists subscriptions_provider_check;
alter table public.subscriptions
  add constraint subscriptions_provider_check check (provider in ('gumroad', 'paddle'));

alter table public.billing_events drop constraint if exists billing_events_provider_check;
alter table public.billing_events
  add constraint billing_events_provider_check check (provider in ('gumroad', 'paddle'));

-- 2. `paused` joins the normalized vocabulary.
--
-- Paddle can pause a subscription, which is neither "expired" (it can resume)
-- nor "revoked" (nothing went wrong). It grants no Pro either way - the
-- entitlement resolver only pays out on active/canceling/past_due - but the
-- learner is shown their status, and calling a paused plan "Expired" is a lie.
alter table public.subscriptions drop constraint if exists subscriptions_status_check;
alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('active', 'canceling', 'expired', 'past_due', 'paused', 'refunded', 'revoked'));

-- 3. Relax the two columns, then re-impose them per provider.
alter table public.subscriptions alter column provider_sale_id drop not null;
alter table public.subscriptions alter column customer_email drop not null;

alter table public.subscriptions drop constraint if exists subscriptions_gumroad_identity_check;
alter table public.subscriptions
  add constraint subscriptions_gumroad_identity_check
  check (provider <> 'gumroad' or (provider_sale_id is not null and customer_email is not null));

-- 4. Paddle identity.
--
-- provider_customer_id holds the Paddle ctm_ id, which is what the customer
-- portal is addressed by. Without it a Paddle subscriber has no way to manage
-- their plan, so it is required for Paddle rows.
alter table public.subscriptions add column if not exists provider_customer_id text;

alter table public.subscriptions drop constraint if exists subscriptions_paddle_identity_check;
alter table public.subscriptions
  add constraint subscriptions_paddle_identity_check
  check (provider <> 'paddle' or provider_customer_id is not null);

-- 4b. Which Paddle account a row came from.
--
-- Sandbox and live are different Paddle accounts with different ids, but both
-- write `provider = 'paddle'`. Without this column, a sandbox subscription
-- created during testing would become indistinguishable from a paid one the
-- moment the deployment is pointed at live - a free Pro subscription that
-- survives the cutover. The entitlement resolver refuses to pay out on a row
-- whose environment does not match the running one.
alter table public.subscriptions add column if not exists provider_environment text;

alter table public.subscriptions drop constraint if exists subscriptions_environment_check;
alter table public.subscriptions
  add constraint subscriptions_environment_check
  check (provider_environment is null or provider_environment in ('sandbox', 'production'));

-- Required for Paddle, and meaningless for Gumroad, which has one environment.
alter table public.subscriptions drop constraint if exists subscriptions_paddle_environment_check;
alter table public.subscriptions
  add constraint subscriptions_paddle_environment_check
  check (provider <> 'paddle' or provider_environment is not null);

comment on column public.subscriptions.provider_environment is
'Which provider environment produced this row. Paddle sandbox rows must never grant entitlement in a production deployment.';

-- The same provenance on the checkout mapping, so a sandbox transaction cannot
-- be recovered by a production deployment either.
-- (Defined with the table below; stated here for the reader.)

-- 5. Event ordering.
--
-- Paddle webhooks are asynchronous and can arrive out of order. This holds the
-- provider's own view of when the subscription last changed, so a delayed older
-- event can be recognised and dropped instead of overwriting newer state.
alter table public.subscriptions add column if not exists provider_updated_at timestamptz;

comment on column public.subscriptions.provider_customer_id is
'Provider-side customer identifier. Paddle ctm_ id, used to open the customer portal.';
comment on column public.subscriptions.provider_updated_at is
'Provider''s own updated timestamp for this subscription. Used to reject stale webhook deliveries.';

-- 6. Server-owned checkout mapping.
--
-- The recovery problem: a transaction is created, the learner pays, and the
-- webhook is delayed or lost. The account has no subscription row and nothing
-- ties it to the payment.
--
-- The unsafe fix is searching the provider by an email the browser supplies.
-- This table is the safe one: the server records, at the moment it creates the
-- transaction, which authenticated user that transaction belongs to. Recovery
-- then reads a mapping JSPath wrote itself and asks Paddle only about that
-- specific transaction.
create table if not exists public.billing_checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_environment text not null,
  provider_transaction_id text not null,
  billing_interval text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint billing_checkout_sessions_provider_check check (provider in ('paddle')),
  constraint billing_checkout_sessions_environment_check check (provider_environment in ('sandbox', 'production')),
  constraint billing_checkout_sessions_interval_check check (billing_interval in ('monthly', 'annual')),
  constraint billing_checkout_sessions_status_check check (status in ('pending', 'completed', 'abandoned')),
  constraint billing_checkout_sessions_transaction_unique unique (provider, provider_transaction_id)
);

create index if not exists billing_checkout_sessions_user_idx
  on public.billing_checkout_sessions (user_id, status, created_at desc);

alter table public.billing_checkout_sessions enable row level security;

-- The browser never touches this table, not even to read. It exists so the
-- server can trust a mapping it wrote; a client that could read or write it
-- would turn it back into client-supplied input.
revoke all on table public.billing_checkout_sessions from anon, authenticated;

comment on table public.billing_checkout_sessions is
'Server-created checkout transactions, bound to the authenticated user who started them. Written and read only by billing Edge Functions; no browser access.';

-- 7. Nothing above touches the existing policies. Restated so a reviewer can see
--    what remains true rather than having to go and check.
--
--    subscriptions           authenticated SELECT own rows only, no client writes
--    billing_events          no client access at all
--    billing_checkout_sessions  no client access at all
