# MIZAN Project State

## Current checkpoint
- CP1 remains `BLOCKED_HUMAN` for owner-side responsive/auth validation.
- CP2 implementation exists but still requires owner-side hosted-auth/RLS validation.
- CP3, CP4, CP5, and CP6 implementation slices are now present on GitHub `main` and remain verification-pending under the current worker policy.
- Next independent engineering checkpoint: **CP7 — Plugins, unified integrations, and provider boundaries**.
- Product authority: GitHub `iosamaes/ai-assistant` on `main`.
- Task digest: `db05d2d78fc71edb1b71880d9e74535318fa6f4a`.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation — owner validation pending
- [ ] CP2 — Supabase, auth, ownership, persistence — owner validation pending
- [ ] CP3 — MIZAN deterministic intelligence core — implementation present, validation pending
- [ ] CP4 — First complete daily life loop — implementation present, validation pending
- [ ] CP5 — Insight, explanation, personal learning — implementation present, validation pending
- [ ] CP6 — Advanced decision tools — implementation present, validation pending
- [ ] CP7 — Plugins, unified integrations, and provider boundaries
- [ ] CP8 — Reliability, offline tolerance, sync
- [ ] CP9 — Responsive UX, accessibility, localization, polish, and design-swappability
- [ ] CP10 — Security, privacy, owner-data control
- [ ] CP11 — Test matrix, performance, release readiness
- [ ] CP12 — Independent final review and handoff

## CP1 / CP2 owner-validation blockers
- Universal Expo shell, Arabic-first RTL/English locale structure, auth/session/recovery flows, Supabase persistence, RLS migrations, and cross-user policy specifications are implemented.
- CP1 still needs owner-side true narrow-phone Arabic/English interaction evidence after the Windows session is unlocked.
- Hosted Supabase Auth still needs the redirect allow-list owner action recorded in `automation/HUMAN_REQUIRED.md`.

## CP3 / CP4 / CP5 implemented slices
- Deterministic core preserves unknown data and implements Human State Vector, confidence, personal baseline/maturity, temporal memory/Momentum, Balance, Life Leverage/One Move, Life Debt, Buffer/Fragility, interaction-risk hypotheses, value alignment, relationship evidence, scenario learning, experiments, and explicit-outcome feedback learning.
- Daily loop implements onboarding context/targets, sub-minute check-in, Today state/Balance/Momentum/One Move, decision handling, explicit usefulness feedback, and restart/login recommendation-context suppression.
- CP5 surfaces include Life Map, WHY, Insights, Personal Learning, Personalization Maturity, Values & Identity alignment, and Invisible Wins/reflection capture.

## CP6 implementation summary
### What If / Digital Twin
- Deterministic scenario projections expose assumptions, uncertainty ranges, evidence source/count, and confidence.
- Unknown current state remains unknown; qualified personal effects require explicit outcome feedback plus a compatible later observation.

### Voluntary Experiment Engine
- Consent-based, time-bounded experiments persist under RLS and evaluate personal pre/post evidence conservatively.
- `/experiments` supports start, stop without punishment, explicit impact feedback, and evidence-limited personal results.

### Recovery / Save My Day
- Deterministic recovery plans use only supported Human State evidence and keep weak/unknown signals insufficient.
- The sequence intentionally reduces choice to at most three tiny optional steps, and skipping/stopping has no points, streaks, or punishment.
- `/recovery` is Arabic/English and explains confidence, evidence, and non-medical limits.

### Cost of Yes
- `packages/core/src/cost-of-yes.ts` compares a proposed weekly commitment with known weekly margin and refuses to invent schedules or displaced activities when context is missing.
- The result distinguishes manageable, tight, and unavoidable-displacement states with explicit evidence/confidence.
- `apps/app/src/application/cost-of-yes.ts` is the application boundary, so future calendar/provider context can be added without coupling the core or feature screen to a vendor.
- `/cost-of-yes` is Arabic/English and uses shared semantic UI primitives.
- `packages/core/src/cost-of-yes.test.ts` specifies missing-context, manageable, tight, displacement, and zero-margin behavior; it has not been executed by workers.

### Human ROI
- `packages/core/src/human-roi.ts` compares only explicit user-reported benefit, effort, and time and intentionally does not create a synthetic scalar ROI score.
- Missing evidence stays insufficient; close readings remain mixed instead of forcing a verdict.
- `protectedMeaning` keeps relationships, worship, sacred moments, or any personally non-optimizable activity completely outside quantitative comparison.
- `/human-roi` is Arabic/English and uses shared UI primitives.
- `packages/core/src/human-roi.test.ts` specifies protected, insufficient, benefit-heavier, mixed, and cost-heavier behavior; it has not been executed by workers.

### Life Seasons
- Migration `0006_life_season_history.sql` adds user-owned Life Season history with RLS, one active season row per user, target snapshots, and an atomic `set_life_season` transition function.
- The migration was applied successfully to Supabase project `olfhjnropdrnujgpidfi`; `list_migrations` now includes `life_season_history` version `20260918105531`.
- Existing current seasons were backfilled from profile/domain target state. New history records close/open atomically when the user changes season.
- `apps/app/src/infrastructure/supabase/life-seasons.ts` and `apps/app/src/application/life-seasons.ts` keep persistence out of presentation code.
- `/life-seasons` lets the user edit the current season and sustainable per-domain targets, displays prior season history, and states that Balance recalculates against user-chosen targets rather than a fixed ideal.
- `supabase/tests/life_season_history.sql` specifies RLS isolation and atomic transition behavior; it has not been executed by workers.

