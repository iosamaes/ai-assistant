-- MIZAN CP10 account-export authorization and completeness checks.
-- Intended for a disposable/local Supabase database after migrations are applied.
-- The script runs inside a transaction and rolls back all fixture data.

begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(1);

-- Test identities are rollback-only fixtures.
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('33333333-3333-4333-8333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mizan-export-a@example.test', '', now(), now(), now()),
  ('44444444-4444-4444-8444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mizan-export-b@example.test', '', now(), now(), now());

insert into public.profiles (user_id, locale, timezone)
values
  ('33333333-3333-4333-8333-333333333333', 'ar', 'Asia/Qatar'),
  ('44444444-4444-4444-8444-444444444444', 'en', 'UTC');

insert into public.domain_preferences (user_id, domain_id, enabled, baseline_target_rating)
values
  ('33333333-3333-4333-8333-333333333333', 'export-domain-a', true, 4),
  ('44444444-4444-4444-8444-444444444444', 'export-domain-b-private', true, 2);

insert into public.observations (user_id, source, metric, value_number, observed_at)
values
  ('33333333-3333-4333-8333-333333333333', 'user', 'export-user-a-marker', 4, now()),
  ('44444444-4444-4444-8444-444444444444', 'user', 'export-user-b-private-marker', 2, now());

insert into public.action_events (id, user_id, action_key, event_type)
values
  ('33333333-3333-4333-8333-333333333301', '33333333-3333-4333-8333-333333333333', 'export-action-a', 'accepted'),
  ('44444444-4444-4444-8444-444444444401', '44444444-4444-4444-8444-444444444444', 'export-action-b-private', 'declined');

insert into public.feedback_outcomes (user_id, action_event_id, usefulness, outcome_note)
values
  ('33333333-3333-4333-8333-333333333333', '33333333-3333-4333-8333-333333333301', 4, 'export-feedback-a'),
  ('44444444-4444-4444-8444-444444444444', '44444444-4444-4444-8444-444444444401', 2, 'export-feedback-b-private');

