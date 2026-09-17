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
- Exported the new engine/temporal/leverage modules from `@mizan/core`.
- Added deterministic unit specifications in `engine.test.ts` and `temporal-leverage.test.ts` covering missing data, sparse evidence, inferred overload, robust outlier handling, stale confidence, temporal momentum, lower-is-better orientation, deterministic leverage ranking, explanation payloads, and refusal to fabricate a recommendation.
- These new CP3 tests/type checks have intentionally not been executed by workers under the current execution policy; no PASS claim is made yet.

## Exact next executable action
1. When the Windows session is unlocked, complete CP1 Arabic/English interaction and true phone-width verification through the owner validation path.
2. Owner-validate sign-up/sign-in/session restore/sign-out, confirmation deep links, recovery deep links/password update, persisted locale/domain preferences, account-switch isolation, temporary-offline messaging/retry, and expired-session routing against the authorized Supabase project after the listed Auth redirect URLs are configured.
3. During owner validation, execute `supabase/tests/rls_cross_user.sql` against a disposable/local Supabase database after migrations are applied, and load `supabase/dev/vertical_slice_fixture.sql` only after replacing its guarded placeholder with an existing dev user UUID.
4. Continue CP3 with the earliest safe unfinished deterministic-core requirements: user-season-relative Balance, then conservative Life Debt / buffer-resilience / interaction-risk models, followed by owner-run core typecheck/tests before CP3 can receive checkpoint credit.

## Last verified commit
- `0fc4fa3b319300403a241d5f31c39e0895962822` — added CP2 cross-user RLS verification script.
- Newer GitHub-native auth/session/persistence/recovery/offline and CP3 deterministic-core commits are implemented but remain owner-validation pending; do not label them verified until the reserved validation path runs.
- Latest CP3 public-export commit in this worker run: `eef5d58400fa9e3f476b1522dbfc99ac377022f9`.

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
