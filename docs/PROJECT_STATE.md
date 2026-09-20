# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy implementation continues in parallel; this does not mark CP9 complete.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `f2786fbae29a0ee1fa7bf77eb1504fc8fb80c208`.
- Worker policy: workers may mutate GitHub source and the authorized Supabase project, but must not run product tests, builds, typechecks, validation database scripts, GitHub Actions, or cloud CI. Execution-dependent gates remain owner validation.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation — implementation present; owner responsive/locale evidence still required
- [ ] CP2 — Supabase, auth, ownership, persistence — implementation present; owner/runtime validation pending
- [ ] CP3 — Deterministic intelligence core — implementation present; validation pending
- [ ] CP4 — First complete daily loop — implementation present; validation pending
- [ ] CP5 — Insight, explanation, personal learning — implementation present; validation pending
- [ ] CP6 — Advanced decision tools — implementation present; validation pending
- [ ] CP7 — Plugins, unified integrations, provider boundaries — implementation present; validation pending
- [ ] CP8 — Reliability, offline tolerance, sync — statically reviewed complete; owner/runtime validation pending
- [ ] CP9 — Responsive UX, accessibility, localization, polish, design-swappability — **IN_PROGRESS**
- [ ] CP10 — Security, privacy, owner-data control — **IN_PROGRESS in parallel**
- [ ] CP11 — Test matrix, performance, release readiness
- [ ] CP12 — Independent final review and handoff

## CP8 current implementation
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Static reliability work includes durable per-user retry for check-ins and Invisible Wins, stable client mutation IDs and duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching with validation/expiry, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and reconnect/restart/concurrency specifications. CP8 is not credited `DONE` until owner/runtime evidence confirms restart/reload and offline/reconnect behavior.

## CP9 current implementation
Detailed presentation/design-swappability ledger: `docs/CP9_PRESENTATION_ARCHITECTURE.md`.

The owner-approved premium reference contract is broadly present in static source: adaptive Home/Life Map/One Move/Insights/More navigation, shared semantic iconography, responsive Life Map radar, premium Today/One Move, WHY/Insights evidence language, What If range visualization, experiment/recovery/onboarding/personalization/invisible-wins treatments, truthful bounded quantitative meters, and premium Auth/Privacy/Settings/Integrations/secondary decision surfaces. Static hardening also covers Western-digit formatting, localized numeric input normalization, malformed-date fallbacks, app-local RTL geometry, reduced-motion navigation, dynamic-type/shared control sizing, and multiple account-switch/session-fencing paths.

### Latest CP9 residual sweep
- `88817770bc4afbfc1760af1776abb03aacb1fedf` + `87053fc4ec9fa41c364f5ad38a888fb14adb7ce6` — Integrations no longer exposes implementation-facing “deterministic core/provider” wording in visible English copy; user-facing core/sample-source language replaces it while internal provider IDs remain unchanged, and a focused source-policy specification was added but intentionally not worker-run.
- `eb13debc885d5bc459f61b5a019709282f2c6128` + `e4d41662d8d73e491f824517d86ab8a8f02d3cbd` — the active Experiments time-progress meter now exposes a contextual accessible name that includes the experiment label instead of presenting an unnamed progress control; focused source-policy regression coverage added and intentionally not worker-run.
- `834d732e6bc169b9a247b4e12449d2dd3aeaffd5` + `590e064b24b712ef83460c05faf2dc7157527997` — shared `AppIcon` glyphs are decorative to assistive technology where adjacent labelled content supplies meaning; focused specification added and not worker-run.
- `f3054b2a17ef9535d8ca68899ed68cfb3f04ac6f` — source-policy specification rejects Arabic-Indic/Eastern Arabic digits from shipped copy while retaining tolerant localized input parsing; not worker-run.
- `b48234834a1aca7c865d4d6dee44100facd3ff57` + `089b423e67be4df923ce7f5e1d4c88b7442e43b1` — Recovery summary/progress sequences mirror from app-local RTL state; focused specification added and not worker-run.
- `33f99b904b1cb41cf2288412004bd6bfbc5ca987` + `b7ab909961069ed2a3da48d8a6bab96e0c2499fd` — Experiments template/stat/metadata/comparison grids mirror correctly in RTL; focused specification added and not worker-run.
- `846c8c9dc95e5abd3d973e7096386f9d5daa9648` + `8d456f2bb9069d0e88b71eb772e130f652aea56a` — What If now mirrors its bounded 0–100 range band, current marker, and endpoint order in Arabic; focused specification added and not worker-run.
- `1319dcc59448c2205c1dc71eaf76e08c386f2c25` + `dcda91b6c55c20ea9294ad116444e7e65d5a619d` — Onboarding no longer exposes a silent dead tap on the final enabled life-domain chip; the control is disabled and the minimum-one-domain rule is visible and accessible; focused specification added and not worker-run.
- `bb3994d3bf3ae546923ede89d9e92b3ec5aaecc6` + `587fd385ce806ea87e2280f8c9223cd2f8b68263` — Today/Home known-value state meters and season-balance meter now fill from the semantic RTL reading edge; focused specification added and not worker-run.
- `4069e5310ca1c964154a6e15aa404cf6083ae921` + `3c9fceb276e68cb4c7f676021159b732621d1602` — Life Map domain score meters now fill from the semantic RTL reading edge rather than the physical left edge; focused source-policy specification added and intentionally not worker-run.
- `0d7537cadccc19a78c04310352e1fb36726932ba` + `ab6b25a417697a1ba2a0ee734a3a8584427d9e82`, `f2ad18b5ba78fcc2d42c4990863ff67108e8eb89` + `e2e1bcc01159dc7cfc43467ac6d8732ff7a8beaa`, and `e25613ad92316446c5bae678bca284ce54c98075` + `80d4ea1035b0d2186d3593ceb6d05fe8677eda01` — Invisible Wins, Life Seasons, and Experiments no longer fall back to raw ISO/storage date strings when locale formatting fails; they render an explicit unknown em dash instead, with focused source-policy specifications added and intentionally not worker-run.

