# MIZAN Project State

## Current checkpoint
- CP1 — Universal application foundation
- Status: `BLOCKED_HUMAN` for owner-side CP1/CP2 validation; CP3, CP4, and CP5 implementation slices are in place pending owner validation, while CP6 implementation is progressing independently on GitHub `main`.
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
- True narrow-phone representative evidence and Arabic RTL / English interaction verification after the owner unlocks the Windows session.

## CP2 independent progress
- Supabase public environment validation, SecureStore-backed universal session storage, typed data access, auth/session/recovery flows, route guarding, password update, and account-specific preference hydration/persistence are implemented.
- `0001_vertical_slice.sql`, `0002_onboarding_context.sql`, `0003_domain_baseline_targets.sql`, and `0004_invisible_wins.sql` define the current vertical-slice schema, RLS ownership model, onboarding context, optional per-domain baseline targets, and user-owned reflection persistence.
- `0002`, `0003`, and `0004` were applied to project `olfhjnropdrnujgpidfi`; the `reflections` RLS policies were directly inspected after migration.
- `supabase/tests/rls_cross_user.sql` covers own-row access and cross-user denial, including reflection isolation; execution remains owner-validation pending.
- Supabase Auth redirect allow-list activation remains in `automation/HUMAN_REQUIRED.md`.

## CP3 independent progress
- Pure deterministic TypeScript core implements unknown-preserving Human State Vector, evidence/freshness confidence, robust baseline maturity, temporal windows/Momentum, Life Leverage/One Move, season-relative Balance, Life Debt, Buffer/Fragility, interaction-risk hypotheses, relationship evidence, N-of-1 strengthening, and explicit-outcome feedback learning.
- Added `packages/core/src/alignment.ts`: a conservative value-alignment summary that uses only usable evidence-backed momentum, never turns missing signals into zero/alignment, and reports `supported`, `watch`, or `insufficient` without a morality/worth score.
- Added deterministic `alignment.test.ts` specifications for missing evidence, possible drift, and steady/improving evidence. These tests were authored but not run by workers under the current execution policy.

## CP4 independent progress
- `/check-in` captures energy, recovery, mental load, and connection in under one minute; skipped values remain unknown.
- Today renders evidence-backed state, confidence, Balance, Momentum, and an explainable One Move.
- One Move supports accept/defer/decline/alternative and suppresses repeat decisions for the same evidence context after restart/login.
- Explicit 1–5 usefulness feedback persists to `feedback_outcomes`; completion alone never creates benefit evidence.
- Pending feedback recovers across restart/login, and explicit personal usefulness can only make a bounded confidence-weighted recommendation nudge.
- Onboarding persists focus domain, life season, self-declared values, privacy mode, priority weights, optional baseline targets, and optional Spiritual Grounding consent.

## CP5 independent progress
Completed implementation slices:
- Life Map with evidence-backed 28-day history, confidence, and Momentum.
- WHY with ranked supported candidate factors and explicit non-diagnostic/non-causal language.
- Insights with conservative paired-observation associations, evidence counts, windows, confidence, and suppression under sparse evidence.
- Personal Learning from explicit outcome feedback only; bare completion remains adherence evidence, not benefit evidence.
- Personalization Maturity surface driven by core `cold_start` / `learning` / `personalized` evidence stages without a user score.
- Values & Identity alignment uses the user's persisted self-declared values and stored self-report observations; unsupported values remain explicitly insufficient rather than borrowing unrelated productivity data.
- `/value-alignment` is Arabic/English, RTL-aware, exposes confidence/evidence counts, and labels only possible drift rather than judging identity.
- Invisible Wins / reflection capture persists only explicit user-authored entries in the separate `reflections` table. Categories include rest, healthy boundaries, family, relationship repair, disconnecting, health protection, and other; no points, streaks, or productivity score are produced.
- `/invisible-wins` is Arabic/English and RTL-aware, supports intentional save plus recent reflection history, and explains that entries stay outside productivity scoring. The route is registered and exposed from Settings.

