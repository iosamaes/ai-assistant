# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy source hardening is broadly implemented; execution-dependent gates remain owner validation.
- CP11 static verification/release readiness is prepared and continues to be hardened; execution is pending because current worker policy forbids workers from running product tests, builds, typechecks, database suites, GitHub Actions, or cloud CI.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `f2786fbae29a0ee1fa7bf77eb1504fc8fb80c208`.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation — implementation present; owner responsive/locale/native runtime evidence pending
- [ ] CP2 — Supabase, auth, ownership, persistence — implementation present; owner/runtime validation pending
- [ ] CP3 — Deterministic intelligence core — implementation present; validation pending
- [ ] CP4 — First complete daily loop — implementation present; validation pending
- [ ] CP5 — Insight, explanation, personal learning — implementation present; validation pending
- [ ] CP6 — Advanced decision tools — implementation present; validation pending
- [ ] CP7 — Plugins, unified integrations, provider boundaries — implementation present; validation pending
- [ ] CP8 — Reliability, offline tolerance, sync — statically reviewed; owner/runtime validation pending
- [ ] CP9 — Responsive UX, accessibility, localization, polish, design-swappability — **IN_PROGRESS**
- [ ] CP10 — Security, privacy, owner-data control — **IN_PROGRESS / runtime verification pending**
- [ ] CP11 — Test matrix, performance, release readiness — **static harness prepared; execution pending**
- [ ] CP12 — Independent final review and handoff

## Latest productive changes
CP11 now has performance evidence prepared for the **actual Expo static Web export**, not only the development-server runtime, and the static cleanup sweep removed one concrete destructive starter artifact.

- `852b7600d3f5a272872479d154c6d3093737b0f2` — added `tests/e2e/production-performance.spec.ts`, an opt-in read-only performance sanity journey that runs against `playwright.production.config.ts` and the exported files served from `apps/app/dist`. It measures authenticated Home readiness plus Home → Life Map → One Move → Insights → More transitions, captures production resource timing and long tasks, checks horizontal overflow/browser diagnostics, and attaches `production-performance-sanity.json`. Broad timing limits remain regression tripwires rather than product SLOs.
- `66a36372f76334aa4b4b54eb4eef77cb9f385379` — added the owner-side command `npm run test:e2e:production:performance`, isolated to one production desktop project so the measurement is not multiplied across smoke viewports.
- `5d3cbe2e90c8b3e2a76e545bfb3d8cae569d134a` + `755f54fa1c26e96ea14e28cb0b5a8ce6ab636e54` — hardened both production-export and controlled-runtime performance probes so route timing does not stop at URL/tab selection alone; each measured transition now also waits for a route-specific visible surface marker on Life Map, One Move, Insights, and Settings.
- `36b4f885204951168f16977cfadfe5a8d3fa6dfb` — removed the unused Expo starter `apps/app/scripts/reset-project.js`. It was not referenced by current package scripts and was a destructive blank-project reset utility that no longer belonged in a release-ready product repository.
- `ac75d4992cbdfd604abfb2bfba72e8698d9a998a` + `1461bb91a60625c6688b3c167d3a0c41a0edf4bc` — aligned the root clean-checkout README and `.env.example` with the separate controlled-runtime versus production-export performance commands and the shared explicit performance opt-in.
- `7848b2fe30d18c2c2040d07db716bbaf37cd0ae9` — expanded the CP11 release ledger with the production-export performance gate and evidence contract.
- The immediately preceding native-readiness hardening remains relevant: `0d3b0251d02c69c92b84b1c382cbeff1901ccc9f` enabled `expo.ios.supportsTablet: true`, and `e7bfedb051d9796171addb55693cb36b5355f647` added a static platform-config policy specification.
- These are **static implementation/specification changes only**. No test, Expo export, typecheck, native build, or performance run was executed by the worker.

## CP8 reliability state
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Static implementation covers durable per-user retry for check-ins and Invisible Wins, duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and restart/reconnect/concurrency specifications. CP8 cannot close until owner/runtime evidence confirms the required offline/reconnect behavior.

