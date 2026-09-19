-- MIZAN CP10 portable account-data export.
-- The RPC runs with the caller's privileges and explicit user ownership filters.
-- It exports only application-owned public data; auth-provider metadata is added by
-- the client from its authenticated session rather than widening database access.

create or replace function public.export_my_data()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_export jsonb;
begin
  if v_user_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'format_version', 1,
    'exported_at', now(),
    'user_id', v_user_id,
    'profile', (
      select to_jsonb(p) - 'user_id'
      from public.profiles p
      where p.user_id = v_user_id
    ),
    'domain_preferences', coalesce((
      select jsonb_agg((to_jsonb(dp) - 'user_id') order by dp.domain_id)
      from public.domain_preferences dp
      where dp.user_id = v_user_id
    ), '[]'::jsonb),
    'observations', coalesce((
      select jsonb_agg((to_jsonb(o) - 'user_id') order by o.observed_at, o.id)
      from public.observations o
      where o.user_id = v_user_id
    ), '[]'::jsonb),
    'action_events', coalesce((
      select jsonb_agg((to_jsonb(ae) - 'user_id') order by ae.occurred_at, ae.id)
      from public.action_events ae
      where ae.user_id = v_user_id
    ), '[]'::jsonb),
    'feedback_outcomes', coalesce((
      select jsonb_agg((to_jsonb(fo) - 'user_id') order by fo.observed_at, fo.id)
      from public.feedback_outcomes fo
      where fo.user_id = v_user_id
    ), '[]'::jsonb),
    'plugin_settings', coalesce((
      select jsonb_agg((to_jsonb(ps) - 'user_id') order by ps.plugin_id)
      from public.plugin_settings ps
      where ps.user_id = v_user_id
    ), '[]'::jsonb),
    'reflections', coalesce((
      select jsonb_agg((to_jsonb(r) - 'user_id') order by r.occurred_at, r.id)
      from public.reflections r
      where r.user_id = v_user_id
    ), '[]'::jsonb),
    'experiments', coalesce((
      select jsonb_agg((to_jsonb(e) - 'user_id') order by e.created_at, e.id)
      from public.experiments e
      where e.user_id = v_user_id
    ), '[]'::jsonb),
    'life_season_history', coalesce((
      select jsonb_agg((to_jsonb(lsh) - 'user_id') order by lsh.started_at, lsh.id)
      from public.life_season_history lsh
      where lsh.user_id = v_user_id
    ), '[]'::jsonb),
    'integration_connections', coalesce((
      select jsonb_agg((to_jsonb(ic) - 'user_id') order by ic.created_at, ic.id)
      from public.integration_connections ic
      where ic.user_id = v_user_id
    ), '[]'::jsonb)
  ) into v_export;

  return v_export;
end;
$$;

revoke all on function public.export_my_data() from public, anon;
grant execute on function public.export_my_data() to authenticated;

comment on function public.export_my_data() is
  'Returns the authenticated user''s application-owned MIZAN data as portable JSON. Runs as security invoker and relies on the same RLS boundary as normal client reads.';
