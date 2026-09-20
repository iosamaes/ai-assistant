# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy implementation continues in parallel; source hardening is broadly present but runtime/security verification remains outstanding.
- CP11 static verification/release harness is being expanded while all execution-dependent gates remain owner validation under the active worker policy.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `f2786fbae29a0ee1fa7bf77eb1504fc8fb80c208`.
- Workers may edit authorized source/tests/backend state but must not run product tests, builds, typechecks, database validation suites, GitHub Actions, or cloud CI.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation — implementation present; owner responsive/locale runtime evidence pending
- [ ] CP2 — Supabase, auth, ownership, persistence — implementation present; owner/runtime validation pending
- [ ] CP3 — Deterministic intelligence core — implementation present; validation pending
- [ ] CP4 — First complete daily loop — implementation present; validation pending
- [ ] CP5 — Insight, explanation, personal learning — implementation present; validation pending
- [ ] CP6 — Advanced decision tools — implementation present; validation pending
- [ ] CP7 — Plugins, unified integrations, provider boundaries — implementation present; validation pending
- [ ] CP8 — Reliability, offline tolerance, sync — statically reviewed complete; owner/runtime validation pending
- [ ] CP9 — Responsive UX, accessibility, localization, polish, design-swappability — **IN_PROGRESS**
- [ ] CP10 — Security, privacy, owner-data control — **IN_PROGRESS in parallel**
- [ ] CP11 — Test matrix, performance, release readiness — static harness expanded; execution pending
- [ ] CP12 — Independent final review and handoff

## CP8 reliability state
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Static implementation includes durable per-user retry for check-ins and Invisible Wins, stable mutation IDs and duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching with validation/expiry, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and reconnect/restart/concurrency specifications. CP8 is not `DONE` until owner/runtime evidence confirms restart/reload and offline/reconnect behavior.

## CP9 presentation state
Detailed architecture: `docs/CP9_PRESENTATION_ARCHITECTURE.md`.

The owner-reference premium contract is broadly present in static source: adaptive Home/Life Map/One Move/Insights/More navigation, shared semantic iconography, responsive Life Map visualization, premium Today/One Move hierarchy, WHY/Insights evidence language, What If range visualization, Experiments/Recovery/Onboarding/Personalization/Invisible Wins treatments, truthful bounded meters, premium Auth/Privacy/Settings/Integrations/secondary decision surfaces, Western-digit formatting, app-local RTL geometry, reduced-motion navigation, dynamic-type/shared control sizing, repeated account-switch/session fencing, and semantic light/dark palette roles.

Recent residual fixes include semantic RTL progress geometry, unknown-safe date/value formatting, onboarding minimum-domain explanation, technical-provider-copy cleanup, shared icon accessibility policy, Western-digit source policy regression specifications, a pointer-free keyboard verification path for authentication and the primary product shell, accessible-label password selectors for the Web harness, and a demonstrated light-theme muted-text contrast correction.

