-- CP10 account-switch hardening for the atomic Life Season transition.
-- The client supplies the user identity it started the mutation for; the database
-- rejects the write if the authenticated session changed before the RPC executes.

revoke all on function public.set_life_season(text, jsonb) from public;
revoke all on function public.set_life_season(text, jsonb) from authenticated;
drop function public.set_life_season(text, jsonb);

create function public.set_life_season(
  p_season text,
  p_target_snapshot jsonb default '{}'::jsonb,
  p_expected_user_id uuid default null
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

  if p_expected_user_id is null or p_expected_user_id <> v_user_id then
    raise exception 'authenticated account changed before life season save' using errcode = '42501';
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

revoke all on function public.set_life_season(text, jsonb, uuid) from public;
grant execute on function public.set_life_season(text, jsonb, uuid) to authenticated;
