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
The earlier Premium Production Visual Pass remains useful foundation, but the owner-approved showcase in `automation/TASK.md` is now the blocking visual/product contract. The major structural reference slices are now statically implemented; CP9 still requires residual static review plus owner runtime evidence before it can close.

### Owner-reference implementation now landed
- `a04dc88e452381051f2377de1bb994e4f55a4954` — adaptive product navigation shell with **Home / Life Map / One Move / Insights / More**, mobile bottom tabs, tablet/wide rail/sidebar behavior, RTL mirroring, accessible selected tab semantics, shared `AppIcon`, and direct `/one-move` routing.
- `da2de9f60e5e632df84271e1fe1e6ee75821e38c` + `3b3126110a5b733b96dff14fb2c4648c9ac2c53c` — the direct **One Move** destination now matches the owner-reference language with a responsive illustrated focus hero, semantic reason icon, evidence/confidence tiles, designed loading/error/empty/status states, alternative-action surface, preserved accept/defer/decline semantics, and localized confidence labeling.
- `81f334b0e548c8ee8a9b794056344409e515c7fb` — Life Map application data exposes direction-normalized positive visual signals while preserving raw values and explicit unknowns.
- `1195dee72b0ff63815e32eb4e8d462da2c93490a` + `c45c8ca496d358bcc9343cf67f10a6c3c01f662f` — shared icon vocabulary and mandatory responsive Life Map radar/spider composition backed by current enabled-domain data, with unknown preservation, accessible descriptions, exact-value detail, and narrow/wide responsive composition.
- `fbf457d90e4b8b2f9c2fd781586b01f58a0f1a0c` — Life Map visualization-data regression specification for lower-is-better normalization, unknown preservation, and future-observation exclusion; intentionally not worker-run under policy.
- `9370d59476d26ff642506b9f32029eabddc8ce1a` — repository-owned theme-aware `BrandedIllustration` language with focus/recovery/welcome variants.
- `137fd2fe9facda65aba2691f38a08d6afdbc848a` — owner-reference Today/Home composition: premium greeting/day context, illustrated Today Focus / One Move hero, semantic state tiles, known-only 0–100 meters, balance/momentum treatment, domain icons, preserved alternatives and outcome feedback, and no fabricated unknown values.
- `2fbd4f17fc736faf039c6d357dcd8f28625f6b20` — shared icon vocabulary extended for pattern, hypothesis, and confidence semantics so WHY/Insights/decision surfaces do not invent local icon systems.
- `18747ebf8401bae4f596630554aab30fc4c52254` — owner-reference **Insights** visual language: semantic relationship/pattern/hypothesis icons, differentiated association vs personal-hypothesis cards, evidence/confidence tiles, Arabic/English filters, preserved sample size/evidence windows/effect direction, non-causal caveat, and RTL wrapping.
- `6c6fafed833e79c5ef5a60352f54199c09e7ce2c` — owner-reference **WHY** visual language: ranked candidate-factor cards, factor-specific icons, confidence/evidence/window details, separated interpretation-not-diagnosis caveat, and semantic RTL ordering.
- `c80a4119f3e7c3c090751d4faec96b2e8615ce33` — owner-reference **What If** range visualization: real 0–100 current marker plus plausible-range band only when values are known, accessible range summaries, shared status/evidence icons, uncertainty treatment, and no fake bars for unknowns.
- `60193f0f4a1948d96f4512adfdc07114494dd293` — owner-reference **Experiments** upgrade: recognizable category icons, icon-led new-experiment cards, explicit active/completed/stopped status treatment, duration/metric/start metadata, accessible time-window progress bar, evidence/confidence icons, safe unknown fallbacks, and preserved voluntary N-of-1/non-causal language.
- `7dd7e5f4b570ae012864297d1887e2e39e04fbe5` — **Recovery / Save My Day** now uses the shared calm recovery illustration in the hero while preserving the low-cognitive step sequence, primary progression action, skip-without-penalty path, evidence reading, and non-medical caveat.
- `c9bfa4e7342fa01e09f9cc2a8159ad0fa21dfbbe` — **Onboarding** now uses the shared welcome/botanical illustration, explicit MIZAN wordmark, responsive welcoming hero hierarchy, existing personalized setup summaries, and the dominant final continue action without changing persistence semantics.
- `41656f61d234248683855f468b22943310299d4b` — **Invisible Wins** now has category filtering, category-specific shared icons, a stronger capture affordance, visually differentiated reflection cards, filtered-empty handling, and preserved no-points/no-streaks/account-fencing behavior.
- `a3db6f54b5c6031ece29117f21bcdac7e6fdc1f2` — **Personalization** now includes icon-led domain enable/disable rows with switch semantics, explicit enabled/disabled state, and last-domain protection while retaining evidence-maturity stages and using the existing persisted domain-preference path.
- `3574f554aa4392d8573332a6f91991a797c8faf1` — **Capacity / Life Buffer & Life Debt** now visualizes known 0–100 buffer and debt amounts with accessible meters; unknown values still render no invented bar.
- `4fa3d9beb543fcb3b467232040fa7dd45d450fcf` — **Cost of Yes** now visualizes known margin usage with an accessible meter while preserving the real percentage (including >100% displacement) in text and keeping missing-margin cases unknown.
- `4d792b40df1867f83268f95c73354ad4178ca9f2` — **Human ROI** now displays benefit and effort as two separate accessible 1–5 meters rather than inventing a single ROI score, preserving the protected-meaning mode and the product rule against false scalar precision.
- `b5938695a7fac3dd49358900b4da59b60078b67b` + `168628b850aafe2b5db6c2952fd09587a95dafc8` + `144473356aec4368c359eca1d29e9fce9599c14b` — the shared icon vocabulary now covers values, reflections, experiments, seasons, integrations, privacy, and personalization; Settings and Integrations consume those shared semantics with RTL-aware icon-led composition instead of local glyph systems.
- `9ce78fe21550dbb62fc6ecc18abd823b11eff459` — **Personal Learning** now visualizes each explicit user-reported usefulness outcome on its real 1–5 bounded scale with an accessible progress meter while retaining the exact `x/5` value, note, date, and rule that completion alone is not benefit evidence.
- `a8a4ef8b3e4ea56fc70ccaac14a302e729f16742` — **Auth** now uses the same owner-reference premium language instead of a functional form-only surface: responsive narrow/wide composition, shared welcome illustration, explicit MIZAN hierarchy, a privacy/trust panel with shared semantics, and clearer access/language controls while preserving authentication behavior and localized live feedback.
- `4840728f73374ce8ceba88a030e5a04aaff53e30` — **Password recovery/update** now matches the premium Auth surface with responsive narrow/wide composition, the shared welcome illustration, privacy/trust treatment, secure LTR password fields, and the existing 8-character recovery policy unchanged.
- `c5c1bd79aced8e82b709960d150343d4ed362d30` — the initial session/restoration entry surface now uses the shared branded illustration, responsive RTL-aware hierarchy, and a designed restoration status treatment while leaving redirect/session behavior unchanged.
- `92c7f06ad33534b905e38252bfa4758bf950c907` — **Privacy & data** now has stronger owner-control visual hierarchy with shared semantic icons; the same change also scopes destructive delete confirmation to the active account so a confirmation opened before an account switch cannot authorize deletion for the newly active user.
- `6c84bb8915103f16af68d4c630dc7373aece431a` — focused Privacy-screen regression specification requires a fresh two-step deletion confirmation after an account switch; intentionally not worker-run under the active policy.
- Existing navigation/auth/localization/account-switch hardening remains in place, including offline authenticated entry, password-recovery routing, Check-in fencing, Today RTL ordering, Western-digit normalization, and corrected neutral Life Debt Arabic wording.

