# MIZAN Project State

## Current checkpoint
- CP1 — Universal application foundation
- Status: BLOCKED_HUMAN (CP2 validation pending; CP3 and independent CP4 implementation progressing)
- Product authority: GitHub `iosamaes/ai-assistant` on `main`
- Owner-only local mirror/testing copy: `C:\Users\bofo_\Documents\automation\ai assistant`
- Task digest: `c823e4d1031ac5f3f7230ed4e2de236b4446817a`

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
- Universal Expo Router shell with real onboarding, Today, settings, auth, recovery/password-update routes.
- Strict TypeScript workspace, shared tokens, responsive safe-area primitive, RTL-aware layout/text, Arabic default and English locale, error boundary, app state.
- Existing evidence shows Web rendering and Android/iOS Metro/Hermes export resolution.

Remaining gate:
- True narrow-phone representative evidence.
- Exercise onboarding -> Today -> settings in Arabic RTL and English at representative widths; fix any concrete defect found.
- Owner-side final CP1 checks after the Windows session is unlocked.

## CP2 independent progress
- Supabase public environment validation, SecureStore-backed universal session storage, typed data-access boundary, auth/session/recovery flows, route guarding, password update, and account-specific preference hydration/persistence are implemented.
- `supabase/migrations/0001_vertical_slice.sql` defines profiles, domain preferences, observations, action events, feedback outcomes, and plugin settings with RLS/ownership policies; prior live inspection confirmed the six tables and policies on project `olfhjnropdrnujgpidfi`.
- `supabase/migrations/0002_onboarding_context.sql` extends the user-owned profile with nullable `life_season`, explicit `self_values`, and nullable `privacy_mode`; the migration was applied to the named Supabase project and schema inspection confirmed the three columns plus the season/privacy constraints.
- `supabase/tests/rls_cross_user.sql` covers own-row access, cross-user denial, and feedback/action ownership; `supabase/dev/vertical_slice_fixture.sql` is guarded dev-only fixture data.
- Failure handling separates expired authorization from temporary unavailability and avoids raw backend messages.
- Observation data access supports bounded recent-history reads and atomic batch inserts.
- Action feedback data access loads bounded explicit usefulness history for a concrete action without treating acceptance/completion as benefit evidence.
- Auth redirect allow-list activation remains in `automation/HUMAN_REQUIRED.md`; current CP2 runtime/database verification remains owner-side under the active execution policy.

## CP3 independent progress
- Pure deterministic TypeScript core exists under `packages/core` with unknown-preserving Human State Vector, evidence/freshness confidence, robust personal baseline maturity, temporal windows/Momentum, Life Leverage/One Move ranking, season-relative Balance, Life Debt, Buffer/Fragility, interaction-risk hypotheses, relationship evidence, N-of-1 confidence strengthening, and explicit-outcome feedback learning.
- Deterministic specifications cover sparse/missing/contradictory evidence, outliers, freshness, leverage, balance, capacity, interaction risk, relationship evidence, and feedback learning.
- `packages/core/src/recommendation-context.ts` now derives a deterministic evidence-context identity used by the daily loop; its specification proves ordering stability and that new persisted evidence creates a new context.
- Current CP3 tests/type checks remain intentionally unexecuted by workers; no PASS claim is made until owner validation.

