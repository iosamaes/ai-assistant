# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy implementation continues in parallel; this does not mark CP9 complete.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `f2786fbae29a0ee1fa7bf77eb1504fc8fb80c208`.
- Worker policy: workers may mutate GitHub source and the authorized Supabase project, but must not run product tests, builds, typechecks, validation database scripts, GitHub Actions, or cloud CI. Execution-dependent gates remain owner validation.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation — `BLOCKED_HUMAN` only for owner-side responsive/locale evidence
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

Static reliability work includes durable per-user retry for check-ins and Invisible Wins, stable client mutation IDs and duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching with validation/expiry, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and reconnect/restart/concurrency specifications.

CP8 is not credited `DONE` until owner/runtime evidence confirms restart/reload and offline/reconnect behavior.

## CP9 current implementation
The earlier Premium Production Visual Pass remains useful foundation, but the owner-approved showcase in `automation/TASK.md` is now the blocking visual/product contract. CP9 is not complete until the remaining structural reference requirements are implemented and runtime evidence is recorded.

### Owner-reference implementation now landed
- `a04dc88e452381051f2377de1bb994e4f55a4954` — first structural owner-reference batch:
  - persistent adaptive product navigation shell with **Home / Life Map / One Move / Insights / More**;
  - mobile/common widths use a safe-area-aware bottom tab bar; tablet/wide layouts switch to a sidebar/rail;
  - Arabic mirrors mobile destination ordering and wide rail placement through `isRtl`; English remains LTR;
  - primary navigation uses accessible tab roles/selected state and minimum touch sizing;
  - initial shared `AppIcon` layer uses the already-installed cross-platform `expo-symbols` package;
  - dedicated `/one-move` route makes One Move directly reachable from the shell while preserving deterministic recommendation/evidence behavior and account-switch fencing.
- `81f334b0e548c8ee8a9b794056344409e515c7fb` — Life Map application data exposes a direction-normalized positive visual signal per metric/domain while preserving raw values. Lower-is-better mental load is inverted only for the visual signal, and unsupported domains remain `null` rather than becoming zero.
- `1195dee72b0ff63815e32eb4e8d462da2c93490a` — shared icon vocabulary covers energy, mental load, overload, evidence, trend, navigation, and current domain semantics.
- `c45c8ca496d358bcc9343cf67f10a6c3c01f662f` — mandatory responsive Life Map radar/spider composition:
  - geometry uses the current enabled-domain snapshot rather than demo values;
  - unknown domains stay unknown and do not fabricate zero values or close the polygon across missing evidence;
  - known domains use direction-normalized 0–100 visual signals while exact raw values, 28-day median, evidence, confidence, and trend remain inspectable;
  - narrow layouts stack radar/detail; wide layouts compose them side-by-side with semantic RTL adaptation;
  - accessibility description contains each supported signal or explicit unknown state;
  - central/adjacent summary reports supported-domain coverage until every axis is known, then shows a qualified descriptive map signal rather than an objective life-quality score.
- `fbf457d90e4b8b2f9c2fd781586b01f58a0f1a0c` — Life Map visualization-data regression specification covers lower-is-better normalization, unknown preservation, and future-observation exclusion; intentionally not worker-run under policy.
- `9370d59476d26ff642506b9f32029eabddc8ce1a` — adds `BrandedIllustration`, a small repository-owned, theme-aware botanical/landscape shape language with focus/recovery/welcome variants. It is decorative-only so adjacent text remains the semantic source of truth, and it adapts automatically to shipped light/dark palette roles.
- `137fd2fe9facda65aba2691f38a08d6afdbc848a` — owner-reference **Today/Home composition** now lands on the real daily path:
  - premium greeting/header plus locale-aware day/date context strip using `ar-QA-u-nu-latn` / `en-QA-u-nu-latn`, preserving mandatory Western digits;
  - One Move is elevated into the primary Today Focus hero with the shared branded illustration, semantic reason/evidence icons, evidence/confidence copy, alternatives, accept/defer/decline, and existing outcome-feedback behavior;
  - check-in remains prominent as a calmer quick-update panel that stacks on narrow layouts and composes horizontally when space allows;
  - current state uses compact semantic-icon tiles and restrained 0–100 meters only when numeric evidence is known; unknown components now render explicitly as unknown instead of disappearing or becoming zero;
  - balance uses a restrained real-data meter, while momentum uses shared state + directional trend icons without inventing unsupported precision;
  - priority cards now reuse shared domain icons and the same visual language rather than text-only tiles;
  - composition continues to reuse the existing deterministic daily snapshot/recommendation/application boundaries rather than moving product logic into UI.
- Existing navigation/auth/localization/account-switch hardening remains in place, including offline authenticated entry, password-recovery routing, Check-in fencing, Today RTL ordering, Western-digit normalization, and corrected neutral Life Debt Arabic wording.

### CP9 remaining
- Continue the owner-approved implementation order rather than returning to micro-polish:
  1. complete WHY/Insights icon/evidence language: ranked factor cards, meaningful semantic icons, differentiated insight categories/filter chips, and explicit evidence/confidence/correlation caveats;
  2. add What If uncertainty/range meters and richer Experiments status/progress treatment;
  3. complete Personalization/Invisible Wins/Recovery/Onboarding illustration/composition requirements and remaining quantitative gauges, reusing `BrandedIllustration` where appropriate rather than creating another artwork system;
  4. extend the same shared domain/action/status icon semantics through remaining repeated product surfaces as each surface is upgraded.
