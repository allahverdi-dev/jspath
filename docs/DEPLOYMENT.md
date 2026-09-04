# Production deployment

What must be true before JSPath is served to real users. Nothing here contains a
secret; every value below is a *name* you set in a dashboard.

---

## 1. Build pipeline

| Command | When | Why |
| --- | --- | --- |
| `npm run content:manifest` | before build | regenerates the public card/search manifest |
| `npm run content:premium` | **before deploying Edge Functions** | writes `supabase/functions/premium-content/payload.json`, the paid half of Pro content |
| `npm run build` | deploy | produces `dist/`, with Pro answers stripped out |

`npm run build` prints how much was withheld, for example:

```
premium: withheld 3149 paid fields from 629 Pro items (156 challenges, 160 exercises, 287 interview questions, 26 projects)
```

If that line is missing or the counts are zero, the paid content is going into the
bundle and the deploy must be stopped.

**Order matters.** `content:premium` reads the same source the stripper does, so
run it from the same commit you build and deploy. A payload built from an older
commit leaves Pro items the function cannot serve.

---

## 2. Vercel

**Public environment variables** (these are shipped to the browser by design):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` — or the legacy `VITE_SUPABASE_ANON_KEY`
- `VITE_GUMROAD_PRO_MONTHLY_URL`
- `VITE_GUMROAD_PRO_ANNUAL_URL`

Never set a service-role key, a Gumroad access token or a webhook token as a
`VITE_*` variable. Anything prefixed `VITE_` is compiled into the bundle.

**Headers** come from `vercel.json` and need no dashboard configuration. Confirm
after deploying:

```
curl -sI https://<your-domain>/ | grep -i -E 'content-security-policy|x-content-type|referrer-policy'
```

The Content-Security-Policy is deliberately permissive in three specific ways,
each verified against a real build:

- `script-src` allows `https://cdn.jsdelivr.net` because `@monaco-editor/react`
  loads the editor from that CDN. Without it the editor silently degrades to the
  plain-textarea fallback.
- `style-src`/`font-src` allow Google Fonts, which provide the three typefaces
  and the Material Symbols icon font. Without them the UI loses all its icons.
- `script-src` allows `'unsafe-inline'` and `'unsafe-eval'` because the code
  sandbox is the product: learner code runs through `new Function` inside a blob
  Worker and a `srcdoc` iframe, and a `srcdoc` frame with `sandbox="allow-scripts"`
  has an opaque origin, so `'self'` cannot match its bootstrap script.

  A stricter future option is to serve the sandbox document from its own origin
  so it carries its own policy; that is a known improvement, not a blocker.

---

## 3. Supabase

**Apply migrations** — `supabase db push`. These create:

- `public.subscriptions` and `public.billing_events`, with RLS: a learner may read
  their own subscription rows and nothing else; there are no client write policies.
- `public.user_progress`, with RLS restricting select/insert/update/delete to the
  owning `auth.uid()`.

Verify afterwards that RLS is enabled on all three:

```sql
select relname, relrowsecurity from pg_class
where relname in ('subscriptions','billing_events','user_progress');
```

All three must report `t`.

**Edge Function secrets** (server-only; never `VITE_*`):

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `GUMROAD_ACCESS_TOKEN`
- `GUMROAD_WEBHOOK_TOKEN`
- `GUMROAD_ALLOWED_PRODUCTS_JSON`
- `GUMROAD_USER_ID_FIELD`

**Deploy the functions:**

```
npm run content:premium
supabase functions deploy premium-content
supabase functions deploy gumroad-webhook
supabase functions deploy reconcile-gumroad
supabase functions deploy delete-account
```

`delete-account` backs Settings → Danger zone. It needs **no new secret** — it
uses `SUPABASE_SERVICE_ROLE_KEY` plus the platform-provided `SUPABASE_URL` and
`SUPABASE_ANON_KEY`, all of which the other functions already have — and **no
migration**: deleting the row from `auth.users` cascades to `user_progress` and
`subscriptions`, which already declare it. Deploy it *before* the frontend, so
the Danger zone never reaches a function that is not there yet.