insert into public.plugin_settings (user_id, plugin_id, enabled, consented_at, settings)
values
  ('33333333-3333-4333-8333-333333333333', 'export-plugin-a', true, now(), '{"marker":"a"}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 'export-plugin-b-private', true, now(), '{"marker":"b"}'::jsonb);

insert into public.reflections (user_id, kind, category, note)
values
  ('33333333-3333-4333-8333-333333333333', 'invisible_win', 'rest', 'export-reflection-a'),
  ('44444444-4444-4444-8444-444444444444', 'invisible_win', 'boundary', 'export-reflection-b-private');

insert into public.experiments (
  user_id,
  hypothesis,
  metric,
  expected_direction,
  duration_days,
  consented_at
)
values
  ('33333333-3333-4333-8333-333333333333', 'Export hypothesis A', 'export-metric-a', 'higher', 7, now()),
  ('44444444-4444-4444-8444-444444444444', 'Export hypothesis B private', 'export-metric-b-private', 'lower', 7, now());

insert into public.life_season_history (user_id, season, target_snapshot)
values
  ('33333333-3333-4333-8333-333333333333', 'build', '{"export-domain-a":4}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 'recovery', '{"export-domain-b-private":2}'::jsonb);

insert into public.integration_connections (
  user_id,
  capability,
  provider_id,
  status,
  metadata
)
values
  ('33333333-3333-4333-8333-333333333333', 'export-capability-a', 'export-provider-a', 'configured', '{"marker":"a"}'::jsonb),
  ('44444444-4444-4444-8444-444444444444', 'export-capability-b-private', 'export-provider-b-private', 'configured', '{"marker":"b"}'::jsonb);

-- Function ACL must be least privilege before exercising caller-scoped export.
do $$
begin
  if has_function_privilege('anon', 'public.export_my_data()', 'EXECUTE') then
    raise exception 'export ACL failure: anon can execute export_my_data';
  end if;

  if not has_function_privilege('authenticated', 'public.export_my_data()', 'EXECUTE') then
    raise exception 'export ACL failure: authenticated role cannot execute export_my_data';
  end if;
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated"}',
  true
);

do $$
declare
  v_export jsonb;
  v_collection text;
  v_collections constant text[] := array[
    'domain_preferences',
    'observations',
    'action_events',
    'feedback_outcomes',
    'plugin_settings',
    'reflections',
    'experiments',
    'life_season_history',
    'integration_connections'
  ];
begin
  v_export := public.export_my_data();

  if not (v_export ?& array[
    'format_version',
    'exported_at',
    'user_id',
    'profile',
    'domain_preferences',
    'observations',
    'action_events',
    'feedback_outcomes',
    'plugin_settings',
    'reflections',
    'experiments',
    'life_season_history',
    'integration_connections'
  ]) then
    raise exception 'portable export failure: a current application-owned data section is missing';
  end if;

  if v_export ->> 'user_id' <> '33333333-3333-4333-8333-333333333333' then
    raise exception 'export ownership failure: payload user_id does not match caller';
  end if;

  if v_export ->> 'format_version' <> '1' then
    raise exception 'portable export failure: unexpected format version';
  end if;

  if v_export -> 'profile' ->> 'locale' <> 'ar' then
    raise exception 'export ownership failure: caller profile was not exported';
  end if;

  if (v_export -> 'profile') ? 'user_id' then
    raise exception 'portable export failure: profile user_id should not be emitted twice';
  end if;

  foreach v_collection in array v_collections loop
    if jsonb_typeof(v_export -> v_collection) <> 'array' then
      raise exception 'portable export failure: % is not an array', v_collection;
    end if;

    if jsonb_array_length(v_export -> v_collection) <> 1 then
      raise exception 'export ownership/completeness failure: % should contain exactly one caller row', v_collection;
    end if;

    if exists (
      select 1
      from jsonb_array_elements(v_export -> v_collection) as item
      where item ? 'user_id'
    ) then
      raise exception 'portable export failure: nested user_id leaked from %', v_collection;
    end if;
  end loop;

  if v_export -> 'domain_preferences' -> 0 ->> 'domain_id' <> 'export-domain-a' then
    raise exception 'export ownership failure: caller domain preference was not exported';
  end if;

  if v_export -> 'observations' -> 0 ->> 'metric' <> 'export-user-a-marker' then
    raise exception 'export ownership failure: caller observation was not exported';
  end if;

  if v_export -> 'action_events' -> 0 ->> 'action_key' <> 'export-action-a' then
    raise exception 'export ownership failure: caller action event was not exported';
  end if;

  if v_export -> 'feedback_outcomes' -> 0 ->> 'outcome_note' <> 'export-feedback-a' then
    raise exception 'export ownership failure: caller feedback was not exported';
  end if;

  if v_export -> 'plugin_settings' -> 0 ->> 'plugin_id' <> 'export-plugin-a' then
    raise exception 'export ownership failure: caller plugin setting was not exported';
  end if;

  if v_export -> 'reflections' -> 0 ->> 'note' <> 'export-reflection-a' then
    raise exception 'export ownership failure: caller reflection was not exported';
  end if;

  if v_export -> 'experiments' -> 0 ->> 'metric' <> 'export-metric-a' then
    raise exception 'export ownership failure: caller experiment was not exported';
  end if;

  if v_export -> 'life_season_history' -> 0 ->> 'season' <> 'build' then
    raise exception 'export ownership failure: caller life-season history was not exported';
  end if;

  if v_export -> 'integration_connections' -> 0 ->> 'provider_id' <> 'export-provider-a' then
    raise exception 'export ownership failure: caller integration connection was not exported';
  end if;
end;
$$;

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
begin
  begin
    perform public.export_my_data();
    raise exception 'export ACL failure: anonymous call unexpectedly succeeded';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;
select extensions.pass('Account export is authenticated-only, caller-scoped, and covers current application-owned data');
select * from extensions.finish();
rollback;
