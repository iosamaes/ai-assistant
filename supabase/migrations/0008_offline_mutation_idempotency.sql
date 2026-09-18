-- MIZAN CP8: stable client mutation ids make retryable user writes idempotent.
-- Existing rows receive unique generated ids; new direct writes keep a safe server default.

alter table public.observations
  add column client_mutation_id text not null default gen_random_uuid()::text;

create unique index observations_user_client_mutation_metric_key
  on public.observations(user_id, client_mutation_id, metric);

alter table public.reflections
  add column client_mutation_id text not null default gen_random_uuid()::text;

create unique index reflections_user_client_mutation_key
  on public.reflections(user_id, client_mutation_id);