`premium-content` ships `payload.json` alongside it. That file must never be
copied into `public/` or anywhere Vite can see.

**OAuth redirect URLs** — add the production origin to Supabase Auth:

- Site URL: `https://<your-domain>`
- Redirect URLs: `https://<your-domain>/**` plus `http://localhost:5173/**` for
  local development.

---

## 4. Google OAuth

In the Google Cloud console, the OAuth client's **Authorised redirect URI** must be
the Supabase callback, not the app domain:

```
https://<project-ref>.supabase.co/auth/v1/callback
```

## 5. GitHub OAuth

Same shape — the GitHub OAuth app's **Authorization callback URL**:

```
https://<project-ref>.supabase.co/auth/v1/callback
```

## 6. Gumroad

- The Pro product exists with monthly and annual tiers.
- Every tier id or permalink you sell is listed in `GUMROAD_ALLOWED_PRODUCTS_JSON`.
  A sale for anything not on that list is rejected rather than granted.
- Resource subscriptions (`sale`, `refund`, `dispute`, `dispute_won`,
  `cancellation`, `subscription_updated`, `subscription_ended`,
  `subscription_restarted`) point at:

  ```
  https://<project-ref>.supabase.co/functions/v1/gumroad-webhook?token=<GUMROAD_WEBHOOK_TOKEN>&event=<resource_name>
  ```

- The checkout collects the JSPath account id in the custom field named by
  `GUMROAD_USER_ID_FIELD`, so a sale can be matched to an account.

---

## 7. Post-deploy verification

Signed out, in a private window:

1. Curriculum, a lesson, the playground and Placement all work.
2. A Free challenge opens and runs; the editor is Monaco, not the textarea
   fallback; icons render.
3. A Pro challenge shows the upgrade wall, and its solution is **not** in the
   page source.
4. A URL for content that does not exist shows "not found" — never a paywall.

Signed in with Pro:

5. A Pro challenge, project and interview question all open with full content.
6. Interview Session and Practice Session start.

Then confirm the split held in production:

```
curl -s https://<your-domain>/assets/ --compressed | grep -c 'solutionExplanation'
```

Better, search a built asset for a known Pro solution string. It must be absent
while the Pro item's *title* is present — that is the split working: discovery
public, payload protected.

---

## 8. What this repository cannot verify

These live in dashboards and must be checked by hand:

- Supabase Site URL and Redirect URLs contain the production domain.
- RLS is actually enabled on the three tables (the query above).
- Edge Function secrets are set in the deployed project.
- The four functions are deployed, and `premium-content` was deployed *after* the
  most recent `content:premium` run.
- `delete-account` is deployed *before* the frontend that calls it.
- Google and GitHub OAuth callback URLs point at the Supabase callback.
- Gumroad resource subscriptions point at the deployed webhook with the right token.
- `GUMROAD_ALLOWED_PRODUCTS_JSON` lists exactly the tiers being sold.
- Vercel has the four public `VITE_*` variables and no private ones.


---

# Paddle Billing

Two procedures, deliberately separate. **Sandbox testing does not change what
production sells.**

| | Production today | After live cutover |
| --- | --- | --- |
| New purchases | **Gumroad** | Paddle |
| Existing Gumroad subscriptions | keep working | keep working |
| Paddle | sandbox testing only | live |

`VITE_BILLING_MODE` decides which checkout a deployment offers. Unset or
unrecognised means `gumroad-production`, so a typo cannot promote sandbox
checkout to real learners — and the Paddle Edge Functions independently refuse
sandbox work for anyone not on a server-side tester allowlist, because a
frontend flag is a UI decision and never a security boundary.

---

