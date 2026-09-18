# MIZAN Project State

## Current checkpoint
- CP1 — Universal application foundation
- Status: `BLOCKED_HUMAN` for owner-side CP1/CP2 validation; CP3, CP4, and CP5 implementation continue independently on GitHub `main`.
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
- `supabase/migrations/0003_domain_baseline_targets.sql` adds nullable `baseline_target_rating` (1–5) to `domain_preferences`; it was applied and directly inspected.
- `supabase/tests/rls_cross_user.sql` covers own-row access, cross-user denial, and feedback/action ownership; guarded dev fixture data exists.
- Auth redirect allow-list activation remains in `automation/HUMAN_REQUIRED.md`; runtime/database verification remains owner-side under the active execution policy.

## CP3 independent progress
- Pure deterministic TypeScript core under `packages/core` implements unknown-preserving Human State Vector, evidence/freshness confidence, robust personal baseline maturity, temporal windows/Momentum, Life Leverage/One Move ranking, season-relative Balance, Life Debt, Buffer/Fragility, interaction-risk hypotheses, relationship evidence, N-of-1 confidence strengthening, and explicit-outcome feedback learning.
- `UserTargets` accepts optional per-domain baseline targets; untouched domains remain explicitly without a baseline target.
- Deterministic specifications cover sparse/missing/contradictory evidence, outliers, freshness, leverage, balance, capacity, interaction risk, relationship evidence, feedback learning, recommendation-context stability, and optional baseline-target preservation.
- Current CP3 tests/type checks remain intentionally unexecuted by workers; no PASS claim is made until owner validation.

## CP4 independent progress
- `/check-in` provides a sub-one-minute direct self-report of energy, recovery, mental load, and connection; skipped values remain unknown and are omitted rather than converted to zero.
- Recent observations feed the application intelligence boundary and Today renders evidence-backed state with confidence/evidence counts.
- One Move ranking is evidence-aware, conservative during cold start, explainable, supports accept/defer/decline, and suppresses restart-level duplicate decisions for the same evidence context.
- Explicit 1–5 usefulness feedback persists to `feedback_outcomes`; acceptance/completion alone never creates benefit evidence.
- Pending feedback recovers across restart/login; personalized usefulness affects future ranking only after the core confidence threshold and is bounded to a small impact nudge.
- Onboarding persists focus domain, life season, self-declared values, privacy mode, domain priority weights, optional per-domain sustainable baseline targets, and an explicit optional Spiritual Grounding choice.
- Today derives conservative season-relative Balance and evidence-backed Momentum; missing evidence remains unknown.
- `packages/plugins` exposes optional first-party Spiritual Grounding through the compile-time registry without faith/worth scoring.
- CP4 additions remain owner-validation pending; workers did not run product tests/builds under the current execution policy.

## CP5 independent progress
- Life Map is backed only by stored observations; enabled domains remain visible even without evidence and missing metrics remain unknown.
- Numeric history uses the deterministic temporal engine for 28-day medians, evidence-count/freshness confidence, and evidence-backed Momentum, including lower-is-better mental load.
- `/life-map` provides Arabic/English RTL-aware loading/error/insufficient-data states plus latest value, 28-day median, evidence count/confidence, and non-causal trend language.
- WHY ranks only supported Human State signals with usable confidence and real evidence windows. `/why` states clearly that candidate factors are neither diagnoses nor proven causes.
- `apps/app/src/application/insights.ts` conservatively pairs supported observation metrics only when readings are within six hours, evaluates the existing core relationship-hypothesis contract, suppresses relationships below the minimum evidence threshold, and never fabricates missing values.
- `/insights` provides Arabic/English RTL-aware loading/error/insufficient-evidence states. Surfaced relationships expose interpretation (`association` or `personal hypothesis`), confidence, paired sample count, evidence window, and the signed association indicator with explicit non-causal caveats.
- Initial surfaced relationships are deliberately limited to meaningful existing signals: recovery↔energy, mental load↔energy, connection↔energy, and mental load↔perceived control. The application does not claim broader graph coverage yet.
- Registered `/insights` and exposed it from Settings alongside Life Map and WHY without adding a new navigation framework.
- Added `apps/app/src/application/personal-learning.ts`: each foundational action loads its explicit 90-day outcome-feedback history and recomputes the existing deterministic `estimateActionUsefulness` contract, preserving sample count, recency-weighted confidence, and evidence semantics.
- Added `/personal-learning`: Arabic/English RTL-aware loading/error/empty states plus per-action explicit outcome count, confidence, freshest evidence, a conservative helpful/neutral/not-helpful personal-response description, and the latest explicit 1–5 outcome reports/notes.
- The Personal Learning surface explicitly states that completing an action or tapping Done is adherence evidence only and never raises the benefit estimate; the core `learning.test.ts` already contains a deterministic specification for this rule.
- Registered `/personal-learning` and exposed it from Settings without a new navigation abstraction.
- Added `/personalization`: Arabic/English maturity surface driven directly by the existing core `HumanStateVector.maturity` states (`cold_start`, `learning`, `personalized`). It explicitly says maturity is not a score, can regress as evidence ages, and never converts missing evidence into certainty.
- Exposed Personalization Maturity from Settings. No new scoring or duplicated thresholds were introduced; the UI renders the existing core maturity contract.
- No separate unit test was added for this display-only mapping because it introduces no new algorithm; the core maturity thresholds/behavior remain the relevant deterministic specification. Runtime/type validation is still owner-side under the active execution policy.
- Implementation milestones: `701ef8a9d3ca747ba3c44f9fd19e6fb88815f07e` — inspectable personal action-learning history; `b8a0e4acb9b4415e8e8dd8500c925127aad1f275` + `d14bacf5018d9f918dd72d38e9011bd40ab54576` — visible personalization maturity progression and Settings entry.
- CP5 remains incomplete: next worker-safe work is identity/value alignment, then Invisible Wins without causal, moral, or productivity overclaim.
- No tests/builds were run by this worker; CP5 additions remain owner-validation pending under the active execution policy.

