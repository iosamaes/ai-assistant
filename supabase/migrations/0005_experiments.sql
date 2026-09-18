-- MIZAN CP6 voluntary N-of-1 experiment plans.
-- Experiments store consented plans and lifecycle state; observations remain in public.observations.

create table public.experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text,
  hypothesis text not null check (char_length(btrim(hypothesis)) >= 8),
  metric text not null check (char_length(btrim(metric)) > 0),
  expected_direction text not null check (expected_direction in ('higher', 'lower')),
  duration_days smallint not null check (duration_days between 1 and 90),
  status text not null default 'planned' check (status in ('planned', 'active', 'completed', 'cancelled')),
  consented_at timestamptz not null,
  started_at timestamptz,
  ended_at timestamptz,
  baseline_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint experiments_end_after_start check (
    ended_at is null or started_at is null or ended_at >= started_at
  )
);

create index experiments_user_status_created_idx
  on public.experiments(user_id, status, created_at desc);

create trigger experiments_set_updated_at
before update on public.experiments
for each row execute function public.set_updated_at();

alter table public.experiments enable row level security;

create policy "experiments_select_own" on public.experiments
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "experiments_insert_own" on public.experiments
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "experiments_update_own" on public.experiments
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "experiments_delete_own" on public.experiments
for delete to authenticated
using ((select auth.uid()) = user_id);