## CP9 presentation state
Detailed architecture: `docs/CP9_PRESENTATION_ARCHITECTURE.md`. Runtime design-swap procedure: `docs/CP9_DESIGN_SWAP_PROOF.md`.

The owner-approved premium reference is broadly implemented in static source: adaptive Home/Life Map/One Move/Insights/More navigation, shared semantic iconography, responsive Life Map radar, premium Today/One Move composition, WHY/Insights evidence language, What If range visualization, Experiments/Recovery/Onboarding/Personalization/Invisible Wins treatments, truthful bounded meters, premium Auth/Privacy/Settings/Integrations and secondary decision surfaces, Western-digit formatting, RTL-aware geometry, reduced-motion handling, dynamic-type/shared-control sizing, and semantic light/dark roles.

Prepared owner/runtime evidence includes:
- `tests/e2e/visual-evidence-live.spec.ts` for Today/Life Map/WHY/interacted Check-in across the responsive light/dark matrix in persisted English and Arabic RTL.
- Real Tab/Enter keyboard journeys for Auth and the primary shell, including after Arabic RTL hydration.
- `apps/app/__tests__/theme-contrast-policy-test.ts` for semantic normal-text contrast.
- `apps/app/__tests__/app-native-platform-config-policy-test.ts` for native iPad support and responsive platform configuration.
- `docs/CP9_DESIGN_SWAP_PROOF.md` for the deliberate owner-side design-swap proof.

### CP9 remaining
- Make only demonstrated residual accessibility/RTL/localization/focus/presentation fixes; do not manufacture speculative polish.
- Execute and inspect the prepared runtime visual matrix across narrow/common phone, tablet portrait/landscape, wide Web, Arabic/English, and light/dark.
- Manually inspect keyboard focus indicators and representative interactions.
- Run native iPad/iPhone validation after pulling current `main`; the iPad capability is explicitly enabled in Expo config.
- Execute and record the deliberate design-swap proof. CP9 remains open until runtime evidence exists.

## CP10 security/privacy state
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented source hardening includes user-owned table/RLS review, cross-user policy specifications, function-execute hardening migration `0009`, authenticated portable export migration `0010`, Life Season expected-user fencing migrations `0011`/`0012`, JWT-protected `delete-account` Edge Function v2 with expected-user matching, export/two-step deletion and local-cache purge attempts, consent rechecks around integration sync, safer logging/error boundaries, and broad account-switch/session fencing.

### CP10 remaining
- Owner/runtime validation for cross-user/database specifications, Life Season expected-user behavior, export/delete/local purge, destructive Edge deletion v2, consent-revocation races, account-switch/session-binding cases, offline replay ownership, and notification-preference isolation/persistence.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## CP11 static readiness
Detailed ledger: `docs/CP11_RELEASE_READINESS.md`.

Prepared static readiness includes:
- Main Web matrix at **320×568**, **390×844**, **834×1194**, **1194×834**, and **1440×900**, each in light/dark.
- Auth/route guard/password recovery, onboarding, completed-account navigation, Arabic persisted-locale coverage, Recovery/What If, privacy export, live daily-loop and feedback-learning mutations, Spiritual Grounding toggle/restore, notification preference persistence/restore, destructive account deletion with a dedicated fixture, browser diagnostics, production logging policy, semantic contrast policy, and CP9 visual capture.
- Read-only performance sampling for both the controlled Expo E2E runtime (`tests/e2e/performance-live.spec.ts`) and the real static production Web export (`tests/e2e/production-performance.spec.ts`). Both route probes now wait for route-specific visible content rather than treating navigation selection alone as route readiness.
- Production static-Web export smoke, direct-route hydration coverage, static-size reporting, and explicit Web/Android/iOS Expo export scripts.
- Native iPad eligibility is explicit in app config and guarded by source policy.
- The obsolete create-expo-app reset utility has been removed from `apps/app/scripts`, reducing release-repository dead/destructive starter tooling.

