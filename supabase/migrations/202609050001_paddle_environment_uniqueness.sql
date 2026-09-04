-- Environment-aware Paddle identities.
--
-- Keep the legacy two-column unique constraints for the currently deployed
-- generic billing functions. Fixed sandbox/production handlers use these
-- three-column identities instead.

alter table public.subscriptions
  add constraint subscriptions_provider_environment_subscription_unique
  unique (provider, provider_environment, provider_subscription_id);

alter table public.billing_checkout_sessions
  add constraint billing_checkout_sessions_environment_transaction_unique
  unique (provider, provider_environment, provider_transaction_id);