### CP9 remaining
- Run the residual **static** owner-reference sweep over shipped routes and fix only demonstrated gaps: untranslated production literals, Western-digit regressions, semantic RTL, accessibility/live announcements, dynamic-type/truncation, keyboard/focus, technical-id fallbacks, and duplicated global presentation decisions.
- Inspect any still-unreviewed secondary quantitative surface for a truthful visualization only where the underlying data has a meaningful bounded scale. Do **not** invent meters for categorical confidence, evidence counts, or incomparable values merely for visual density.
- Confirm shared icon semantics remain consistent on remaining secondary screens without building another icon/design abstraction layer.
- Owner/runtime evidence remains required across representative phone/tablet/Web widths, Arabic/English, and shipped light/dark modes. All owner-reference commits above remain static implementation evidence until that validation occurs.
- TASK-required runtime design-swap proof is not yet claimed and still requires Today, Life Map, WHY, and an interaction-heavy flow without edits outside the presentation boundary.

## CP10 current implementation
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented security/privacy work includes live RLS/ownership review of the ten current user-owned client-visible tables, cross-user policy specifications, function-execute hardening migration `0009`, portable authenticated data export migration `0010`, deployed JWT-protected `delete-account` Edge Function, client export/two-step deletion UI with local cache purge attempts, safer error-boundary logging, targeted sensitive-log review, stronger auth password creation minimums, consent rechecks around health sync, and account-switch/session fencing across integrations, app-state hydration, Invisible Wins, Recovery, Check-in, and the Privacy destructive-confirmation flow. A confirmation opened under one user is now invalidated on account switch before any newly active user can execute deletion. The source-level sensitive-error review has now covered baseline-target, experiment, reflection, Life Season, onboarding-context, One Move decision/history, pending-feedback, plugin-setting, What If trial-data, app-owned integration adapter/contract/registry paths, and the application-layer action-feedback, daily intelligence/recommendation, check-in, capacity, Cost of Yes, spiritual preference, user-target, personal-learning/scenario-learning, Human ROI, Value Alignment, WHY, and Recovery paths without finding a new raw-sensitive logging sink in those inspected boundaries.

