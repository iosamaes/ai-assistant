-- CP10 least-privilege follow-up for the guarded Life Season RPC.
-- Supabase default privileges add an explicit anon EXECUTE grant to newly-created
-- functions, so remove it after replacing the function signature in migration 0011.

revoke all on function public.set_life_season(text, jsonb, uuid) from public, anon;
grant execute on function public.set_life_season(text, jsonb, uuid) to authenticated;
