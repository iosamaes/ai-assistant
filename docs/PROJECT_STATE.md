# MIZAN Project State

## Current checkpoint
- CP1 — Universal application foundation
- Status: BLOCKED_HUMAN (CP2 validation pending; CP3 implementation progressing independently)
- Product source authority: GitHub `iosamaes/ai-assistant` on `main`
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
- Architecture, domain vocabulary, vertical slice, provider/plugin boundaries, entity map, ownership/RLS rules, and deterministic fixture intent are documented.
- Official compatibility remains Expo 57 / React Native 0.86 / React 19.2 / React Native Web 0.21.

## CP1 completed so far
- Workspace scripts resolve app/core/plugins under strict TypeScript settings.
- Universal Expo Router shell has real onboarding, Today, and settings routes with Arabic default and English locale support.
- Shared tokens, responsive safe-area screen primitive, RTL-aware text/layout, light/dark palette, error boundary, and app-level state are present.
- Web renders Arabic Today on `localhost:8087`; compact/wide evidence exists, but true phone-width evidence is still required.
- Expo public config resolves with Android/iOS identifiers; Android and iOS Metro/Hermes export bundles resolve.

## CP1 remaining
- Capture true narrow-phone representative evidence.
- Exercise onboarding -> Today -> settings in Arabic RTL and English at representative widths.
- Fix any concrete responsive/RTL defect found and run final CP1 gate checks.

## CP2 independent progress while CP1 is human-blocked
- Added `.env.example`, public Supabase config validation, Supabase JS, and Expo SecureStore-backed universal session storage.
- Added `supabase/migrations/0001_vertical_slice.sql` for profiles, domain preferences, observations, action events, feedback outcomes, and plugin settings.
- The corresponding `vertical_slice` migration is present on the authorized Supabase project `olfhjnropdrnujgpidfi`.
- Live project inspection confirms all six vertical-slice tables exist and RLS is enabled on every one.
- Live project inspection confirms ownership CRUD policies exist for the six tables, including the feedback/action ownership guard.
- Supabase security advisors previously returned no security lints for the project.
- Added `supabase/tests/rls_cross_user.sql`, a rollback-only verification script covering own-row access, cross-user denial, and feedback/action ownership.
- Added application-owned auth/session and typed data-access boundaries; UI components do not import Supabase directly.
- Added bilingual sign-in/sign-up/recovery-request UI, session restoration, global authenticated-route guarding, and sign-out.
- Authenticated profile/domain-preference hydration and serialized persistence keep locale, onboarding state, and enabled domains with the user account.
- Added native/Web auth redirect handling: Expo custom-scheme links can establish a Supabase session from access/refresh tokens; Web retains URL-session detection.
- Signup confirmation supplies an application redirect; password reset supplies an `/update-password` redirect.
- Added authenticated password-update UI with minimum-length/match checks and safe backend error copy.
- Auth redirect allow-list activation is recorded once in `automation/HUMAN_REQUIRED.md`; code work continues independently.
- Added explicit data-boundary classification for expired PostgREST auth tokens versus temporary service/network unavailability.
- App state now resets account-specific preferences when the active user changes/signs out, preventing stale state from leaking between accounts in one process.
- Temporary unavailability preserves the current in-memory authenticated view, surfaces a bilingual unsaved/offline status, and retries persistence on the next user mutation instead of falsely reporting success.
- Expired backend authorization clears usable write authority and routes the user back to authentication with a safe bilingual session-expired message.
- Added `supabase/dev/vertical_slice_fixture.sql`, an idempotent dev-only deterministic fixture that refuses to run until an explicit existing non-production `auth.users` UUID is supplied.
- Current auth/session/recovery/offline changes have not been executed by workers because execution policy reserves product/database tests/builds for owner validation unless `TASK.md` explicitly requires otherwise.

