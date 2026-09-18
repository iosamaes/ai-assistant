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
- `supabase/tests/rls_cross_user.sql` covers own-row access, cross-user denial, and feedback/action ownership; `supabase/dev/vertical_slice_fixture.sql` is guarded dev-only fixture data.
- Failure handling separates expired authorization from temporary unavailability and avoids raw backend messages.
- Observation data access supports bounded recent-history reads and atomic batch inserts.
- Action feedback data access loads bounded explicit usefulness history for a concrete action without treating acceptance/completion as benefit evidence.
- Auth redirect allow-list activation remains in `automation/HUMAN_REQUIRED.md`; current CP2 runtime/database verification remains owner-side under the active execution policy.

## CP3 independent progress
- Pure deterministic TypeScript core exists under `packages/core` with unknown-preserving Human State Vector, evidence/freshness confidence, robust personal baseline maturity, temporal windows/Momentum, Life Leverage/One Move ranking, season-relative Balance, Life Debt, Buffer/Fragility, interaction-risk hypotheses, relationship evidence, N-of-1 confidence strengthening, and explicit-outcome feedback learning.
- Deterministic specifications cover sparse/missing/contradictory evidence, outliers, freshness, leverage, balance, capacity, interaction risk, relationship evidence, and feedback learning.
- Current CP3 tests/type checks remain intentionally unexecuted by workers; no PASS claim is made until owner validation.

## CP4 independent progress
- `/check-in` provides a sub-one-minute direct self-report of energy, recovery, mental load, and connection; skipped values remain unknown and are omitted rather than converted to zero.
- Recent persisted observations feed `apps/app/src/application/daily-intelligence.ts`, which derives the Human State Vector at an application boundary; Today renders only evidence-backed state with confidence/evidence counts.
- `apps/app/src/application/daily-recommendation.ts` prepares One Move candidates from first-party actions and current evidence-backed state, suppressing insufficient-confidence candidates and using a conservative bounded cold-start impact prior.
- Today shows One Move only when eligible, explains the supporting signal in Arabic/English, allows alternatives, and records `accepted`, `deferred`, or `declined` action events.
- Explicit 1–5 post-action usefulness feedback persists to `feedback_outcomes`; `apps/app/src/application/action-feedback.ts` maps it to signed personal benefit and uses `@mizan/core` `estimateActionUsefulness`. Acceptance/completion alone never creates benefit evidence.
- `apps/app/src/infrastructure/supabase/pending-action-feedback.ts` now recovers the latest accepted action from the last 7 days that has no feedback row, so the feedback prompt can survive navigation/reload/restart instead of existing only in the active Today session.
- Today keeps pending feedback independent from the currently calculated One Move, allowing a recovered feedback prompt to remain available even when the current recommendation changes.
- Future One Move preparation now loads each first-party action's 90-day explicit personal usefulness estimate. A personal estimate is used only when its confidence is at least `possible`; otherwise the cold-start prior is retained.
- Personal usefulness only nudges expected impact: the signed usefulness estimate is bounded to a maximum `0.15` impact delta and multiplied by its confidence score, so sparse personal feedback cannot dominate the recommendation ranking.
- When personal usefulness is applied, its explicit outcome evidence is included in the recommendation evidence set; action-specific usefulness does not inflate state-derived recommendation confidence.
- Implementation milestone: `c7f6350fc0de75d912b82851e18db505ecf0be68` — pending feedback recovery plus confidence-bounded personal usefulness in One Move ranking.
- These CP4 additions remain owner-validation pending; workers did not run product tests/builds under the current execution policy.

## Exact next executable action
1. Owner path: unlock Windows and complete CP1 true phone-width Arabic/English interaction verification.
2. Owner path: configure the Supabase Auth redirect allow-list from `automation/HUMAN_REQUIRED.md`, then validate auth/recovery/session/persistence/offline paths and run `supabase/tests/rls_cross_user.sql` in the approved validation environment.
3. Owner path: run current core/app typechecks and tests before granting CP3/CP4 checkpoint credit.
4. Worker-safe CP4 path: prevent restart-level duplicate One Move decisions by recognizing a recent already-decided offer/action context before presenting or accepting the same recommendation again, while preserving a clear path for a genuinely new check-in/recommendation cycle.

## Verification record
Previously verified evidence:
- CP1 root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app typecheck PASS and app lint PASS.
- `0fc4fa3b319300403a241d5f31c39e0895962822` — prior verified CP2 RLS verification-script milestone.

Implemented after that verification and still awaiting owner validation:
- CP2 auth/session/persistence/recovery/offline work and action-feedback history access `400f54e3b8f97f40f779745a7fcddda2d51756d4`.
- CP3 Balance `c384e886a22aa888ab29de599eee9202d12c06e2`, Capacity/Interaction Risk `04d5868f92161ad7d4de2537696417474b6fd890`, Learning `28dc70d3e95a0409d253c02ddc2633e5138b9cb5`.
- CP4 check-in `6e5f83928a1bb89d2d24bcd76d93f4398c2557ab`, current-state integration `40f1eab35e55a1f6f9aa0e783e93ccbef9d5db96`, One Move preparation `39f6ac67cda7c20dbcbd9432a50468ad49d1285e`, decision wiring `213bed52e49d96a451b9a4a55d5b74955c6be696`, explicit feedback learning boundary `25167d853f8ad6c65e5f152bfde34b931b400ea4`, feedback UI `cff0775f2b9638b1e922808024fbc60c23969462`, and pending-feedback/personalized-ranking milestone `c7f6350fc0de75d912b82851e18db505ecf0be68`.
- This worker did not run product, database, cloud tests, or builds, per `automation/TASK.md`.

## Known technical risks / temporary compromises
- CP1 remains blocked on owner-side physical responsive/locale verification.
- Hosted Supabase Auth must allow `mizan://**`, `http://localhost:8087/**`, and the eventual production Web URL before confirmation/recovery can be verified end-to-end.
- Offline preference/check-in/action-event/feedback durability beyond the current screen/session remains CP8 work; no durable general sync queue is claimed.
- Cross-user SQL verification and guarded fixture exist but lack current owner-side execution evidence.
- CP3 models and new CP4 UI/application paths remain runtime/type validation pending.
- One Move personalization deliberately remains conservative: fewer than the core's confidence threshold of explicit outcome samples leaves the generic prior unchanged.
- Pending feedback recovery intentionally looks back only 7 days and returns the latest unanswered accepted action; older unanswered acceptances are not surfaced indefinitely.
- Today still prevents duplicate decision taps only within the active screen session; restart-level suppression for an already-decided recommendation is the next worker-safe CP4 task.
- Moderate npm advisories remain in the supported Expo dependency chain; no prior high/critical advisory was recorded.

## Evidence paths
- `docs/cp1-wide.png`
- `docs/cp1-narrow.png` (compact Web evidence only; not accepted as true phone-width proof)
- `supabase/migrations/0001_vertical_slice.sql`
- `supabase/tests/rls_cross_user.sql`
- `supabase/dev/vertical_slice_fixture.sql`
- `apps/app/src/application/check-in.ts`
- `apps/app/src/application/daily-intelligence.ts`
- `apps/app/src/application/daily-recommendation.ts`
- `apps/app/src/application/action-feedback.ts`
- `apps/app/src/infrastructure/supabase/pending-action-feedback.ts`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/infrastructure/supabase/data-access.ts`
- `packages/core/src/engine.ts`
- `packages/core/src/leverage.ts`
- `packages/core/src/balance.ts`
- `packages/core/src/capacity.ts`
- `packages/core/src/learning.ts`
