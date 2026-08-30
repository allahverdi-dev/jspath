-- Provider-neutral subscription records. Learning progress remains in user_progress.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  provider_subscription_id text not null,
  provider_sale_id text not null,
  provider_product_id text not null,
  provider_variant text,
  plan text not null,
  status text not null,
  billing_interval text,
  customer_email text not null,
  started_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  ended_at timestamptz,
  last_verified_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_provider_check check (provider in ('gumroad')),
  constraint subscriptions_plan_check check (plan ~ '^[a-z][a-z0-9_-]*$'),
  constraint subscriptions_status_check check (status in ('active', 'canceling', 'expired', 'past_due', 'refunded', 'revoked')),
  constraint subscriptions_interval_check check (billing_interval is null or billing_interval in ('monthly', 'quarterly', 'semiannual', 'annual')),
  constraint subscriptions_provider_subscription_unique unique (provider, provider_subscription_id),
  constraint subscriptions_provider_sale_unique unique (provider, provider_sale_id)
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_access_idx on public.subscriptions (user_id, plan, status, current_period_end);

-- Stores only event identity and processing outcome, not raw purchaser payloads.
create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_key text not null,
  event_type text not null,
  provider_object_id text,
  payload_sha256 text not null,
  processing_status text not null default 'received',
  error_message text,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint billing_events_provider_check check (provider in ('gumroad')),
  constraint billing_events_status_check check (processing_status in ('received', 'processed', 'duplicate', 'rejected', 'unresolved', 'failed')),
  constraint billing_events_provider_key_unique unique (provider, event_key)
);

alter table public.subscriptions enable row level security;
alter table public.billing_events enable row level security;

drop policy if exists "read own subscriptions" on public.subscriptions;
create policy "read own subscriptions"
  on public.subscriptions for select
  to authenticated
  using (auth.uid() = user_id);

-- The browser gets SELECT only. There are intentionally no client write policies.
revoke all on table public.subscriptions from anon, authenticated;
grant select on table public.subscriptions to authenticated;
revoke all on table public.billing_events from anon, authenticated;

comment on table public.subscriptions is 'Trusted billing state written only by server-side billing functions.';
comment on table public.billing_events is 'Idempotency ledger for billing provider resource events; raw payloads are not retained.';
