# MIZAN Project State

## Current checkpoint
- CP1 remains `BLOCKED_HUMAN` for owner-side responsive/auth validation.
- CP2 implementation exists but still requires owner-side hosted-auth/RLS validation.
- CP3, CP4, CP5, CP6, and CP7 implementation slices are now present on GitHub `main` and remain verification-pending under the current worker policy.
- Next independent engineering checkpoint: **CP8 — Reliability, offline tolerance, and sync behavior**.
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
- [ ] CP7 — Plugins, unified integrations, and provider boundaries — implementation present, validation pending
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
- `apps/app/src/application/cost-of-yes.ts` is the application boundary; it now supports both explicit self-reported context and a typed `TimeContextProvider` without coupling the core or feature screen to a vendor.
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
- The migration was applied successfully to Supabase project `olfhjnropdrnujgpidfi`; `list_migrations` includes `life_season_history` version `20260918105531`.
- Existing current seasons were backfilled from profile/domain target state. New history records close/open atomically when the user changes season.
- `apps/app/src/infrastructure/supabase/life-seasons.ts` and `apps/app/src/application/life-seasons.ts` keep persistence out of presentation code.
- `/life-seasons` lets the user edit the current season and sustainable per-domain targets, displays prior season history, and states that Balance recalculates against user-chosen targets rather than a fixed ideal.
- `supabase/tests/life_season_history.sql` specifies RLS isolation and atomic transition behavior; it has not been executed by workers.

### Life Debt / Resilience / Fragility / Life Buffer
- Existing pure core algorithms in `packages/core/src/capacity.ts` are surfaced through `apps/app/src/application/capacity.ts` and `/capacity`.
- The application layer derives conservative recent/prior evidence windows from real observations and current user targets before calling pure `calculateLifeDebt` and `calculateLifeBuffer` functions.
- Life Debt remains unknown when targets/current evidence are missing; recovery/accumulation direction requires prior-window evidence.
- Buffer requires multiple comparable capacity/load signals; otherwise it remains unknown rather than fabricating spare capacity.
- `/capacity` explains that debt is a neutral planning signal, fragility is not poor performance, and neither surface is a medical diagnosis or measure of personal worth.
- Existing `packages/core/src/capacity.test.ts` specifies sparse-evidence, accumulation/recovery, first-snapshot, low-buffer, weak-margin, and interaction-risk behavior; it was not rerun by workers.

### CP6 implementation status
- All CP6 required feature categories now have code paths for both meaningful-data and insufficient-data states.
- CP6 is **implementation-complete but not checkpoint-verified** because the current worker execution mode prohibits product/database test and build execution. Owner-side validation remains required before the checkbox can be marked complete.

## CP7 implementation summary
### Plugin contract and first-party registry
- `PluginManifest` now supports typed `dataRequirements` containing capability, metric, scope, and optionality metadata; the core still does not know vendor names or SDK payloads.
- `packages/plugins/src/registry.ts` resolves plugins as `disabled`, `ready`, `degraded`, or `unavailable` from capability availability and permission scopes.
- Disabled/unavailable plugins contribute no active dimensions/actions; optional missing external data degrades rather than crashes a plugin.
- The first-party registry now covers the foundational domains plus Body/Health, Mental/Emotional, Financial Safety, Learning/Growth, Habits/Routines, Rest/Play, Personal Environment, and opt-in Spiritual Grounding.
- `packages/plugins/src/registry.test.ts` specifies enable/disable, optional data availability, permission scope, and sample-plugin behavior; it has not been executed by workers.

### Focused capability contracts and provider boundaries
- `apps/app/src/integrations/contracts.ts` defines small application-owned contracts for `TimeContextProvider`, `HealthDataProvider`, and `LocationContextProvider`; there is no universal `doAnything(provider,type,payload)` interface.
- `apps/app/src/integrations/adapters.ts` provides deterministic and explicit unavailable adapters so the product can exercise provider behavior without inventing production credentials or making core functionality depend on external services.
- `apps/app/src/integrations/provider-registry.ts` centralizes provider selection separately per capability instead of introducing a service locator or giant provider switch.
- Provider SDKs and vendor payload schemas remain outside feature screens, plugins, and `packages/core`.

### Unified integration lifecycle, provenance, and idempotency
- Migration `0007_integration_architecture.sql` adds vendor-neutral `integration_connections` lifecycle state with RLS, consent/scopes, configured/connected/disabled/error status, last sync, safe error code, disconnect time, and non-secret metadata.
- The same migration adds normalized external-observation provenance fields: provider id, external item id, stable dedupe key, ingestion time, and optional evidence quality, plus uniqueness indexes for idempotent ingestion.
- The migration was applied successfully to Supabase project `olfhjnropdrnujgpidfi`; `list_migrations` includes `integration_architecture` version `20260918111525`.
- `apps/app/src/infrastructure/supabase/integrations.ts` persists lifecycle state and normalized scalar observations only; it does not store raw provider payloads or provider credentials.
- `apps/app/src/application/integrations.ts` validates health-provider scopes, rejects provider-identity mismatch, stores normalized observations idempotently, records sync lifecycle, and exposes disconnect behavior through the application boundary.
- `supabase/tests/integration_architecture.sql` specifies cross-user RLS isolation and deterministic duplicate-provider-event handling; it has not been executed by workers.

### Provider-swap proof
- `Cost of Yes` now has `assessCostOfYesWithTimeContext(...)`, which consumes only `TimeContextProvider`.
- The time-context registry can return `deterministic-primary`, `deterministic-alternate`, or `unavailable` implementations of the same focused contract.
- Switching between these implementations requires no change to `packages/core`, the Cost of Yes scoring model, or feature-screen business logic.
- No production calendar provider or credentials are configured, so the proof deliberately uses deterministic alternate adapters rather than creating a fake production integration.

