# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy implementation continues in parallel; this does not mark CP9 complete.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `e226b941b6e25ba2437483ab7d699087dcd48c29`.
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

Implemented static reliability work includes durable per-user retry for check-ins and Invisible Wins, stable client mutation IDs and duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching with validation/expiry, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and reconnect/restart/concurrency specifications.

CP8 is not credited `DONE` until owner/runtime evidence confirms restart/reload and offline/reconnect behavior.

## CP9 current implementation
Presentation authority remains the compact app-local theme and shared primitives. The current shared foundation includes semantic palette/typography/spacing/radii/control sizing, `MizanText`, cards, form controls, buttons/chips, responsive `Screen`, reduced-motion navigation behavior, broad RTL/dynamic-type/accessibility/localization hardening, Western-digit formatting, and async state fencing.

The Premium Production Visual Pass has been statically applied across the primary shipped surfaces including Today, Life Map, WHY, Check-in, Insights, Personal Learning, What If, Recovery, Experiments, Integrations, Settings, Privacy, Auth, Onboarding, Capacity, Cost of Yes, Human ROI, Value Alignment, Life Seasons, Personalization, Invisible Wins, Update Password, and the root session-restoration state. Representative implementation commits are recorded in Git history and the presentation boundary is documented in `docs/CP9_PRESENTATION_ARCHITECTURE.md`.

Navigation/state hardening currently includes:
- `de9ddb608498d4440874a831585ae19bb4a70b52` — offline authenticated root entry remains inside the product instead of bouncing to Auth.
- `e3a817f552a8036974efef449d36a98718acef84` + `9c4f254c2117645d1f7ef6295e9063c185979111` — entry-route regression specifications for offline authenticated routing and session-loading behavior; added but not worker-run.
- `b6d0878574de785c63cf0cfac5f1aae20ace813f` — shared Web `pointerEvents` deprecation path removed from the ambient `Screen` layers.
- `bcf210bc36d4f3ccfe995faa21707ab18083e3cc` — root auth guard now preserves `/update-password` while signed out so a password-reset deep link can finish establishing its temporary recovery session instead of racing to `/auth`.
- `7d8d3310e33843170afdc33065738bca76cbe882` — focused root-layout routing specification covers the recovery-route exception, normal signed-out protection, and post-restoration Auth redirect; specification added but not worker-run under the active policy.
- `f4e38742c587150bfe87489bf0fd3b831dcad69b` — Check-in local answers and submit state are now scoped to the active account; switching users clears prior-user ratings immediately and stale submit/session-refresh completions cannot redirect or repaint the new account.
- `a318a7152902159998d9f5ae87ab811502074da6` — focused Check-in account-switch regression specification covers stale User A submit completion after User B becomes active; added but not worker-run under the active policy.
- `150294d7fc81c0a503893c44f32ca2be46dc9882` — Today dashboard and priorities wrapped grids now mirror their row direction from `isRtl`, so Arabic cards begin from the right instead of retaining LTR card ordering. This is a presentation-only semantic RTL correction; runtime visual confirmation remains part of owner validation rather than a separate worker-run unit test.

### CP9 remaining
- Finish static inspection only for concrete residual scaffold-level or navigation-state defects; avoid reworking already-premium screens without evidence.
- Continue targeted checks for untranslated literals, Western-digit regressions, semantic RTL in remaining wrapped grids, accessibility/live announcements, truncation/dynamic type, keyboard/focus, technical-id fallbacks, and duplicated global visual decisions.
- Owner/runtime evidence is still required across representative phone/tablet/Web widths, Arabic/English, and shipped light/dark modes.
- TASK-required design-swap proof is not yet claimed and still requires representative runtime evidence on Today, Life Map, WHY, and an interaction-heavy flow without edits outside the presentation boundary.

