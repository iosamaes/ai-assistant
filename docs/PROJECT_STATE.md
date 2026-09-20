# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy source hardening is broadly implemented; execution-dependent security/privacy gates remain owner validation.
- CP11 static verification/release readiness is being completed while the active worker policy forbids workers from running product tests, builds, typechecks, database validation suites, GitHub Actions, or cloud CI.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `f2786fbae29a0ee1fa7bf77eb1504fc8fb80c208`.

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
- [ ] CP10 — Security, privacy, owner-data control — **IN_PROGRESS / runtime verification pending**
- [ ] CP11 — Test matrix, performance, release readiness — **static harness prepared; execution pending**
- [ ] CP12 — Independent final review and handoff

## CP8 reliability state
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Static implementation covers durable per-user retry for check-ins and Invisible Wins, stable mutation IDs and duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching with validation/expiry, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and restart/reconnect/concurrency specifications. CP8 cannot close until owner/runtime evidence confirms the required offline/reconnect behavior.

## CP9 presentation state
Detailed architecture: `docs/CP9_PRESENTATION_ARCHITECTURE.md`. Runtime design-swap procedure: `docs/CP9_DESIGN_SWAP_PROOF.md`.

The owner-approved premium reference is broadly implemented in static source: adaptive Home/Life Map/One Move/Insights/More navigation, shared semantic iconography, responsive Life Map radar, premium Today/One Move composition, WHY/Insights evidence language, What If range visualization, Experiments/Recovery/Onboarding/Personalization/Invisible Wins treatments, truthful bounded meters, premium Auth/Privacy/Settings/Integrations and secondary decision surfaces, Western-digit formatting, app-local RTL geometry, reduced-motion handling, dynamic-type/shared-control sizing, semantic light/dark roles, and multiple account-switch/session-fencing paths.

Prepared owner/runtime evidence includes:
- `tests/e2e/visual-evidence-live.spec.ts` — read-only Today/Life Map/WHY/interacted Check-in captures for persisted-English and persisted-Arabic completed accounts across the full responsive light/dark matrix; captures wait for localized ready markers, settled loading, no known load-error state, and browser fonts.
- Real Tab/Enter keyboard journeys for auth and the primary product shell, including after Arabic RTL hydration.
- `apps/app/__tests__/theme-contrast-policy-test.ts` — static semantic normal-text contrast contract after the light `textMuted` token correction.
- `docs/CP9_DESIGN_SWAP_PROOF.md` — deliberate owner-side proof constrained to the presentation boundary for Today, Life Map, WHY, and an interacted Check-in flow, with a required diff proving no core/application/data/provider edits and restoration of the production visual direction afterward.

### CP9 remaining
- Make only demonstrated residual accessibility/RTL/localization/focus/technical-id/presentation fixes; do not manufacture speculative polish.
- Execute and inspect the prepared runtime visual matrix across narrow/common phone, tablet portrait/landscape, wide Web, Arabic/English, and light/dark.
- Manually inspect keyboard focus indicators and representative interactions; automated screenshots do not replace interaction review.
- Execute and record the deliberate design-swap proof. CP9 remains open until this runtime evidence exists.

## Notifications/preferences surface
The TASK-required Notifications/preferences surface is statically implemented using the existing user-owned `plugin_settings` boundary. `dailyCheckIn`, `experimentReminders`, and `recoveryPrompts` default off; enabling a preference records consent time and disabling all categories clears consent. Settings truthfully states that device notification delivery is not configured in this build, so preference persistence does not imply a push/local notification was sent.

Static/live harness coverage includes bilingual RTL-aware controls, contextual screen-reader names, disabled-row fallback semantics, account-switch stale-load/stale-save fencing specifications, and an opt-in live persistence → reload → restore → reload journey. Actual notification delivery remains intentionally unclaimed and does not justify a provider credential Human Required item unless delivery is later implemented.

