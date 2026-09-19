# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy implementation continues in parallel; this does not mark CP9 complete.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `e226b941b6e25ba2437483ab7d699087dcd48c29`.
- Worker execution policy: workers may mutate GitHub source and the authorized Supabase project, but must not run product tests, builds, typechecks, validation database scripts, GitHub Actions, or cloud CI. Execution-dependent gates remain owner validation.

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
- [ ] CP9 — Responsive UX, accessibility, localization, polish, design-swappability — **IN_PROGRESS; Premium Production Visual Pass progressing across primary routes**
- [ ] CP10 — Security, privacy, owner-data control — **IN_PROGRESS in parallel**
- [ ] CP11 — Test matrix, performance, release readiness
- [ ] CP12 — Independent final review and handoff

## CP8 current implementation
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Implemented static reliability work includes durable per-user retry for check-ins and Invisible Wins, stable client mutation IDs and duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching with validation/expiry, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and reconnect/restart/concurrency specifications.

CP8 is not credited `DONE` until owner/runtime evidence confirms restart/reload and offline/reconnect behavior.

## CP9 current implementation
Presentation authority remains the compact app-local theme and shared primitives. Current shared foundation includes semantic palette/typography/spacing/radii/control sizing, `MizanText`, cards, form controls, buttons/chips, responsive `Screen`, reduced-motion navigation behavior, and broad static hardening for RTL, dynamic type, accessibility/live regions, localization, Western-digit formatting, and async state fencing.