### CP9 remaining
- Continue only concrete residual static defects on still-unreviewed shipped surfaces: untranslated literals, semantic RTL/icon direction, missing accessibility semantics, truncation/dynamic type, keyboard/focus, technical identifiers, or duplicated global visual decisions. Avoid speculative abstraction and do not churn already-reviewed screens without evidence.
- Inspect any still-unreviewed quantitative surface only for truthful visualization where the domain contract provides a meaningful bounded scale; do not invent meters for categorical confidence, evidence counts, or incomparable values.
- Owner/runtime evidence is required across representative narrow/common phone, tablet portrait/landscape, and wide Web layouts, with Arabic/English and shipped light/dark modes.
- TASK-required runtime design-swap proof is pending for Today, Life Map, WHY, and the interaction-heavy Check-in flow. No runtime visual proof is claimed from static source inspection.

## CP10 current implementation
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented security/privacy work includes RLS/ownership review of the ten current user-owned client-visible tables, cross-user policy specifications, function-execute hardening migration `0009`, authenticated portable data export migration `0010`, Life Season expected-user fencing migrations `0011`/`0012`, JWT-protected `delete-account` Edge Function v2 with expected-user matching, client export/two-step deletion and local cache purge attempts, safer error-boundary logging, consent rechecks around integration sync, and account-switch/session fencing across integrations, app-state hydration, Invisible Wins, Recovery, Check-in, Life Seasons, Settings, Onboarding, Personalization, password recovery, Privacy destructive confirmation/deletion, Today embedded One Move/outcome feedback, account-owned Experiments drafts/history, and explicit local decision-tool drafts.

Latest Today hardening:
- `7c9e49be3f7d8df84a9b82c0d2c30725b80a6ed6` — Today now binds embedded One Move decision completion and explicit outcome-feedback completion to the initiating account. A stale completion after account switch is discarded, session refresh is rechecked against the initiating account, and accepted feedback targets remain account-scoped.
- `f6b9762977f99973646f00d7f2fb7da478a9bcd4` — focused Today account-switch source-policy specification records the decision/feedback fencing contract; intentionally not worker-run under current policy.

