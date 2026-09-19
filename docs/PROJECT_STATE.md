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

Current implementation includes durable per-user retry for check-ins and Invisible Wins, stable client mutation IDs with migration `0008_offline_mutation_idempotency.sql`, serialized duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching with validation/expiry, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and recorded reliability specifications for reconnect/restart/concurrency behavior.

CP8 is not credited `DONE` until owner/runtime evidence confirms restart/reload and offline/reconnect behavior.

## CP9 current implementation
Presentation boundary already in place:
- semantic palette, typography, spacing, radii, controls/touch sizing, border, interaction, and responsive layout tokens in `apps/app/src/constants/theme.ts`;
- shared `MizanText`, `Card`, `MizanTextInput`, `PrimaryButton`, `SecondaryButton`, and `ChoiceChip` primitives;
- centralized responsive `Screen` behavior;
- representative consolidation across current primary routes;
- navigation shell honors reduced-motion preference;
- confidence/status localization is progressively removed from raw engine enums;
- semantic RTL fixes cover grouped metric/date presentation where concrete issues were found;
- async accessibility live announcements cover loading/error/empty/status transitions across reviewed product surfaces.

Latest static CP9 work:
- **Life Seasons async choice fencing:** season and target chips are now disabled during initial/reload loading and while a save is in flight, and their handlers reject mutations during that window. This prevents the visible season/target draft from drifting away from the snapshot being loaded or persisted, while exposing the shared disabled semantics to assistive technology. Commit `eb220dd038d6379bdbe29a075bd2dceb3a3beb97`.
- **Settings optional-module choice fencing:** Spiritual Grounding enable/disable chips now expose the shared disabled interaction/accessibility state while the preference is loading/saving or a Settings-level destructive flow is busy, matching the handler's existing no-op guard instead of leaving controls visually and semantically enabled when they cannot act. Commit `1902023c893a340471e72f472d48881e018a32b5`.
- **Bootstrap error bidi parity:** the root `AppErrorBoundary` fallback now applies explicit RTL/LTR `writingDirection` to its title, body, and retry label in addition to alignment, so the provider-independent recovery surface handles Arabic/English punctuation and mixed-direction text consistently with the shared text primitives. Commit `db099d989b3c1c2a943175652c50e82ad7678fb5`.
- **Keyboard-safe shared scrolling:** shared `Screen` now enables React Native automatic keyboard inset adjustment for scrollable screens, reducing the risk that auth, recovery, feedback, experiment, and other input flows have lower content obscured by the on-screen keyboard on supported native targets. Commit `e15b3b5f7c01798f32248702f0d03089020c76ee`.
- **Disabled text-input semantics:** shared `MizanTextInput` now derives and exposes `accessibilityState.disabled` whenever a field is non-editable (or explicitly marked disabled), so auth/password and other submission-fenced inputs communicate their disabled state to assistive technology instead of only blocking edits. Commit `1ddb09879baebe0b296f74a7e1090f519bdfcb0e`.
- **Reduced-motion startup safety:** navigation now starts with motion disabled until React Native resolves the platform reduced-motion preference, preventing an initial fade from slipping through for users who have Reduced Motion enabled. Runtime preference changes still update through the existing accessibility listener. Commit `b5530e0a5e55abd549db949daef53ca2be2af9e5`.
- **Unknown-data presentation honesty:** Capacity no longer coerces a missing fragility estimate to `0 / 100` when the surrounding buffer summary is otherwise available; it now renders the localized unknown label and preserves the mission rule that missing evidence never becomes a zero score. Commit `d5143d3b094893cc6352eea415ae914097c3fc1a`.
- **Auth submission fencing:** language and auth-mode chips are now disabled while sign-in/sign-up/reset is in flight, and email/password fields become non-editable until the request finishes. This prevents the visible form or mode from drifting away from the credentials/action actually submitted and exposes the disabled choice state to assistive technology through the shared `ChoiceChip` semantics. Commit `b32714eb8b53dc43a9389e6f0c2ee2cbf3302294`.
- **Password-update fencing:** new-password and confirmation fields are now non-editable while the password update request is in flight, preventing visible field values from diverging from the password already submitted. Commit `5d91b00584ccb3a4623065684034b52856a72d48`.
- **Choice-control disabled semantics:** shared `ChoiceChip` supports native disabled interaction, `accessibilityState.disabled`, and the shared disabled-opacity token. Commit `71064ae6f183724685c67a543ad0650aa1c9c5d1`.
- **Check-in submission fencing:** rating and skip chips are disabled while saving and after a queued terminal state. Commit `52b0065ebc7014fedd701a26a6033c24b9ab86a7`.
- **Arabic-first numeric input:** Cost of Yes and Human ROI use localized decimal parsing for Western, Arabic-Indic, Eastern-Arabic/Persian digits and decimal separators; focused specification exists but has not been worker-run. Commits `f6750f42a739d1680578549961f52b6cdca88118`, `192642abc2ab1bc13feb5f8c052375bbc7cff329`, `7a93fab1f4f12f3cdbb1d23b73efc91d7cb3cb0f`, `ec9a016cee5649cccaeb4af966d3037624f94fce`.
- **Shared bidi/dynamic-type hardening:** shared text/input/action primitives apply locale-aware writing direction; primary and choice labels center when wrapping; representative Life Map, WHY, Check-in, and Recovery flows were hardened for narrow widths, larger text, and assistive announcements.
- **Async accessibility coverage:** Today, Life Map, WHY, Insights, Capacity, Life Seasons, Entry, Personalization, Onboarding, Personal Learning, Experiments, Recovery, What If, Settings, Auth/recovery, Check-in, Value Alignment, Invisible Wins, and Integrations have received static accessibility-state review with targeted live-region fixes where concrete gaps were found.