## CP4 independent progress
- `/check-in` provides a sub-one-minute direct self-report of energy, recovery, mental load, and connection; skipped values remain unknown and are omitted rather than converted to zero.
- Recent persisted observations feed `apps/app/src/application/daily-intelligence.ts`, which derives the Human State Vector at an application boundary; Today renders only evidence-backed state with confidence/evidence counts.
- `apps/app/src/application/daily-recommendation.ts` prepares One Move candidates from first-party actions and current evidence-backed state, suppressing insufficient-confidence candidates and using a conservative bounded cold-start impact prior.
- Today shows One Move only when eligible, explains the supporting signal in Arabic/English, allows alternatives, and records `accepted`, `deferred`, or `declined` action events.
- Explicit 1–5 post-action usefulness feedback persists to `feedback_outcomes`; `apps/app/src/application/action-feedback.ts` maps it to signed personal benefit and uses `@mizan/core` `estimateActionUsefulness`. Acceptance/completion alone never creates benefit evidence.
- `apps/app/src/infrastructure/supabase/pending-action-feedback.ts` recovers the latest accepted action from the last 7 days that has no feedback row, so the feedback prompt survives navigation/reload/restart instead of existing only in the active Today session.
- Today keeps pending feedback independent from the currently calculated One Move, allowing a recovered feedback prompt to remain available even when the current recommendation changes.
- Future One Move preparation loads each first-party action's 90-day explicit personal usefulness estimate. A personal estimate is used only when its confidence is at least `possible`; otherwise the cold-start prior is retained.
- Personal usefulness only nudges expected impact: the signed usefulness estimate is bounded to a maximum `0.15` impact delta and multiplied by its confidence score, so sparse personal feedback cannot dominate recommendation ranking.
- When personal usefulness is applied, its explicit outcome evidence is included in the recommendation evidence set; action-specific usefulness does not inflate state-derived recommendation confidence.
- Restart-level duplicate One Move decisions are now suppressed by a stable evidence-context identity. The decision context is stored in `action_events.context`; recommendation loading suppresses an already-decided context after reload/restart, and the write path rechecks the context before inserting to prevent duplicate acceptance/defer/decline writes.
- A genuinely new persisted check-in changes the evidence-context identity, so the same action can be considered again in a new recommendation cycle instead of being suppressed forever.
- Onboarding now requires explicit user choices for a focus domain, life season, at least one self-declared value, and a privacy mode before completion; no season/priority default is fabricated.
- Completed onboarding persists life season, self-declared values, privacy choice, and user-owned domain priority weights. Pre-completion domain edits use neutral weights so the old fixed domain order is not silently interpreted as a personal priority.
- `apps/app/src/application/user-targets.ts` converts persisted season plus enabled domain weights into the core `UserTargets` contract, establishing the application boundary needed for season-relative Balance.
- `apps/app/src/application/daily-intelligence.ts` now consumes those user targets with the recent observation history to derive a 7-day evidence-backed Balance input. A target dimension with no current numeric evidence remains `null`, so `calculateBalance` withholds the score rather than substituting zero.
- The same Today intelligence boundary derives energy, recovery, mental-load, and connection Momentum from the existing 7-day-vs-prior-7-day temporal model. Unknown or `insufficient` trends are suppressed instead of being presented as direction claims.
- Today now exposes a bilingual Balance & Momentum card with confidence and evidence counts. The Balance copy explicitly states that missing domains remain unknown; Momentum appears only for evidence-backed trends.
- Implementation milestones: `0df635891787d63f4157612fd546a6996bd43f29` — pending feedback recovery/personalized ranking/decision suppression; `5632c6f2e501f76ad881ea0e1ba5a1461935121b` — explicit onboarding life context and user targets; `843b7e3bf4c1425e63076b78e143ea5e7a201afe` — Today season-relative Balance and evidence-backed Momentum wiring.
- These CP4 additions remain owner-validation pending; workers did not run product tests/builds under the current execution policy.

## Exact next executable action
1. Owner path: unlock Windows and complete CP1 true phone-width Arabic/English interaction verification.
2. Owner path: configure the Supabase Auth redirect allow-list from `automation/HUMAN_REQUIRED.md`, then validate auth/recovery/session/persistence/offline paths and run `supabase/tests/rls_cross_user.sql` in the approved validation environment.
3. Owner path: run current core/app typechecks and tests before granting CP3/CP4 checkpoint credit.
4. Worker-safe CP4 path: complete the remaining optional Spiritual Grounding onboarding choice so participation is explicit, removable, and never inferred from missing data; persist that choice through the existing plugin-settings boundary without introducing a faith score or compulsory tracking.

## Verification record
Previously verified evidence:
- CP1 root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app typecheck PASS and app lint PASS.
- `0fc4fa3b319300403a241d5f31c39e0895962822` — prior verified CP2 RLS verification-script milestone.

