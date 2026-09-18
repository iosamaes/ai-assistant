# MIZAN Project State

## Current checkpoint
- CP1 — Universal application foundation
- Status: BLOCKED_HUMAN for owner-side CP1/CP2 validation; CP3 and CP4 implementation continue independently on GitHub main.
- Product authority: GitHub `iosamaes/ai-assistant` on `main`.
- Owner-only local mirror/testing copy: `C:\Users\bofo_\Documents\automation\ai assistant`.
- Task digest: `c823e4d1031ac5f3f7230ed4e2de236b4446817a`.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation
- [ ] CP2 — Supabase, auth, ownership, persistence
- [ ] CP3 — MIZAN deterministic intelligence core
- [ ] CP4 — First complete daily life loop
- [ ] CP5 — Insight, explanation, personal learning
- [ ] CP6 — Advanced decision tools
- [ ] CP7 — Plugins and provider boundaries
- [ ] CP8 — Reliability, offline tolerance, sync
- [ ] CP9 — Responsive UX, accessibility, localization, polish
- [ ] CP10 — Security, privacy, owner-data control
- [ ] CP11 — Test matrix, performance, release readiness
- [ ] CP12 — Independent final review and handoff

## CP1 completed / remaining
Completed:
- Universal Expo Router shell with onboarding, Today, settings, auth, recovery/password-update routes.
- Strict TypeScript workspace, shared tokens, responsive safe-area primitive, RTL-aware layout/text, Arabic default and English locale, error boundary, app state.
- Existing evidence shows Web rendering and Android/iOS Metro/Hermes export resolution.

Remaining gate:
- True narrow-phone representative evidence.
- Exercise onboarding -> Today -> settings in Arabic RTL and English at representative widths and fix any concrete defect found.
- Owner-side final CP1 checks after the Windows session is unlocked.

## CP2 independent progress
- Supabase public environment validation, SecureStore-backed universal session storage, typed data access, auth/session/recovery flows, route guarding, password update, and account-specific preference hydration/persistence are implemented.
- `supabase/migrations/0001_vertical_slice.sql` defines profiles, domain preferences, observations, action events, feedback outcomes, and plugin settings with RLS/ownership policies.
- `supabase/migrations/0002_onboarding_context.sql` adds nullable `life_season`, explicit `self_values`, and nullable `privacy_mode`; it was applied to project `olfhjnropdrnujgpidfi` and schema inspection confirmed the columns and constraints.
- `supabase/migrations/0003_domain_baseline_targets.sql` adds nullable `baseline_target_rating` (1–5) to `domain_preferences`; it was applied to project `olfhjnropdrnujgpidfi` and direct schema inspection confirmed the nullable `smallint` column.
- `supabase/tests/rls_cross_user.sql` covers own-row access, cross-user denial, and feedback/action ownership; guarded dev fixture data exists.
- Auth redirect allow-list activation remains in `automation/HUMAN_REQUIRED.md`; runtime/database verification remains owner-side under the active execution policy.

## CP3 independent progress
- Pure deterministic TypeScript core under `packages/core` implements unknown-preserving Human State Vector, evidence/freshness confidence, robust personal baseline maturity, temporal windows/Momentum, Life Leverage/One Move ranking, season-relative Balance, Life Debt, Buffer/Fragility, interaction-risk hypotheses, relationship evidence, N-of-1 confidence strengthening, and explicit-outcome feedback learning.
- `UserTargets` now accepts optional per-domain baseline targets; Balance exposes a baseline target/deviation only when the user supplied one, while untouched domains remain explicitly without a baseline target.
- Deterministic specifications cover sparse/missing/contradictory evidence, outliers, freshness, leverage, balance, capacity, interaction risk, relationship evidence, feedback learning, recommendation-context stability, and optional baseline-target preservation.
- Current CP3 tests/type checks remain intentionally unexecuted by workers; no PASS claim is made until owner validation.

## CP4 independent progress
- `/check-in` provides a sub-one-minute direct self-report of energy, recovery, mental load, and connection; skipped values remain unknown and are omitted rather than converted to zero.
- Recent observations feed the application intelligence boundary and Today renders evidence-backed state with confidence/evidence counts.
- One Move ranking is evidence-aware, conservative during cold start, explainable, and supports accept/defer/decline.
- Explicit 1–5 usefulness feedback persists to `feedback_outcomes`; acceptance/completion alone never creates benefit evidence.
- Pending feedback recovers across restart/login; personalized usefulness affects future ranking only after the core confidence threshold and is bounded to a small impact nudge.
- Restart-level duplicate One Move decisions are suppressed by a stable evidence-context identity while a genuinely new check-in creates a new recommendation cycle.
- Onboarding requires explicit focus domain, life season, at least one self-declared value, and privacy mode; completed onboarding persists those choices and user-owned domain priority weights.
- Onboarding now offers an optional 1–5 sustainable baseline target for every enabled domain. Leaving a domain unset persists `null`; MIZAN does not invent a target for untouched domains.
- Persisted baseline ratings are converted to the core 0–100 scale only when present and are exposed through `UserTargets.dimensionBaselines` and Balance per-domain baseline target/deviation metadata.
- `apps/app/src/application/user-targets.ts` converts persisted season plus enabled-domain weights and any explicit baseline ratings into the core `UserTargets` contract.
- Today derives a conservative 7-day season-relative Balance and evidence-backed Momentum; missing evidence remains unknown.
- Onboarding requires an explicit Spiritual Grounding choice. Enablement is optional; choosing `Not now` is persisted as an explicit disabled plugin setting rather than inferred from missing data.
- The Spiritual Grounding preference is stored in `plugin_settings` under `spiritual-grounding`, can be enabled or removed later from Settings, and never creates a faith/worth score.
- `packages/plugins` exposes `spiritualGroundingPlugin` as an optional first-party compile-time plugin plus `firstPartyPlugins` registry.
- Implementation milestone: `bf0e656b1de10f1ac9fbbd68dbbad2b054474208` — optional per-domain baseline-target capture, persistence migration, UserTargets wiring, and unknown-preserving Balance metadata.
- These CP4 additions remain owner-validation pending; workers did not run product tests/builds under the current execution policy.

