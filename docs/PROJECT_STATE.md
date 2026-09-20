# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy implementation continues in parallel; source hardening is broadly present but runtime/security verification remains outstanding.
- CP11 static verification harness is being expanded while execution-dependent gates remain owner validation under the current worker policy.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `f2786fbae29a0ee1fa7bf77eb1504fc8fb80c208`.
- Workers may add/update source, tests, and the authorized Supabase project, but must not run product tests, builds, typechecks, database validation suites, GitHub Actions, or cloud CI under the active task policy.

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
Detailed ledger: `docs/CP9_PRESENTATION_ARCHITECTURE.md`.

The owner-approved premium reference contract is broadly present in static source: adaptive Home/Life Map/One Move/Insights/More navigation, shared semantic iconography, responsive Life Map radar, premium Today/One Move hierarchy, WHY/Insights evidence language, What If range visualization, experiment/recovery/onboarding/personalization/invisible-wins treatments, truthful bounded quantitative meters, premium Auth/Privacy/Settings/Integrations/secondary decision surfaces, Western-digit formatting, app-local RTL geometry, reduced-motion navigation, dynamic-type/shared control sizing, and repeated account-switch/session fencing.

Recent residual fixes include:
- Integrations visible copy no longer exposes implementation-facing deterministic-provider wording.
- Experiments progress has contextual accessibility naming and RTL grid hardening.
- Recovery, What If, Today, and Life Map quantitative/progress geometry mirror from semantic RTL direction.
- Onboarding exposes the minimum-one-domain rule instead of leaving a silent dead tap.
- Invisible Wins, Life Seasons, and Experiments use an explicit unknown fallback instead of raw storage/ISO date strings when formatting fails.
- Shared `AppIcon` behavior and Western-digit source policy have focused regression specifications.

### CP9 remaining
- Fix only demonstrated residual defects on still-unreviewed shipped surfaces: untranslated literals, semantic RTL/icon direction, accessibility semantics, truncation/dynamic type, keyboard/focus, technical identifiers, or duplicated foundational presentation decisions. Do not manufacture speculative polish.
- Owner/runtime evidence remains required across narrow/common phone, tablet portrait/landscape, and wide Web, with Arabic/English and shipped light/dark modes.
- The TASK-required runtime design-swap proof remains pending for Today, Life Map, WHY, and interaction-heavy Check-in. Static source review is not runtime visual evidence.

## CP10 security/privacy state
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented source hardening includes RLS/ownership review of current user-owned client-visible tables, cross-user policy specifications, function-execute hardening migration `0009`, authenticated portable export migration `0010`, Life Season expected-user fencing migrations `0011`/`0012`, JWT-protected `delete-account` Edge Function v2 with expected-user matching, export/two-step deletion UI and local cache purge attempts, consent rechecks around integration sync, safer error-boundary/logging boundaries, and broad account-switch/session fencing.

Account-sensitive presentation paths hardened or explicitly reviewed include Today decision/feedback, Invisible Wins, Recovery, Check-in, Privacy, Onboarding, Update Password, Settings, Personalization, Life Seasons, Experiments, Cost of Yes, Human ROI, Capacity, Integrations, WHY, What If, Personal Learning, Value Alignment, and root offline replay. The production sensitive logging/error-reporting source review is complete for the current tree and should reopen only if a new production sink/boundary is introduced. A focused source-policy specification now scans production app/core/plugin/Edge source and rejects new ad-hoc `console.*` sinks while preserving only the existing development-only sanitized render diagnostic.

### CP10 remaining
- Owner/runtime validation for cross-user/database specifications, Life Season expected-user behavior, export/delete/local purge, destructive Edge deletion v2, consent-revocation races, account-switch/session-binding cases, and offline replay ownership.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## CP11 static readiness
Detailed release ledger: `docs/CP11_RELEASE_READINESS.md`.

The Playwright Web matrix defines five representative viewport classes — **320×568 narrow phone, 390×844 common phone, 834×1194 tablet portrait, 1194×834 tablet landscape, and 1440×900 desktop** — each in light and dark emulated color schemes. Native Android/iOS validation remains a separate owner/runtime gate.