## CP10 security/privacy state
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented source hardening includes user-owned table/RLS review, cross-user policy specifications, function-execute hardening migration `0009`, authenticated portable export migration `0010`, Life Season expected-user fencing migrations `0011`/`0012`, JWT-protected `delete-account` Edge Function v2 with expected-user matching, export/two-step deletion and local-cache purge attempts, consent rechecks around integration sync, safer logging/error boundaries, and broad account-switch/session fencing across the shipped application.

The production sensitive logging/error-reporting source review is complete for the reviewed production tree and should reopen only if a genuinely new production sink/boundary appears.

### CP10 remaining
- Owner/runtime validation for cross-user/database specifications, Life Season expected-user behavior, export/delete/local purge, destructive Edge deletion v2, consent-revocation races, account-switch/session-binding cases, offline replay ownership, and notification-preference account isolation/persistence restoration.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## CP11 static readiness
Detailed ledger: `docs/CP11_RELEASE_READINESS.md`.

The main Playwright Web matrix defines **320×568**, **390×844**, **834×1194**, **1194×834**, and **1440×900**, each in light/dark. Native Android/iOS validation is a separate owner/runtime gate.

Prepared static verification covers auth/route guard/password recovery, real keyboard navigation, onboarding, completed-account product navigation, Arabic persisted-locale coverage, Recovery/What If, privacy export, live daily-loop and feedback-learning mutations, Spiritual Grounding toggle/restore, notification preference persistence/restore, destructive account deletion with a dedicated disposable account, shared browser diagnostics, production logging policy, semantic contrast policy, CP9 visual-evidence capture, opt-in performance sampling, production static-Web export smoke, and dependency-free exported-size reporting.

### Latest CP11 performance readiness
- `35327811a8f8fe07d32b33fac3280ef88526dc14` — added opt-in read-only `tests/e2e/performance-live.spec.ts` for the persisted-English completed account. It records authenticated Home readiness, Home → Life Map → One Move → Insights → More route-readiness durations, browser navigation/resource timing, observed long-task durations, horizontal overflow, and critical browser diagnostics. It attaches `performance-sanity.json` and uses deliberately broad regression tripwires of 15 s authenticated readiness, 5 s per primary route transition, and 1 s maximum observed long task. These are sanity ceilings, not product SLOs.
- `ab34901be58c893090c2f01326c08f28cc6d87ac` — root script `npm run test:e2e:performance` runs the performance sample once in `desktop-light`.
- `bb72ae16428dc90e2b463cb362aa00cc92dcf996` — `.env.example` adds explicit `MIZAN_E2E_PERFORMANCE=0` opt-in without credentials.
- `9dc3cd0dc4444f00f4a9b3f5eadac740a368127d` + `fe24046ed606f58119284a140098efcc318f673d` — root README and CP11 ledger document interpretation and explicitly distinguish controlled E2E runtime measurements from production-export performance proof.

### Latest CP11 production-export readiness
- `834ad443380636a6868a85548943a9239b166315` + `8f122852dcd788cbb3331178a161fc352bf5c1cf` — explicit Web/Android/iOS Expo export commands now exist in the app workspace and at repository root for clean-checkout validation.
- `d25c518c564185b8c9ec2380c56b72d0f30ae2d6` — added dependency-free `scripts/serve-expo-static.mjs` to serve the actual Expo static export with exact route-file resolution rather than an SPA fallback.
- `f403e38144038389a55066fde7679b5615fac10f` — added `playwright.production.config.ts`, which builds the Web export and serves `apps/app/dist` on a separate port for representative phone-light and desktop-dark production smoke checks.
- `c36e2df4b6e01d88c5873234c1c670425fb14733` — added `tests/e2e/production-web.spec.ts`: signed-out direct-route/auth hydration always runs; with the normal live completed account it also checks authenticated direct-route/session hydration, shell routing, WHY, overflow, and shared page/console/network/5xx diagnostics.
- `53e5857184712f4188030da247458a688b51894b` — root `npm run test:e2e:production` exposes the production-export smoke flow.
- `7d55235d224b1c55e41693fe8d4cee87b74a906c` + `e5eb15fe5abc0ece74c02066922f9f4328c7571d` — root README and CP11 ledger document the production-export gate and explicitly retain separate bundle/performance/native owner review requirements.

