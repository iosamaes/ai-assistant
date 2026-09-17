-- MIZAN CP2 minimum persistence for the first daily vertical slice.
-- Every client-visible table is user-owned and protected by RLS.

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  locale text not null default 'ar' check (locale in ('ar', 'en')),
  timezone text not null default 'UTC',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.domain_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  domain_id text not null,
  enabled boolean not null default true,
  priority_weight numeric(5,4) not null default 1 check (priority_weight between 0 and 1),
  custom_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, domain_id)
);

create index domain_preferences_user_id_idx on public.domain_preferences(user_id);

create table public.observations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('user', 'integration', 'inferred')),
  metric text not null,
  value_number double precision,
  value_text text,
  value_boolean boolean,
  unit text,
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint observations_exactly_one_value check (
    num_nonnulls(value_number, value_text, value_boolean) = 1
  )
);

create index observations_user_observed_at_idx
  on public.observations(user_id, observed_at desc);

create table public.action_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_key text not null,
  event_type text not null check (event_type in ('offered', 'accepted', 'deferred', 'declined', 'completed')),
  context jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index action_events_user_occurred_at_idx
  on public.action_events(user_id, occurred_at desc);

create table public.feedback_outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_event_id uuid not null references public.action_events(id) on delete cascade,
  usefulness smallint check (usefulness between 1 and 5),
  outcome_note text,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint feedback_has_evidence check (usefulness is not null or outcome_note is not null)
);

create index feedback_outcomes_user_observed_at_idx
  on public.feedback_outcomes(user_id, observed_at desc);

create table public.plugin_settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  plugin_id text not null,
  enabled boolean not null default false,
  consented_at timestamptz,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, plugin_id)
);

create index plugin_settings_user_id_idx on public.plugin_settings(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger domain_preferences_set_updated_at
before update on public.domain_preferences
for each row execute function public.set_updated_at();

create trigger plugin_settings_set_updated_at
before update on public.plugin_settings
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.domain_preferences enable row level security;
alter table public.observations enable row level security;
alter table public.action_events enable row level security;
alter table public.feedback_outcomes enable row level security;
alter table public.plugin_settings enable row level security;

create policy "profiles_select_own" on public.profiles
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "profiles_insert_own" on public.profiles
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "profiles_update_own" on public.profiles
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "profiles_delete_own" on public.profiles
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "domain_preferences_select_own" on public.domain_preferences
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "domain_preferences_insert_own" on public.domain_preferences
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "domain_preferences_update_own" on public.domain_preferences
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "domain_preferences_delete_own" on public.domain_preferences
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "observations_select_own" on public.observations
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "observations_insert_own" on public.observations
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "observations_update_own" on public.observations
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "observations_delete_own" on public.observations
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "action_events_select_own" on public.action_events
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "action_events_insert_own" on public.action_events
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "action_events_update_own" on public.action_events
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "action_events_delete_own" on public.action_events
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "feedback_outcomes_select_own" on public.feedback_outcomes
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "feedback_outcomes_insert_own" on public.feedback_outcomes
for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.action_events ae
    where ae.id = action_event_id
      and ae.user_id = (select auth.uid())
  )
);

create policy "feedback_outcomes_update_own" on public.feedback_outcomes
for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.action_events ae
    where ae.id = action_event_id
      and ae.user_id = (select auth.uid())
  )
);

create policy "feedback_outcomes_delete_own" on public.feedback_outcomes
for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "plugin_settings_select_own" on public.plugin_settings
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "plugin_settings_insert_own" on public.plugin_settings
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "plugin_settings_update_own" on public.plugin_settings
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "plugin_settings_delete_own" on public.plugin_settings
for delete to authenticated
using ((select auth.uid()) = user_id);