### New CP9 runtime-evidence preparation
- `4649f097024351ee7d288085ae76daa55284eb91` — added opt-in read-only `tests/e2e/visual-evidence-live.spec.ts`. It captures full-page Today, Life Map, WHY, and Check-in screenshots for English/default and persisted-Arabic completed accounts across every configured Playwright viewport/light-dark project, while asserting authenticated product chrome, no horizontal overflow, and shared critical browser diagnostics.
- `2f0725f0ecf0865f3e8cccf314cfdb9b0700bace` — `.env.example` now documents `MIZAN_E2E_VISUAL_EVIDENCE=0` without credentials.
- `c5c05930b1226893ee2a5043875e2ff08c44d761` — root package scripts expose `npm run test:e2e:visual`.
- `74c5b59f1ac256f77551dd2459a3bf7fcdaf6e6d` and `99cdd5bc31de68811453e6ad2c3482fd1a8b5d19` — root README and CP11 release ledger document the capture contract and explicitly state that source presence is not runtime proof.
- `6a64a1bd5b1ff9abc35e60390500a77d5344fa38` + `05162904fba11d8a75e34546c737c492ec28539a` + `693ea427247d252e659cd4b4958e6818cdf192a2` — auth E2E now contains a real Tab/Enter path for locale switching, Email, Password, and the enabled Sign in control, with shared bounded keyboard-focus traversal rather than programmatic `.focus()`.
- `c6cb14622a5ecefebb3147499af0d18c7af45643` + `91583d9b500e7d90effca63b3a489dc5b74d774b` — completed-account product E2E now proves the primary tab shell is reachable and route-activatable by keyboard in the normal account and again after persisted Arabic RTL hydration. These are static specifications only until owner execution.
- `f725fbd17954651ab17aac56ad1cdfcabe575d48` + `11ba928363ce3ad80f890781ab822b2017eef019` — password input selection in signed-out and live-account E2E now uses the explicit accessibility label instead of assuming secure HTML password inputs expose the implicit `textbox` role; this keeps the verification path aligned with the product accessibility contract.
- `eb9c048f3ad774ba14f78c4459c1710b1c2eeaaf` — corrected the light semantic `textMuted` token from `#627067` to `#5C6A61` after static luminance analysis showed the previous token below 4.5:1 on both `surfaceMuted` and `accentSoft`, two shipped backgrounds used with normal-size muted copy.
- `cc1196c7ecee9aece8fa828b8bceededd09d7cbe` — added `apps/app/__tests__/theme-contrast-policy-test.ts`, which computes sRGB relative luminance and statically requires the shipped semantic normal-text/surface pairs to remain at least 4.5:1 in light and dark. The specification has **not** been executed by workers.
- `08f19860603b58a5c30e28b224a17a9b597f5673` — CP9 presentation architecture now records the contrast defect, token fix, and static regression contract without claiming a runtime/test PASS.
- `4cdde370fd067d926470b8bd2174793c948a2870` — the English visual-evidence path now proves the normal completed fixture has a persisted English MIZAN locale before accepting it as English evidence; authentication-screen language alone can no longer silently mislabel an Arabic profile capture.
- `3d95935188efd8b896c09ef3cb74cf780fbaeeeb` — the CP9 visual capture now waits for each surface's localized ready marker, waits for asynchronous loading text to clear where applicable, rejects known load-error states, and waits for browser fonts before taking the screenshot. This prevents half-loaded or wrongly localized screenshots from counting as evidence.
- `170acaf0c28bc2c7a7685dac3187d6f0f905ac81` + `f3964eeafd239b7bdfb70b93e9236047c5fdd1ce` — `.env.example` and the root README now document the persisted-English fixture requirement and the stable-capture contract without adding credentials or claiming execution.
- `7496bb9fa3f80d8859e1d2a6fd307cde2ea133ca` — the visual-evidence harness now enters a real **non-persisting Check-in interaction state** by selecting Energy `3`, verifying the selected state and enabled Save control, then capturing the screen without submitting. The interaction-heavy CP9 proof surface is therefore represented by an actual control state rather than only an untouched form.
- `ae63bdb335fdf4f83ffc5447945ae756c362f54c` — added `docs/CP9_DESIGN_SWAP_PROOF.md`, an owner-side runtime proof procedure that constrains the temporary alternate direction to the presentation boundary, requires Today/Life Map/WHY/interacted Check-in evidence, requires a diff proving no core/application/data/provider edits, and requires reverting the temporary direction after evidence is recorded.

### CP9 remaining
- Fix only demonstrated residual defects on still-unreviewed shipped surfaces; do not manufacture speculative polish.
- Owner/runtime evidence remains required across narrow/common phone, tablet portrait/landscape, and wide Web, Arabic/English, and shipped light/dark modes.
- Execute and inspect the prepared visual-evidence matrix plus the keyboard/focus journeys; a successful automated run still does not replace human focus-indicator and interaction review.
- Execute the prepared `docs/CP9_DESIGN_SWAP_PROOF.md` owner procedure and record its evidence. The TASK-required deliberate runtime **design-swap proof** remains pending until that happens.