## Part A — Paddle sandbox test procedure

**This does not touch production checkout.** Production keeps selling through
Gumroad throughout.

### Where to run it

Best: a **staging Supabase project** with its own database, plus a preview
deployment with `VITE_BILLING_MODE=paddle-sandbox`. Sandbox rows then live in a
separate database entirely and can never be confused with production ones.

This repository has no staging Supabase project configured. Until one exists,
the options are:

1. **Create a staging Supabase project** (recommended). Clean isolation, no
   allowlist needed, nothing to undo afterwards.
2. **Run sandbox against production Supabase, gated by the tester allowlist.**
   Workable for owner testing, and the safeguards below are built for it — but
   sandbox rows then sit in the production database, so
   `provider_environment = 'sandbox'` is what keeps them from ever granting Pro
   in production mode.
3. **Local Supabase** (`supabase start`). No production risk at all; the webhook
   needs a tunnel for Paddle to reach it.

Do not assume production Supabase is safe for sandbox merely because the code
guards it. The guards are real, but option 1 removes the question.

### A1. Migration

```bash
supabase db push
```

Applies `supabase/migrations/202609040001_paddle_billing.sql`, which:

- allows `provider` to be `gumroad` **or** `paddle` (still a closed set)
- adds `paused` to the status vocabulary
- makes `provider_sale_id` and `customer_email` nullable, then re-imposes both on
  Gumroad rows with a per-provider CHECK, so Gumroad semantics are unchanged
- adds `provider_customer_id` (Paddle `ctm_`, required on Paddle rows) and
  `provider_updated_at` (event ordering)
- creates `public.billing_checkout_sessions` with RLS and **no browser access at
  all**

It drops no data and weakens no policy.

### A2. Server secrets

Set as Supabase Edge Function secrets. Never as `VITE_` variables, never in git.

| Name | Sandbox value |
| --- | --- |
| `PADDLE_API_KEY` | your sandbox API key |
| `PADDLE_ENVIRONMENT` | `sandbox` |
| `PADDLE_PRODUCT_ID` | `pro_01m1kfjerd1h1mzev6m8td7dxa` |
| `PADDLE_PRO_MONTHLY_PRICE_ID` | `pri_01m1kfspfdnp24enjp1j03gjfn` |
| `PADDLE_PRO_ANNUAL_PRICE_ID` | `pri_01m1kfv9jw4d174amwn6kvfwz3` |
| `PADDLE_WEBHOOK_SECRET` | the notification destination secret from step A5 |
| `PADDLE_SANDBOX_TESTER_IDS` | your own Supabase user UUID. **Empty means nobody** |

`PADDLE_SANDBOX_TESTER_IDS` is what stops an ordinary learner reaching sandbox
checkout if sandbox is ever pointed at the production database. It is compared
against the id in the verified JWT — never an email, never anything from a
request body — and it never reaches the browser. Find your UUID in the Supabase
dashboard under Authentication → Users.

```bash
supabase secrets set PADDLE_ENVIRONMENT=sandbox
supabase secrets set PADDLE_PRODUCT_ID=pro_01m1kfjerd1h1mzev6m8td7dxa
supabase secrets set PADDLE_PRO_MONTHLY_PRICE_ID=pri_01m1kfspfdnp24enjp1j03gjfn
supabase secrets set PADDLE_PRO_ANNUAL_PRICE_ID=pri_01m1kfv9jw4d174amwn6kvfwz3
# The two credentials, entered interactively rather than pasted into a file:
supabase secrets set PADDLE_API_KEY=...
supabase secrets set PADDLE_WEBHOOK_SECRET=...
```

The product and price ids are not secrets, but they live in configuration
because the live ids will be different and no source file should need editing.

### A3. Deploy the functions

```bash
supabase functions deploy paddle-checkout
supabase functions deploy paddle-webhook --no-verify-jwt
supabase functions deploy reconcile-paddle
supabase functions deploy paddle-portal
```