## Exact next executable action
1. Owner path: unlock Windows and complete CP1 true phone-width Arabic/English interaction verification.
2. Owner path: configure the Supabase Auth redirect allow-list from `automation/HUMAN_REQUIRED.md`, then validate auth/recovery/session/persistence/offline paths and run `supabase/tests/rls_cross_user.sql` in the approved validation environment.
3. Owner path: run current core/app/plugin typechecks and tests before granting CP3/CP4/CP5 checkpoint credit.
4. Worker-safe CP5 path: implement identity/value alignment against the user's already-persisted self-declared values and observed/self-reported evidence, phrased neutrally with explicit confidence/unknown handling.
5. Then implement Invisible Wins/reflection capture without gamification or productivity scoring.

## Verification record
Previously verified evidence:
- CP1 root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app typecheck PASS and app lint PASS.

Implemented after that verification and still awaiting owner validation:
- CP2 auth/session/persistence/recovery/offline work and action-feedback history access.
- CP3 Balance, Capacity/Interaction Risk, relationship/feedback learning, recommendation context, and optional baseline-target metadata.
- CP4 check-in, current-state integration, One Move decision/feedback learning, onboarding life context/user targets, baseline targets, Balance/Momentum, and optional Spiritual Grounding preference/plugin wiring.
- CP5 Life Map, WHY, evidence-backed Insights/pattern history, inspectable personal action-learning history, and Personalization Maturity surface.
- Supabase migrations `onboarding_context` and `domain_baseline_targets` were applied successfully and directly inspected.
- No product, database test script, cloud test, or build was run by this worker, per `automation/TASK.md`.

## Known technical risks / temporary compromises
- CP1 remains blocked on owner-side physical responsive/locale verification.
- Hosted Supabase Auth must allow `mizan://**`, `http://localhost:8087/**`, and the eventual production Web URL before confirmation/recovery can be verified end-to-end.
- Cross-user SQL verification and guarded fixture exist but lack current owner-side execution evidence.
- CP3/CP4 models and CP5 Life Map/WHY/Insights/Personal Learning/Personalization paths remain runtime/type validation pending.
- Offline preference/check-in/action-event/feedback durability beyond the current screen/session remains CP8 work; no durable general sync queue is claimed.
- Restart-level One Move suppression is client/query based rather than a database uniqueness constraint; concurrent-device double-submit prevention remains a later hardening concern.
- Balance is a conservative evidence-backed state-distribution signal, not a claim about exact time allocation; any enabled target domain lacking current evidence remains unknown.
- Spiritual Grounding currently covers explicit module consent/enablement only; user-selected practices and grounding observations remain later module work and must stay non-judgmental and opt-in.
- Life Map currently summarizes only supported numeric observation metrics already present in the observation stream; unsupported or absent domain signals remain visibly unknown rather than inferred.
- WHY ranks current evidence-backed concern signals; it does not claim to identify causes.
- Insights currently pairs selected numeric observations within a six-hour window and relies on the core evidence threshold; it is an intentionally small first graph slice, not a general causal model.
- Personal Learning currently covers the foundational first-party actions and explicit usefulness feedback only; bare action completions are intentionally excluded from benefit history/estimates.
- Personalization Maturity currently exposes the core evidence stage at product level; it does not claim that every metric is individually personalized and still needs owner-side responsive/runtime verification.
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
- `apps/app/src/application/personal-learning.ts`
- `apps/app/src/application/user-targets.ts`
- `apps/app/src/application/spiritual-grounding.ts`
- `apps/app/src/application/life-map.ts`
- `apps/app/src/application/why.ts`
- `apps/app/src/application/insights.ts`
- `apps/app/src/infrastructure/supabase/data-access.ts`
- `apps/app/src/infrastructure/supabase/baseline-targets.ts`
- `apps/app/src/infrastructure/supabase/plugin-settings.ts`
- `apps/app/src/infrastructure/supabase/onboarding-context.ts`
- `apps/app/src/infrastructure/supabase/pending-action-feedback.ts`
- `apps/app/src/infrastructure/supabase/one-move-decision.ts`
- `apps/app/src/app/onboarding.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/app/life-map.tsx`
- `apps/app/src/app/why.tsx`
- `apps/app/src/app/insights.tsx`
- `apps/app/src/app/personal-learning.tsx`
- `apps/app/src/app/personalization.tsx`
- `apps/app/src/app/settings.tsx`
- `packages/core/src/engine.ts`
- `packages/core/src/temporal.ts`
- `packages/core/src/leverage.ts`
- `packages/core/src/balance.ts`
- `packages/core/src/capacity.ts`
- `packages/core/src/learning.ts`
- `packages/core/src/recommendation-context.ts`
- `packages/plugins/src/index.ts`