Latest account-switch hardening:
- `3a214f9d453e660e2a0072ce9d1e06f3168c678c` — Invisible Wins now updates its active-account fence synchronously with render rather than waiting for a passive effect, so a stale load/save completion cannot pass through the render-to-effect account-switch gap. Account switches also reset the local saving state, while stale completions do not mutate the new account's busy state.
- `775f296b3d4ad6f28021db31bcab451730ed2133` — Recovery now invalidates the previous account's request generation as soon as a different account renders, before passive effects run, closing the same stale-plan completion gap while retaining the existing request-generation fence.
- `94db2ccd5101ad0d07f4f55d6b151891bd18c856` — Check-in now synchronizes the active-account fence during render, so a previous account's submit or session-refresh completion cannot route or repaint during the render-to-effect window after an account switch.
- `64b8680a29e539b4db94f7697cfc24f82ad83360` — Privacy export/delete now synchronizes its active-account fence during render. A stale export cannot be delivered after another account becomes active; stale export/delete completions no longer clear the new account's busy state; and deletion rechecks the active account again after `refreshSession()` before redirecting.
- `31482238ba228599724f9d02004ac6fb29877311` — focused Privacy-screen specification now covers the stale-export account-switch case in addition to requiring a fresh destructive confirmation; intentionally not worker-run under the active policy.
- `186cffc217c91c85e6dc7aadde12abe8f2e555b2` — Onboarding binds baseline loading to the active account, clears prior baseline targets before applying a replacement, and checks account identity before asynchronous baseline results can be applied.
- `ed7af7a7736c1c2ebc29e3a1ff616e9364d0925e` — focused Onboarding specification records that a late User A baseline result must not replace User B's target state; intentionally not worker-run under the active policy.
- `a9a23c4adfe1de7be76b3b5372541d320645af42` + `2eca1ff5876ef6cd53a01d19d93ab607e4ea2a1b` — Update Password synchronizes its active-account fence during render before passive reset effects, so a stale password-update completion from User A cannot update message/busy state or route after User B becomes active; focused source-policy specification added and intentionally not worker-run.
- `d5545d0266ded23fb8f9023997fe5e43ecd963e4` + `cdc18ef8f589474585accec97d557ce6c203ae5f` — Settings synchronizes active-account identity during render, closing the render-to-effect gap for onboarding reset, spiritual-preference persistence, and sign-out/session-refresh completions; focused source-policy specification added and intentionally not worker-run.
- `e9674e3b665d63b1fb5b900564303ad9b3ded5ad` + `83fa31901ee4eb13bf6fdffbde0fe68f680260d1` — Personalization owns loaded human-state data by user id and uses a render-synchronous active-account fence, preventing User A maturity data or a late load/session-refresh completion from painting into User B; focused source-policy specification added and intentionally not worker-run.
- `34562b81964ceae9d47471065d770e627d7c291d` + `8d38040f86fb43e224f6a8ba979537120df5c5d4` — Life Seasons synchronizes active-account identity during render in addition to its request-generation guards, closing the remaining render-to-effect save/load completion window; focused source-policy specification added and intentionally not worker-run.
- `ef6e046ee198f947dd411ea6d8f2a99c61edd6de` + `44abe7a4ca89c38991e12c6658a055d2353f7d99` — Experiments resets the account-owned editable hypothesis, selected template, consent, rating draft, busy/message state, and mutation generation synchronously when account identity changes. This prevents a personalized User A experiment hypothesis from remaining visible to User B while preserving owner-scoped history; focused source-policy specification added and intentionally not worker-run.
- `edbb1b45db7bfc6c8f5827d877e25e847dc0499f` + `8dda68b2cdad12e2c3968f282f0008291eda48b1` + `856fc173306eaaebc73805c6ff483c2aab21b361` — Cost of Yes and Human ROI now bind their explicit local planning inputs to the active account and synchronously clear those drafts on account switch; a focused source-policy specification records both contracts and was not worker-run.
- `90a42eb9fa091b41ff734a0948a60e59f6a191bb` + `16aaa100d26efcf97dd88f832b31193ac3700da9` — Invisible Wins now clears the account-owned reflection note, category/filter state, busy state, and message synchronously when account identity changes instead of waiting for the passive load effect; focused source-policy specification added and intentionally not worker-run.
- `85b6109696c6b58af43d73dd4e803f85264703a2` — Check-in now clears account-owned rating/skip drafts synchronously during account identity change rather than waiting for a passive microtask effect, while retaining stale-submit completion fencing. The existing behavioral session-fencing specification remains the regression contract and was not worker-run in this run.
- `d0ec5c1ac28cc078e4216d1cb570be8ccac20daf` — Capacity was independently reviewed for the same account-switch class. Its render-synchronous active-user ref plus snapshot ownership gating already prevent User A capacity data from painting into User B; a focused behavioral regression specification now covers immediate hiding while the replacement account is loading. It was intentionally not worker-run under the active policy.
- `053d4b070b75fcad988d2f0faf41af5cc35ffca5` — root offline replay now has focused regression coverage that an authenticated account switch starts replay with the newly active user id rather than a stale or null identity. The existing queue storage rejects records whose embedded user id does not match the requested user namespace, and Supabase ownership/RLS remains the server boundary. The specification was intentionally not worker-run under the active policy.

