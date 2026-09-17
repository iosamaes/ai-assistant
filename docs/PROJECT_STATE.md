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
- Observation data access now supports bounded recent-history reads and atomic batch inserts.
- Auth redirect allow-list activation remains in `automation/HUMAN_REQUIRED.md`; current CP2 runtime/database verification remains owner-side under the active execution policy.

## CP3 independent progress
- Pure deterministic TypeScript core exists under `packages/core` with unknown-preserving Human State Vector, evidence/freshness confidence, robust personal baseline maturity, temporal windows/Momentum, Life Leverage/One Move ranking, season-relative Balance, Life Debt, Buffer/Fragility, interaction-risk hypotheses, relationship evidence, N-of-1 confidence strengthening, and explicit-outcome feedback learning.
- Deterministic specifications cover sparse/missing/contradictory evidence, outliers, freshness, leverage, balance, capacity, interaction risk, relationship evidence, and feedback learning.
- Current CP3 tests/type checks remain intentionally unexecuted by workers; no PASS claim is made until owner validation.

## CP4 independent progress
- Added `/check-in`, linked from Today, for a sub-one-minute direct self-report of energy, recovery, mental load, and connection.
- Every check-in signal is optional. Unknown/skipped values are omitted completely; they are never converted to zero.
- Answered 1–5 values normalize deterministically to 0–100 at an application-owned boundary and persist together as user-owned observations.
- Check-in UI has Arabic/English copy, RTL-aware layout, safe disabled/save states, temporary-unavailable copy, and an expired-session refresh path.
- Added recent-observation loading and `apps/app/src/application/daily-intelligence.ts`, which maps persisted rows into canonical `@mizan/core` observations and derives the Human State Vector without putting Supabase in UI components.
- Today now renders only state components that have actual values, including confidence language and evidence count; missing state remains absent instead of displaying fabricated zeroes. Conservative inferred overload risk appears only when the core has the required evidence.
- Added the check-in route explicitly to the root Stack.
- Implementation commits: `6e5f83928a1bb89d2d24bcd76d93f4398c2557ab` (persisted quick check-in) and `40f1eab35e55a1f6f9aa0e783e93ccbef9d5db96` (evidence-backed current state on Today).
- These CP4 additions remain owner-validation pending; workers did not run product tests/builds under the current execution policy.

## Exact next executable action
1. Owner path: unlock Windows and complete CP1 true phone-width Arabic/English interaction verification.
2. Owner path: configure the Supabase Auth redirect allow-list from `automation/HUMAN_REQUIRED.md`, then validate auth/recovery/session/persistence/offline paths and run `supabase/tests/rls_cross_user.sql` in the approved validation environment.
3. Owner path: run current core/app typechecks and tests before granting CP3/CP4 checkpoint credit.
4. Worker-safe CP4 path: build conservative One Move candidate preparation from the already-derived state and registered first-party actions, but emit no recommendation when evidence/confidence is insufficient; then wire accept/defer/decline action events without claiming completion benefit.

## Verification record
Previously verified evidence:
- CP1 root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app typecheck PASS and app lint PASS.
- `0fc4fa3b319300403a241d5f31c39e0895962822` — prior verified CP2 RLS verification-script milestone.

Implemented after that verification and still awaiting owner validation:
- CP2 auth/session/persistence/recovery/offline work.
- CP3 Balance `c384e886a22aa888ab29de599eee9202d12c06e2`, Capacity/Interaction Risk `04d5868f92161ad7d4de2537696417474b6fd890`, Learning `28dc70d3e95a0409d253c02ddc2633e5138b9cb5`.
- CP4 check-in `6e5f83928a1bb89d2d24bcd76d93f4398c2557ab` and current-state integration `40f1eab35e55a1f6f9aa0e783e93ccbef9d5db96`.
- This worker did not run product, database, cloud tests, or builds, per `automation/TASK.md`.

## Known technical risks / temporary compromises
- CP1 remains blocked on owner-side physical responsive/locale verification.
- Hosted Supabase Auth must allow `mizan://**`, `http://localhost:8087/**`, and the eventual production Web URL before confirmation/recovery can be verified end-to-end.
- Offline preference/check-in durability beyond the current screen/session remains CP8 work; no durable general sync queue is claimed.
- Cross-user SQL verification and guarded fixture exist but lack current owner-side execution evidence.
- CP3 models and new CP4 UI/application paths remain runtime/type validation pending.
- One Move is deliberately not shown yet from check-in data alone; the next implementation must require explicit evidence/confidence and must not fabricate identity alignment or causal benefit.
- Moderate npm advisories remain in the supported Expo dependency chain; no prior high/critical advisory was recorded.

## Evidence paths
- `docs/cp1-wide.png`
- `docs/cp1-narrow.png` (compact Web evidence only; not accepted as true phone-width proof)
- `supabase/migrations/0001_vertical_slice.sql`
- `supabase/tests/rls_cross_user.sql`
- `supabase/dev/vertical_slice_fixture.sql`
- `apps/app/src/application/check-in.ts`
- `apps/app/src/application/daily-intelligence.ts`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/infrastructure/supabase/data-access.ts`
- `packages/core/src/engine.ts`
- `packages/core/src/leverage.ts`
- `packages/core/src/balance.ts`
- `packages/core/src/capacity.ts`
- `packages/core/src/learning.ts`