### Life Debt / Resilience / Fragility / Life Buffer
- Existing pure core algorithms in `packages/core/src/capacity.ts` are now surfaced through `apps/app/src/application/capacity.ts` and `/capacity`.
- The application layer derives conservative recent/prior evidence windows from real observations and current user targets before calling pure `calculateLifeDebt` and `calculateLifeBuffer` functions.
- Life Debt remains unknown when targets/current evidence are missing; recovery/accumulation direction requires prior-window evidence.
- Buffer requires multiple comparable capacity/load signals; otherwise it remains unknown rather than fabricating spare capacity.
- `/capacity` explains that debt is a neutral planning signal, fragility is not poor performance, and neither surface is a medical diagnosis or measure of personal worth.
- Existing `packages/core/src/capacity.test.ts` specifies sparse-evidence, accumulation/recovery, first-snapshot, low-buffer, weak-margin, and interaction-risk behavior; it was not rerun by workers.

### CP6 implementation status
- All CP6 required feature categories now have code paths for both meaningful-data and insufficient-data states.
- CP6 is **implementation-complete but not checkpoint-verified** because the current worker execution mode prohibits product/database test and build execution. Owner-side validation remains required before the checkbox can be marked complete.

## Architecture amendments now in force
- TASK section 7.1 requires design-swappable presentation architecture. New CP6 surfaces use shared semantic `Screen`, `Card`, `MizanText`, `ChoiceChip`, `PrimaryButton`, and `MizanTextInput` primitives rather than creating screen-local foundational styling systems.
- TASK section 6.1 requires unified integration architecture. New external-service work must use capability-specific typed contracts and adapters, normalized data/provenance, centralized provider selection, and no generic God API or vendor SDK leakage into core/features.

## Exact next executable action
1. Begin CP7 by finalizing the plugin contract/registry from actual usage and implementing the smallest capability-specific integration contracts plus shared lifecycle model required by TASK section 6.1.
2. Add a provider-swap proof and a new-capability proof without introducing a service locator, generic integration platform, or vendor conditionals in feature screens/core.
3. Expand first-party plugin/domain manifests from actual product requirements, including opt-in Spiritual Grounding and permission/data-availability semantics.
4. Owner path: unlock Windows and complete CP1 narrow-phone Arabic/English interaction verification.
5. Owner path: configure Supabase Auth redirect allow-list, then validate auth/recovery/session/persistence and execute RLS verification.
6. Owner path: run current core/app/plugin typechecks, tests, DB specifications, and required builds before granting CP3/CP4/CP5/CP6 checkpoint credit.

## Verification record
Previously verified baseline evidence:
- CP1 root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app typecheck PASS and app lint PASS.

Implemented after that baseline and still awaiting owner validation:
- CP2 auth/session/persistence/recovery additions and current migrations/policy tests.
- CP3/CP4/CP5 implementation slices listed above.
- CP6 What If, scenario learning, experiment engine/persistence/surface, Recovery / Save My Day, Cost of Yes, Human ROI, Life Seasons, and Life Debt/Buffer presentation.
- No product/database test script, cloud test, or build was run by workers for these post-baseline additions, per `automation/TASK.md`.

## Known technical risks / temporary compromises
- CP1 remains blocked on owner-side physical responsive/locale verification.
- Hosted Supabase Auth must allow `mizan://**`, `http://localhost:8087/**`, and the eventual production Web URL before confirmation/recovery can be verified end-to-end.
- Cross-user SQL verification exists but lacks current owner-side execution evidence.
- Post-baseline CP3/CP4/CP5/CP6 additions remain runtime/type validation pending.
- Offline mutation durability beyond the current screen/session remains CP8 work.
- Recovery mode is deliberately stateless in this slice: skipping/stopping is never converted into a negative event, score, or adherence penalty.
- Cost of Yes currently uses explicit user-entered weekly time/margin context because calendar/provider integrations belong behind the CP7 capability-contract layer; unknown context remains unknown.
- Human ROI intentionally has no combined numeric ROI score; benefit/effort ratings and time use unlike scales, so collapsing them would create false precision.
- Life Season history begins from migration/backfill or the first later season transition; it does not fabricate historical seasons from before the feature existed.
- Capacity presentation currently uses the supported self-report observation metrics; richer wearable/calendar signals must enter later through CP7 normalization/provider boundaries, not through vendor-specific feature code.
- Moderate npm advisories remain in the supported Expo dependency chain; no prior high/critical advisory was recorded.

## Evidence paths
- `packages/core/src/cost-of-yes.ts`
- `packages/core/src/cost-of-yes.test.ts`
- `packages/core/src/human-roi.ts`
- `packages/core/src/human-roi.test.ts`
- `packages/core/src/capacity.ts`
- `packages/core/src/capacity.test.ts`
- `apps/app/src/application/cost-of-yes.ts`
- `apps/app/src/application/human-roi.ts`
- `apps/app/src/application/capacity.ts`
- `apps/app/src/app/cost-of-yes.tsx`
- `apps/app/src/app/human-roi.tsx`
- `apps/app/src/app/capacity.tsx`
- `apps/app/src/app/life-seasons.tsx`
- `apps/app/src/infrastructure/supabase/life-seasons.ts`
- `supabase/migrations/0006_life_season_history.sql`
- `supabase/tests/life_season_history.sql`
- `apps/app/src/components/mizan-ui.tsx`
- `packages/core/src/recovery.ts`
- `packages/core/src/recovery.test.ts`
- `apps/app/src/application/recovery.ts`
- `apps/app/src/app/recovery.tsx`
- `apps/app/src/app/_layout.tsx`
- `apps/app/src/app/settings.tsx`
- `packages/core/src/scenario.ts`
- `packages/core/src/experiment.ts`
- `apps/app/src/app/what-if.tsx`
- `apps/app/src/app/experiments.tsx`
- `supabase/tests/rls_cross_user.sql`
