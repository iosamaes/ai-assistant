-- MIZAN CP5 Invisible Wins / reflection capture.
-- These entries are intentionally separate from observations and action scoring.

create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('invisible_win')),
  category text not null check (category in ('rest', 'boundary', 'family', 'repair', 'disconnect', 'health', 'other')),
  note text not null check (char_length(btrim(note)) between 1 and 1000),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index reflections_user_occurred_at_idx
  on public.reflections(user_id, occurred_at desc);

alter table public.reflections enable row level security;

create policy "reflections_select_own" on public.reflections
for select to authenticated
using ((select auth.uid()) = user_id);

create policy "reflections_insert_own" on public.reflections
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "reflections_update_own" on public.reflections
for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "reflections_delete_own" on public.reflections
for delete to authenticated
using ((select auth.uid()) = user_id);
