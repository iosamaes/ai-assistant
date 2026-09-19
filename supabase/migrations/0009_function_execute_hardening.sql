-- MIZAN CP10 least-privilege hardening for client-reachable database functions.
-- Supabase's default function grants can leave explicit anon/authenticated EXECUTE ACLs.
-- Keep the user-facing RPC authenticated-only and remove direct client execution from
-- the trigger helper, which remains available to its already-created triggers.

revoke all on function public.set_life_season(text, jsonb) from public, anon;
grant execute on function public.set_life_season(text, jsonb) to authenticated;

revoke all on function public.set_updated_at() from public, anon, authenticated;