`paddle-webhook` is the only one deployed `--no-verify-jwt`: Paddle is not a
Supabase user and cannot present a Supabase token. Its authentication is the
Paddle signature, which is verified on the raw body before anything is parsed.
The other three require a normal authenticated session.

Deploy the functions **before** the frontend, so the pricing page never calls
something that is not there.

### A4. Frontend environment

```
VITE_BILLING_MODE=paddle-sandbox
VITE_PADDLE_CLIENT_TOKEN=<sandbox client-side token>
VITE_PADDLE_ENVIRONMENT=sandbox
```

**Set these on the preview/staging deployment only.** Production keeps
`VITE_BILLING_MODE=gumroad-production` and needs no Paddle variables at all.

The client token is designed to be public — it can open a checkout and nothing
else. It is **not** the API key. `VITE_PADDLE_ENVIRONMENT` must be exactly
`sandbox` or `production`; anything else disables checkout rather than guessing.

Without a client token the pricing page renders normally, shows the prices, and
disables the buttons with "Billing is unavailable in this deployment" — free
learning is unaffected.

The CSP in `vercel.json` gained `https://cdn.paddle.com` (script-src, for
Paddle.js) and `https://*.paddle.com` (frame-src for the checkout overlay,
connect-src for its API calls). Nothing else changed.

### A5. Notification destination

Paddle dashboard → **Developer tools → Notifications → New destination**.

- Type: **Webhook**
- URL: `https://ufqyheazexqhaygpfcee.supabase.co/functions/v1/paddle-webhook`
- Events: **`subscription.created`** and **`subscription.updated`** — those two,
  nothing else

Paddle shows the destination's secret key (`pdl_ntfset_...`) once. That value is
`PADDLE_WEBHOOK_SECRET`.

The project ref above comes from `supabase/.temp/project-ref`; it is also the
first path segment of the project URL in the Supabase dashboard.

### Why only those two events

`subscription.updated` is the authoritative state cache, and `subscription.created`
starts it. Everything JSPath needs — active, scheduled cancellation, pause,
dunning, cancellation — arrives on those.

`transaction.completed` is deliberately not enabled: the subscription events
already carry `transaction_id`, and the recovery path uses the server's own
checkout mapping rather than waiting for a transaction event.

`adjustment.updated` is deliberately not enabled either, and this is a
considered decision rather than an omission. In Paddle a refund **does not**
cancel a subscription, and refund adjustments are approved by Paddle rather than
being final on arrival. Acting on one would mean deciding a business rule nobody
has decided — whether a full refund of the latest invoice should end access
early. Until that is decided, `subscription.updated` remains the single
authority on access, and a refund that is meant to end a subscription ends it by
cancelling the subscription, which we do see. Subscribing to an event the code
does not act on would only add noise.

### A6. Run the test

Use Paddle's own sandbox test card details from their testing documentation. Do
not put card numbers in this repository.

1. Sign in to JSPath with a confirmed account.
2. Open `/pricing`. Both buttons should be enabled and priced.
3. Choose monthly. A Paddle overlay opens for a transaction the *server* created.
4. Pay with a sandbox card.
5. You are returned to `/pricing?purchase=success`, which shows "confirming".

Expected `public.subscriptions` row:

| column | value |
| --- | --- |
| `provider` | `paddle` |
| `provider_subscription_id` | `sub_...` |
| `provider_customer_id` | `ctm_...` |
| `provider_product_id` | the configured `pro_...` |
| `provider_variant` | the configured `pri_...` |
| `provider_sale_id` | `NULL` (Paddle has no equivalent) |
| `plan` / `status` | `pro` / `active` |
| `billing_interval` | `monthly` |
| `current_period_end` | the period end Paddle reported |

Pro should unlock, and `premium-content` should return 200.

### Cancellation

