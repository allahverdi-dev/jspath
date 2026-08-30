# Supabase setup (optional)

JSPath runs fully without Supabase. With no credentials the app is in guest mode:
every lesson, exercise, challenge, quiz and project works, saved to `localStorage`.

Configure it only if you want accounts and cross-device sync.

Paid-plan state uses separate protected tables and Edge Functions. See
[`BILLING_GUMROAD.md`](BILLING_GUMROAD.md); never put entitlements in `user_progress`.

## 1. Environment

```bash
# .env — never commit this
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Newer projects should use the browser-safe publishable key. Existing deployments may
continue to use `VITE_SUPABASE_ANON_KEY`; JSPath falls back to it when no publishable
key is set. Never use a service-role key in the browser. Row-level security below is
what protects learner data.

## 2. Schema

```sql
create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

create policy "read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

The whole progress document is stored as one JSONB row per user. That is a deliberate
trade: it keeps the client simple and makes guest → account migration a single merge,
at the cost of not being able to query individual lesson rows server-side — which
nothing in the product needs.

## 3. OAuth providers

Enable Google and GitHub under **Authentication → Providers**. Create each provider's
OAuth application as described by Supabase, and keep provider client secrets in the
Supabase dashboard — never in this repository or a Vite environment variable.

Add every application origin under **Authentication → URL Configuration**. Local
development needs both JSPath return routes, for example:

```text
http://localhost:5173/dashboard
http://localhost:5173/onboarding/level
```

Add the equivalent routes for each deployed origin. Login returns to `/dashboard`;
account creation returns to `/onboarding/level`. Both providers use Supabase's normal
identity-only OAuth flow and request no provider API scopes.

## Failure behaviour

Every Supabase call resolves to `{ data, error }` and never throws. If the network is
down or the credentials are wrong, the app logs a warning and keeps working from
`localStorage` — learning is never blocked on the backend being reachable.

## Guest → account migration

On sign-in, `mergeStates()` in `src/state/UserStateProvider.jsx` merges whatever the
guest did into the account record. The rule is **keep the better outcome**:

- a lesson completed in either place stays completed (earliest timestamp wins)
- an exercise or challenge solved in either place stays solved
- quiz attempts are unioned; the best ratio is kept
- XP takes the union of awarded keys, so nothing is lost and nothing is double-counted
- streak days are unioned and the longest run recomputed

Nothing a learner earned can be lost by signing in. This is covered by tests in
`src/tests/content.test.js`.