### Latest CP11 production-size readiness
- `42487d8b1302d680a0214da1f2efa7701f122f8a` — added dependency-free `scripts/report-expo-static-size.mjs`, which measures total export bytes, JavaScript/CSS raw and gzip sizes, aggregate gzip size for compressible assets, and the 15 largest exported files.
- `e2eb9e84425e0af931591fbe9d79ef90cdef4fe4` — root `npm run report:web-size` exposes the measurement against `apps/app/dist`.
- `587bcc3ad5a165a2ca2607413c90bc561d2f17a0` — the production Web smoke path now emits the size report immediately after export and before serving/browser checks, so production route smoke and static-size evidence come from the same output.
- `fd3810f55953c8d40e8fb697b99fb230538e7f10` + `b96d19e89bbd90e3544c69f2266012ef4c091305` — root README and CP11 ledger document how to retain the measurement as a release baseline without inventing an arbitrary product SLO before real production evidence exists.

All CP11 additions above are **static harness/readiness evidence only**. Workers did not run the performance spec, production export/smoke, size reporter, tests, builds, typechecks, or database suites under the active policy.

### CP11 remaining
- Run TypeScript, lint, unit/component/integration, database/policy, and full Web E2E suites from a trustworthy checkout.
- Execute and inspect keyboard/focus journeys, visual evidence, live mutation journeys, and destructive deletion only with the documented dedicated fixtures.
- Execute `npm run test:e2e:performance` and inspect its structured report.
- Execute `npm run test:e2e:production`, inspect direct-route/static-export browser diagnostics, retain the emitted Web size report as the first reviewed baseline, and investigate material bundle/static-asset growth separately from startup/interaction performance.
- Run Expo diagnostics and Android/iOS export checks available in the owner environment.
- Perform a clean-checkout setup using the root README and correct any missing prerequisite/configuration/test/export step.
- Record exact commands, versions, results, failures/fixes, Web size evidence, and owner release actions before CP11 can close.

## Exact next executable action
1. Continue CP9 static work only when a concrete residual defect is demonstrated; otherwise leave the prepared runtime evidence and design-swap proof to owner validation.
2. Keep CP10 source review scoped to genuinely new security/account-sensitive boundaries; do not reopen the completed logging audit without a new sink.
3. Keep CP11 static harness aligned with the release contract. Execution-dependent gates remain owner validation under current policy; the production smoke now supplies static-size evidence as well as direct-route/browser diagnostics.
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
- Authorized migrations `0009`–`0012` were applied previously; live ACL/state reads are implementation evidence, not a behavioral suite PASS.
- `delete-account` v2 was previously deployed ACTIVE with JWT verification; destructive end-to-end deletion remains unverified until the owner-side disposable-account journey runs.
- The current CP9/CP10/CP11 source and verification harness therefore remain pending the explicit runtime/test/build evidence required by TASK.md.

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
- `playwright.production.config.ts`
- `scripts/serve-expo-static.mjs`
- `scripts/report-expo-static-size.mjs`
- `tests/e2e/browser-assertions.ts`
- `tests/e2e/product-live.spec.ts`
- `tests/e2e/visual-evidence-live.spec.ts`
- `tests/e2e/performance-live.spec.ts`
- `tests/e2e/production-web.spec.ts`
- `tests/e2e/notification-preferences-live.spec.ts`
- `tests/e2e/account-deletion-live.spec.ts`
- `automation/HUMAN_REQUIRED.md`