Prepared static verification paths include:
- Auth/route-guard and password-recovery coverage with shared critical browser diagnostics.
- Dedicated onboarding account coverage, with mutation completion isolated to `desktop-light` and the same critical browser diagnostics.
- Completed-account shell, Recovery, What If, Settings, Privacy export, daily check-in, One Move → explicit feedback → Personal Learning, and Spiritual Grounding toggle/restore coverage.
- Read-only CP9 owner-reference evidence checks for WHY, Personal Learning, Experiments, and Integrations across the full responsive/light-dark matrix, including the dedicated persisted-Arabic account when configured.
- Isolated destructive account-deletion E2E using a dedicated disposable account, local user-scoped cache sentinels, two-step confirmation, post-delete credential rejection, and critical browser diagnostics; destructive execution is single-project only.
- Mutation journeys are isolated to `desktop-light` to avoid shared-account write races.
- A static production-logging privacy policy rejects new ad-hoc console sinks across app/core/plugin/Edge production source and constrains the one allowed development render diagnostic to a fixed label plus React component stack.

### Latest CP11 harness and release-readiness hardening
- `b1b3ff43e463fe33e59cc192b4fa0ace72db2ec1` — live product journeys now collect critical browser diagnostics: uncaught page errors, browser `console.error`, failed requests, and HTTP 5xx responses.
- `b5b1c379e6be8163ea09cf3c7d240d7940a02bc9` — expected Chromium `net::ERR_ABORTED` navigation cancellations are excluded so the diagnostic guard targets real failures instead of route-change noise.
- `53577c0c557dbea8cf5b7e03db177bfb1d45d9a3` — live-account helpers support a separate completed account whose persisted MIZAN locale is Arabic.
- `2ed09abe739ac23c846e41f6103ea7d9d61d35f1` — the dedicated Arabic account adds read-only Arabic primary-shell routing/overflow coverage across the full responsive/light-dark matrix without racing persisted locale changes on the normal completed account.
- `152bd7aeeadad90a4eacbda0b68099685af4f5ec` — `.env.example` documents `MIZAN_E2E_ARABIC_EMAIL` / `MIZAN_E2E_ARABIC_PASSWORD` names only; no credentials are stored.
- `8cceddac08725f2a0dacacdbcc8be406b9fdac84` — the CP11 release ledger records the Arabic fixture and browser-diagnostic contract.
- `2d8b4fb98aa165222b05d6c1726a4b77f2a65be9` — the previously missing root `README.md` is now present with clean-install requirements, public environment setup, local Supabase initialization/reset guidance, run/test/E2E commands, destructive-test safety boundaries, Expo export guidance, architecture invariants, and links to the current release ledger.
- `f4822edeb7f86491ce8284269092683f482796f1` — the stale create-expo-app starter `apps/app/README.md` was replaced with MIZAN workspace-specific run/configuration/quality/export/source-layout guidance; the nonexistent starter `reset-project` instruction is gone.
- `da486e76f8d6809e046f7a05ca4acf1a8128fc3c` — the CP11 release ledger now records both README surfaces and requires a clean-checkout owner/new-engineer setup run before claiming documentation readiness.
- `6976b8e711647da57ee9e0c3fa52329aea5b0f11` — generic overflow and critical browser/runtime assertions moved into `tests/e2e/browser-assertions.ts`, keeping them independent from account-fixture/sign-in concerns.
- `43fe31ba67ee7e11cf83379381596f12254a9fa6`, `f8fb6d4e1c83fd0e1b0c3a80035f1f51d23c68bd`, and `b10d297e31fa37891b8c1ef9a666833cbf057744` — completed-account, onboarding, and destructive-deletion journeys consume the shared browser assertions rather than maintaining inconsistent local guards.
- `a713ed3380e1c6190e3c03f64d540e441f414c02` — signed-out auth/route-guard, locale-switch, and password-reset journeys now also fail on browser console errors, unexpected failed requests, and HTTP 5xx responses instead of checking only one page-error path.
- `a43efda03152cc4232a56981e53c48cdf5d61cd5` — the CP11 release ledger documents the shared browser-assertion boundary and its coverage across signed-out and live journeys.
- `71cae9a7d538a7469f2a8004aff8d0b8b991fc59` — a production-source logging/privacy policy specification now rejects ad-hoc console sinks across app/core/plugin/Edge source and constrains the sanitized development render diagnostic; it is unexecuted under worker policy.
- `47dc7796b44780a041655c87ca90318dd174818b` — completed-account Web E2E now adds read-only WHY, Personal Learning, Experiments, and Integrations route/heading/overflow evidence across the full responsive/light-dark matrix for both normal and dedicated persisted-Arabic fixtures.
- `bb2f02b2bf46a8ea4c8d81ac020ca8cb09038b9e` — the CP11 release ledger records the expanded owner-reference surface matrix and production logging-policy specification without claiming execution.