- After those structural gaps are implemented, finish the residual static sweep for untranslated literals, Western-digit regressions, semantic RTL, accessibility/live announcements, truncation/dynamic type, keyboard/focus, technical-id fallbacks, and duplicated global visual decisions.
- Owner/runtime evidence is still required across representative phone/tablet/Web widths, Arabic/English, and shipped light/dark modes. Today/Home and Life Map are static implementation evidence until that validation occurs.
- TASK-required runtime design-swap proof is not yet claimed and still requires Today, Life Map, WHY, and an interaction-heavy flow without edits outside the presentation boundary.

## CP10 current implementation
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented security/privacy work includes live RLS/ownership review of the ten current user-owned client-visible tables, cross-user policy specifications, function-execute hardening migration `0009`, portable authenticated data export migration `0010`, deployed JWT-protected `delete-account` Edge Function, client export/two-step deletion UI with local cache purge attempts, safer error-boundary logging, targeted sensitive-log review, stronger auth password creation minimums, consent rechecks around health sync, and account-switch/session fencing across integrations, app-state hydration, Invisible Wins, Recovery, and Check-in.

### CP10 remaining
- Complete repository-wide sensitive logging/error-reporting review beyond the targeted boundaries already inspected; fix only concrete leakage paths.
- Owner/runtime validation remains required for cross-user/database tests, export/delete/local purge, destructive Edge deletion, consent revocation races, and account-switch races.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## Exact next executable action
1. Continue CP9 reference fidelity with **WHY + Insights**: use the existing shared iconography for ranked candidate factors, evidence/confidence cues, differentiated insight types, category/filter treatment, and explicit non-diagnostic/correlation language.
2. Follow with What If range meters and Experiments category/status/duration/progress visuals.
3. Then complete Recovery/Onboarding illustration composition and the remaining Personalization/Invisible Wins requirements, reusing the new branded illustration language rather than inventing a second artwork system.
4. Keep CP10 parallel only when a safe independent security batch is clearly higher value or CP9 work is temporarily blocked.
5. Leave representative-width runtime checks, tests/builds/typechecks/database validation suites, premium screenshot evidence, and final design-swap proof to owner validation under the active execution policy.

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
- **No worker-run app tests, builds, typechecks, validation database scripts, cloud CI, or GitHub Actions are claimed for CP2–CP10 changes.**
- Authorized migrations `function_execute_hardening` and `account_data_export` were applied and live function ACLs were read; this is implementation/state evidence, not a test-suite PASS.
- `delete-account` deployment reports ACTIVE with JWT verification enabled; no destructive end-to-end deletion validation is claimed.
- Adaptive navigation/iconography/One Move batch `a04dc88e452381051f2377de1bb994e4f55a4954` is static implementation evidence only until owner typecheck/runtime/responsive validation.
- Life Map radar/iconography/data-honesty commits `81f334b0e548c8ee8a9b794056344409e515c7fb`, `1195dee72b0ff63815e32eb4e8d462da2c93490a`, and `c45c8ca496d358bcc9343cf67f10a6c3c01f662f` are static implementation evidence only; the specification in `fbf457d90e4b8b2f9c2fd781586b01f58a0f1a0c` was added but not executed.
- Today/Home owner-reference commits `9370d59476d26ff642506b9f32029eabddc8ce1a` and `137fd2fe9facda65aba2691f38a08d6afdbc848a` are **static implementation evidence only**. Workers did not run typecheck, tests, build, screenshot capture, or representative device validation under the active policy.

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- CP9 still needs blocking WHY/Insights, What If/Experiments, and remaining illustration/composition work plus representative runtime screenshot evidence and the design-swap proof. Today/Home and Life Map now need owner responsive/light-dark/RTL runtime confirmation rather than further detached mock work.
- Privacy export/delete UI, local cache purge/warning behavior, and Edge deletion need owner Web/native end-to-end validation before CP10 can close.
- Repository-wide sensitive logging/error reporting review remains incomplete beyond the targeted boundaries already hardened.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `apps/app/src/app/_layout.tsx`
- `apps/app/src/app/one-move.tsx`
- `apps/app/src/components/app-navigation.tsx`
- `apps/app/src/components/app-icon.tsx`
- `apps/app/src/components/branded-illustration.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/app/life-map.tsx`
- `apps/app/src/application/life-map.ts`
- `apps/app/__tests__/life-map-visualization-data-test.ts`
- `apps/app/src/app/why.tsx`
- `apps/app/src/app/insights.tsx`
- `apps/app/src/state/app-state.tsx`
- `supabase/tests/rls_cross_user.sql`
- `supabase/tests/account_data_export_security.sql`
- `supabase/migrations/0009_function_execute_hardening.sql`
- `supabase/migrations/0010_account_data_export.sql`
- `supabase/functions/delete-account/index.ts`
- `automation/HUMAN_REQUIRED.md`
