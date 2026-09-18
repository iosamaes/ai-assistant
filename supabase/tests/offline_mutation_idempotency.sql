-- CP8 offline mutation idempotency specification.
-- Run only against a disposable/local database after migrations; all fixtures roll back.

begin;
create extension if not exists pgtap with schema extensions;
select extensions.plan(1);

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at)
values (
  '77777777-7777-4777-8777-777777777777',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'mizan-offline@example.test',
  '',
  now(),
  now(),
  now()
);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"77777777-7777-4777-8777-777777777777","role":"authenticated"}',
  true
);

insert into public.observations (
  user_id, source, metric, value_number, unit, observed_at, client_mutation_id
) values
  ('77777777-7777-4777-8777-777777777777', 'user', 'energy', 50, 'score_0_100', '2026-09-18T08:00:00Z', 'checkin-retry-1'),
  ('77777777-7777-4777-8777-777777777777', 'user', 'recovery', 75, 'score_0_100', '2026-09-18T08:00:00Z', 'checkin-retry-1')
on conflict (user_id, client_mutation_id, metric)
do update set
  value_number = excluded.value_number,
  observed_at = excluded.observed_at;

insert into public.observations (
  user_id, source, metric, value_number, unit, observed_at, client_mutation_id
) values
  ('77777777-7777-4777-8777-777777777777', 'user', 'energy', 50, 'score_0_100', '2026-09-18T08:00:00Z', 'checkin-retry-1'),
  ('77777777-7777-4777-8777-777777777777', 'user', 'recovery', 75, 'score_0_100', '2026-09-18T08:00:00Z', 'checkin-retry-1')
on conflict (user_id, client_mutation_id, metric)
do update set
  value_number = excluded.value_number,
  observed_at = excluded.observed_at;

insert into public.reflections (
  user_id, kind, category, note, occurred_at, client_mutation_id
) values (
  '77777777-7777-4777-8777-777777777777',
  'invisible_win',
  'family',
  'Protected family time.',
  '2026-09-18T09:00:00Z',
  'reflection-retry-1'
)
on conflict (user_id, client_mutation_id)
do update set
  category = excluded.category,
  note = excluded.note,
  occurred_at = excluded.occurred_at;

insert into public.reflections (
  user_id, kind, category, note, occurred_at, client_mutation_id
) values (
  '77777777-7777-4777-8777-777777777777',
  'invisible_win',
  'family',
  'Protected family time.',
  '2026-09-18T09:00:00Z',
  'reflection-retry-1'
)
on conflict (user_id, client_mutation_id)
do update set
  category = excluded.category,
  note = excluded.note,
  occurred_at = excluded.occurred_at;

do $$
begin
  if (
    select count(*)
    from public.observations
    where user_id = '77777777-7777-4777-8777-777777777777'
      and client_mutation_id = 'checkin-retry-1'
  ) <> 2 then
    raise exception 'Idempotency failure: retried check-in created duplicate metric rows';
  end if;

  if (
    select count(*)
    from public.reflections
    where user_id = '77777777-7777-4777-8777-777777777777'
      and client_mutation_id = 'reflection-retry-1'
  ) <> 1 then
    raise exception 'Idempotency failure: retried reflection created a duplicate row';
  end if;
end;
$$;

reset role;
select extensions.pass('Offline mutation idempotency checks completed');
select * from extensions.finish();
rollback;