These are static harness/readiness changes only. **No E2E run, destructive delete, test result, typecheck, build, database-policy execution, performance result, or release PASS is claimed by workers under the active policy.**

## Exact next executable action
1. Continue CP9 static work only if a concrete accessibility/RTL/localization/focus/technical-id/presentation defect is demonstrated; otherwise leave visual/runtime proof to owner validation.
2. Continue CP10 source work only if a still-unreviewed account-sensitive async path or new security/logging boundary is demonstrated; avoid reopening already-fenced paths without evidence.
3. Keep CP11 static harness aligned with the release matrix and close demonstrated coverage/documentation gaps, but leave actual TypeScript/lint/tests, database-policy suites, Web E2E, destructive deletion, production Web export, native checks, performance measurements, screenshot/device validation, clean-checkout execution, and design-swap runtime evidence to owner validation under the current policy.
4. When owner execution evidence exists and CP0–CP11 gates are honestly satisfied, proceed to CP12 independent two-worker review; do not mark completion from static implementation alone.

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
- `delete-account` version 2 previously reported ACTIVE with JWT verification enabled; destructive end-to-end deletion remains unexecuted. The dedicated deletion E2E harness prepares owner-side proof only.
- Premium-reference/residual CP9 fixes and account-fencing regression specifications remain static evidence until owner validation.
- Capacity account-switch coverage and root offline-replay ownership coverage are present but unexecuted under the worker policy.
- The five-viewport × two-color Playwright matrix, destructive deletion harness, Arabic read-only completed-account path, expanded WHY/Personal Learning/Experiments/Integrations evidence surfaces, and shared browser diagnostic guards are configured but unexecuted.
- The production logging/privacy source-policy specification is present but unexecuted; it must not be treated as runtime telemetry proof.
- Root/app setup and release documentation are now MIZAN-specific rather than starter/template documentation, but the documented flow still requires owner clean-checkout execution evidence.

## Known blockers / risks
- CP1/CP9: true phone/tablet/Web visual interaction evidence still needs an unlocked owner runtime; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action.
- Cross-user/database specifications and all post-baseline runtime/type/build gates require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- CP9 representative screenshots, interaction validation, and the final design-swap proof remain outstanding.
- Privacy export/delete, local cache purge/warning behavior, account-scoped confirmation, Edge v2 expected-user deletion fencing, Life Season expected-user fencing, and account-switch/session-binding behavior still need Web/native/end-to-end validation.
- CP11 Web projects, production Web console/network/build inspection, native device/export validation, clean-setup confirmation, and performance evidence remain owner-side.
- The optional Arabic read-only matrix requires a dedicated completed test account with persisted Arabic locale; absent credentials cause the specification to skip rather than mutate another account.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `README.md`
- `apps/app/README.md`
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `docs/CP11_RELEASE_READINESS.md`
- `playwright.config.ts`
- `package.json`
- `.env.example`
- `tests/e2e/browser-assertions.ts`
- `tests/e2e/live-account.ts`
- `tests/e2e/auth.spec.ts`
- `tests/e2e/product-live.spec.ts`
- `tests/e2e/onboarding-live.spec.ts`
- `tests/e2e/account-deletion-live.spec.ts`
- `apps/app/__tests__/production-logging-privacy-policy-test.ts`
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
- `apps/app/src/app/capacity.tsx`
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