## Exact next executable action
1. Owner path: unlock Windows and complete CP1 true phone-width Arabic/English interaction verification.
2. Owner path: configure the Supabase Auth redirect allow-list from `automation/HUMAN_REQUIRED.md`, then validate auth/recovery/session/persistence/offline paths and run `supabase/tests/rls_cross_user.sql` in the approved validation environment.
3. Owner path: run current core/app/plugin typechecks and tests before granting CP3/CP4 checkpoint credit.
4. Worker-safe CP5 path: implement the first Life Map/domain-history surface using existing observations and explicit evidence/confidence, with a useful insufficient-data state and no causal language.
5. Then add the first WHY explanation surface that ranks candidate factors only from available evidence and clearly labels uncertainty/correlation.

## Verification record
Previously verified evidence:
- CP1 root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app typecheck PASS and app lint PASS.

Implemented after that verification and still awaiting owner validation:
- CP2 auth/session/persistence/recovery/offline work and action-feedback history access.
- CP3 Balance, Capacity/Interaction Risk, relationship/feedback learning, recommendation context, and optional baseline-target metadata.
- CP4 check-in, current-state integration, One Move preparation/decision wiring, feedback learning UI, pending-feedback recovery, personalized ranking, restart-level decision suppression, explicit onboarding life context/user targets, optional baseline targets, Today Balance/Momentum, and optional Spiritual Grounding preference/plugin wiring.
- Supabase migration `onboarding_context` was applied successfully to project `olfhjnropdrnujgpidfi`; direct schema reads confirmed `life_season`, `self_values`, `privacy_mode`, and the related constraints.
- Supabase migration `domain_baseline_targets` was applied successfully to project `olfhjnropdrnujgpidfi`; direct schema read confirmed `baseline_target_rating` is nullable `smallint`.
- No product, database test script, cloud test, or build was run by this worker, per `automation/TASK.md`.

## Known technical risks / temporary compromises
- CP1 remains blocked on owner-side physical responsive/locale verification.
- Hosted Supabase Auth must allow `mizan://**`, `http://localhost:8087/**`, and the eventual production Web URL before confirmation/recovery can be verified end-to-end.
- Cross-user SQL verification and guarded fixture exist but lack current owner-side execution evidence.
- CP3 models and new CP4 UI/application paths remain runtime/type validation pending.
- Offline preference/check-in/action-event/feedback durability beyond the current screen/session remains CP8 work; no durable general sync queue is claimed.
- Restart-level One Move suppression is client/query based rather than a database uniqueness constraint; concurrent-device double-submit prevention remains a later hardening concern.
- Balance is a conservative evidence-backed state-distribution signal, not a claim about exact time allocation; any enabled target domain lacking current evidence remains unknown.
- Explicit baseline targets currently appear as optional per-domain target/deviation metadata; the aggregate Balance score still uses season priority distribution rather than silently mixing two different target semantics.
- Spiritual Grounding currently covers explicit module consent/enablement only; user-selected practices and grounding observations remain later module work and must stay non-judgmental and opt-in.
- Moderate npm advisories remain in the supported Expo dependency chain; no prior high/critical advisory was recorded.

## Evidence paths
- `docs/cp1-wide.png`
- `docs/cp1-narrow.png`
- `supabase/migrations/0001_vertical_slice.sql`
- `supabase/migrations/0002_onboarding_context.sql`
- `supabase/migrations/0003_domain_baseline_targets.sql`
- `supabase/tests/rls_cross_user.sql`
- `apps/app/src/application/check-in.ts`
- `apps/app/src/application/daily-intelligence.ts`
- `apps/app/src/application/daily-recommendation.ts`
- `apps/app/src/application/action-feedback.ts`
- `apps/app/src/application/user-targets.ts`
- `apps/app/src/application/spiritual-grounding.ts`
- `apps/app/src/infrastructure/supabase/baseline-targets.ts`
- `apps/app/src/infrastructure/supabase/plugin-settings.ts`
- `apps/app/src/infrastructure/supabase/onboarding-context.ts`
- `apps/app/src/infrastructure/supabase/pending-action-feedback.ts`
- `apps/app/src/infrastructure/supabase/one-move-decision.ts`
- `apps/app/src/app/onboarding.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/app/settings.tsx`
- `packages/core/src/engine.ts`
- `packages/core/src/temporal.ts`
- `packages/core/src/leverage.ts`
- `packages/core/src/balance.ts`
- `packages/core/src/capacity.ts`
- `packages/core/src/learning.ts`
- `packages/core/src/recommendation-context.ts`
- `packages/plugins/src/index.ts`
