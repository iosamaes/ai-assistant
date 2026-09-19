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
  - adds a persistent adaptive product navigation shell with **Home / Life Map / One Move / Insights / More**;
  - mobile/common widths use a safe-area-aware bottom tab bar, while tablet/wide layouts switch to a sidebar/rail without stretching the phone treatment;
  - Arabic mirrors mobile destination ordering and wide rail placement through the existing `isRtl` state; English remains LTR;
  - primary navigation uses accessible tab roles/selected state and minimum touch sizing;
  - adds the initial shared `AppIcon` layer backed by the already-installed cross-platform `expo-symbols` package;
  - adds a dedicated `/one-move` route so One Move is directly reachable from the shell rather than being discoverable only by scrolling Today;
  - the focused One Move route reuses the existing deterministic recommendation/application boundary, preserves evidence/confidence copy, supports alternative selection plus accept/defer/decline, and fences async decision completion against account switching.
- `81f334b0e548c8ee8a9b794056344409e515c7fb` — Life Map application data now exposes a direction-normalized positive visual signal per metric/domain while preserving raw values. Lower-is-better mental load is inverted only for the visual signal, and domains without supported numeric evidence remain `null` rather than becoming zero.
- `1195dee72b0ff63815e32eb4e8d462da2c93490a` — expands the shared production icon vocabulary with energy, mental-load, overload, evidence, and trend semantics in addition to navigation/domain icons.
- `c45c8ca496d358bcc9343cf67f10a6c3c01f662f` — lands the mandatory responsive Life Map radar/spider production composition:
  - real geometry is generated from the current enabled-domain snapshot rather than detached demo values;
  - unknown domains render as unknown axes and never fabricate zero values or close the data polygon across missing evidence;
  - known domains use direction-normalized 0–100 state signals with explicit explanatory copy, while exact raw metric values, 28-day median, evidence, confidence, and trend remain inspectable in the overview;
  - shared domain/evidence/trend iconography is used in the radar and exact-value cards;
  - narrow layouts stack radar and detail overview; wide layouts compose them side-by-side with semantic RTL adaptation;
  - the radar exposes an accessibility description containing each domain's exact supported signal or explicit unknown state;
  - the central/adjacent summary reports supported-domain coverage until all axes are known, then shows a clearly qualified descriptive map signal rather than claiming an objective life-quality score.
- `fbf457d90e4b8b2f9c2fd781586b01f58a0f1a0c` — adds a Life Map visualization-data regression specification covering lower-is-better normalization, unknown-domain preservation, and future-observation exclusion. It is intentionally **not run by workers** under the active execution policy.
- Existing navigation/auth/localization/account-switch hardening remains in place, including offline authenticated entry, password-recovery routing, Check-in fencing, Today RTL grid ordering, Western-digit normalization, and the corrected neutral Life Debt Arabic wording.

### CP9 remaining
- Continue the owner-approved implementation order rather than returning to micro-polish:
  1. upgrade Today/Home composition with the branded focus hero, day/context strip, shared icon state tiles, and restrained meters/trends; use the expanded icon layer there rather than adding another icon system;
  2. complete WHY/Insights icon/evidence language;
  3. add What If uncertainty/range meters and richer Experiments status/progress treatment;
  4. complete Personalization/Invisible Wins/Recovery/Onboarding illustration/composition requirements and remaining quantitative gauges;
  5. extend the same shared domain/action/status icon semantics through the remaining repeated product surfaces as each surface is upgraded.
- After those structural gaps are implemented, finish the residual static sweep for untranslated literals, Western-digit regressions, semantic RTL, accessibility/live announcements, truncation/dynamic type, keyboard/focus, technical-id fallbacks, and duplicated global visual decisions.
- Owner/runtime evidence is still required across representative phone/tablet/Web widths, Arabic/English, and shipped light/dark modes. The new Life Map radar is static implementation evidence until that validation occurs.
- TASK-required runtime design-swap proof is not yet claimed and still requires Today, Life Map, WHY, and an interaction-heavy flow without edits outside the presentation boundary.

## CP10 current implementation
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented security/privacy work includes live RLS/ownership review of the ten current user-owned client-visible tables, cross-user policy specifications, function-execute hardening migration `0009`, portable authenticated data export migration `0010`, deployed JWT-protected `delete-account` Edge Function, client export/two-step deletion UI with local cache purge attempts, safer error-boundary logging, targeted sensitive-log review, stronger auth password creation minimums, consent rechecks around health sync, and account-switch/session fencing across integrations, app-state hydration, Invisible Wins, Recovery, and Check-in.

### CP10 remaining
- Complete repository-wide sensitive logging/error-reporting review beyond the targeted boundaries already inspected; fix only concrete leakage paths.
- Owner/runtime validation remains required for cross-user/database tests, export/delete/local purge, destructive Edge deletion, consent revocation races, and account-switch races.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## Exact next executable action
1. Continue CP9 reference fidelity with the **Today/Home reference composition**: branded focus hero, compact day/context treatment, shared semantic icons in state/progress tiles, and restrained real-data meters/trends.
2. Follow with WHY/Insights, What If/Experiments, and the required illustration/composition pass in the order defined by `TASK.md`.
3. Keep extending the same iconography vocabulary across those repeated domain/action/status surfaces; do not build a second visual icon abstraction.
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
- The adaptive navigation/iconography/One Move batch `a04dc88e452381051f2377de1bb994e4f55a4954` is **static implementation evidence only** until owner typecheck/runtime/responsive validation.
- The Life Map radar/iconography/data-honesty commits `81f334b0e548c8ee8a9b794056344409e515c7fb`, `1195dee72b0ff63815e32eb4e8d462da2c93490a`, and `c45c8ca496d358bcc9343cf67f10a6c3c01f662f` are **static implementation evidence only**. The specification in `fbf457d90e4b8b2f9c2fd781586b01f58a0f1a0c` was added but not executed by the worker.

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- CP9 still needs the blocking Today/WHY/Insights/What If/Experiments/illustration work, representative runtime screenshot evidence, and the required design-swap proof. The Life Map radar itself now needs owner responsive/light-dark/RTL runtime confirmation rather than further mock implementation.
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