### Premium Production Visual Pass — completed static slices
- `41d8620d1d9ee2531b46dea80fefdd453c0c2930` — premium token direction: warmer light canvas, deeper dark canvas, stronger green hierarchy, editorial type rhythm, roomier radii/control sizing, wider content measure, centralized surface/control elevation.
- `baab75d60ebe4464cf4b3fd07c73ff98cffe4857` — shared cards, text inputs, primary/secondary controls, and chips upgraded to the premium direction.
- `ff8cfb14ef84c7ac96b5d4cdbe8e2e1a87089806` — shared responsive canvas upgraded with restrained semantic ambient layers and production spacing rhythm.
- `60178df8ed576ef0b7c4e901d9c76ec86c284f66` — Today premium composition: stronger check-in/One Move hierarchy, responsive state dashboard, semantic metric pills, quieter secondary surfaces, safe wrapping header/actions.
- `fa9bee8ce35694af797e7650ea9e001ed8ad7632` — Life Map premium composition: accent hero, responsive domain-card grid, evidence/score/trend pills, Western-digit date formatting.
- `b7a54d31b8ff3652b6f59c1ec214da1790f4f77c` — WHY premium composition: accent hero, responsive factor grid, confidence/evidence/window tiles, safer state surfaces, Western-digit date formatting.
- `aa988563ccc67c24db26b270e70f1a15c3dc69dd` — Check-in premium composition: accent introduction/progress surface, responsive metric grid, selected-state summaries, structured delivery/error states, grouped actions while preserving existing submission/offline behavior.
- `2f114afd020beef932a91dd8e437dfd092d7bfbe` — Insights premium composition: evidence-window/pattern summary, stronger descriptive hero hierarchy, accent-led relationship cards, direction callouts, responsive evidence tiles, and structured loading/error/empty surfaces without changing inference semantics.
- `2d66c9bfc6c25aa52c9373e2f8300a4560a06222` — Personal Learning premium composition: evidence-count overview, clearer adherence-vs-benefit rule, accent-led action cards, stronger response/evidence hierarchy, refined recent-outcome presentation, and localized generic fallback instead of exposing unknown technical action ids.
- `ac46c49c2872073faadd34730841be7a8f2f1a65` — What If premium composition: accent-led explanatory hero, structured scenario chooser, uncertainty and assumptions hierarchy, responsive projection cards, explicit source/evidence presentation, localized fallback labels, and calm limitation treatment without changing simulation semantics.
- `2bc252e1fd73775d22f0fc059e67820a951632b3` — Recovery premium composition: calm recovery hero, structured confidence/evidence reading, reason signals, accessible step progress, stronger current-step/action hierarchy, and non-medical limitation treatment without changing recovery-plan behavior.
- `37560ba39e0f766846cc5752e79abaf701765c8c` — Experiments premium composition: accent-led voluntary-experiment framing, structured planner with responsive duration/outcome tiles, clearer consent hierarchy, premium active/history cards, personal-comparison result surfaces, evidence/confidence presentation, and designed loading/error/empty/limitations states while preserving the existing experiment lifecycle and conservative causal language.
- `20b392e9a5cd9488a55907979cbcb1247afd0f4e` — Integrations premium composition: user-control/privacy framing, structured loading/error/empty states, capability/status/provider hierarchy, responsive sync/consent detail blocks, permission pills, and a calmer secondary disconnect action while preserving existing account-switch/load-request fencing and provider lifecycle behavior.
- `1002a24b375fcd435617066cd8d07ef7659d7be7` — Settings premium composition: replaces the long undifferentiated route list with grouped preferences, responsive decision-tool cards, explicit data/connection controls, calm status messaging, and separated account actions while keeping shared primitives as visual authority.
- `344ef43ef58e653fbd4bd5e6a85b1a6073f0d612` — Privacy premium composition: trust-focused hero, separate export and permanent-deletion surfaces, explicit non-destructive pre-confirmation messaging, responsive action layout, danger-semantic borders, and preserved initiating-user/session fencing.
- `1b0da78cebdae408703dbbb7ab17784033c3f5a1` + `6f831b51e7930d1e4ae476d684b85961efe382af` — Auth premium composition: trust-focused hero, grouped language/access-mode controls, structured account form, designed live-message surface, and semantic radius-token cleanup without changing auth/session behavior.
- `b54f2012b8a45f1edf155b84de3a4a48a3717d42` — Onboarding premium composition: personalized setup hero with live selection summary, grouped foundation/priorities/baseline/boundaries sections, responsive target panels, structured preference/status feedback, and a clear final readiness surface while preserving existing persistence behavior.
- `d70439bc381477c6f94c2b3455c219903a885a1a` — Capacity premium composition: accent Life Buffer hero, structured buffer/confidence/evidence tiles, responsive Life Debt cards, urgency/evidence hierarchy, and explicit unknown/loading/error/caveat surfaces without inventing missing capacity evidence.
- `8312dbf56047dec4a83b99e20b280145ed75fc29` — Cost of Yes premium composition: premium decision-tool hero, responsive explicit-input grid, designed assessment state, inspectable margin metrics/evidence, and calm caveat treatment while preserving deterministic planning semantics.
- `577eecb41f8231887ae23c28f133186306ea0a80` — Human ROI premium composition: explicit protected-vs-compare framing, responsive benefit/effort input panels, inspectable assessment/evidence hierarchy, and preservation of the non-scalar/no-human-worth rule.
- `7bcf6b8664b96c0dbcbd0b84458c5802dc15ff4a` — Value Alignment premium composition: value-signal hero, responsive alignment cards, confidence/evidence tiles, separated watch/supporting signals, and localized generic fallback instead of exposing unknown technical signal ids.
- `09010b3b130efaaf402aa9eea1404d2866bfebe9` — Life Seasons premium composition: season hero, responsive target panels, structured persistence feedback, premium history grid and state pills; Arabic history dates now force Latin digits and unknown stored domain ids use a localized generic fallback.
- `c0fdf88655682900b36c90d531b3ef2114f065c2` — Personalization premium composition: current-maturity hero, responsive learning-stage cards with active/past/future state treatment, structured loading/error/empty states, and retained evidence-maturity caveats.
- `726a969566a178332d0f21f09ca6e6694bfebc5e` — Invisible Wins premium composition plus account-state hardening: calm reflection hero/composer/history grid and structured delivery/load states; history is now explicitly owned by the active account and stale previous-account load/save completions cannot repaint the next account's reflection list.
- `b88fb3a4d70994251300b52c8458e3409659aa17` — Update Password premium composition: secure recovery framing, structured credential form, designed requirement/match/session states, and input gating when no valid recovery session is active, while preserving the existing password-update behavior and raw-error shielding.
- `2bf3e942e172c1d9233574468cdcdc4fbe7baae0` — entry/session-restoration surface upgraded from a lone loading label to a bilingual premium trust-state card with clear context-restoration messaging, semantic shared primitives, and a live loading status; routing behavior is unchanged.

