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

## CP0 verification
- Architecture, domain vocabulary, first vertical slice, provider/plugin boundaries, entity ownership, RLS intent, and deterministic fixture strategy are documented.
- Established baseline: Expo 57 / React Native 0.86 / React 19.2 / React Native Web 0.21.

## CP1 progress and remaining gate
Completed:
- Universal Expo Router shell with real onboarding, Today, settings, auth, and password-update routes.
- Strict TypeScript workspace, shared design tokens, responsive safe-area primitive, RTL-aware text/layout, Arabic default plus English locale, error boundary, and app-level state.
- Existing evidence shows Web render and Android/iOS Metro/Hermes export resolution.

Remaining:
- True narrow-phone representative evidence.
- Exercise onboarding -> Today -> settings in Arabic RTL and English at representative widths and fix any concrete defect found.
- Owner-side final CP1 gate checks after the Windows session is unlocked.

## CP2 independent progress while CP1 is human-blocked
- Supabase public environment validation, Expo SecureStore-backed universal session storage, and typed data-access boundary are present.
- `supabase/migrations/0001_vertical_slice.sql` defines profiles, domain preferences, observations, action events, feedback outcomes, and plugin settings with RLS and ownership policies.
- The corresponding migration is present on authorized project `olfhjnropdrnujgpidfi`; prior live inspection confirmed all six tables and RLS policies.
- `supabase/tests/rls_cross_user.sql` covers own-row access, cross-user denial, and feedback/action ownership; `supabase/dev/vertical_slice_fixture.sql` is guarded dev-only fixture data.
- Bilingual sign-in/sign-up/recovery UI, session restoration, authenticated route guarding, sign-out, confirmation/recovery deep-link handling, and password update are implemented.
- Profile/domain-preference hydration and persistence carry locale, onboarding state, and enabled domains per account; account switches reset account-specific state.
- Data failures distinguish expired authorization from temporary service/network unavailability and avoid exposing raw backend messages.
- Added atomic batch observation persistence through `insertObservations`, used by the new CP4 check-in path.
- Auth redirect allow-list activation remains a one-time owner action in `automation/HUMAN_REQUIRED.md`.
- Current CP2 runtime/database verification remains reserved for owner validation under the active execution policy.

## CP3 independent progress while earlier runtime gates are owner-blocked
- Pure TypeScript deterministic core is present under `packages/core`.
- Human State Vector preserves unknown data, carries evidence/source/freshness-aware confidence, and conservatively infers overload only when required evidence exists.
- Personal baselines use bounded robust rolling statistics with explicit `cold_start`, `learning`, and `personalized` maturity.
- Temporal current/day, 7-day, 28-day, and 90-day windows plus polarity-aware Momentum are implemented.
- Life Leverage / One Move ranking centralizes documented weights, stable tie-breaking, evidence, alternatives, explanation, and a refusal path when evidence is insufficient.
- Season-relative Balance, Life Debt, Life Buffer/Fragility, interaction-risk hypotheses, relationship evidence, N-of-1 confidence strengthening, and feedback learning are implemented conservatively.
- Deterministic unit specifications cover sparse/missing data, contradictory/extreme evidence, outliers, freshness, leverage, balance, capacity, interaction risk, relationship evidence, and outcome learning.
- New CP3 tests/type checks remain intentionally unexecuted by workers; no PASS claim is made until owner validation.

## CP4 independent progress while earlier gates are blocked
- Added a real `/check-in` route linked from Today for a sub-one-minute user check-in.
- The check-in currently captures four direct self-report signals: energy, recovery, mental load, and sense of connection.
- Every signal is optional. A skipped/unknown answer is omitted from persistence entirely; it is never converted to zero.
- Answered 1–5 values are deterministically normalized to 0–100 at an application-owned boundary and persisted together as user-owned observations through typed data access.
- The screen has Arabic/English copy, RTL-aware layout, safe disabled/save states, explicit offline/service-unavailable messaging, and an expired-session refresh path.
- Today now exposes a clear entry point to the check-in rather than leaving the daily loop as a placeholder-only learning card.
- Implementation commit: `6e5f83928a1bb89d2d24bcd76d93f4398c2557ab` (`Add persisted quick daily check-in`).
- This CP4 addition has not been executed by workers under the current validation policy; type/runtime credit remains pending owner validation.

