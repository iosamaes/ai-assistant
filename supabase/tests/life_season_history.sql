-- CP6 Life Seasons RLS and atomic transition specification.
-- Intended for a disposable/local Supabase database after migrations are applied.
-- The script runs inside a transaction and rolls back all fixture data.

begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(1);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('33333333-3333-4333-8333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mizan-season-a@example.test', '', now(), now(), now()),
  ('44444444-4444-4444-8444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mizan-season-b@example.test', '', now(), now(), now());

insert into public.profiles (user_id, life_season)
values
  ('33333333-3333-4333-8333-333333333333', 'balanced'),
  ('44444444-4444-4444-8444-444444444444', 'recovery');

insert into public.domain_preferences (user_id, domain_id, enabled, baseline_target_rating)
values
  ('33333333-3333-4333-8333-333333333333', 'recovery', true, 3),
  ('44444444-4444-4444-8444-444444444444', 'recovery', true, 2);

insert into public.life_season_history (user_id, season, target_snapshot)
values
  ('33333333-3333-4333-8333-333333333333', 'balanced', '{"recovery":3}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 'recovery', '{"recovery":2}'::jsonb);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}',
  true
);

do $$
begin
  if (select count(*) from public.life_season_history) <> 1 then
    raise exception 'RLS failure: Life Season history visibility is not isolated';
  end if;

  if exists (
    select 1 from public.life_season_history
    where user_id = '44444444-4444-4444-8444-444444444444'
  ) then
    raise exception 'RLS failure: user A can read user B Life Season history';
  end if;

  begin
    insert into public.life_season_history (user_id, season, target_snapshot)
    values ('44444444-4444-4444-8444-444444444444', 'build', '{}'::jsonb);
    raise exception 'RLS failure: user A inserted user B Life Season history';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

select public.set_life_season('build', '{"recovery":4}'::jsonb);

do $$
begin
  if (select life_season from public.profiles where user_id = '33333333-3333-4333-8333-333333333333') <> 'build' then
    raise exception 'Life Season transition did not update the current profile season';
  end if;

  if (select baseline_target_rating from public.domain_preferences where user_id = '33333333-3333-4333-8333-333333333333' and domain_id = 'recovery') <> 4 then
    raise exception 'Life Season transition did not update the current target snapshot';
  end if;

  if (select count(*) from public.life_season_history where ended_at is null) <> 1 then
    raise exception 'Life Season transition must leave exactly one active own history entry';
  end if;

  if (select season from public.life_season_history where ended_at is null) <> 'build' then
    raise exception 'Life Season transition active history entry has the wrong season';
  end if;

  if (select target_snapshot from public.life_season_history where ended_at is null) <> '{"recovery":4}'::jsonb then
    raise exception 'Life Season transition active history entry has the wrong target snapshot';
  end if;
end;
$$;

reset role;
select extensions.pass('Life-season history checks completed');
select * from extensions.finish();
rollback;
