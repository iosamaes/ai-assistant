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
- `a04dc88e452381051f2377de1bb994e4f55a4954` — adaptive product navigation shell with **Home / Life Map / One Move / Insights / More**, mobile bottom tabs, tablet/wide rail/sidebar behavior, RTL mirroring, accessible selected tab semantics, shared `AppIcon`, and direct `/one-move` routing.
- `81f334b0e548c8ee8a9b794056344409e515c7fb` — Life Map application data exposes direction-normalized positive visual signals while preserving raw values and explicit unknowns.
- `1195dee72b0ff63815e32eb4e8d462da2c93490a` + `c45c8ca496d358bcc9343cf67f10a6c3c01f662f` — shared icon vocabulary and mandatory responsive Life Map radar/spider composition backed by current enabled-domain data, with unknown preservation, accessible descriptions, exact-value detail, and narrow/wide responsive composition.
- `fbf457d90e4b8b2f9c2fd781586b01f58a0f1a0c` — Life Map visualization-data regression specification for lower-is-better normalization, unknown preservation, and future-observation exclusion; intentionally not worker-run under policy.
- `9370d59476d26ff642506b9f32029eabddc8ce1a` — repository-owned theme-aware `BrandedIllustration` language with focus/recovery/welcome variants.
- `137fd2fe9facda65aba2691f38a08d6afdbc848a` — owner-reference Today/Home composition: premium greeting/day context, illustrated Today Focus / One Move hero, semantic state tiles, known-only 0–100 meters, balance/momentum treatment, domain icons, preserved alternatives and outcome feedback, and no fabricated unknown values.
- `2fbd4f17fc736faf039c6d357dcd8f28625f6b20` — shared icon vocabulary extended for pattern, hypothesis, and confidence semantics so WHY/Insights/decision surfaces do not invent local icon systems.
- `18747ebf8401bae4f596630554aab30fc4c52254` — owner-reference **Insights** visual language:
  - semantic relationship icons and pattern/hypothesis status icons;
  - visually differentiated association vs personal-hypothesis cards;
  - evidence and confidence tiles with shared icon semantics;
  - Arabic/English filter chips for All / Observed association / Personal hypothesis;
  - preserved sample size, evidence window, effect indicator, direction language, and explicit non-causal caveat;
  - RTL mirrors wrapped filters/cards and card identity rows.
- `6c6fafed833e79c5ef5a60352f54199c09e7ce2c` — owner-reference **WHY** visual language:
  - ranked candidate-factor cards with explicit Western-digit rank;
  - factor-specific shared icons for recovery, energy, mental load, connection, and overload;
  - confidence/evidence cues and evidence-window details;
  - separated interpretation-not-diagnosis caveat panel;
  - semantic RTL wrapped-card ordering while preserving the existing evidence-ranked application output.
- `c80a4119f3e7c3c090751d4faec96b2e8615ce33` — owner-reference **What If** range visualization:
  - real 0–100 current-marker plus plausible-range band for projections only when all required values are known;
  - unknown values still remain unknown and render no fake bar;
  - accessible range summary includes current value, plausible range, and visual-scale explanation;
  - shared component/status/evidence icons, uncertainty icon treatment, and RTL effect-grid ordering;
  - estimate source/evidence and the explicit no-causality simulation caveat remain visible.
- Existing navigation/auth/localization/account-switch hardening remains in place, including offline authenticated entry, password-recovery routing, Check-in fencing, Today RTL ordering, Western-digit normalization, and corrected neutral Life Debt Arabic wording.

### CP9 remaining
- Continue the owner-approved implementation order rather than returning to micro-polish:
  1. upgrade **Experiments** with category icons, status/duration/progress treatment, and obvious create-new-experiment composition while preserving voluntary N-of-1 evidence caveats;
  2. complete Personalization / Invisible Wins / Recovery / Onboarding composition requirements, reusing `BrandedIllustration` rather than creating another artwork system;
  3. complete remaining quantitative gauges/meters and extend shared domain/action/status icon semantics through repeated product surfaces where justified;
  4. only after those structural gaps, finish residual static sweeps for untranslated literals, Western-digit regressions, semantic RTL, accessibility/live announcements, truncation/dynamic type, keyboard/focus, technical-id fallbacks, and duplicated global visual decisions.
- Owner/runtime evidence remains required across representative phone/tablet/Web widths, Arabic/English, and shipped light/dark modes. Today/Home, Life Map, WHY, Insights, and What If are static implementation evidence until that validation occurs.
- TASK-required runtime design-swap proof is not yet claimed and still requires Today, Life Map, WHY, and an interaction-heavy flow without edits outside the presentation boundary.

## CP10 current implementation
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented security/privacy work includes live RLS/ownership review of the ten current user-owned client-visible tables, cross-user policy specifications, function-execute hardening migration `0009`, portable authenticated data export migration `0010`, deployed JWT-protected `delete-account` Edge Function, client export/two-step deletion UI with local cache purge attempts, safer error-boundary logging, targeted sensitive-log review, stronger auth password creation minimums, consent rechecks around health sync, and account-switch/session fencing across integrations, app-state hydration, Invisible Wins, Recovery, and Check-in.

### CP10 remaining
- Complete repository-wide sensitive logging/error-reporting review beyond the targeted boundaries already inspected; fix only concrete leakage paths.
- Owner/runtime validation remains required for cross-user/database tests, export/delete/local purge, destructive Edge deletion, consent revocation races, and account-switch races.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## Exact next executable action
1. Continue CP9 reference fidelity with **Experiments**: category icons, active/completed/stopped status visuals, duration/progress treatment, clearer new-experiment creation composition, and evidence/confidence presentation without gamification.
2. Then complete Recovery/Onboarding illustration composition and the remaining Personalization/Invisible Wins requirements, reusing the current branded illustration language rather than inventing a second artwork system.
3. Follow with remaining quantitative gauges/meters and cross-surface icon consistency only where the underlying evidence supports the visualization.
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
- Today/Home owner-reference commits `9370d59476d26ff642506b9f32029eabddc8ce1a` and `137fd2fe9facda65aba2691f38a08d6afdbc848a` are static implementation evidence only.
- WHY/Insights/What If owner-reference commits `2fbd4f17fc736faf039c6d357dcd8f28625f6b20`, `18747ebf8401bae4f596630554aab30fc4c52254`, `6c6fafed833e79c5ef5a60352f54199c09e7ce2c`, and `c80a4119f3e7c3c090751d4faec96b2e8615ce33` are **static implementation evidence only**. Workers did not run typecheck, tests, build, screenshot capture, or representative device validation under the active policy.

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- CP9 still needs Experiments and remaining Personalization/Invisible Wins/Recovery/Onboarding composition work, residual quantitative visual alignment, representative runtime screenshot evidence, and the design-swap proof.
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
- `apps/app/src/app/what-if.tsx`
- `apps/app/src/app/experiments.tsx`
- `apps/app/src/state/app-state.tsx`
- `supabase/tests/rls_cross_user.sql`
- `supabase/tests/account_data_export_security.sql`
- `supabase/migrations/0009_function_execute_hardening.sql`
- `supabase/migrations/0010_account_data_export.sql`
- `supabase/functions/delete-account/index.ts`
- `automation/HUMAN_REQUIRED.md`