## Exact next executable action
1. Owner path: unlock Windows and complete CP1 true phone-width Arabic/English interaction verification.
2. Owner path: configure Supabase Auth redirect allow-list from `automation/HUMAN_REQUIRED.md`, then validate sign-up/sign-in/session restore/sign-out, confirmation/recovery links, password update, persisted preferences, account switching, offline handling, and expired-session routing.
3. Owner path: run `supabase/tests/rls_cross_user.sql` in a disposable/local database after migrations; use the guarded fixture only with an explicit existing dev user UUID.
4. Owner path: run current core typecheck/tests and review evidence/confidence outputs before granting CP3 checkpoint credit.
5. Worker-safe next CP4 step: load recent observations through typed data access, adapt them into `@mizan/core` inputs, and render current-state/evidence/confidence on Today without inventing missing values; then introduce One Move only where the deterministic engine has sufficient evidence.

## Verification record
Last previously verified engineering checkpoint evidence:
- CP1 root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app typecheck PASS and app lint PASS.
- `0fc4fa3b319300403a241d5f31c39e0895962822` — prior verified CP2 cross-user RLS verification-script milestone.

Implemented after that verification but awaiting owner validation:
- CP2 auth/session/persistence/recovery/offline work.
- CP3 deterministic-core modules including Balance `c384e886a22aa888ab29de599eee9202d12c06e2`, Capacity/Interaction Risk `04d5868f92161ad7d4de2537696417474b6fd890`, and Learning `28dc70d3e95a0409d253c02ddc2633e5138b9cb5`.
- CP4 quick daily check-in `6e5f83928a1bb89d2d24bcd76d93f4398c2557ab`.
- Current worker did not run product, database, cloud tests, or builds, per `automation/TASK.md` execution policy.

## Known technical risks / temporary compromises
- CP1 is blocked only on owner-side physical responsive/locale verification; independent implementation can continue.
- Hosted Supabase Auth must allow `mizan://**`, `http://localhost:8087/**`, and the eventual production Web URL before confirmation/recovery can be verified end-to-end.
- Current recovery redirect path supports the hosted implicit access/refresh-token flow; a later PKCE switch would require deliberate code exchange support.
- Offline preference writes remain in-memory/retry-on-next-mutation only; durable queued writes belong to CP8.
- Cross-user SQL verification and guarded dev fixture exist but lack current owner-side execution evidence.
- CP3 models and the new CP4 check-in are deliberately conservative but remain runtime/type validation pending.
- Relationship estimation consumes already-paired observations; raw asynchronous time alignment belongs at the application/data-preparation boundary.
- Action usefulness learns from explicit outcome benefit only; adherence alone cannot raise usefulness.
- Moderate npm advisories remain in the supported Expo dependency chain; no prior high/critical advisory was recorded.

## Evidence paths
- `docs/cp1-wide.png`
- `docs/cp1-narrow.png` (compact Web evidence only; not accepted as true phone-width proof)
- `supabase/migrations/0001_vertical_slice.sql`
- `supabase/tests/rls_cross_user.sql`
- `supabase/dev/vertical_slice_fixture.sql`
- `apps/app/src/application/check-in.ts`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/infrastructure/supabase/data-access.ts`
- `packages/core/src/engine.ts`
- `packages/core/src/temporal.ts`
- `packages/core/src/leverage.ts`
- `packages/core/src/balance.ts`
- `packages/core/src/capacity.ts`
- `packages/core/src/learning.ts`
