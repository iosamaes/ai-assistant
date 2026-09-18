-- CP6 Life Seasons: user-owned history plus an atomic season/target transition.
-- History begins when this feature is introduced; existing current seasons are backfilled from current state.

create table public.life_season_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season text not null check (season in ('balanced', 'build', 'recovery', 'parenting', 'study', 'travel')),
  target_snapshot jsonb not null default '{}'::jsonb check (jsonb_typeof(target_snapshot) = 'object'),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  constraint life_season_history_valid_window check (ended_at is null or ended_at >= started_at)
);

create index life_season_history_user_started_idx
  on public.life_season_history(user_id, started_at desc);

create unique index life_season_history_one_active_per_user_idx
  on public.life_season_history(user_id)
  where ended_at is null;

alter table public.life_season_history enable row level security;

create policy "life_season_history_select_own" on public.life_season_history
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "life_season_history_insert_own" on public.life_season_history
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "life_season_history_update_own" on public.life_season_history
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "life_season_history_delete_own" on public.life_season_history
for delete to authenticated
using ((select auth.uid()) = user_id);

insert into public.life_season_history (user_id, season, target_snapshot)
select
  p.user_id,
  p.life_season,
  coalesce(
    jsonb_object_agg(dp.domain_id, dp.baseline_target_rating)
      filter (where dp.enabled and dp.baseline_target_rating is not null),
    '{}'::jsonb
  )
from public.profiles p
left join public.domain_preferences dp on dp.user_id = p.user_id
where p.life_season is not null
group by p.user_id, p.life_season;

create or replace function public.set_life_season(
  p_season text,
  p_target_snapshot jsonb default '{}'::jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_now timestamptz := now();
  v_key text;
  v_value text;
  v_rating integer;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  if p_season is null or p_season not in ('balanced', 'build', 'recovery', 'parenting', 'study', 'travel') then
    raise exception 'invalid life season' using errcode = '22023';
  end if;

  if p_target_snapshot is null or jsonb_typeof(p_target_snapshot) <> 'object' then
    raise exception 'target snapshot must be a JSON object' using errcode = '22023';
  end if;

  insert into public.profiles (user_id, life_season)
  values (v_user_id, p_season)
  on conflict (user_id) do update
    set life_season = excluded.life_season;

  update public.domain_preferences
  set baseline_target_rating = null
  where user_id = v_user_id
    and enabled
    and not (p_target_snapshot ? domain_id);

  for v_key, v_value in
    select key, value from jsonb_each_text(p_target_snapshot)
  loop
    if v_value !~ '^[1-5]$' then
      raise exception 'invalid baseline target rating for %', v_key using errcode = '22023';
    end if;
    v_rating := v_value::integer;

    update public.domain_preferences
    set baseline_target_rating = v_rating
    where user_id = v_user_id
      and domain_id = v_key
      and enabled;

    if not found then
      raise exception 'unknown or disabled target domain: %', v_key using errcode = '22023';
    end if;
  end loop;

  update public.life_season_history
  set ended_at = v_now
  where user_id = v_user_id
    and ended_at is null;

  insert into public.life_season_history (
    user_id,
    season,
    target_snapshot,
    started_at
  ) values (
    v_user_id,
    p_season,
    p_target_snapshot,
    v_now
  );
end;
$$;

revoke all on function public.set_life_season(text, jsonb) from public;
grant execute on function public.set_life_season(text, jsonb) to authenticated;
