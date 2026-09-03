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
