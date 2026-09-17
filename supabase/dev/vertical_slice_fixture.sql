-- DEV ONLY: deterministic vertical-slice fixture for local/disposable Supabase environments.
-- Never run this against production user data.
-- Replace dev_user_id with an existing auth.users UUID in your local/dev project before running.

do $$
declare
  dev_user_id uuid := '00000000-0000-0000-0000-000000000000';
begin
  if dev_user_id = '00000000-0000-0000-0000-000000000000'::uuid then
    raise exception 'Replace dev_user_id with an existing local/dev auth.users UUID before running this fixture.';
  end if;

  if not exists (select 1 from auth.users where id = dev_user_id) then
    raise exception 'No auth.users row exists for dev_user_id %.', dev_user_id;
  end if;

  insert into public.profiles (user_id, locale, timezone, onboarding_completed)
  values (dev_user_id, 'ar', 'UTC', true)
  on conflict (user_id) do update
    set locale = excluded.locale,
        timezone = excluded.timezone,
        onboarding_completed = excluded.onboarding_completed;

  insert into public.domain_preferences (user_id, domain_id, enabled, priority_weight, custom_label)
  values
    (dev_user_id, 'recovery', true, 1.0000, null),
    (dev_user_id, 'connection', true, 0.8500, null),
    (dev_user_id, 'work', true, 0.7000, null),
    (dev_user_id, 'margin', false, 0.5500, null)
  on conflict (user_id, domain_id) do update
    set enabled = excluded.enabled,
        priority_weight = excluded.priority_weight,
        custom_label = excluded.custom_label;

  insert into public.observations (id, user_id, source, metric, value_number, unit, observed_at)
  values
    ('20000000-0000-0000-0000-000000000001', dev_user_id, 'user', 'energy', 7, '0-10', now() - interval '2 hours'),
    ('20000000-0000-0000-0000-000000000002', dev_user_id, 'user', 'mental_load', 4, '0-10', now() - interval '1 hour')
  on conflict (id) do update
    set user_id = excluded.user_id,
        source = excluded.source,
        metric = excluded.metric,
        value_number = excluded.value_number,
        value_text = null,
        value_boolean = null,
        unit = excluded.unit,
        observed_at = excluded.observed_at;

  insert into public.action_events (id, user_id, action_key, event_type, context, occurred_at)
  values (
    '30000000-0000-0000-0000-000000000001',
    dev_user_id,
    'protect_recovery',
    'completed',
    '{"fixture": true}'::jsonb,
    now() - interval '45 minutes'
  )
  on conflict (id) do update
    set user_id = excluded.user_id,
        action_key = excluded.action_key,
        event_type = excluded.event_type,
        context = excluded.context,
        occurred_at = excluded.occurred_at;

  insert into public.feedback_outcomes (id, user_id, action_event_id, usefulness, outcome_note, observed_at)
  values (
    '40000000-0000-0000-0000-000000000001',
    dev_user_id,
    '30000000-0000-0000-0000-000000000001',
    4,
    'Felt more settled after protecting recovery time.',
    now() - interval '15 minutes'
  )
  on conflict (id) do update
    set user_id = excluded.user_id,
        action_event_id = excluded.action_event_id,
        usefulness = excluded.usefulness,
        outcome_note = excluded.outcome_note,
        observed_at = excluded.observed_at;

  insert into public.plugin_settings (user_id, plugin_id, enabled, consented_at, settings)
  values (dev_user_id, 'spiritual-grounding', false, null, '{}'::jsonb)
  on conflict (user_id, plugin_id) do update
    set enabled = excluded.enabled,
        consented_at = excluded.consented_at,
        settings = excluded.settings;
end
$$;