CP5 remaining gate:
- Owner-side type/runtime/responsive validation for all CP5 surfaces. Workers have not run product tests/builds under the current execution policy.

## CP6 independent progress
- Added `packages/core/src/scenario.ts` as the first deterministic What If / Digital Twin primitive.
- Scenario projections expose explicit assumptions, bounded delta ranges, current/projected ranges when current state is actually known, evidence source (`personal` or `conservative_prior`), evidence count, confidence, and an overall uncertainty level.
- Unknown current state remains unknown; the simulator never invents a starting value just to render a projection.
- Personal effect estimates override conservative priors only after a minimum evidence/confidence threshold; weak personal evidence falls back to the prior rather than pretending to be personalized.
- Projected state ranges are clamped to the existing 0–100 state scale and are framed as scenario estimates, not guaranteed outcomes.
- Added deterministic `scenario.test.ts` specifications for prior fallback, unknown-state preservation, personal-evidence preference, and clamping. Tests were authored but not run by workers.
- Added `/what-if`, an Arabic/English What If surface wired to the real current Human State Vector and the deterministic scenario engine.
- The first UI slice offers three small reversible scenarios: earlier bedtime, a notification-free focus block, and a short calm walk. Each exposes assumptions, uncertainty, current value when actually known, projected range, source, and evidence count.
- The surface explicitly says that the projection is not a forecast or causal proof and refuses to invent a current value when state evidence is missing.
- Added `packages/core/src/scenario-learning.ts`: personal scenario effects now require an explicit 1–5 outcome plus a later compatible observation, reject invalid/non-subsequent evidence, use bounded robust delta ranges, and carry conservative sample/freshness/consistency confidence.
- Added `scenario-learning.test.ts` specifications covering subsequent-evidence requirements, repeated personal evidence, and one-off evidence remaining below the simulator's personal-effect threshold. These tests were authored but not run by workers.
- Added persisted trial evidence reading from `action_events`/`feedback_outcomes` using the explicit `what_if_trial` context contract plus baseline values; no completion-only record can become benefit evidence.
- Added `apps/app/src/application/scenario-learning.ts` to pair each explicit trial outcome with the first compatible later observation inside a bounded 14-day follow-up window and derive component-specific personal effects.
- `/what-if` now loads those qualified personal effects and supplies them to the simulator; if the query is unavailable or evidence is insufficient, the UI safely remains on conservative priors rather than fabricating personalization.
- The scenario trial producer is intentionally not faked here: the upcoming voluntary Experiment Engine is the real user-facing source for consented trial/action records and outcome collection.
- The route is registered with Expo Router and exposed from Settings.

## Exact next executable action
1. Worker-safe CP6 path: implement the voluntary Experiment Engine with a clear hypothesis, duration, observable outcome, explicit consent, safe trial/action persistence, outcome capture, simple comparison logic, and limitations framing; use it as the real producer for `what_if_trial` evidence where a scenario experiment maps cleanly.
2. Then implement Recovery / Save My Day with a low-cognitive-load sequence and no punishment for skipping/stopping.
3. Owner path: unlock Windows and complete CP1 narrow-phone Arabic/English interaction verification.
4. Owner path: configure Supabase Auth redirect allow-list from `automation/HUMAN_REQUIRED.md`, then validate auth/recovery/session/persistence and execute RLS verification.
5. Owner path: run current core/app/plugin typechecks and tests before granting CP3/CP4/CP5/CP6 checkpoint credit.

## Verification record
Previously verified evidence:
- CP1 root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app typecheck PASS and app lint PASS.

