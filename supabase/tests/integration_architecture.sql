-- CP7 unified integration RLS/provenance/idempotency specification.
-- Run only against a disposable/local database after migrations; all fixtures roll back.

begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(1);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values
  ('55555555-5555-4555-8555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mizan-integration-a@example.test', '', now(), now(), now()),
  ('66666666-6666-4666-8666-666666666666', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mizan-integration-b@example.test', '', now(), now(), now());

insert into public.integration_connections (
  user_id, capability, provider_id, status, scopes, consented_at
) values
  ('55555555-5555-4555-8555-555555555555', 'health_data', 'fixture-health', 'connected', array['read_recovery'], now()),
  ('66666666-6666-4666-8666-666666666666', 'health_data', 'fixture-health', 'connected', array['read_recovery'], now());

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"55555555-5555-4555-8555-555555555555","role":"authenticated"}',
  true
);

do $$
begin
  if (select count(*) from public.integration_connections) <> 1 then
    raise exception 'RLS failure: integration connection visibility is not isolated';
  end if;

  if exists (
    select 1 from public.integration_connections
    where user_id = '66666666-6666-4666-8666-666666666666'
  ) then
    raise exception 'RLS failure: user A can read user B integration connection';
  end if;

  begin
    insert into public.integration_connections (
      user_id, capability, provider_id, status, scopes, consented_at
    ) values (
      '66666666-6666-4666-8666-666666666666',
      'time_context',
      'forged-provider',
      'connected',
      array['read_busy_time'],
      now()
    );
    raise exception 'RLS failure: user A inserted user B integration connection';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

insert into public.observations (
  user_id,
  source,
  metric,
  value_number,
  unit,
  observed_at,
  provider_id,
  external_item_id,
  external_dedupe_key,
  evidence_quality
) values (
  '55555555-5555-4555-8555-555555555555',
  'integration',
  'sleep_duration',
  420,
  'minutes',
  '2026-09-18T05:00:00Z',
  'fixture-health',
  'sleep-2026-09-18',
  'sleep_duration:sleep-2026-09-18',
  0.9
)
on conflict (user_id, provider_id, external_dedupe_key)
do update set
  value_number = excluded.value_number,
  observed_at = excluded.observed_at,
  evidence_quality = excluded.evidence_quality;

insert into public.observations (
  user_id,
  source,
  metric,
  value_number,
  unit,
  observed_at,
  provider_id,
  external_item_id,
  external_dedupe_key,
  evidence_quality
) values (
  '55555555-5555-4555-8555-555555555555',
  'integration',
  'sleep_duration',
  430,
  'minutes',
  '2026-09-18T05:00:00Z',
  'fixture-health',
  'sleep-2026-09-18',
  'sleep_duration:sleep-2026-09-18',
  0.95
)
on conflict (user_id, provider_id, external_dedupe_key)
do update set
  value_number = excluded.value_number,
  observed_at = excluded.observed_at,
  evidence_quality = excluded.evidence_quality;

do $$
begin
  if (
    select count(*) from public.observations
    where user_id = '55555555-5555-4555-8555-555555555555'
      and provider_id = 'fixture-health'
      and external_dedupe_key = 'sleep_duration:sleep-2026-09-18'
  ) <> 1 then
    raise exception 'Idempotency failure: duplicate normalized provider observation was created';
  end if;

  if (
    select value_number from public.observations
    where user_id = '55555555-5555-4555-8555-555555555555'
      and provider_id = 'fixture-health'
      and external_dedupe_key = 'sleep_duration:sleep-2026-09-18'
  ) <> 430 then
    raise exception 'Idempotency failure: normalized provider observation was not updated deterministically';
  end if;
end;
$$;

reset role;
select extensions.pass('Integration architecture checks completed');
select * from extensions.finish();
rollback;
