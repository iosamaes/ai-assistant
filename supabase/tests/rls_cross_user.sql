-- MIZAN CP2 RLS isolation checks.
-- Intended for a disposable/local Supabase database after migrations are applied.
-- The script runs inside a transaction and rolls back all fixture data.

begin;

-- Test identities are inserted only inside this rollback-only transaction.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('11111111-1111-4111-8111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mizan-rls-a@example.test', '', now(), now(), now()),
  ('22222222-2222-4222-8222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mizan-rls-b@example.test', '', now(), now(), now());

insert into public.profiles (user_id, locale, timezone)
values
  ('11111111-1111-4111-8111-111111111111', 'ar', 'Asia/Qatar'),
  ('22222222-2222-4222-8222-222222222222', 'en', 'UTC');

insert into public.action_events (id, user_id, action_key, event_type)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'walk.ten_minutes', 'accepted'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'pause.notifications', 'accepted');

insert into public.reflections (user_id, kind, category, note)
values
  ('11111111-1111-4111-8111-111111111111', 'invisible_win', 'rest', 'Paused without guilt.'),
  ('22222222-2222-4222-8222-222222222222', 'invisible_win', 'family', 'Family time.');

insert into public.experiments (user_id, template_id, hypothesis, metric, expected_direction, duration_days, status, consented_at)
values
  ('11111111-1111-4111-8111-111111111111', 'earlier-bedtime', 'Earlier bedtime may improve my recovery.', 'recovery', 'higher', 5, 'planned', now()),
  ('22222222-2222-4222-8222-222222222222', 'quiet-focus', 'Quiet focus may reduce my mental load.', 'mental_load', 'lower', 3, 'planned', now());

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',
  true
);

-- User A can see only their own profile, action event, reflection, and experiment.
do $$
begin
  if (select count(*) from public.profiles) <> 1 then
    raise exception 'RLS failure: user A profile visibility is not isolated';
  end if;

  if exists (
    select 1 from public.profiles
    where user_id = '22222222-2222-4222-8222-222222222222'
  ) then
    raise exception 'RLS failure: user A can read user B profile';
  end if;

  if (select count(*) from public.action_events) <> 1 then
    raise exception 'RLS failure: user A action visibility is not isolated';
  end if;

  if (select count(*) from public.reflections) <> 1 then
    raise exception 'RLS failure: user A reflection visibility is not isolated';
  end if;

  if (select count(*) from public.experiments) <> 1 then
    raise exception 'RLS failure: user A experiment visibility is not isolated';
  end if;
end;
$$;

-- Cross-user writes must be rejected by policy checks.
do $$
begin
  begin
    insert into public.domain_preferences (user_id, domain_id)
    values ('22222222-2222-4222-8222-222222222222', 'recovery');
    raise exception 'RLS failure: user A inserted user B domain preference';
  exception
    when insufficient_privilege then null;
  end;

  begin
    update public.profiles
    set locale = 'ar'
    where user_id = '22222222-2222-4222-8222-222222222222';
    if found then
      raise exception 'RLS failure: user A updated user B profile';
    end if;
  end;

  begin
    insert into public.feedback_outcomes (user_id, action_event_id, usefulness)
    values (
      '11111111-1111-4111-8111-111111111111',
      'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      5
    );
    raise exception 'RLS failure: feedback linked to another user action event';
  exception
    when insufficient_privilege or check_violation then null;
  end;

  begin
    insert into public.reflections (user_id, kind, category, note)
    values ('22222222-2222-4222-8222-222222222222', 'invisible_win', 'rest', 'Cross-user write');
    raise exception 'RLS failure: user A inserted user B reflection';
  exception
    when insufficient_privilege or check_violation then null;
  end;

  begin
    insert into public.experiments (
      user_id,
      hypothesis,
      metric,
      expected_direction,
      duration_days,
      consented_at
    ) values (
      '22222222-2222-4222-8222-222222222222',
      'Cross-user experiment should be rejected.',
      'energy',
      'higher',
      3,
      now()
    );
    raise exception 'RLS failure: user A inserted user B experiment';
  exception
    when insufficient_privilege or check_violation then null;
  end;
end;
$$;

-- Own writes remain allowed.
insert into public.domain_preferences (user_id, domain_id, enabled)
values ('11111111-1111-4111-8111-111111111111', 'recovery', true);

insert into public.feedback_outcomes (user_id, action_event_id, usefulness)
values (
  '11111111-1111-4111-8111-111111111111',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  4
);

insert into public.reflections (user_id, kind, category, note)
values ('11111111-1111-4111-8111-111111111111', 'invisible_win', 'boundary', 'Said no to preserve margin.');

insert into public.experiments (
  user_id,
  hypothesis,
  metric,
  expected_direction,
  duration_days,
  consented_at
) values (
  '11111111-1111-4111-8111-111111111111',
  'A second recovery experiment belongs to user A.',
  'recovery',
  'higher',
  4,
  now()
);

rollback;
