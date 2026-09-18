-- CP4 onboarding context required for season-relative, user-owned targets.
-- Existing profiles remain valid; new fields stay unknown until the user explicitly chooses them.

alter table public.profiles
  add column life_season text,
  add column self_values text[] not null default '{}',
  add column privacy_mode text;

alter table public.profiles
  add constraint profiles_life_season_valid
    check (
      life_season is null
      or life_season in ('balanced', 'build', 'recovery', 'parenting', 'study', 'travel')
    ),
  add constraint profiles_privacy_mode_valid
    check (
      privacy_mode is null
      or privacy_mode in ('minimal', 'balanced')
    );