## CP3 independent progress while earlier runtime gates are owner-blocked
- Added a pure TypeScript deterministic engine foundation in `packages/core/src/engine.ts`.
- Missing/invalid observations remain unknown (`null` + `insufficient`) rather than silently becoming zero.
- Human State Vector derivation now exposes explicit evidence, source classification, freshness-aware confidence, and conservative inferred overload risk only when both energy and mental-load evidence exist.
- Personal baselines use a bounded 90-day window, robust median/quartiles, explicit `cold_start` / `learning` / `personalized` maturity, and evidence-backed confidence.
- Added `packages/core/src/temporal.ts` with deterministic day/7-day/28-day/90-day windows plus polarity-aware momentum from recent-vs-prior evidence; missing windows stay unknown.
- Added `packages/core/src/leverage.ts` with centralized documented leverage weights, deterministic candidate scoring, stable tie-breaking, inspectable reason payloads, alternatives, evidence, and a no-candidate refusal path for `The One Move`.
- Added `packages/core/src/balance.ts` with a deterministic season-relative Balance model that compares current allocation only against the user's configured life-season target distribution, preserves missing target-dimension data as unknown, treats explicit zero allocation as evidence rather than missingness, and carries evidence/confidence into the summary.
- Added `packages/core/src/capacity.ts` with conservative domain-specific Life Debt accumulation/recovery, explicit snapshot-vs-tracked history semantics, bounded velocity, non-moralized urgency, and unknown preservation when required need data is missing.
- Added Life Buffer/Fragility calculation that derives spare capacity from explicit capacity/load signals, requires meaningful evidence coverage, penalizes the weakest margin, and refuses a summary when evidence is too sparse.
- Added transparent interaction-risk rules with explicit factor thresholds, evidence/confidence payloads, `hypothesis` downgrade for weak evidence, and `insufficient` instead of treating missing factors as safe zeros.
- Added `packages/core/src/learning.ts` with a deterministic paired-evidence relationship model that reports sample size, effect direction/estimate, time window, confidence, evidence, and explicit non-causal caveats.
- N-of-1 experimental samples can strengthen a relationship hypothesis confidence without ever changing the output into a universal causal claim.
- Added a feedback learning estimator that keeps completion as adherence-only evidence, learns usefulness only from explicit outcome benefit, applies bounded recency weighting, and preserves no-benefit data as unknown usefulness.
- Exported the engine/temporal/leverage/balance/capacity/learning modules from `@mizan/core`.
- Added deterministic unit specifications covering missing data, sparse evidence, inferred overload, robust outlier handling, stale confidence, temporal momentum, lower-is-better orientation, deterministic leverage ranking, explanation payloads, refusal to fabricate a recommendation, season-relative balance, explicit-zero handling, confidence weighting, Life Debt accumulation/recovery, sparse-buffer refusal, weakest-margin fragility, strong/weak/missing interaction-risk evidence, sparse/strong relationship evidence, N-of-1 confidence strengthening, missing pair values, completion-without-benefit, recency weighting, and action isolation.
- These CP3 tests/type checks have intentionally not been executed by workers under the current execution policy; no PASS claim is made yet.

## Exact next executable action
1. When the Windows session is unlocked, complete CP1 Arabic/English interaction and true phone-width verification through the owner validation path.
2. Owner-validate sign-up/sign-in/session restore/sign-out, confirmation deep links, recovery deep links/password update, persisted locale/domain preferences, account-switch isolation, temporary-offline messaging/retry, and expired-session routing against the authorized Supabase project after the listed Auth redirect URLs are configured.
3. During owner validation, execute `supabase/tests/rls_cross_user.sql` against a disposable/local Supabase database after migrations are applied, and load `supabase/dev/vertical_slice_fixture.sql` only after replacing its guarded placeholder with an existing dev user UUID.
4. CP3 implementation now has the initial required deterministic models; next owner validation should run core typecheck/tests and review confidence/evidence outputs. If those gates pass, grant CP3 checkpoint credit and proceed to CP4's first complete daily life loop; workers may continue independent CP4 code while runtime gates remain owner-blocked.