Implemented after that verification and still awaiting owner validation:
- CP2 auth/session/persistence/recovery/offline work and action-feedback history access `400f54e3b8f97f40f779745a7fcddda2d51756d4`.
- CP3 Balance `c384e886a22aa888ab29de599eee9202d12c06e2`, Capacity/Interaction Risk `04d5868f92161ad7d4de2537696417474b6fd890`, Learning `28dc70d3e95a0409d253c02ddc2633e5138b9cb5`.
- CP4 check-in `6e5f83928a1bb89d2d24bcd76d93f4398c2557ab`, current-state integration `40f1eab35e55a1f6f9aa0e783e93ccbef9d5db96`, One Move preparation `39f6ac67cda7c20dbcbd9432a50468ad49d1285e`, decision wiring `213bed52e49d96a451b9a4a55d5b74955c6be696`, explicit feedback learning boundary `25167d853f8ad6c65e5f152bfde34b931b400ea4`, feedback UI `cff0775f2b9638b1e922808024fbc60c23969462`, pending-feedback/personalized-ranking `c7f6350fc0de75d912b82851e18db505ecf0be68`, restart-level decision suppression `0df635891787d63f4157612fd546a6996bd43f29`, onboarding life context/user targets `5632c6f2e501f76ad881ea0e1ba5a1461935121b`, and Today Balance/Momentum `843b7e3bf4c1425e63076b78e143ea5e7a201afe`.
- Supabase migration `onboarding_context` was applied successfully to project `olfhjnropdrnujgpidfi`; direct schema reads confirmed `life_season`, `self_values`, `privacy_mode`, and both new check constraints.
- This worker did not run product, database test scripts, cloud tests, or builds, per `automation/TASK.md`.

## Known technical risks / temporary compromises
- CP1 remains blocked on owner-side physical responsive/locale verification.
- Hosted Supabase Auth must allow `mizan://**`, `http://localhost:8087/**`, and the eventual production Web URL before confirmation/recovery can be verified end-to-end.
- Offline preference/check-in/action-event/feedback durability beyond the current screen/session remains CP8 work; no durable general sync queue is claimed.
- Cross-user SQL verification and guarded fixture exist but lack current owner-side execution evidence.
- CP3 models and new CP4 UI/application paths remain runtime/type validation pending.
- One Move personalization deliberately remains conservative: fewer than the core's confidence threshold of explicit outcome samples leaves the generic prior unchanged.
- Pending feedback recovery intentionally looks back only 7 days and returns the latest unanswered accepted action; older unanswered acceptances are not surfaced indefinitely.
- Restart-level One Move suppression relies on the existing client-side check/query plus persisted context and is not a database-level uniqueness constraint; concurrent-device double-submit prevention remains a later hardening concern.
- Balance currently compares normalized recent domain-mapped evidence against the user's season priority distribution; it is a conservative state-distribution signal, not a claim about exact time allocation. Any enabled target domain lacking current evidence makes the Balance score unknown.
- Onboarding's life-season/value/privacy controls and the new Balance/Momentum Today surface are implemented but remain unexecuted by workers under the current validation policy; optional spiritual-module choice is still pending.
- Moderate npm advisories remain in the supported Expo dependency chain; no prior high/critical advisory was recorded.

## Evidence paths
- `docs/cp1-wide.png`
- `docs/cp1-narrow.png` (compact Web evidence only; not accepted as true phone-width proof)
- `supabase/migrations/0001_vertical_slice.sql`
- `supabase/migrations/0002_onboarding_context.sql`
- `supabase/tests/rls_cross_user.sql`
- `supabase/dev/vertical_slice_fixture.sql`
- `apps/app/src/application/check-in.ts`
- `apps/app/src/application/daily-intelligence.ts`
- `apps/app/src/application/daily-recommendation.ts`
- `apps/app/src/application/action-feedback.ts`
- `apps/app/src/application/user-targets.ts`
- `apps/app/src/infrastructure/supabase/onboarding-context.ts`
- `apps/app/src/infrastructure/supabase/pending-action-feedback.ts`
- `apps/app/src/infrastructure/supabase/one-move-decision.ts`
- `apps/app/src/app/onboarding.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/infrastructure/supabase/data-access.ts`
- `packages/core/src/engine.ts`
- `packages/core/src/temporal.ts`
- `packages/core/src/leverage.ts`
- `packages/core/src/balance.ts`
- `packages/core/src/capacity.ts`
- `packages/core/src/learning.ts`
- `packages/core/src/recommendation-context.ts`
- `packages/core/src/recommendation-context.test.ts`