The current production source-level sensitive logging/error-reporting review is complete for the existing tree. Re-open that audit only if a new production sink or boundary is added before release.

### CP10 remaining
- Continue the residual source review of account-sensitive async UI flows for render-to-effect account-switch gaps, stale completion state mutations, or account-owned local draft leakage; fix only demonstrated races and avoid duplicating already-fenced paths. Capacity and root offline-replay ownership are now statically reviewed and covered by focused regression specifications.
- Owner/runtime validation for cross-user/database specifications, Life Season expected-user behavior, export/delete/local purge, destructive Edge deletion v2, consent revocation races, and account-switch/session-binding cases including Today decision/feedback, Experiments draft/history fencing, Invisible Wins reflection drafts, Check-in rating drafts, Cost of Yes/Human ROI local drafts, Capacity snapshot ownership, offline replay ownership, and the render-time Privacy/Recovery/Onboarding/Settings/Personalization/Update-Password/Life-Seasons fences.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## CP11 static readiness
Detailed release ledger: `docs/CP11_RELEASE_READINESS.md`.

- `3d4f6f07ef0d660aa331f3ebd5c58b4235ec8dad` expands the Playwright responsive project matrix to the TASK-required representative classes: 390×844 phone, 834×1194 tablet portrait, 1194×834 tablet landscape, and 1440×900 desktop.
- `b9d13daf0b90764b962ca69583bccf34f8a17b00` updates the CP11 release ledger to match that four-viewport matrix and keeps native Android/iOS validation separate from Chromium viewport coverage.
- These are static harness/readiness changes only. No E2E run, test result, typecheck, build, or release PASS is claimed by workers under the active policy.

## Exact next executable action
1. Continue the final CP9 static sweep only when a demonstrated accessibility/RTL/localization/focus/technical-id defect remains on a still-unreviewed shipped surface; make the smallest production-safe fix and add focused regression coverage when useful. The raw ISO date-fallback family identified on Invisible Wins, Life Seasons, and Experiments is closed; Life Map bounded domain meters mirror from the semantic RTL edge.
2. Continue the residual CP10 account-switch/session-binding review only where an async presentation flow still relies on passive-effect account identity, can let a stale completion mutate the new account's UI state, or keeps account-owned local draft text across account identity changes. Capacity and root offline replay now have explicit regression coverage for their existing ownership boundaries; do not duplicate already-fenced paths.
3. If no concrete static defect is found, do not manufacture polish work: leave CP9 runtime screenshot/device validation and final design-swap proof to owner validation under the active execution policy.
4. Keep CP11 static harness aligned with the release matrix, but leave execution of the four Playwright viewport projects, native validation, tests, builds, typechecks, and performance checks to owner validation under the active policy.
5. Do not reopen the completed CP10 logging audit unless new production logging/error boundaries appear.

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
- `delete-account` version 2 previously reported ACTIVE with JWT verification enabled; no destructive end-to-end deletion validation is claimed.
- Premium-reference/residual CP9 changes and focused policy specifications, including What If RTL range, Onboarding final-domain affordance, Today RTL meters, Life Map RTL meters, Today account-switch fencing, and the Invisible Wins/Life Seasons/Experiments raw-date fallback hardening, remain static implementation/specification evidence until owner validation; the focused policy specifications were not worker-run.
- Render-time/account-owned state fencing changes `3a214f9d453e660e2a0072ce9d1e06f3168c678c`, `775f296b3d4ad6f28021db31bcab451730ed2133`, `94db2ccd5101ad0d07f4f55d6b151891bd18c856`, `64b8680a29e539b4db94f7697cfc24f82ad83360`, `186cffc217c91c85e6dc7aadde12abe8f2e555b2`, `a9a23c4adfe1de7be76b3b5372541d320645af42`, `d5545d0266ded23fb8f9023997fe5e43ecd963e4`, `e9674e3b665d63b1fb5b900564303ad9b3ded5ad`, `34562b81964ceae9d47471065d770e627d7c291d`, `ef6e046ee198f947dd411ea6d8f2a99c61edd6de`, `edbb1b45db7bfc6c8f5827d877e25e847dc0499f`, `8dda68b2cdad12e2c3968f282f0008291eda48b1`, `90a42eb9fa091b41ff734a0948a60e59f6a191bb`, and `85b6109696c6b58af43d73dd4e803f85264703a2`, plus focused specifications where present, are static implementation/specification evidence only and were not worker-run.
- Capacity account-switch regression specification `d0ec5c1ac28cc078e4216d1cb570be8ccac20daf` records that User A snapshot data is hidden immediately when User B becomes active and remains hidden while User B loads; it was added but not worker-run under the active execution policy.
- Root offline-replay regression coverage `053d4b070b75fcad988d2f0faf41af5cc35ffca5` records that replay is restarted with the newly active account id after an authenticated account switch; it was added but not worker-run under the active execution policy.
- Playwright responsive harness `3d4f6f07ef0d660aa331f3ebd5c58b4235ec8dad` plus release-ledger update `b9d13daf0b90764b962ca69583bccf34f8a17b00` provide static phone/tablet-portrait/tablet-landscape/desktop coverage definitions; none of those projects were executed by workers.