## Notifications/preferences surface
The TASK-required **Notifications/preferences** product surface was previously missing and is now statically implemented without pretending push delivery exists.

- `a9067ca4515b4c4c7571db58a8f2d1efc956fec9` + `025674cac139989a4506a593319444bf2461f556` — added account-fenced notification preferences using the existing user-owned `plugin_settings` persistence boundary. `dailyCheckIn`, `experimentReminders`, and `recoveryPrompts` all default **off**; a disabled row is treated as fully off even if stale JSON exists. Any enabled preference records explicit consent time; turning all categories off clears consent.
- `8c3c4977562849193409049f8f77053d0a72fd88` — shared icon vocabulary now includes a notification semantic.
- `e873cdac1a051aa7fc7a15ec228ecb2c38f0592c` — Settings now exposes bilingual, RTL-aware preferences for one-minute check-in reminders, voluntary experiment follow-up, and recovery reminders. Copy explicitly rejects urgency/streak/fear engagement tactics and truthfully states that **device notification delivery is not configured in this build**, so saving a preference does not falsely imply a push notification will be sent.
- `ef5a507a2657c993f26c6f032aaa205f67c8de1d` + `91223e5cbafe69d964dda7d67643c41692100ab4` — repeated Allowed/Off controls now expose category-specific screen-reader labels, and the static policy specification guards those contextual accessibility names.
- Existing `plugin_settings` ownership/RLS, authenticated account export, and auth-user cascade deletion already cover this preference namespace; no new schema table or secret/provider dependency was justified.
- `c439fb0e830394102c41813f9c6f6ab1f94439dd` — initial static policy specification guards opt-in defaults, account fencing, persisted keys, anti-gaming copy, and the no-delivery disclosure; the later accessibility commit above extends that policy.
- `fefa86481dd0d197872bf31995d0338fceb8be67` — completed-account Web E2E statically requires the notification-preferences surface and no-delivery disclosure on Settings; the Arabic shell path also requires the Arabic notifications heading.
- `b099e34f49b8c57e0144ea5545346c5a0bc7df1d` — added a mutation-gated live Web specification that toggles the one-minute check-in notification preference, reloads Settings to prove persisted state, restores the original value, reloads again, and checks overflow/browser diagnostics. It is intentionally limited to `desktop-light` and remains unexecuted by workers.
- `b5e842d6b2fcf1443f4cb59badfe59726b06015c` — `npm run test:e2e:mutations` now includes the notification-preference persistence/restore specification alongside the existing live mutation journeys.
- `eceb93f8866d4e203276ecfc3c18019d782deeda` — strengthened the static notification policy specification to guard disabled-row fallback semantics and explicit consent timestamp clearing when all reminder categories are off.
- `819ab8a0970749e558b424b891703a41049a12ad` — added a behavioral regression specification for notification-preference account switching: a stale load from user A cannot replace user B's loaded preferences, and a stale save completion from user A cannot alter user B's state. The specification is intentionally unexecuted under worker policy.

Actual notification scheduling/delivery remains intentionally **not claimed**. If the product later chooses to ship device push/local scheduling, it still requires an application-owned notification provider boundary, permissions/credential handling, and owner/runtime validation; a push-provider credential action should only be added to `automation/HUMAN_REQUIRED.md` when such delivery is actually being implemented and blocked by missing credentials.

## CP10 security/privacy state
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented source hardening includes RLS/ownership review of user-owned client-visible tables, cross-user policy specifications, function-execute hardening migration `0009`, authenticated portable export migration `0010`, Life Season expected-user fencing migrations `0011`/`0012`, JWT-protected `delete-account` Edge Function v2 with expected-user matching, export/two-step deletion UI and local-cache purge attempts, consent rechecks around integration sync, safer error-boundary/logging boundaries, and broad account-switch/session fencing.

