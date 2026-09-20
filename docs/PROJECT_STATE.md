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
- `0fa422d3c90db3b381f355f31f35f53e865c948b` — added a fail-closed safety guard to the irreversible deletion harness: `MIZAN_E2E_DELETE_EMAIL` is rejected before any destructive action if it matches the reusable completed, persisted-Arabic, or onboarding fixtures, reducing the risk of owner validation accidentally deleting a shared test account.
- `249f70164e3042884ffc883f33e0f453080ad205` — extended the destructive account-deletion E2E to exercise the deployed v2 expected-user fence before real deletion: a valid access token paired with a deliberately different `expected_user_id` must return HTTP `409` with `account_changed`, and a fresh password grant must still succeed afterward. The same journey then performs the intended deletion and requires the previously valid credentials to return HTTP `400`, so generic backend failures cannot masquerade as deletion evidence.
- `2b8f7044c2fff10a252778bde332b7238930595a` — first hardened the destructive deletion proof by replacing a generic non-2xx assertion with explicit post-delete HTTP `400` credential rejection.
- `6cf2f9136d48960086dd1c68c3199cfb66860835` — added the root owner-side command `npm run test:db`, mapped to `supabase test db --local`, so CP11 database/RLS/security verification has one explicit local-only entry point instead of requiring ad-hoc manual invocation.
- `982821b080bf6f985e4e8ae179105323f42b2502` — added `npm run lint:db`, mapped to `supabase db lint --local --level warning --fail-on error`, so owner validation can surface warning-level schema/function findings while treating error-level database lint findings as a failing gate.
- `da0eba574441afb72b9f2050bba820a33e1fca72` + `a0c84725cad3611479ee1e54e3c030f115c86ff2` — updated the clean-checkout README to document the local Supabase reset, pgTAP/RLS/security test, and database lint workflow, with both commands explicitly scoped to the local stack rather than the hosted project.
- Immediately preceding release hardening remains current: MIZAN-owned app icon/favicon/adaptive/splash artwork replaced Expo starter branding; native iPad support is explicit; production static-Web smoke/performance harnesses exist; Life Seasons local drafts and the shared AppState persistence queue are account-fenced; destructive account deletion has a dedicated isolated E2E harness.
- These are static implementation/specification changes only. No test, Expo export, typecheck, native build, database suite/lint, E2E, or performance run was executed by workers.

## CP8 reliability state
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Static implementation covers durable per-user retry for check-ins and Invisible Wins, duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and restart/reconnect/concurrency specifications. CP8 cannot close until owner/runtime evidence confirms the required offline/reconnect behavior.

## CP9 presentation state
Detailed architecture: `docs/CP9_PRESENTATION_ARCHITECTURE.md`. Runtime design-swap procedure: `docs/CP9_DESIGN_SWAP_PROOF.md`.

The owner-approved premium reference is broadly implemented in static source: adaptive Home/Life Map/One Move/Insights/More navigation, shared semantic iconography, responsive Life Map radar, premium Today/One Move composition, WHY/Insights evidence language, What If range visualization, Experiments/Recovery/Onboarding/Personalization/Invisible Wins treatments, truthful bounded meters, premium Auth/Privacy/Settings/Integrations and secondary decision surfaces, Western-digit formatting, RTL-aware geometry, reduced-motion handling, dynamic-type/shared-control sizing, semantic light/dark roles, and MIZAN-owned native/Web branding.

Prepared owner/runtime evidence includes:
- `tests/e2e/visual-evidence-live.spec.ts` for Today/Life Map/WHY/interacted Check-in across the responsive light/dark matrix in persisted English and Arabic RTL.
- Real Tab/Enter keyboard journeys for Auth and the primary shell, including after Arabic RTL hydration.
- `apps/app/__tests__/theme-contrast-policy-test.ts` for semantic normal-text contrast.
- `apps/app/__tests__/app-native-platform-config-policy-test.ts` for iPad support, responsive platform configuration, MIZAN-owned native/Web brand assets, starter-asset rejection, and light/dark splash configuration.
- `docs/CP9_DESIGN_SWAP_PROOF.md` for the deliberate owner-side design-swap proof.

### CP9 remaining
- Make only demonstrated residual accessibility/RTL/localization/focus/presentation fixes; do not manufacture speculative polish.
- Execute and inspect the prepared runtime visual matrix across narrow/common phone, tablet portrait/landscape, wide Web, Arabic/English, and light/dark.
- Manually inspect keyboard focus indicators and representative interactions.
- Run representative iPhone/iPad validation and verify the product-owned app icon plus light/dark splash in release-capable native output.
- Execute and record the deliberate design-swap proof. CP9 remains open until runtime evidence exists.

## CP10 security/privacy state
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented source hardening includes user-owned table/RLS review, cross-user policy specifications, function-execute hardening migration `0009`, authenticated portable export migration `0010`, Life Season expected-user fencing migrations `0011`/`0012`, JWT-protected `delete-account` Edge Function v2 with expected-user matching, export/two-step deletion and local-cache purge attempts, consent rechecks around integration sync, safer logging/error boundaries, broad account-switch/session fencing, account-owned Life Seasons drafts, and account-bound queued profile/preference persistence. The prepared destructive E2E now explicitly covers both the `expected_user_id` mismatch guard and post-delete credential rejection, and refuses to run if the destructive fixture reuses a normal E2E account.