Additional static CP9 evidence includes Western/ASCII digit enforcement for Arabic and English formatted output, Arabic localized-number parsing, Arabic timestamps using `nu-latn`, Today cross-user async fencing, and targeted RTL/localization/dynamic-type/accessibility hardening across primary routes.

Navigation/state hardening added in the latest static pass:
- `de9ddb608498d4440874a831585ae19bb4a70b52` — root entry routing now treats an authenticated offline session (`offline` + active `userId`) as usable, matching the root navigator and preventing an offline cold entry from bouncing back to Auth.
- `e3a817f552a8036974efef449d36a98718acef84` — focused entry-route regression specification covers offline authenticated Today/onboarding routing and rejects offline-without-user as authenticated. The specification was added but not run under the active worker policy.
- `b6d0878574de785c63cf0cfac5f1aae20ace813f` — shared `Screen` ambient layers moved `pointerEvents` from the deprecated React Native Web prop to the style property, preserving non-interactive decoration while removing a concrete Web console deprecation path.
- `9c4f254c2117645d1f7ef6295e9063c185979111` — entry-route specification now also covers the designed session-loading state and confirms it does not redirect before restoration finishes; specification added but not worker-run under current policy.

### CP9 remaining
- Continue the Premium Production Visual Pass only on any remaining shipped route that static inspection still shows at scaffold-level composition; password recovery/update and the root session-restoration state now match the premium direction, so prioritize only concrete remaining secondary/state surfaces before touching already-premium screens again.
- Refine navigation shell/state/data presentation only where current code demonstrates a concrete need; avoid page-local design systems or wrapper-only abstraction.
- Continue static defect review for untranslated production literals, Western-digit regressions, semantic RTL, accessibility/live announcements, truncation/dynamic type, keyboard/focus, unknown technical identifiers, and duplicated global visual decisions.
- Owner/runtime evidence is still required across representative phone/tablet/Web widths, Arabic/English, and shipped light/dark modes.
- TASK-required design-swap proof is not claimed and still requires representative runtime evidence on Today, Life Map, WHY, and an interaction-heavy flow without edits outside the presentation boundary.

## CP10 current implementation
Detailed ledger and threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented security/privacy work includes:
- Live audit of the ten current client-visible user-owned tables: RLS enabled, ownership policies present, user foreign keys cascade from `auth.users`, no Storage buckets currently exist.
- Cross-user RLS specification covering all ten tables plus representative write rejection.
- Function execute hardening migration `0009_function_execute_hardening.sql`, applied to the authorized Supabase project.
- Portable authenticated `export_my_data()` migration `0010_account_data_export.sql`, applied to the authorized Supabase project, plus focused export-authorization specification.
- `delete-account` Edge Function deployed with JWT verification, explicit confirmation, server-only service-role use, Auth-user deletion, and cascade-based application-data deletion.
- Client Privacy & Data flow for export and two-step account deletion; Web JSON download/native share path; initiating-user/session fencing.
- Confirmed server deletion triggers local purge attempts for pending offline mutations and recent Today snapshot; cleanup failure is reported separately from server deletion success.
- Development error-boundary logging no longer emits arbitrary error objects/messages.
- Targeted logging/error review completed for Supabase config/data access, integration persistence/sync, session storage, offline caches, privacy/Auth/delete paths, integration UI, root error boundary, global app-state handling, and password-update/auth presentation.
- New-account creation now requires the same 8-character minimum already used by password recovery/update, with localized live guidance; sign-in keeps its 6-character client compatibility threshold for existing accounts. Focused regression specification added in `apps/app/__tests__/auth-screen-test.tsx` but not worker-run.
- Health integration sync now rechecks authoritative consent/connection/scopes before provider read, before retry, after provider read, and before success bookkeeping; stale/revoked sync cannot silently reconnect.
- Integration settings and global app-state hydration are fenced against previous-account async results.
- Invisible Wins history now binds loaded items to the active user and rejects prior-account async load/save completion from repainting a new account; runtime validation remains pending.
- Focused static specifications exist for privacy session fencing/local purge, consent revocation, integration-screen account switching, app-state account-switch hydration, and new-account password minimum behavior.