### CP10 remaining
- Complete repository-wide sensitive logging/error-reporting review beyond the targeted boundaries already inspected; fix only concrete leakage paths.
- Owner/runtime validation remains required for cross-user/database tests, export/delete/local purge, destructive Edge deletion, consent revocation races, account-switch races, and the new account-scoped deletion-confirmation specification.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## Exact next executable action
1. Continue the final CP9 static owner-reference sweep across remaining shipped/secondary routes for concrete RTL/localization/accessibility/dynamic-type/focus/technical-id issues and presentation inconsistencies.
2. Inspect only still-unreviewed quantitative surfaces and add a meter/chart when the domain contract provides a real bounded quantitative meaning; preserve unknown states and avoid false precision.
3. Continue the independent CP10 repository-wide sensitive logging/error-reporting audit across application/presentation boundaries not yet explicitly inspected.
4. Leave representative-width runtime checks, tests/builds/typechecks/database validation suites, premium screenshot comparison, and final design-swap proof to owner validation under the active execution policy.

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
- Adaptive navigation/iconography/One Move batch `a04dc88e452381051f2377de1bb994e4f55a4954` plus the direct One Move refinements `da2de9f60e5e632df84271e1fe1e6ee75821e38c` and `3b3126110a5b733b96dff14fb2c4648c9ac2c53c` are static implementation evidence only until owner typecheck/runtime/responsive validation.
- Life Map radar/iconography/data-honesty commits `81f334b0e548c8ee8a9b794056344409e515c7fb`, `1195dee72b0ff63815e32eb4e8d462da2c93490a`, and `c45c8ca496d358bcc9343cf67f10a6c3c01f662f` are static implementation evidence only; the specification in `fbf457d90e4b8b2f9c2fd781586b01f58a0f1a0c` was added but not executed.
- Today/Home owner-reference commits `9370d59476d26ff642506b9f32029eabddc8ce1a` and `137fd2fe9facda65aba2691f38a08d6afdbc848a` are static implementation evidence only.
- WHY/Insights/What If owner-reference commits `2fbd4f17fc736faf039c6d357dcd8f28625f6b20`, `18747ebf8401bae4f596630554aab30fc4c52254`, `6c6fafed833e79c5ef5a60352f54199c09e7ce2c`, and `c80a4119f3e7c3c090751d4faec96b2e8615ce33` are static implementation evidence only.
- Experiments/Recovery/Onboarding/Invisible Wins/Personalization/quantitative-visual commits `60193f0f4a1948d96f4512adfdc07114494dd293`, `7dd7e5f4b570ae012864297d1887e2e39e04fbe5`, `c9bfa4e7342fa01e09f9cc2a8159ad0fa21dfbbe`, `41656f61d234248683855f468b22943310299d4b`, `a3db6f54b5c6031ece29117f21bcdac7e6fdc1f2`, `3574f554aa4392d8573332a6f91991a797c8faf1`, `4fa3d9beb543fcb3b467232040fa7dd45d450fcf`, `4d792b40df1867f83268f95c73354ad4178ca9f2`, and `9ce78fe21550dbb62fc6ecc18abd823b11eff459` are **static implementation evidence only**.
- Shared secondary-screen iconography commits `b5938695a7fac3dd49358900b4da59b60078b67b`, `168628b850aafe2b5db6c2952fd09587a95dafc8`, and `144473356aec4368c359eca1d29e9fce9599c14b` are static implementation evidence only. Workers did not run typecheck, tests, builds, screenshot capture, or representative device validation under the active policy.
- Auth/entry/privacy owner-reference and privacy-fencing commits `a8a4ef8b3e4ea56fc70ccaac14a302e729f16742`, `4840728f73374ce8ceba88a030e5a04aaff53e30`, `c5c1bd79aced8e82b709960d150343d4ed362d30`, `92c7f06ad33534b905e38252bfa4758bf950c907`, and `6c84bb8915103f16af68d4c630dc7373aece431a` are static implementation/specification evidence only; the Privacy-screen regression specification was not executed.
- CP10 application-layer logging-audit expansion recorded in `75998a428c791893fdfa37a9c27f26ff09e66fa6` is static source-review evidence only, not runtime or test evidence.

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- CP9 major owner-reference structural slices are statically present, but representative runtime screenshot evidence, interaction validation, and the design-swap proof are still outstanding; residual static defects may still surface in the final sweep.
- Privacy export/delete UI, local cache purge/warning behavior, account-scoped confirmation behavior, and Edge deletion need owner Web/native end-to-end validation before CP10 can close.
- Repository-wide sensitive logging/error reporting review remains incomplete beyond the targeted boundaries already hardened.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `apps/app/src/app/_layout.tsx`
- `apps/app/src/app/index.tsx`
- `apps/app/src/app/auth.tsx`
- `apps/app/src/app/update-password.tsx`
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
- `apps/app/src/app/what-if.tsx`
- `apps/app/src/app/experiments.tsx`
- `apps/app/src/app/recovery.tsx`
- `apps/app/src/app/onboarding.tsx`
- `apps/app/src/app/invisible-wins.tsx`
- `apps/app/src/app/personalization.tsx`
- `apps/app/src/app/personal-learning.tsx`
- `apps/app/src/app/settings.tsx`
- `apps/app/src/app/integrations.tsx`
- `apps/app/src/app/privacy.tsx`
- `apps/app/__tests__/privacy-screen-session-fencing-test.tsx`
- `apps/app/src/app/capacity.tsx`
- `apps/app/src/app/cost-of-yes.tsx`
- `apps/app/src/app/human-roi.tsx`
- `apps/app/src/state/app-state.tsx`
- `supabase/tests/rls_cross_user.sql`
- `supabase/tests/account_data_export_security.sql`
- `supabase/migrations/0009_function_execute_hardening.sql`
- `supabase/migrations/0010_account_data_export.sql`
- `supabase/functions/delete-account/index.ts`
- `automation/HUMAN_REQUIRED.md`