### New-capability proof
- `HealthDataProvider` was added as a separate capability and wired to consent/scope checks, normalization, provenance/idempotent persistence, and lifecycle state without widening `TimeContextProvider` or editing MIZAN core algorithms.
- `LocationContextProvider` is another separate focused contract and returns only approximate semantic context (`home`, `work`, `travel`, `other`, `unknown`), not continuous precise coordinates.
- This demonstrates the intended rule: same-capability vendors add adapters/registration; genuinely new capabilities add one focused contract rather than expanding a God API.

### Integration settings surface and architecture note
- `/integrations` is an Arabic/English lifecycle settings surface that lists real connection state, scopes, consent, last sync, and supports disabling existing integrations through the application boundary; it does not expose decorative fake-connect buttons.
- `docs/INTEGRATIONS.md` records the boundary, provider-swap proof, new-capability proof, normalization/provenance rules, and steps for adding providers/capabilities.

### CP7 implementation status
- All required CP7 architecture/code proof categories now have implementation paths and explicit unavailable/fallback behavior.
- CP7 is **implementation-complete but not checkpoint-verified** because the current worker mode prohibits executing product/database tests and builds. A production external provider is not required for code completeness because the task explicitly requires deterministic/unavailable fallback when credentials are absent.

## Architecture amendments now in force
- TASK section 7.1 requires design-swappable presentation architecture. New CP6/CP7 screens use shared semantic `Screen`, `Card`, `MizanText`, `ChoiceChip`, `PrimaryButton`, and `MizanTextInput` primitives rather than creating screen-local foundational styling systems.
- TASK section 6.1 requires unified integration architecture. Current CP7 code uses capability-specific typed contracts and adapters, normalized provenance, centralized per-capability provider selection, and no generic God API or vendor SDK leakage into core/features.

## Exact next executable action
1. Begin CP8 with the smallest durable offline mutation queue/retry strategy for user-entered check-ins/reflections and integration sync, preserving idempotency and explicit conflict/error state.
2. Add provider retry/reconnect handling around normalized integration ingestion without weakening the CP7 capability boundaries.
3. Verify restart/reload semantics through code/specification work available under the worker policy; leave actual runtime execution evidence for owner validation.
4. Owner path: unlock Windows and complete CP1 narrow-phone Arabic/English interaction verification.
5. Owner path: configure Supabase Auth redirect allow-list, then validate auth/recovery/session/persistence and execute RLS verification.
6. Owner path: run current core/app/plugin typechecks, tests, DB specifications, and required builds before granting CP3/CP4/CP5/CP6/CP7 checkpoint credit.

## Verification record
Previously verified baseline evidence:
- CP1 root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app typecheck PASS and app lint PASS.

Implemented after that baseline and still awaiting owner validation:
- CP2 auth/session/persistence/recovery additions and current migrations/policy tests.
- CP3/CP4/CP5 implementation slices listed above.
- CP6 What If, scenario learning, experiment engine/persistence/surface, Recovery / Save My Day, Cost of Yes, Human ROI, Life Seasons, and Life Debt/Buffer presentation.
- CP7 plugin registry/data requirements, focused integration contracts/adapters, per-capability provider registry, lifecycle/provenance migration, normalized health sync orchestration, provider-swap/new-capability proof, and integration settings surface.
- No product/database test script, cloud test, or build was run by workers for these post-baseline additions, per `automation/TASK.md`.

## Known technical risks / temporary compromises
- CP1 remains blocked on owner-side physical responsive/locale verification.
- Hosted Supabase Auth must allow `mizan://**`, `http://localhost:8087/**`, and the eventual production Web URL before confirmation/recovery can be verified end-to-end.
- Cross-user SQL verification exists but lacks current owner-side execution evidence.
- Post-baseline CP3/CP4/CP5/CP6/CP7 additions remain runtime/type validation pending.
- Offline mutation durability beyond the current screen/session remains CP8 work.
- Recovery mode is deliberately stateless in this slice: skipping/stopping is never converted into a negative event, score, or adherence penalty.
- Cost of Yes retains explicit user-entered weekly time/margin as its current UI path; the CP7 application boundary can now accept a future calendar/time adapter without core or screen-business-logic redesign.
- Human ROI intentionally has no combined numeric ROI score; benefit/effort ratings and time use unlike scales, so collapsing them would create false precision.
- Life Season history begins from migration/backfill or the first later season transition; it does not fabricate historical seasons from before the feature existed.
- Capacity presentation currently uses the supported self-report observation metrics; richer wearable/calendar signals can now enter through CP7 normalization/provider boundaries without vendor-specific feature code.
- No real AI, wearable, calendar, or location provider credentials are configured; deterministic/unavailable adapters preserve the required provider-independent product path and prevent fake production success.
- Full revoke/delete/export handling for imported integration data remains CP10 privacy work; current CP7 disconnect disables lifecycle state and future app-driven sync.
- Moderate npm advisories remain in the supported Expo dependency chain; no prior high/critical advisory was recorded.

## Evidence paths
- `docs/INTEGRATIONS.md`
- `packages/core/src/types.ts`
- `packages/plugins/src/index.ts`
- `packages/plugins/src/registry.ts`
- `packages/plugins/src/registry.test.ts`
- `apps/app/src/integrations/contracts.ts`
- `apps/app/src/integrations/adapters.ts`
- `apps/app/src/integrations/provider-registry.ts`
- `apps/app/src/infrastructure/supabase/integrations.ts`
- `apps/app/src/application/integrations.ts`
- `apps/app/src/app/integrations.tsx`
- `supabase/migrations/0007_integration_architecture.sql`
- `supabase/tests/integration_architecture.sql`
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
