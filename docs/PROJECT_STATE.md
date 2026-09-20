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
A CP9/CP11 release-surface audit found a concrete production branding defect: the shipped app icon, Android adaptive artwork, Web favicon, splash artwork, and the former iOS icon-composer bundle still matched Expo SDK 57 starter assets by exact Git blob SHA. Those starter surfaces have now been replaced or removed, while the preceding CP10 account-switch and CP11 production-performance hardening remains current.

- `ab4f19804edd433c5dca16055049b6ded9d26e86` — replaced the remaining Expo starter app/icon surfaces with MIZAN-owned deep-green/ivory balance-mark artwork across the shared app icon, Android adaptive foreground/monochrome icon, Web favicon, and native splash. Android adaptive background now uses the semantic MIZAN accent `#245E4A`; the native splash uses the designed light background `#F4F2EC` plus an explicit dark variant on `#0C1210`. The obsolete starter adaptive background image was removed.
- `36fb271dcc67499d99d3067d5397fe2a4c519eff`, `b7f021ae3237f4c9c0c2df93ada10586c5c6a6ea`, and `8aa3f17768a3153f1b73cd3c4d36fbb58ece2cd2` — removed the unused Expo starter iOS icon-composer manifest and its exact starter `expo-symbol`/grid artwork after the iOS-specific override was retired.
- `66b47f9d231f60eb07d4cc4ea45a37341d8eac06` — removed the iOS-only `./assets/expo.icon` override so iOS uses the same product-owned icon contract as the rest of MIZAN.
- `ecd439673dc484fbdb3096aa9252f7eba869a500` and the strengthened policy included in `ab4f19804edd433c5dca16055049b6ded9d26e86` — expanded native platform regression policy to require the MIZAN icon/splash configuration, absence of the deleted starter surfaces, and rejection of the exact known Expo starter Git blob SHAs for every shipped brand asset.
- `b69e55bd817c9dbdecad694dc50cc9069d8b926d` — Life Seasons now binds the locally selected season and target draft to the account that owns them. During the render-to-effect window after an account switch, prior-account targets are not used, the prior selected season is not presented as the active account's draft, editing/saving is disabled until the active account's Life Seasons state is loaded, and `handleSave` refuses to persist unless both draft owners match the current user. This prevents User A's unsaved season/target choices from being copied into User B by a fast save after account switching.
- `3866d797333514ae451b1bf64daba0cbbad89f52` — strengthened the Life Seasons source policy specification to require account-owned season drafts, visible target filtering, disabled controls until ownership is current, and save-time owner checks.
- `1d2ba9c1abe20cde5c3c69b0b7a6fd7e5121afb2` — added a focused component regression specification that renders User A with a selected season/target, switches to User B while B's load is still pending, requires A's draft to disappear immediately, requires Save to remain disabled, and permits Save only after B's own state resolves.
- `729aded64fe0ab3821e09a489c0314d63d005fe2` — hardened the shared AppState persistence queue. A stale closure now cannot enqueue persistence once `activeUserRef` belongs to another account, and an already queued old-account job re-checks account ownership before changing sync status or issuing any Supabase write. This closes the case where User A could queue a second preference/profile write, switch to User B while an earlier A write was in flight, then have the stale queued job begin under B's active session and leave B's UI stuck in a misleading `saving` state.
- `9d2c79ea02a690e1f1414841b7a18e7dc3f41551` — added a focused AppState behavioral regression specification: two User A persistence requests are queued behind an unresolved first write, the active session switches to User B, the first A write completes, and the second stale A job must never issue a write or change B's final `saved` sync state.
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

The owner-approved premium reference is broadly implemented in static source: adaptive Home/Life Map/One Move/Insights/More navigation, shared semantic iconography, responsive Life Map radar, premium Today/One Move composition, WHY/Insights evidence language, What If range visualization, Experiments/Recovery/Onboarding/Personalization/Invisible Wins treatments, truthful bounded meters, premium Auth/Privacy/Settings/Integrations and secondary decision surfaces, Western-digit formatting, RTL-aware geometry, reduced-motion handling, dynamic-type/shared-control sizing, semantic light/dark roles, and MIZAN-owned app-icon/favicon/adaptive/splash identity rather than Expo starter branding.

Prepared owner/runtime evidence includes:
- `tests/e2e/visual-evidence-live.spec.ts` for Today/Life Map/WHY/interacted Check-in across the responsive light/dark matrix in persisted English and Arabic RTL.
- Real Tab/Enter keyboard journeys for Auth and the primary shell, including after Arabic RTL hydration.
- `apps/app/__tests__/theme-contrast-policy-test.ts` for semantic normal-text contrast.
- `apps/app/__tests__/app-native-platform-config-policy-test.ts` for native iPad support, responsive platform configuration, MIZAN-owned native/Web brand assets, starter-asset SHA rejection, and light/dark native splash configuration.
- `docs/CP9_DESIGN_SWAP_PROOF.md` for the deliberate owner-side design-swap proof.

### CP9 remaining
- Make only demonstrated residual accessibility/RTL/localization/focus/presentation fixes; do not manufacture speculative polish.
- Execute and inspect the prepared runtime visual matrix across narrow/common phone, tablet portrait/landscape, wide Web, Arabic/English, and light/dark.
- Manually inspect keyboard focus indicators and representative interactions.
- Run native iPad/iPhone validation after pulling current `main`; confirm the product-owned app icon and light/dark splash in release-capable native builds as well as the already enabled iPad capability.
- Execute and record the deliberate design-swap proof. CP9 remains open until runtime evidence exists.

