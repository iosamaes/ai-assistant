# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `db05d2d78fc71edb1b71880d9e74535318fa6f4a`.
- Current worker policy: GitHub source changes are allowed; workers must not run product tests, builds, typechecks, database scripts, GitHub Actions, or cloud CI. Execution-dependent gates remain owner validation.

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
- [ ] CP10 — Security, privacy, owner-data control
- [ ] CP11 — Test matrix, performance, release readiness
- [ ] CP12 — Independent final review and handoff

## CP8 current implementation
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Current implementation includes durable per-user retry for check-ins and Invisible Wins, stable client mutation IDs and duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching with validation/expiry, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and recorded reconnect/restart/concurrency specifications.

CP8 is not credited `DONE` until owner/runtime evidence confirms restart/reload and offline/reconnect behavior.

## CP9 current implementation
Presentation boundary:
- centralized semantic palette, typography, spacing, radii, controls/touch sizing, border, interaction, and responsive layout tokens;
- shared `MizanText`, `Card`, `MizanTextInput`, `PrimaryButton`, `SecondaryButton`, and `ChoiceChip`;
- centralized responsive `Screen` behavior;
- reduced-motion navigation behavior;
- broad static pass over RTL, dynamic type, accessibility states/live regions, async interaction fencing, localization, and repeated visual semantics across primary routes.

Latest static CP9 work:
- **Onboarding baseline numeric localization:** the optional baseline-target explanation now uses Arabic-Indic digits in Arabic, and the 1–5 target chips render through the shared locale-aware formatter so Arabic and English remain consistent with the rest of the product. Commit `f1c29980f7f22785576052d077c3732bb596461d`.
- **What If numeric localization:** scenario assumptions now use Arabic-Indic minute values in Arabic, while current-state values, plausible ranges, and evidence counts render through the shared locale-aware formatter. English retains Western digits. Commit `4da2ef10335ce1399acf838885e520f15fb649b3`.
- **Today numeric localization:** Today now uses the shared locale-aware formatter for current-state scores and `/100` denominators, state/balance/momentum evidence counts, One Move evidence counts, and feedback rating text plus its assistive labels. Arabic therefore renders Arabic-Indic digits consistently on the primary dashboard while English retains Western digits. Commit `92c9a3a6a6a1fa0f7cd1039daaaf26c81e71548f`.
- **Arabic-first numeric presentation:** `apps/app/src/i18n/number-input.ts` provides shared locale-aware numeric formatting in addition to localized decimal parsing. Cost of Yes and Human ROI render Arabic-Indic digits for Arabic placeholders, rating controls/accessibility labels, calculated hours, evidence counts, and percentage/rating values while retaining Western-digit output for English. Earlier commits: `f38750f1848a73e38cfbbdad8de85b598439632a`, `93bae4e5dee36a9d2310b7d8fae1d6eceb443a23`, `8075d87d80b52a78c3601edf5f1570bc020e4a39`.
- **Numeric localization extended across evidence surfaces:** Insights, WHY, Capacity, and Life Map now use the shared formatter for user-facing sample/evidence counts, score denominators, effect/window values, and other dynamic numbers; Arabic static window copy on these audited surfaces uses Arabic-Indic digits where applicable. Capacity also preserves a genuinely unknown evidence count as `—` instead of manufacturing `0` when no snapshot exists. Commits `a7737820279ef87ffff7c6aebba67994682b121b`, `1b707719be16b339bf02e1ccaf151592b5a9fb14`, `cf667c6b8ce513292260c25bf97ef2630c5feae4`, `be50e86ca8f12f2bf735ca507b83c0a8bca5afc3`.
- **Numeric localization extended across personal-learning/decision flows:** Personal Learning now locale-formats feedback/evidence counts, freshness days, usefulness ratings, and Arabic minute numerals; Experiments locale-formats durations, evaluation medians, and combined evidence counts while preserving locale-aware dates; Recovery locale-formats evidence counts and live step counters. Commits `a025cb10ed8e5b417b9e46b10398a5f56306aedb`, `e1c522d6806c3cb084db444cfa9e60dbbd70b7a9`, `88565944cef48dc4b805ee2330e3cda6c2120173`.
- **Numeric localization extended to Life Seasons, Value Alignment, and Check-in:** Life Seasons now uses locale-aware digits for its 1–5 target copy, target chips, and recorded target history; Value Alignment locale-formats evidence counts; Check-in locale-formats rating-chip text and the corresponding assistive labels. Commits `61153d3900ff788c2914b630ad9b72f767dba7fc`, `6f0092940b23a86a12bc1334245f3ec95371cd25`, `b1de3ea1bdd63c7b9bf5ade1cd143a076504a1ca`.
- **Insights dynamic-type hardening:** header/detail rows now wrap and allow text shrinkage consistently with the already-hardened WHY/Life Map patterns, reducing narrow-width and large-text collision risk. Commit `a7737820279ef87ffff7c6aebba67994682b121b`.
- **Numeric localization specification:** `apps/app/__tests__/advanced-tools-test.ts` covers Arabic and English formatted-number output in addition to localized decimal parsing. Commit `4cd50a79e013ba78cd25ced4e6a6d99600a236fb`; not worker-run under current policy.
- **Recent accessibility/interaction hardening already on main:** async state fencing across onboarding, auth, password recovery, What If, Invisible Wins, Experiments, Life Seasons, Settings and Check-in; disabled semantics in shared fields/chips; keyboard-safe shared scrolling; startup-safe reduced motion; root fallback bidi parity; unknown-data honesty in Capacity; localized integration metadata; live-region/RTL/dynamic-type fixes across primary surfaces.