Implemented after that verification and still awaiting owner validation:
- CP2 auth/session/persistence/recovery work and current migrations/policy tests.
- CP3 Balance, Capacity/Interaction Risk, relationship/feedback learning, recommendation-context stability, optional baseline targets, and value-alignment core/specifications.
- CP4 check-in, state integration, One Move decision/feedback loop, onboarding context/targets, Balance/Momentum, Spiritual Grounding preference.
- CP5 Life Map, WHY, Insights, Personal Learning, Personalization Maturity, Values & Identity alignment, and Invisible Wins/reflection capture.
- CP6 deterministic What If scenario engine/specifications, qualified personal-effect learning/specifications, persisted trial-evidence reader/application bridge, and the Arabic/English `/what-if` surface wired to current state plus qualified personal effects.
- Supabase migration `invisible_wins` was applied successfully to project `olfhjnropdrnujgpidfi`; direct policy inspection confirmed SELECT/INSERT/UPDATE/DELETE own-row policies on `public.reflections`.
- Reflection RLS isolation checks were added to `supabase/tests/rls_cross_user.sql` but were not executed by the worker.
- No product/database test script, cloud test, or build was run by workers for these post-baseline additions, per `automation/TASK.md`.

## Known technical risks / temporary compromises
- CP1 remains blocked on owner-side physical responsive/locale verification.
- Hosted Supabase Auth must allow `mizan://**`, `http://localhost:8087/**`, and the eventual production Web URL before confirmation/recovery can be verified end-to-end.
- Cross-user SQL verification exists but lacks current owner-side execution evidence.
- CP3/CP4/CP5/CP6 additions after the earlier verification baseline remain runtime/type validation pending.
- Offline mutation durability beyond the current screen/session remains CP8 work; Invisible Wins currently requires live persistence to save.
- Restart-level One Move suppression is query/context based rather than a DB uniqueness constraint; concurrent-device double-submit prevention remains later hardening.
- Spiritual Grounding currently covers consent/enablement only; selected practices and grounding observations remain later module work.
- Insights is intentionally a small association slice, not a general causal graph.
- Value alignment intentionally leaves values without a direct observation signal unknown rather than borrowing unrelated productivity data.
- Invisible Wins are intentionally stored outside `observations` and `action_events`; they are reflection history, not scoring evidence.
- What If personal estimates remain absent until a real consented trial producer records `what_if_trial` action context, an explicit outcome, and a later compatible observation; conservative priors remain the safe fallback.
- Moderate npm advisories remain in the supported Expo dependency chain; no prior high/critical advisory was recorded.

## Evidence paths
- `docs/cp1-wide.png`
- `docs/cp1-narrow.png`
- `supabase/migrations/0001_vertical_slice.sql`
- `supabase/migrations/0002_onboarding_context.sql`
- `supabase/migrations/0003_domain_baseline_targets.sql`
- `supabase/migrations/0004_invisible_wins.sql`
- `supabase/tests/rls_cross_user.sql`
- `apps/app/src/application/check-in.ts`
- `apps/app/src/application/daily-intelligence.ts`
- `apps/app/src/application/daily-recommendation.ts`
- `apps/app/src/application/action-feedback.ts`
- `apps/app/src/application/personal-learning.ts`
- `apps/app/src/application/user-targets.ts`
- `apps/app/src/application/spiritual-grounding.ts`
- `apps/app/src/application/life-map.ts`
- `apps/app/src/application/why.ts`
- `apps/app/src/application/insights.ts`
- `apps/app/src/application/value-alignment.ts`
- `apps/app/src/application/scenario-learning.ts`
- `apps/app/src/infrastructure/supabase/reflections.ts`
- `apps/app/src/infrastructure/supabase/scenario-trial-data.ts`
- `apps/app/src/app/value-alignment.tsx`
- `apps/app/src/app/invisible-wins.tsx`
- `apps/app/src/app/what-if.tsx`
- `apps/app/src/app/settings.tsx`
- `packages/core/src/alignment.ts`
- `packages/core/src/alignment.test.ts`
- `packages/core/src/scenario.ts`
- `packages/core/src/scenario.test.ts`
- `packages/core/src/scenario-learning.ts`
- `packages/core/src/scenario-learning.test.ts`
- `packages/core/src/engine.ts`
- `packages/core/src/temporal.ts`
- `packages/core/src/leverage.ts`
- `packages/core/src/balance.ts`
- `packages/core/src/capacity.ts`
- `packages/core/src/learning.ts`
- `packages/core/src/recommendation-context.ts`
- `packages/plugins/src/index.ts`
