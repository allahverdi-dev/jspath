-- Learning progress: one JSONB document per user.
---------------------------------------------------

-- The schema and its policies were previously documented in docs/SUPABASE.md as
-- SQL to paste by hand, which meant `supabase db push` did not create them and
-- nothing proved that row-level security was actually enabled on private learner
-- data. This migration captures exactly what the documentation described, and is
-- written to be safe to apply to a project where the table already exists.

create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  state      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_progress enable row level security;

-- Recreated rather than assumed, so applying this to an existing project
-- converges on the intended policy set instead of layering a second one.
drop policy if exists "read own progress" on public.user_progress;

create policy "read own progress"
on public.user_progress for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "insert own progress" on public.user_progress;

create policy "insert own progress"
on public.user_progress for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "update own progress" on public.user_progress;

create policy "update own progress"
on public.user_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- A learner may remove their own data; nobody may reach another row.
drop policy if exists "delete own progress" on public.user_progress;

create policy "delete own progress"
on public.user_progress for delete
to authenticated
using (auth.uid() = user_id);

-- Anonymous visitors keep their progress in local storage and never touch this
-- table. Only the signed-in owner's own row is reachable, and only through the
-- policies above.
revoke all on table public.user_progress from anon;
revoke all on table public.user_progress from authenticated;
grant select, insert, update, delete on table public.user_progress to authenticated;

comment on table public.user_progress is
'One learning-progress document per user. Never contains plan or entitlement data - see public.subscriptions.';

