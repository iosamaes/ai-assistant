-- CP7 unified integrations: small shared lifecycle state plus normalized observation provenance.

alter table public.observations
  add column provider_id text,
  add column external_item_id text,
  add column external_dedupe_key text,
  add column ingested_at timestamptz not null default now(),
  add column evidence_quality numeric check (evidence_quality is null or (evidence_quality >= 0 and evidence_quality <= 1));

create unique index observations_external_item_unique_idx
  on public.observations(user_id, provider_id, external_item_id, metric);

create unique index observations_external_dedupe_unique_idx
  on public.observations(user_id, provider_id, external_dedupe_key);

create table public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  capability text not null check (char_length(trim(capability)) > 0),
  provider_id text not null check (char_length(trim(provider_id)) > 0),
  status text not null check (status in ('configured', 'connected', 'disabled', 'error')),
  scopes text[] not null default '{}',
  consented_at timestamptz,
  last_synced_at timestamptz,
  last_error_code text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  disconnected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, capability, provider_id),
  constraint integration_connections_consent_state check (
    status <> 'connected' or consented_at is not null
  )
);

create index integration_connections_user_capability_idx
  on public.integration_connections(user_id, capability);

alter table public.integration_connections enable row level security;

create policy "integration_connections_select_own" on public.integration_connections
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "integration_connections_insert_own" on public.integration_connections
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "integration_connections_update_own" on public.integration_connections
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "integration_connections_delete_own" on public.integration_connections
for delete to authenticated
using ((select auth.uid()) = user_id);

comment on table public.integration_connections is
  'Vendor-neutral lifecycle state for external capability adapters. Credentials and provider tokens must not be stored here.';

comment on column public.observations.provider_id is
  'Application-owned provider identifier for normalized external observations; never a secret.';
comment on column public.observations.external_item_id is
  'Provider item identifier when supplied, used for provenance and deduplication.';
comment on column public.observations.external_dedupe_key is
  'Application-generated stable idempotency key for normalized external observation ingestion.';
comment on column public.observations.evidence_quality is
  'Optional normalized 0..1 source/evidence quality, not a domain score.';