## CP10 security/privacy state
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented source hardening includes user-owned table/RLS review, cross-user policy specifications, function-execute hardening migration `0009`, authenticated portable export migration `0010`, Life Season expected-user fencing migrations `0011`/`0012`, JWT-protected `delete-account` Edge Function v2 with expected-user matching, export/two-step deletion and local-cache purge attempts, consent rechecks around integration sync, safer logging/error boundaries, broad account-switch/session fencing, explicit ownership fencing for Life Seasons local season/target drafts, and account-bound guards on the shared queued profile/preference persistence path so stale old-account jobs cannot begin under a newly active session.

### CP10 remaining
- Owner/runtime validation for cross-user/database specifications, Life Season expected-user and local-draft behavior, queued AppState persistence account switching, export/delete/local purge, destructive Edge deletion v2, consent-revocation races, account-switch/session-binding cases, offline replay ownership, and notification-preference isolation/persistence.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## CP11 static readiness
Detailed ledger: `docs/CP11_RELEASE_READINESS.md`.

Prepared static readiness includes:
- Main Web matrix at **320×568**, **390×844**, **834×1194**, **1194×834**, and **1440×900**, each in light/dark.
- Auth/route guard/password recovery, onboarding, completed-account navigation, Arabic persisted-locale coverage, Recovery/What If, privacy export, live daily-loop and feedback-learning mutations, Spiritual Grounding toggle/restore, notification preference persistence/restore, destructive account deletion with a dedicated fixture, browser diagnostics, production logging policy, semantic contrast policy, and CP9 visual capture.
- Read-only performance sampling for both the controlled Expo E2E runtime (`tests/e2e/performance-live.spec.ts`) and the real static production Web export (`tests/e2e/production-performance.spec.ts`). Both route probes now wait for route-specific visible content rather than treating navigation selection alone as route readiness.
- Production static-Web export smoke, direct-route hydration coverage, static-size reporting, and explicit Web/Android/iOS Expo export scripts.
- Native iPad eligibility is explicit in app config and guarded by source policy.
- Shipped app-icon/favicon/adaptive/splash assets no longer match the Expo starter Git blobs; the source policy now blacklists those exact starter hashes and validates the semantic light/dark splash contract.
- The obsolete create-expo-app reset utility and unused Expo starter icon-composer artwork have been removed, reducing release-repository dead/starter surfaces.

### CP11 remaining
- Run TypeScript, lint, unit/component/integration, database/policy, and full Web E2E suites from a trustworthy owner checkout.
- Execute and inspect keyboard/focus journeys, visual evidence, live mutation journeys, development-runtime performance sampling, **production-export performance sampling**, production Web export/smoke/size reporting, and destructive deletion only with documented fixtures.
- Run Expo diagnostics and Android/iOS export checks; include representative iPhone and iPad runtime review and verify the new branded icon/splash surfaces in release-capable native output.
- Continue repository hygiene review for any other demonstrated dead flags, stale mocks/debug surfaces, console noise, or unused dependencies; do not remove dependencies solely from heuristic source-search evidence without validation.
- Perform a clean-checkout setup from the root README and record exact commands, versions, results, failures/fixes, Web size evidence, performance evidence, and owner release actions.

## Exact next executable action
1. Continue CP9 static work only when a concrete residual defect is demonstrated; otherwise preserve the prepared runtime evidence for owner validation. The Expo starter branding residue is now removed and guarded statically.
2. Keep CP10 source review limited to genuinely new security/account-sensitive boundaries; Life Seasons local drafts and the shared persistence queue now have explicit account ownership fences and prepared regression specifications.
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
- Latest implementation/harness commits now include `ab4f19804edd433c5dca16055049b6ded9d26e86`, `ecd439673dc484fbdb3096aa9252f7eba869a500`, `66b47f9d231f60eb07d4cc4ea45a37341d8eac06`, `b69e55bd817c9dbdecad694dc50cc9069d8b926d`, `3866d797333514ae451b1bf64daba0cbbad89f52`, `1d2ba9c1abe20cde5c3c69b0b7a6fd7e5121afb2`, `729aded64fe0ab3821e09a489c0314d63d005fe2`, `9d2c79ea02a690e1f1414841b7a18e7dc3f41551`, `852b7600d3f5a272872479d154c6d3093737b0f2`, `66a36372f76334aa4b4b54eb4eef77cb9f385379`, `5d3cbe2e90c8b3e2a76e545bfb3d8cae569d134a`, `755f54fa1c26e96ea14e28cb0b5a8ce6ab636e54`, and `36b4f885204951168f16977cfadfe5a8d3fa6dfb`.

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
- `apps/app/assets/images/`
- `apps/app/src/app/life-seasons.tsx`
- `apps/app/__tests__/life-seasons-session-fencing-test.tsx`
- `apps/app/__tests__/life-seasons-draft-session-fencing-test.tsx`
- `apps/app/src/state/app-state.tsx`
- `apps/app/__tests__/app-state-session-fencing-test.tsx`
- `apps/app/__tests__/app-state-persistence-queue-session-fencing-test.tsx`
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