## Last verified commit
- `0fc4fa3b319300403a241d5f31c39e0895962822` — added CP2 cross-user RLS verification script.
- Newer GitHub-native auth/session/persistence/recovery/offline and CP3 deterministic-core commits are implemented but remain owner-validation pending; do not label them verified until the reserved validation path runs.
- Latest CP3 season-relative Balance implementation commit: `c384e886a22aa888ab29de599eee9202d12c06e2`.
- Latest CP3 Life Debt/Buffer/Interaction Risk implementation commit: `04d5868f92161ad7d4de2537696417474b6fd890`.
- Latest CP3 relationship/feedback learning implementation commit: `28dc70d3e95a0409d253c02ddc2633e5138b9cb5`.

## Tests/builds last run
- Existing CP1 gate evidence: root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access additions: app `typecheck` PASS and app `lint` PASS.
- Current worker run did not execute product/cloud tests or builds, per worker execution policy.
- New CP3 deterministic tests were added but remain unexecuted pending owner validation.

## Known technical risks / temporary compromises
- CP1 is blocked only on owner unlock for physical responsive/locale verification; useful independent work can continue.
- Current auth, route-guard, profile/preference persistence, recovery, account-isolation, and offline/expired-session code requires owner-side runtime/typecheck validation before checkpoint credit.
- Hosted Supabase Auth must allow the `mizan` custom scheme and local Web redirect before email confirmation/recovery can be verified end-to-end; see `automation/HUMAN_REQUIRED.md`.
- Recovery-link handling currently supports the hosted implicit access/refresh-token redirect used by the client setup; any later switch to PKCE must add code-exchange handling deliberately.
- Offline preference changes are preserved only in the current app session and retry on a later mutation; durable queued offline writes remain CP8 work and are not claimed here.
- The cross-user SQL verification and guarded dev fixture exist in-repo but still require owner-side execution evidence.
- New CP3 engine modules are deliberately conservative and deterministic, but their new type/tests have not yet been executed under the worker transport policy.
- The Balance model intentionally refuses to emit an overall score until every active season target dimension has explicit current-allocation data and at least two target dimensions are comparable; this is conservative by design and should only be relaxed with an explicit missing-data model.
- Life Debt snapshot mode deliberately reports amount without inventing historical direction/velocity; tracked direction begins only when a prior bounded debt amount exists.
- The initial interaction-risk model is rule-based and intentionally narrow; it surfaces hypotheses under weak evidence rather than escalating lifestyle telemetry into diagnostic claims.
- Relationship estimates currently consume already-paired observations; pairing raw asynchronous telemetry belongs at the application/data preparation boundary so the pure engine does not hide time-alignment assumptions.
- Action usefulness uses explicit personal outcome benefit only; adherence without benefit remains visible but cannot raise usefulness.
- Moderate npm advisories remain in the supported Expo dependency chain; no high/critical advisory was previously reported.

## Evidence
- `docs/cp1-wide.png`
- `docs/cp1-narrow.png` (compact Web evidence only; not accepted as true phone-width proof)
- `supabase/migrations/0001_vertical_slice.sql`
- `supabase/tests/rls_cross_user.sql`
- `supabase/dev/vertical_slice_fixture.sql`
- `packages/core/src/engine.ts`
- `packages/core/src/engine.test.ts`
- `packages/core/src/temporal.ts`
- `packages/core/src/leverage.ts`
- `packages/core/src/temporal-leverage.test.ts`
- `packages/core/src/balance.ts`
- `packages/core/src/balance.test.ts`
- `packages/core/src/capacity.ts`
- `packages/core/src/capacity.test.ts`
- `packages/core/src/learning.ts`
- `packages/core/src/learning.test.ts`
