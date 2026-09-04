# Gumroad billing and JSPath entitlements

JSPath billing is optional. Without the public checkout URLs or the server-side
configuration, authentication and the existing guest/free learning experience keep
working. A checkout redirect never grants access.

## Architecture

```text
authenticated JSPath user
        ↓ public checkout URL + email/user-ID hints
Gumroad Membership checkout
        ↓ resource subscription event (not trusted by itself)
Supabase Edge Function
        ↓ authenticated Gumroad API verification + allowlists + identity match
public.subscriptions (service-role write, owner read only)
        ↓
EntitlementProvider → Guest / Free / Pro → centralized feature/content guards
```

Auth, billing, and learning state are separate:

- Supabase Auth owns identity.
- `subscriptions` owns server-verified billing state.
- `user_progress.state` remains learning data and never contains a plan flag.
- Gumroad-specific fields stop at the billing boundary; application code asks for a
  logical plan or feature.

The frontend can read its own subscription row, but RLS and grants provide no client
INSERT, UPDATE, or DELETE path. Static SPA guards are product UX rather than a way to
make bundled JavaScript secret. Any future server-hosted Pro capability must enforce
the same entitlement on the server.

## Gumroad setup

Current official Gumroad documentation:

- [Membership products](https://gumroad.com/help/article/82-membership-products)
- [Membership management and cancellation](https://gumroad.com/help/article/278-guide-to-memberships)
- [Checkout URL parameters](https://gumroad.com/help/article/270-url-parameters)
- [API access token setup](https://gumroad.com/help/article/280-create-application-api.html)
- [Test purchases](https://gumroad.com/help/article/62-testing-a-purchase)
- [License/subscription status fields](https://gumroad.com/help/article/76-license-keys)

1. Create one **Membership** product.
2. Create a Pro tier if using tiers. Enable monthly and annual frequency (Gumroad also
   supports quarterly and semiannual frequencies, but JSPath initially exposes two).
3. Choose the real prices in Gumroad. No price or fictitious product ID is committed.
4. Under checkout customization, add a text custom field named exactly
   `JSPath account ID`. Checkout links prefill it, but the server treats it only as a
   hint and also requires a verified Gumroad object and matching confirmed account
   email.
5. Copy the monthly and annual public product/tier links into Vercel as:

   ```text
   VITE_GUMROAD_PRO_MONTHLY_URL
   VITE_GUMROAD_PRO_ANNUAL_URL
   ```

   The links may be the same Membership URL; JSPath adds Gumroad's documented
   `monthly=true` or `yearly=true`, `wanted=true`, email, and custom-field parameters.
6. Configure the product's successful-purchase/custom-delivery destination, if enabled
   for the product, as `https://jspath.vercel.app/pricing?purchase=success`. The query
   only starts trusted reconciliation and polling; it is never proof of payment.
7. In Gumroad **Settings → Advanced**, create an API application for the creator
   account and generate an access token. Store it only as an Edge Function secret.
8. Register resource subscriptions for each currently documented resource:

   ```text
   sale
   refund
   cancellation
   subscription_ended
   subscription_restarted
   subscription_updated
   dispute
   dispute_won
   ```

   Each POST URL includes the corresponding event query value, for example:

   ```text
   https://PROJECT_REF.supabase.co/functions/v1/gumroad-webhook?event=sale&token=LONG_RANDOM_VALUE
   https://PROJECT_REF.supabase.co/functions/v1/gumroad-webhook?event=cancellation&token=LONG_RANDOM_VALUE
   ```

   Create each resource subscription with Gumroad's `PUT /v2/resource_subscriptions`
   API using `resource_name` and `post_url`. The access token authorizes setup and does
   not belong in the webhook URL.

## Supabase setup

Install the Supabase CLI, link the production project, then run:

```bash
supabase db push
supabase functions deploy gumroad-webhook --no-verify-jwt
supabase functions deploy reconcile-gumroad
```

`gumroad-webhook` is intentionally public because Gumroad calls it. It does not trust
the request: it verifies the sale/subscriber through Gumroad's authenticated API.
`reconcile-gumroad` retains normal Supabase JWT verification and additionally resolves
the caller with `auth.getUser()`.

Set server-only secrets:

```bash
supabase secrets set GUMROAD_ACCESS_TOKEN=...
supabase secrets set GUMROAD_ALLOWED_PRODUCTS_JSON='{"REAL_PRODUCT_ID":{"plan":"pro","variants":["REAL_PRO_TIER"]}}'
supabase secrets set GUMROAD_USER_ID_FIELD='JSPath account ID'
supabase secrets set GUMROAD_WEBHOOK_TOKEN='A_LONG_RANDOM_VALUE'
```

Supabase provides `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` to deployed functions. Confirm this in the project before
deployment; never copy the service-role key into Vercel or a `VITE_*` variable.

`GUMROAD_ALLOWED_PRODUCTS_JSON` is mandatory for grants. To accept any tier of one
Membership while still pinning the product, use an empty variants array:

```json
{"REAL_PRODUCT_ID":{"plan":"pro","variants":[]}}
```

The migration in `supabase/migrations/202608300001_billing_subscriptions.sql` creates:

- `subscriptions`: one normalized row per provider subscription, with lifecycle dates
  and unique provider subscription/sale identifiers.
- `billing_events`: an idempotency ledger containing event identity/hash and outcome,
  not raw purchaser payloads.

Authenticated users can SELECT only their own subscription rows. Billing events have
no browser access. Only the service-role Edge runtime performs billing writes.

## Identity linking and reconciliation

Checkout receives the authenticated Supabase UUID and email as prefilled hints. On a
resource event, the server:

1. fetches the sale and subscriber from Gumroad using the private creator token;
2. rejects products and tiers outside the server allowlist;
3. requires a recurring `subscription_id`;
4. resolves the hinted Supabase user server-side;
5. requires the confirmed Supabase email to equal Gumroad's verified purchaser email;
6. stores the provider sale/subscription IDs for deterministic future updates.

Changing a custom field cannot prove payment. If the hint is absent or the emails do
not match, the event is recorded as unresolved and grants nothing. The signed-in user
can choose **Retry confirmation** on Pricing; the authenticated reconciliation
function searches the creator's Gumroad sales for that confirmed email, then applies
the same product/tier/API checks. Support should investigate genuine email mismatch
cases rather than manually toggling browser state.

The webhook remains the primary update path. On account startup, JSPath automatically
reconciles an existing `active`, `canceling`, or `past_due` Gumroad row when its last
provider verification is at least 24 hours old, or when its effective end boundary has
passed. This recovery check runs at most once per signed-in user during an application
session and never runs for Free users with no subscription row. When Gumroad provides
no effective end date, the existing seven-day verification TTL remains a fail-safe if
recovery stays unavailable.

## Lifecycle

- **Initial sale / renewal:** verified state becomes `active`.
- **Cancellation:** becomes `canceling`; Pro continues until Gumroad's effective end
  timestamp. Gumroad documents that canceled Memberships retain access through the
  paid billing cycle.
- **Failed renewal:** becomes `past_due` while a future effective end still exists,
  then `expired` after that date.
- **Subscription ended:** becomes `expired`.
- **Refund:** becomes `refunded` and no longer grants Pro.
- **Dispute/chargeback:** becomes `revoked`; `dispute_won` is reconciled against current
  provider state before restoration.
- **Restart/resubscribe/update:** current verified provider state is upserted into the
  same subscription row.

Plan changes never update or delete `user_progress`, bookmarks, achievements, project
milestones, XP, streaks, activity, or mistakes.

## Idempotency and webhook authenticity

Gumroad's current resource-subscription documentation does not describe a modern
cryptographic webhook signature. JSPath therefore does not invent an HMAC check or
claim signed delivery. Compensating controls are:

- authenticated server-to-server Gumroad API verification;
- an unguessable endpoint token in the configured resource-subscription URL (a spam
  control, explicitly not a Gumroad signature);
- server-only product/tier allowlists;
- confirmed account-email matching plus stable provider IDs;
- a SHA-256 event identity with a unique database constraint;
- normalized provider-neutral status values;
- RLS and no client billing writes;
- safe failure to Free when verification is absent, expired, or contradictory.

A replay produces the same event key and cannot create a second grant. A sale for any
other Gumroad product cannot grant JSPath Pro regardless of its name or price.

## Testing without a real charge

Gumroad explicitly warns creators not to buy their own products with a real card.
While logged into the creator account, open the product purchase page and use the
built-in **Test card** purchase flow. A 100% discount code is another documented test
option. Verify all of the following in a staging Supabase project:

1. initial Membership purchase and delayed confirmation;
2. duplicate delivery of the same event;
3. cancellation while access remains through the paid period;
4. effective subscription end;
5. refund and dispute revocation;
6. restart/resubscribe restoration;
7. mismatched account email remains unresolved;
8. an unrelated product ID remains rejected.

For local webhook inspection, use a temporary HTTPS tunnel; Gumroad resource
subscriptions cannot target localhost directly. Never place live tokens in fixtures.

## Vercel

Vercel receives only:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY (or the legacy VITE_SUPABASE_ANON_KEY)
VITE_GUMROAD_PRO_MONTHLY_URL
VITE_GUMROAD_PRO_ANNUAL_URL
```

Never add `GUMROAD_ACCESS_TOKEN`, `GUMROAD_ALLOWED_PRODUCTS_JSON`, `GUMROAD_WEBHOOK_TOKEN`, or
`SUPABASE_SERVICE_ROLE_KEY` to Vercel's frontend environment or source control.


## Restoring a purchase

`reconcile-gumroad` runs from three places. Two are automatic and narrow; the
third is the learner asking.

| Trigger | When |
| --- | --- |
| Return from checkout | `/pricing?purchase=success`, once per visit |
| Stale row refresh | `EntitlementProvider`, when an existing row satisfies `subscriptionNeedsReconciliation` — once per user per session |
| **Restore Pro purchase** | The learner clicks it, in Settings or on Pricing |

### The gap the button closes

The automatic refresh asks
`result.data?.some((item) => subscriptionNeedsReconciliation(item))`. For an
account with **no** subscription rows that is `[].some(...)` — false — so nothing
ever asked Gumroad whether a purchase existed.

That is the exact state of an account recreated after deletion: the cascade took
`subscriptions` with it, the Gumroad subscription is untouched and still valid,
and the new Supabase user starts with an empty list. In production the only
thing that recovered it was opening `/pricing?purchase=success` by hand, which
is an internal checkout return path, not something a learner can be told to do.

### Why the button rather than an automatic call

Reconciling automatically whenever an authenticated user with no rows opens
Pricing was considered and rejected. Pricing is visited constantly by free
learners who have never bought anything, so it would spend one Gumroad API call
per user per session almost always to learn nothing, and it would make
entitlement depend on which page someone happened to open. An explicit action
costs one call exactly when there is reason to think a purchase exists, and it
is deterministic to test.

`RestorePurchase` renders only for a signed-in learner who is **not** already
Pro and only when billing is configured, so the button is absent wherever it
could not help.

### Security

The button changes no trust boundary. The browser sends **no body at all** —
no email, no user id, no subscription data — so there is nothing in the request
to forge. The function still:

- requires an `Authorization` header and verifies it with `auth.getUser()`
- requires `email_confirmed_at`
- searches Gumroad with `salesForEmail(user.email)` — the *authenticated*
  address, never a supplied one
- filters by `GUMROAD_ALLOWED_PRODUCTS_JSON`
- re-checks in `resolveUser` that the purchaser email matches the account
- maps `refunded` / `disputed` / `chargebacked` to non-entitling statuses
- writes the row itself, with `current_period_end` taken from the provider

Repeating a restore is safe: the unique constraints
`subscriptions_provider_subscription_unique` and
`subscriptions_provider_sale_unique` mean a second run updates the same row
rather than adding one.

### What restore does not do

It restores **entitlement only**. Learning progress lives in `user_progress`,
which is a different table with a different lifecycle — deleted with the
account, cascaded, gone. A recreated account is a new learning profile that may
carry an old purchase. The Privacy Policy and the delete-account dialog both
say so.