Cancel from the customer portal. Paddle keeps `status: active` and adds a
`scheduled_change` with `action: cancel`. JSPath stores `canceling` with
`current_period_end = scheduled_change.effective_at`, and **Pro stays available
until that date**. After it passes, the account returns to Free.

### Past due

Simulate a failed renewal. JSPath stores `past_due` and keeps granting Pro,
matching Paddle's provisioning guidance.

Access is **not** bounded by the period end — which has already elapsed, since
that is why payment is due — and **not** by any local timeout. Paddle decides
when it ends: a successful retry returns the subscription to `active`, and
exhausted recovery moves it to `canceled`, which JSPath stores as `expired` and
stops granting. The pricing page shows a dateless payment-issue notice next to
the existing Manage subscription action.

### Paused

Pause from the portal. JSPath stores `paused`, which grants no Pro. It is a
distinct status precisely so the learner is not told their plan "expired" when
it can resume.

### Missing webhook

Disable the destination, buy again, and return to `/pricing`. The webhook never
arrives, so no row exists. Press **Restore Pro purchase**: `reconcile-paddle`
reads this user's own pending `billing_checkout_sessions` row, fetches that one
transaction, follows it to the subscription, validates product and price, and
writes the row. At no point does anything search Paddle by email.

### Customer portal

As a Paddle subscriber, press **Manage subscription** in Settings. It calls
`paddle-portal`, which resolves the customer id from the trusted row and returns
a fresh authenticated URL. The URL is never cached. A legacy Gumroad subscriber
gets the Gumroad library link instead.

## Part B — Paddle live cutover procedure

**Do not start this until every blocker below is cleared.** No source change is
required for any of it.

### Blocking prerequisites

- [ ] Paddle **live** account approved for selling
- [ ] live API key created
- [ ] live client-side token created
- [ ] live product id and both live price ids
- [ ] live notification destination created, secret captured
- [ ] production checkout domain approved in Paddle
- [ ] **refund / chargeback entitlement semantics decided** — see the blocker in
      `docs/BILLING_GUMROAD.md`. Paddle refunds are financial adjustments and do
      not cancel a subscription, so what a refund should do to Pro is an owner
      decision that has not been made
- [ ] **legal policies updated** for the provider change — see the checklist in
      `docs/LEGAL.md`
- [ ] live smoke test planned (one low-value real purchase, then refund)

### Steps

1. Create the product and both prices in the live Paddle account.
2. Create the live API key, client-side token and notification destination
   (same URL, same two events).
3. Update the Supabase secrets: `PADDLE_ENVIRONMENT=production`, live API key,
   live product and price ids, live webhook secret. Remove
   `PADDLE_SANDBOX_TESTER_IDS` — it does nothing in production.
4. Update the frontend: `VITE_BILLING_MODE=paddle-production`, live client
   token, `VITE_PADDLE_ENVIRONMENT=production`.
5. Redeploy the functions, then the frontend.
6. Make one real low-value purchase, confirm the subscription row has
   `provider_environment = 'production'`, then refund it from the dashboard.

### What happens to sandbox rows

Nothing — and that is the point. Any `provider_environment = 'sandbox'` row left
in the database stops granting Pro the moment the deployment runs as production,
because the entitlement resolver refuses a row whose environment does not match
the running one. A subscription bought with a test card cannot survive cutover
and become real access.

`PADDLE_ENVIRONMENT` is the only thing that selects the API host, and an invalid
value throws rather than defaulting — sandbox code cannot silently reach the live
API.

## Gumroad, meanwhile

`gumroad-webhook` and `reconcile-gumroad` stay deployed and stay configured.
Existing `provider = 'gumroad'` rows keep granting Pro until they end on their
own. Reconciliation tries Paddle first and falls back to Gumroad, so a legacy
subscriber can still recover their entitlement. Removing Gumroad is a later
phase, and should not happen while any Gumroad subscription is still running.