Account-sensitive presentation paths hardened or explicitly reviewed include Today decision/feedback, Invisible Wins, Recovery, Check-in, Privacy, Onboarding, Update Password, Settings, Personalization, Life Seasons, Experiments, Cost of Yes, Human ROI, Capacity, Integrations, WHY, What If, Personal Learning, Value Alignment, root offline replay, and notification-preference persistence. Notification preferences now also have a behavioral stale-load/stale-save account-switch regression specification. The production sensitive logging/error-reporting source review is complete for the previously reviewed tree and must reopen when a genuinely new production sink/boundary is introduced.

### CP10 remaining
- Owner/runtime validation for cross-user/database specifications, Life Season expected-user behavior, export/delete/local purge, destructive Edge deletion v2, consent-revocation races, account-switch/session-binding cases, offline replay ownership, and notification-preference account isolation/persistence restoration.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## CP11 static readiness
Detailed release ledger: `docs/CP11_RELEASE_READINESS.md`.

The Playwright Web matrix defines **320×568**, **390×844**, **834×1194**, **1194×834**, and **1440×900**, each in light/dark emulated color schemes. Native Android/iOS validation is a separate owner/runtime gate.

Prepared static verification includes auth/route guard/password recovery, real Tab/Enter keyboard navigation of auth controls, accessible-label password targeting, onboarding, completed-account pointer and keyboard navigation, Recovery/What If/Settings/Privacy export, daily-loop mutation paths, One Move → explicit feedback → Personal Learning, Spiritual Grounding preference toggle/restore, notification preference toggle → reload persistence → restore → reload verification, notification-preference stale-load/stale-save account-switch fencing, Arabic persisted-locale read-only coverage including keyboard navigation after RTL hydration, destructive deletion with a dedicated disposable account, shared critical browser diagnostics, production logging policy, semantic text-contrast regression coverage, and a locale-verified/load-settled CP9 visual-evidence capture matrix whose Check-in frame uses a real non-persisting selected rating.

These are static harness/readiness changes only. **No E2E run, screenshot capture result, keyboard PASS, contrast-test PASS, destructive delete, notification preference persistence/session-fencing PASS, test result, typecheck, build, database-policy execution, performance result, or release PASS is claimed by workers under the active policy.**

## Exact next executable action
1. Continue CP9 static work only when a concrete accessibility/RTL/localization/focus/technical-id/presentation defect is demonstrated; otherwise leave runtime visual/interaction proof to owner validation.
2. Keep CP10 source review scoped to genuinely new account-sensitive/security boundaries introduced by new work; notification preferences now have live persistence and behavioral account-switch specifications but still need owner execution evidence.
3. Keep CP11 static harness aligned with the release matrix. Owner validation must execute typecheck/lint/tests, SQL/RLS suites, Web E2E including keyboard/focus and notification-preference mutation journeys, visual capture, destructive deletion, production Web inspection, native/export checks, performance sanity, clean-checkout setup, and the prepared deliberate design-swap proof.
4. When CP0–CP11 gates are honestly satisfied with execution evidence, proceed to CP12 independent two-worker review. Do not claim completion from static implementation alone.

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
- **No worker-run app tests, builds, typechecks, validation database scripts, cloud CI, or GitHub Actions are claimed for CP2–CP11 changes.**
- Authorized migrations `0009`–`0012` were applied previously; live reads confirmed the hardened Life Season RPC signature/ACL. This is implementation/state evidence, not a behavioral test-suite PASS.
- `delete-account` version 2 previously reported ACTIVE with JWT verification enabled; destructive end-to-end deletion remains unexecuted.
- Premium-reference fixes, account-fencing specifications, notification-preference code/specifications, notification-preference live persistence and session-fencing harnesses, locale-verified/load-settled visual-evidence harness with non-persisting Check-in interaction, responsive/keyboard E2E matrix, semantic contrast regression specification, and production logging guards remain static evidence until owner validation.
- Root/app setup and release documentation are MIZAN-specific, but the documented clean-checkout flow still requires owner execution evidence.