The TASK-required final design-swap proof is **not claimed**. It still requires owner visual/runtime validation using a substantially different visual direction and representative device widths.

## Test matrix progress
- Commit `d32636ddd253e3ec688376a4a42596e2844704df` added broad CP2–CP9 app/runtime validation coverage scaffolding.
- Commit `ec9a016cee5649cccaeb4af966d3037624f94fce` added focused localized-number parsing coverage.
- These suites have **not** been executed by workers under the current policy; no PASS is claimed from their presence alone.
- No new automated test was added for the latest declarative interaction-state fencing; meaningful verification depends on pending runtime interaction/accessibility checks rather than duplicating React Native prop assertions.

## Exact next executable action
1. Continue repository-wide CP9 static review for untranslated production literals, semantic RTL issues, missing accessibility labels/states/live announcements, truncation/dynamic-type risks, duplicated global visual values, unjustified local control treatments, and keyboard/focus usability gaps; prioritize concrete defects over abstraction-only cleanup.
2. Revisit an already-audited surface only when static inspection finds a concrete remaining defect; avoid abstraction-only cleanup.
3. Leave representative-width runtime checks, post-baseline tests/builds/typechecks, CP1–CP8 execution-dependent evidence, and the final design-swap proof to owner validation under the active policy.

## Verification record
Previously recorded owner-side baseline evidence:
- Root typecheck PASS.
- Lint PASS.
- Core tests 3/3 PASS.
- Plugin tests 2/2 PASS.
- Expo Doctor 21/21 PASS.
- Android export PASS.
- iOS export PASS.
- Earlier auth/data-access app typecheck and lint were recorded PASS.

Post-baseline status:
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
- `apps/app/src/components/app-error-boundary.tsx`
- `apps/app/src/i18n/number-input.ts`
- `apps/app/src/app/auth.tsx`
- `apps/app/src/app/update-password.tsx`
- `apps/app/src/app/onboarding.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/app/life-map.tsx`
- `apps/app/src/app/life-seasons.tsx`
- `apps/app/src/app/why.tsx`
- `apps/app/src/app/insights.tsx`
- `apps/app/src/app/experiments.tsx`
- `apps/app/src/app/recovery.tsx`
- `apps/app/src/app/human-roi.tsx`
- `apps/app/src/app/cost-of-yes.tsx`
- `apps/app/src/app/capacity.tsx`
- `apps/app/src/app/personal-learning.tsx`
- `apps/app/src/app/personalization.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/value-alignment.tsx`
- `apps/app/src/app/invisible-wins.tsx`
- `apps/app/src/app/integrations.tsx`
- `apps/app/src/app/settings.tsx`
- `apps/app/src/app/what-if.tsx`
- `apps/app/__tests__/advanced-tools-test.ts`
- `automation/HUMAN_REQUIRED.md`