## Known blockers / risks
- CP1/CP9: true phone/tablet/Web visual interaction evidence still needs an unlocked owner runtime; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action.
- Cross-user/database specifications and all post-baseline runtime/type/build gates require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity needs owner runtime validation.
- CP9 major structural slices are statically present, but representative runtime screenshots, interaction validation, and the final design-swap proof remain outstanding.
- Privacy export/delete, local cache purge/warning behavior, account-scoped confirmation, Edge v2 expected-user deletion fencing, Life Season expected-user fencing, and account-switch/session-binding behavior need owner Web/native/end-to-end validation before CP10 can close.
- CP11 four-viewport Web projects are configured but unexecuted; native device/export and performance evidence also remain owner-side.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `docs/CP11_RELEASE_READINESS.md`
- `playwright.config.ts`
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
- `apps/app/__tests__/root-layout-auth-routing-test.tsx`
- `apps/app/__tests__/app-icon-accessibility-test.tsx`
- `apps/app/__tests__/western-digit-source-policy-test.ts`
- `apps/app/__tests__/integrations-user-facing-language-policy-test.ts`
- `apps/app/__tests__/recovery-rtl-layout-policy-test.ts`
- `apps/app/__tests__/recovery-screen-session-fencing-test.tsx`
- `apps/app/__tests__/capacity-screen-session-fencing-test.tsx`
- `apps/app/__tests__/experiments-rtl-layout-policy-test.ts`
- `apps/app/__tests__/experiments-session-fencing-policy-test.ts`
- `apps/app/__tests__/what-if-rtl-range-layout-policy-test.ts`
- `apps/app/__tests__/onboarding-domain-minimum-policy-test.ts`
- `apps/app/__tests__/onboarding-session-fencing-test.tsx`
- `apps/app/__tests__/today-rtl-meter-layout-policy-test.ts`
- `apps/app/__tests__/today-session-fencing-policy-test.ts`
- `apps/app/__tests__/life-map-rtl-meter-layout-policy-test.ts`
- `apps/app/__tests__/check-in-session-fencing-test.tsx`
- `apps/app/__tests__/decision-tool-draft-session-fencing-policy-test.ts`
- `apps/app/__tests__/invisible-wins-session-fencing-policy-test.ts`
- `apps/app/__tests__/privacy-screen-session-fencing-test.tsx`
- `apps/app/__tests__/update-password-screen-session-fencing-test.tsx`
- `apps/app/__tests__/settings-session-fencing-test.tsx`
- `apps/app/__tests__/personalization-session-fencing-test.tsx`
- `apps/app/__tests__/life-seasons-session-fencing-test.tsx`
- `apps/app/__tests__/invisible-wins-date-fallback-policy-test.ts`
- `apps/app/__tests__/life-seasons-date-fallback-policy-test.ts`
- `apps/app/__tests__/experiments-date-fallback-policy-test.ts`
- `supabase/tests/rls_cross_user.sql`
- `supabase/tests/account_data_export_security.sql`
- `supabase/migrations/0009_function_execute_hardening.sql`
- `supabase/migrations/0010_account_data_export.sql`
- `supabase/migrations/0011_life_season_expected_user_guard.sql`
- `supabase/migrations/0012_life_season_execute_hardening.sql`
- `supabase/functions/delete-account/index.ts`
- `automation/HUMAN_REQUIRED.md`