## Known blockers / risks
- CP1/CP9: true phone/tablet/Web visual interaction evidence still needs an unlocked owner runtime; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action.
- Cross-user/database specifications and all post-baseline runtime/type/build gates require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- CP9 representative screenshots, keyboard/focus interaction validation, and final design-swap proof remain outstanding even though capture, interaction-state evidence, keyboard automation, and an exact proof procedure are prepared. English capture now requires a persisted-English completed fixture rather than merely an English auth form.
- Privacy export/delete, local cache purge/warning behavior, account-scoped confirmation, Edge v2 expected-user deletion fencing, Life Season expected-user fencing, and account-switch/session-binding behavior still need Web/native/end-to-end validation.
- Notification preferences persist safely in existing app-owned storage and now have prepared live persistence/restore plus account-switch regression specifications, but actual device notification scheduling/push delivery is intentionally unavailable and unclaimed.
- The optional Arabic read-only matrix requires a dedicated completed test account with persisted Arabic locale; absent credentials cause the specification to skip rather than mutate another account.
- No real AI, wearable, calendar, location, or notification-provider credentials are configured; deterministic/unavailable behavior remains the supported fallback where applicable.

## Evidence paths
- `README.md`
- `apps/app/README.md`
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP9_DESIGN_SWAP_PROOF.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `docs/CP11_RELEASE_READINESS.md`
- `playwright.config.ts`
- `package.json`
- `.env.example`
- `tests/e2e/browser-assertions.ts`
- `tests/e2e/live-account.ts`
- `tests/e2e/auth.spec.ts`
- `tests/e2e/product-live.spec.ts`
- `tests/e2e/notification-preferences-live.spec.ts`
- `tests/e2e/visual-evidence-live.spec.ts`
- `tests/e2e/onboarding-live.spec.ts`
- `tests/e2e/account-deletion-live.spec.ts`
- `apps/app/__tests__/notification-preferences-policy-test.ts`
- `apps/app/__tests__/notification-preferences-session-fencing-test.tsx`
- `apps/app/__tests__/production-logging-privacy-policy-test.ts`
- `apps/app/__tests__/theme-contrast-policy-test.ts`
- `apps/app/src/application/notification-preferences.ts`
- `apps/app/src/infrastructure/supabase/plugin-settings.ts`
- `apps/app/src/constants/theme.ts`
- `apps/app/src/components/mizan-ui.tsx`
- `apps/app/src/components/screen.tsx`
- `apps/app/src/components/app-navigation.tsx`
- `apps/app/src/components/app-icon.tsx`
- `apps/app/src/components/branded-illustration.tsx`
- `apps/app/src/components/app-error-boundary.tsx`
- `apps/app/src/app/_layout.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/life-map.tsx`
- `apps/app/src/app/one-move.tsx`
- `apps/app/src/app/why.tsx`
- `apps/app/src/app/insights.tsx`
- `apps/app/src/app/what-if.tsx`
- `apps/app/src/app/experiments.tsx`
- `apps/app/src/app/recovery.tsx`
- `apps/app/src/app/onboarding.tsx`
- `apps/app/src/app/invisible-wins.tsx`
- `apps/app/src/app/life-seasons.tsx`
- `apps/app/src/app/personalization.tsx`
- `apps/app/src/app/settings.tsx`
- `apps/app/src/app/integrations.tsx`
- `apps/app/src/app/privacy.tsx`
- `apps/app/src/app/update-password.tsx`
- `apps/app/src/app/capacity.tsx`
- `apps/app/src/app/cost-of-yes.tsx`
- `apps/app/src/app/human-roi.tsx`
- `apps/app/src/application/offline-sync.ts`
- `apps/app/src/infrastructure/offline/pending-mutations.ts`
- `supabase/tests/rls_cross_user.sql`
- `supabase/tests/account_data_export_security.sql`
- `supabase/migrations/0009_function_execute_hardening.sql`
- `supabase/migrations/0010_account_data_export.sql`
- `supabase/migrations/0011_life_season_expected_user_guard.sql`
- `supabase/migrations/0012_life_season_execute_hardening.sql`
- `supabase/functions/delete-account/index.ts`
- `automation/HUMAN_REQUIRED.md`