### CP10 remaining
- Owner/runtime validation for cross-user/database specifications, Life Season expected-user/local-draft behavior, queued AppState persistence account switching, export/delete/local purge, destructive Edge deletion v2, consent-revocation races, account-switch/session-binding cases, offline replay ownership, and notification-preference isolation/persistence.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## CP11 static readiness
Detailed ledger: `docs/CP11_RELEASE_READINESS.md`.

Prepared readiness includes:
- Main Web matrix at **320×568**, **390×844**, **834×1194**, **1194×834**, and **1440×900**, each in light/dark.
- Auth/route guard/password recovery, onboarding, completed-account navigation, persisted Arabic locale coverage, Recovery/What If, privacy export, live daily-loop and feedback-learning mutations, Spiritual Grounding toggle/restore, notification preference persistence/restore, destructive account deletion with a dedicated-only fixture guard, explicit HTTP `409 account_changed` expected-user fencing, and explicit HTTP `400` post-delete credential rejection, browser diagnostics, production logging policy, semantic contrast policy, and CP9 visual capture.
- Read-only performance sampling for both the controlled Expo E2E runtime and the served static production Web export.
- Production static-Web export smoke, direct-route hydration coverage, static-size reporting, and explicit Web/Android/iOS Expo export scripts.
- Root `npm run test:db` provides an explicit local-only Supabase pgTAP/RLS/security suite entry point, and `npm run lint:db` provides a local database lint gate that reports warnings while failing on errors.
- Native iPad eligibility and MIZAN-owned app icon/favicon/adaptive/splash contracts are guarded statically.

### CP11 remaining
- Run TypeScript, lint, unit/component/integration, `npm run test:db`, `npm run lint:db`, and full Web E2E suites from a trustworthy owner checkout.
- Execute and inspect keyboard/focus journeys, visual evidence, live mutation journeys, development-runtime performance sampling, production-export performance sampling, production Web export/smoke/size reporting, and destructive deletion only with documented fixtures.
- Run Expo diagnostics and Android/iOS export checks; include representative iPhone/iPad runtime review and verify branded icon/splash surfaces in release-capable native output.
- Continue repository hygiene review only for demonstrated dead flags, stale mocks/debug surfaces, console noise, or validated unused dependencies.
- Perform a clean-checkout setup from the root README and record exact commands, versions, results, failures/fixes, database-test/lint evidence, Web size evidence, performance evidence, and owner release actions.

## Exact next executable action
1. Continue CP9 static work only when a concrete residual defect is demonstrated; otherwise preserve the prepared runtime evidence for owner validation.
2. Keep CP10 source review limited to genuinely new security/account-sensitive boundaries.
3. Keep CP11 static harness aligned with the release contract; the next owner-side database step is reproducible as `supabase init` → `supabase start` → `supabase db reset` → `npm run test:db` → `npm run lint:db`.
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
- **No worker-run app tests, builds, typechecks, validation database scripts/lints, Web E2E, screenshot captures, performance runs, production-export smoke/size runs, GitHub Actions, or cloud CI are claimed for CP2–CP11 changes.**
- Migrations `0009`–`0012` were applied previously; live ACL/state reads are implementation evidence, not a behavioral suite PASS.
- `delete-account` v2 was previously deployed ACTIVE with JWT verification; destructive end-to-end deletion remains unverified until the owner-side disposable-account journey runs.
- Latest owner-executable release-harness additions include destructive-fixture reuse protection (`0fa422d3c90db3b381f355f31f35f53e865c948b`), expected-user mismatch and strict post-delete authentication proof (`249f70164e3042884ffc883f33e0f453080ad205`, building on `2b8f7044c2fff10a252778bde332b7238930595a`), the local-only database test command (`6cf2f9136d48960086dd1c68c3199cfb66860835`), the database lint command (`982821b080bf6f985e4e8ae179105323f42b2502`), and clean-checkout documentation (`da0eba574441afb72b9f2050bba820a33e1fca72`, `a0c84725cad3611479ee1e54e3c030f115c86ff2`).

## Known blockers / owner actions
- CP1/CP9 representative physical/runtime visual interaction evidence requires the owner environment to be normally unlocked; see `automation/HUMAN_REQUIRED.md`.
- Hosted Supabase Auth redirect allow-list still requires the documented owner URL configuration.
- Supabase leaked-password protection remains disabled pending the documented owner Auth setting.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path and this does not block core product usefulness.

## Evidence paths
- `README.md`
- `package.json`
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP9_DESIGN_SWAP_PROOF.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `docs/CP11_RELEASE_READINESS.md`
- `apps/app/app.json`
- `apps/app/__tests__/app-native-platform-config-policy-test.ts`
- `apps/app/__tests__/app-state-persistence-queue-session-fencing-test.tsx`
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
- `supabase/tests/`
- `automation/HUMAN_REQUIRED.md`