### CP10 remaining
- Complete repository-wide sensitive logging/error-reporting review beyond the already inspected boundaries; fix only concrete leakage paths.
- Owner/runtime validation remains required for cross-user/database tests, export/delete/local-purge, destructive Edge deletion, consent revocation races, account-switch races, and the newly hardened reflection/auth paths.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## Exact next executable action
1. Finish CP9 static inspection of remaining shipped routes/navigation state and apply the Premium Production Visual Pass only where a concrete scaffold-level composition still remains.
2. Continue static CP9 defects: untranslated literals, Western-digit regressions, semantic RTL, accessibility/live announcements, truncation/dynamic type, keyboard/focus, and technical-id fallbacks.
3. In parallel, continue CP10 repository-wide sensitive logging/error-reporting review for concrete uninspected sinks.
4. Leave representative-width runtime checks, post-baseline tests/builds/typechecks/database validation suites, export/delete/local-purge proof, consent/account-switch runtime races, premium screenshot evidence, and final design-swap proof to owner validation under the active policy.

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
- Authorized product migrations `function_execute_hardening` and `account_data_export` were applied and resulting live function ACLs were read; this is implementation/state evidence, not a test-suite PASS.
- `delete-account` deployment reports ACTIVE with JWT verification enabled; no destructive end-to-end deletion validation is claimed.
- CP9 Premium Production Visual Pass commits through `2bf3e942e172c1d9233574468cdcdc4fbe7baae0` are static implementation evidence only until owner runtime review.
- Offline entry routing, premium session-loading presentation, and shared Web `pointerEvents` warning fixes above are static source/specification evidence only; the focused regression specifications remain owner-run under the active worker policy.
- Auth new-account password hardening is static implementation/specification evidence only: implementation `82fb811d77e01bfd61d07f3bdbbbcda92d3b6e9d`, specification `8b7b7258f054a7f5eedb1a320a9c8cea2f199bf1`; the specification was not worker-run.

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- CP9 Premium Production Visual Pass still needs a final static sweep of remaining secondary/scaffold-level routes plus representative runtime screenshot evidence.
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
- `apps/app/src/constants/theme.ts`
- `apps/app/src/components/mizan-ui.tsx`
- `apps/app/src/components/screen.tsx`
- `apps/app/src/app/index.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/app/life-map.tsx`
- `apps/app/src/app/why.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/insights.tsx`
- `apps/app/src/app/personal-learning.tsx`
- `apps/app/src/app/what-if.tsx`
- `apps/app/src/app/recovery.tsx`
- `apps/app/src/app/experiments.tsx`
- `apps/app/src/app/settings.tsx`
- `apps/app/src/app/privacy.tsx`
- `apps/app/src/app/auth.tsx`
- `apps/app/src/app/update-password.tsx`
- `apps/app/src/app/onboarding.tsx`
- `apps/app/src/app/integrations.tsx`
- `apps/app/src/app/capacity.tsx`
- `apps/app/src/app/cost-of-yes.tsx`
- `apps/app/src/app/human-roi.tsx`
- `apps/app/src/app/value-alignment.tsx`
- `apps/app/src/app/life-seasons.tsx`
- `apps/app/src/app/personalization.tsx`
- `apps/app/src/app/invisible-wins.tsx`
- `apps/app/src/infrastructure/supabase/privacy.ts`
- `apps/app/src/infrastructure/supabase/integrations.ts`
- `apps/app/src/infrastructure/offline/pending-mutations.ts`
- `apps/app/src/infrastructure/offline/recent-daily-snapshot.ts`
- `apps/app/src/application/integrations.ts`
- `apps/app/src/state/app-state.tsx`
- `apps/app/src/components/app-error-boundary.tsx`
- `apps/app/__tests__/auth-screen-test.tsx`
- `apps/app/__tests__/entry-screen-offline-routing-test.tsx`
- `apps/app/__tests__/privacy-session-fencing-test.ts`
- `apps/app/__tests__/integration-consent-revocation-test.ts`
- `apps/app/__tests__/integrations-screen-session-fencing-test.tsx`
- `apps/app/__tests__/app-state-session-fencing-test.tsx`
- `automation/HUMAN_REQUIRED.md`
