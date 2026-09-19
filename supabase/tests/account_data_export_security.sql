-- MIZAN CP10 account-export authorization checks.
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

insert into public.observations (user_id, source, metric, value_number, observed_at)
values
  ('33333333-3333-4333-8333-333333333333', 'user', 'export-user-a-marker', 4, now()),
  ('44444444-4444-4444-8444-444444444444', 'user', 'export-user-b-private-marker', 2, now());

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
begin
  v_export := public.export_my_data();

  if v_export ->> 'user_id' <> '33333333-3333-4333-8333-333333333333' then
    raise exception 'export ownership failure: payload user_id does not match caller';
  end if;

  if v_export -> 'profile' ->> 'locale' <> 'ar' then
    raise exception 'export ownership failure: caller profile was not exported';
  end if;

  if jsonb_array_length(v_export -> 'observations') <> 1 then
    raise exception 'export ownership failure: caller sees another user observation';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(v_export -> 'observations') as item
    where item ->> 'metric' = 'export-user-b-private-marker'
  ) then
    raise exception 'export ownership failure: another user marker leaked into export';
  end if;

  if (v_export -> 'observations' -> 0) ? 'user_id' then
    raise exception 'portable export failure: nested user_id should not be emitted';
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
select extensions.pass('Account export is authenticated-only and caller-scoped');
select * from extensions.finish();
rollback;