### CP11 remaining
- Run TypeScript, lint, unit/component/integration, database/policy, and full Web E2E suites from a trustworthy owner checkout.
- Execute and inspect keyboard/focus journeys, visual evidence, live mutation journeys, development-runtime performance sampling, **production-export performance sampling**, production Web export/smoke/size reporting, and destructive deletion only with documented fixtures.
- Run Expo diagnostics and Android/iOS export checks; include representative iPhone and iPad runtime review.
- Continue repository hygiene review for any other demonstrated dead flags, stale mocks/debug surfaces, console noise, or unused dependencies; do not remove dependencies solely from heuristic source-search evidence without validation.
- Perform a clean-checkout setup from the root README and record exact commands, versions, results, failures/fixes, Web size evidence, performance evidence, and owner release actions.

## Exact next executable action
1. Continue CP9 static work only when a concrete residual defect is demonstrated; otherwise preserve the prepared runtime evidence for owner validation.
2. Keep CP10 source review limited to genuinely new security/account-sensitive boundaries.
3. Keep CP11 static harness aligned with the release contract and continue only evidence-backed repository-hygiene cleanup; owner validation now has both development-runtime and actual static-export performance probes, while execution-dependent gates remain pending.
4. After CP0–CP11 gates are honestly satisfied with current execution evidence, begin CP12 independent two-worker verification. Do not claim completion from source presence alone.

## Verification record
Previously recorded owner-side baseline evidence:
- Root typecheck PASS.
- Lint PASS.
- Core tests 3/3 PASS.
- Plugin tests 2/2 PASS.
- Expo Doctor 21/21 PASS.
- Android export PASS.
- iOS export PASS.
- Earlier auth/data-access app typecheck and lint PASS.

Post-baseline:
- **No worker-run app tests, builds, typechecks, validation database scripts, Web E2E, screenshot captures, performance runs, production-export smoke/size runs, GitHub Actions, or cloud CI are claimed for CP2–CP11 changes.**
- Migrations `0009`–`0012` were applied previously; live ACL/state reads are implementation evidence, not a behavioral suite PASS.
- `delete-account` v2 was previously deployed ACTIVE with JWT verification; destructive end-to-end deletion remains unverified until the owner-side disposable-account journey runs.
- Latest implementation/harness commits in this run: `852b7600d3f5a272872479d154c6d3093737b0f2`, `66a36372f76334aa4b4b54eb4eef77cb9f385379`, `5d3cbe2e90c8b3e2a76e545bfb3d8cae569d134a`, `755f54fa1c26e96ea14e28cb0b5a8ce6ab636e54`, `36b4f885204951168f16977cfadfe5a8d3fa6dfb`.

## Known blockers / owner actions
- CP1/CP9 representative physical/runtime visual interaction evidence requires the owner environment to be normally unlocked; see `automation/HUMAN_REQUIRED.md`.
- Hosted Supabase Auth redirect allow-list still requires the documented owner URL configuration.
- Supabase leaked-password protection remains disabled pending the documented owner Auth setting.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path and this does not block core product usefulness.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP9_DESIGN_SWAP_PROOF.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `docs/CP11_RELEASE_READINESS.md`
- `apps/app/app.json`
- `apps/app/__tests__/app-native-platform-config-policy-test.ts`
- `playwright.production.config.ts`
- `scripts/serve-expo-static.mjs`
- `scripts/report-expo-static-size.mjs`
- `tests/e2e/browser-assertions.ts`
- `tests/e2e/product-live.spec.ts`
- `tests/e2e/visual-evidence-live.spec.ts`
- `tests/e2e/performance-live.spec.ts`
- `tests/e2e/production-performance.spec.ts`
- `tests/e2e/production-web.spec.ts`
- `tests/e2e/notification-preferences-live.spec.ts`
- `tests/e2e/account-deletion-live.spec.ts`
- `automation/HUMAN_REQUIRED.md`