## CP10 current implementation
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented security/privacy work includes:
- Live audit of the ten current client-visible user-owned tables: RLS enabled, ownership policies present, user foreign keys cascade from `auth.users`, and no Storage buckets currently exist.
- Cross-user RLS specification covering all ten tables plus representative write rejection.
- Function execute hardening migration `0009_function_execute_hardening.sql`, applied to the authorized Supabase project.
- Portable authenticated `export_my_data()` migration `0010_account_data_export.sql`, applied to the authorized Supabase project, plus focused export-authorization specification.
- `delete-account` Edge Function deployed with JWT verification, explicit confirmation, server-only service-role use, Auth-user deletion, and cascade-based application-data deletion.
- Client Privacy & Data flow for export and two-step account deletion with initiating-user/session fencing and local offline-cache purge attempts.
- Development error-boundary logging excludes arbitrary `Error` content and retains only fixed diagnostic context plus React component stack.
- Targeted sensitive logging review covers Supabase config/data access, integration persistence/sync, session storage, offline caches, privacy/Auth/delete paths, integration UI, root error boundary, global app-state handling, password-update/auth presentation, baseline-target persistence, experiment persistence, What If trial data, and the app-local integration contract/adapter/registry boundary.
- New-account creation requires the same 8-character minimum already used by password recovery/update; sign-in keeps the existing 6-character compatibility threshold.
- Health integration sync rechecks authoritative consent/connection/scopes before provider read, before retry, after provider read, and before success bookkeeping; stale/revoked sync cannot silently reconnect.
- Integration settings, app-state hydration, Invisible Wins history, Recovery plan loading, and Check-in local/submit state are fenced against previous-account async completion or local-state carryover.

### CP10 remaining
- Complete repository-wide sensitive logging/error-reporting review beyond the targeted boundaries already inspected; fix only concrete leakage paths.
- Owner/runtime validation remains required for cross-user/database tests, export/delete/local purge, destructive Edge deletion, consent revocation races, account-switch races, and the newly hardened reflection/auth/logging/check-in paths.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## Exact next executable action
1. Continue CP9 static inspection of residual navigation/state and remaining responsive RTL/accessibility/localization defects; only mutate when a concrete defect is demonstrated.
2. Continue CP10 repository-wide sensitive logging/error-reporting review for uninspected sinks.
3. Leave representative-width runtime checks, post-baseline tests/builds/typechecks/database validation suites, export/delete/local-purge proof, consent/account-switch runtime races, premium screenshot evidence, and final design-swap proof to owner validation under the active policy.

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
- Authorized migrations `function_execute_hardening` and `account_data_export` were applied and resulting live function ACLs were read; this is implementation/state evidence, not a test-suite PASS.
- `delete-account` deployment reports ACTIVE with JWT verification enabled; no destructive end-to-end deletion validation is claimed.
- CP9 Premium Production Visual Pass and later navigation/auth hardening are static source/specification evidence only until owner runtime review.
- Root recovery-route regression specification `apps/app/__tests__/root-layout-auth-routing-test.tsx` was added but not run under the active worker policy.
- Check-in account-switch regression specification `apps/app/__tests__/check-in-session-fencing-test.tsx` was added but not run under the active worker policy.
- Today semantic RTL grid correction is static source evidence only; representative Arabic runtime widths remain an owner-validation gate.

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- CP9 still needs representative runtime screenshot evidence and the required design-swap proof.
- Privacy export/delete UI, local cache purge/warning behavior, and Edge deletion need owner Web/native end-to-end validation before CP10 can close.
- Repository-wide sensitive logging/error reporting review remains incomplete beyond the targeted boundaries already hardened.
- Health consent revocation and account-switch fencing are statically implemented but still need runtime proof; future time/location collectors must adopt the same authoritative consent pattern.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `supabase/tests/rls_cross_user.sql`
- `supabase/tests/account_data_export_security.sql`
- `supabase/migrations/0009_function_execute_hardening.sql`
- `supabase/migrations/0010_account_data_export.sql`
- `supabase/functions/delete-account/index.ts`
- `apps/app/src/app/_layout.tsx`
- `apps/app/src/app/index.tsx`
- `apps/app/src/app/update-password.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/life-map.tsx`
- `apps/app/src/app/why.tsx`
- `apps/app/src/app/settings.tsx`
- `apps/app/src/app/privacy.tsx`
- `apps/app/src/app/auth.tsx`
- `apps/app/src/app/integrations.tsx`
- `apps/app/src/state/app-state.tsx`
- `apps/app/src/components/app-error-boundary.tsx`
- `apps/app/__tests__/root-layout-auth-routing-test.tsx`
- `apps/app/__tests__/entry-screen-offline-routing-test.tsx`
- `apps/app/__tests__/auth-screen-test.tsx`
- `apps/app/__tests__/privacy-session-fencing-test.ts`
- `apps/app/__tests__/integration-consent-revocation-test.ts`
- `apps/app/__tests__/integrations-screen-session-fencing-test.tsx`
- `apps/app/__tests__/app-state-session-fencing-test.tsx`
- `apps/app/__tests__/check-in-session-fencing-test.tsx`
- `automation/HUMAN_REQUIRED.md`