The TASK-required final design-swap proof is **not claimed**. It still requires owner visual/runtime validation using a substantially different visual direction and representative device widths.

## Test matrix progress
- Broad CP2–CP9 app/runtime validation scaffolding exists (`d32636ddd253e3ec688376a4a42596e2844704df`).
- Localized-number parsing/output coverage exists (`ec9a016cee5649cccaeb4af966d3037624f94fce`, `4cd50a79e013ba78cd25ced4e6a6d99600a236fb`).
- These suites have **not** been executed by workers under the current policy; no PASS is claimed from their presence alone.

## Exact next executable action
1. Continue repository-wide CP9 static review for remaining untranslated production literals and locale-inconsistent numeric/date presentation on primary routes not covered by the current localization ledger; fix only concrete user-visible defects.
2. Then continue semantic RTL issues, missing accessibility labels/states/live announcements, truncation/dynamic-type risks, duplicated global visual values, unjustified local control treatments, and keyboard/focus usability gaps; prioritize concrete defects over abstraction-only cleanup.
3. Revisit an already-audited surface only when static inspection finds a concrete remaining defect.
4. Leave representative-width runtime checks, post-baseline tests/builds/typechecks, CP1–CP8 execution-dependent evidence, and final design-swap proof to owner validation under the active policy.

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
- No worker-run app tests, builds, typechecks, database scripts, cloud CI, or GitHub Actions are claimed for CP2–CP9 changes.
- Current CP9 evidence is static implementation/code-review evidence only until owner validation runs the validation matrix and representative device/browser/screen-reader checks.

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- Static CP9 review is not a substitute for visual/device/screen-reader validation.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `apps/app/src/constants/theme.ts`
- `apps/app/src/components/mizan-ui.tsx`
- `apps/app/src/components/screen.tsx`
- `apps/app/src/i18n/number-input.ts`
- `apps/app/src/app/onboarding.tsx`
- `apps/app/src/app/what-if.tsx`
- `apps/app/src/app/cost-of-yes.tsx`
- `apps/app/src/app/human-roi.tsx`
- `apps/app/src/app/insights.tsx`
- `apps/app/src/app/why.tsx`
- `apps/app/src/app/capacity.tsx`
- `apps/app/src/app/life-map.tsx`
- `apps/app/src/app/personal-learning.tsx`
- `apps/app/src/app/experiments.tsx`
- `apps/app/src/app/recovery.tsx`
- `apps/app/src/app/life-seasons.tsx`
- `apps/app/src/app/value-alignment.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/__tests__/advanced-tools-test.ts`
- `automation/HUMAN_REQUIRED.md`
