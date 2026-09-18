-- CP4 explicit per-domain baseline targets for onboarding.
-- Null means the user has not chosen a target; no default target is fabricated.

alter table public.domain_preferences
  add column baseline_target_rating smallint;

alter table public.domain_preferences
  add constraint domain_preferences_baseline_target_rating_valid
    check (
      baseline_target_rating is null
      or baseline_target_rating between 1 and 5
    );
