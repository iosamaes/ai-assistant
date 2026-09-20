# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy source hardening is broadly implemented; execution-dependent gates remain owner validation.
- CP11 verification/release-readiness harnesses are prepared; execution is pending because the active worker policy forbids workers from running product tests, builds, typechecks, database suites, GitHub Actions, or cloud CI.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `f2786fbae29a0ee1fa7bf77eb1504fc8fb80c208`.
- Latest source-hardening commit reviewed in this ledger: `92332a1d965e79fcee482d4fa5f21ba745959a88`.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation — implementation present; owner responsive/locale/native runtime evidence pending
- [ ] CP2 — Supabase, auth, ownership, persistence — implementation present; owner/runtime validation pending
- [ ] CP3 — Deterministic intelligence core — implementation present; validation pending
- [ ] CP4 — First complete daily loop — implementation present; validation pending
- [ ] CP5 — Insight, explanation, personal learning — implementation present; validation pending
- [ ] CP6 — Advanced decision tools — implementation present; validation pending
- [ ] CP7 — Plugins, unified integrations, provider boundaries — implementation present; validation pending
- [ ] CP8 — Reliability, offline tolerance, sync — statically reviewed; owner/runtime validation pending
- [ ] CP9 — Responsive UX, accessibility, localization, polish, design-swappability — **IN_PROGRESS**
- [ ] CP10 — Security, privacy, owner-data control — **IN_PROGRESS / runtime verification pending**
- [ ] CP11 — Test matrix, performance, release readiness — **static harness prepared; execution pending**
- [ ] CP12 — Independent final review and handoff — **NOT_STARTED**

## Latest productive changes
- `2b56227df4a2df44c39e32f632c2ef8b5a703836` + `78780be624b866377da9ea4fd7b041018be3fbd0` — expanded the CP10 client-secret source policy from only `apps/app/src` to all current client-bundled production roots (`apps/app/src`, `packages/core/src`, `packages/plugins/src`) and Expo manifest/config candidates (`app.json`, `app.config.*` when present). The guard rejects Supabase service-role/secret-key markers before they can be introduced into source or shipped Expo configuration. Server-only Edge Function source is intentionally outside this client-bundle rule. The specification is present but unexecuted under worker policy.
- `cdf3884f23e02c5ffd3900f4c0203712d3e2c1ba` + `92332a1d965e79fcee482d4fa5f21ba745959a88` — hardened public Supabase client configuration so only `http:`/`https:` URLs are accepted before client construction, while preserving local HTTP Supabase development and hosted HTTPS use. The existing public-key guard continues to accept current publishable keys or legacy `anon` JWTs and reject current `sb_secret_` keys plus legacy service-role JWTs. A focused regression specification covers the new non-HTTP rejection; it was not executed by the worker.
- `1126ad46ce3965ea943d948acc10634421b3b4fe` — introduced the initial production-app client-secret source guard that the later commits above broadened.
- `00048202c92e0f2b979ee95940242d5d8e18b22f` + related navigation commits — closed the demonstrated CP9 tablet-navigation gap by using the shared semantic tablet breakpoint for the persistent side rail while preserving phone bottom navigation and RTL/LTR rail behavior.
- `70584656d22c8bae22950a167b67eaed080dd226` — strengthened the Western-digit policy with a production-source scan; localized Arabic/Persian digit glyphs remain allowed only at the input-normalization boundary.
- `5e0f27b7a9a40f73ab0d11c231501a26b9345f0b` + `bfba0d3b32591afc7e9ebbb522a7a0619ee37d54` — added visible Web keyboard focus to Personalization domain switches and guarded it statically.
- Recent CP11 hardening keeps reusable English/Arabic/onboarding evidence fixtures separate from completed-mutation, onboarding-mutation, and destructive-deletion fixtures; release/mutation/destructive runners fail closed when required identities or authorized Supabase-project checks are missing.

## CP8 reliability state
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Static implementation covers durable per-user retry for check-ins and Invisible Wins, duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, account-fenced drafts/persistence queues, and restart/reconnect/concurrency specifications.

### CP8 remaining
- Owner/runtime proof for restart/reload and offline/reconnect behavior on Web and native development runtime.
- Confirm queued writes survive interruption without cross-account replay or duplicate creation.

## CP9 presentation state
Detailed architecture: `docs/CP9_PRESENTATION_ARCHITECTURE.md`.
Design-swap procedure: `docs/CP9_DESIGN_SWAP_PROOF.md`.

The blocking premium-reference contract is broadly present in static source: adaptive Home/Life Map/One Move/Insights/More navigation, phone bottom navigation plus tablet/wide rail, shared iconography, responsive Life Map radar, premium Today/One Move hierarchy, WHY/Insights evidence language, What If ranges, Experiments/Recovery/Onboarding/Personalization/Invisible Wins treatments, bounded meters, semantic light/dark roles, MIZAN-owned branding, Western digits in both locales, RTL-aware geometry, reduced-motion handling, responsive/shared control sizing, and explicit visible Web focus treatment on shared and demonstrated direct-screen controls.

### CP9 remaining
- Make only demonstrated residual accessibility/RTL/localization/focus/presentation fixes; do not manufacture speculative polish.
- Execute and inspect the prepared visual matrix at 320×568, 390×844, 834×1194, 1194×834, and 1440×900 across Arabic/English and shipped light/dark modes.
- Manually inspect keyboard focus and representative interactions.
- Run representative iPhone/iPad validation and verify the production icon and light/dark splash behavior.
- Execute and record the deliberate design-swap proof for Today, Life Map, WHY, and an interaction-heavy flow.

## CP10 security/privacy state
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented source hardening includes user-owned table/RLS review, cross-user policy specifications, function-execute hardening migration `0009`, authenticated portable export migration `0010`, Life Season expected-user fencing migrations `0011`/`0012`, JWT-protected `delete-account` Edge Function v2 with expected-user matching, export/two-step deletion and local-cache purge attempts, consent rechecks around integration sync, safer logging/error boundaries, broad account-switch/session fencing, account-owned local drafts/queued persistence, platform-truthful native export/share behavior, client-bundle secret-marker protection across app/core/plugin plus Expo config, and public Supabase config validation that rejects elevated secret/service-role credentials and non-HTTP(S) endpoints before client construction.

### CP10 remaining
- Owner/runtime validation for cross-user/database specifications, Life Season expected-user/local-draft behavior, queued AppState account switching, export/delete/local purge, Edge deletion v2, consent-revocation races, account-switch/session-binding cases, offline replay ownership, notification-preference isolation/persistence, and native export/share dismissal behavior.
- Execute the client-config/client-secret specifications with the normal app test suite; the current worker only prepared/reviewed source and did not claim a PASS.
- Supabase leaked/compromised-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## CP11 static readiness
Detailed ledger: `docs/CP11_RELEASE_READINESS.md`.

Prepared readiness includes:
- Responsive Chromium matrix: **320×568**, **390×844**, **834×1194**, **1194×834**, and **1440×900**, each light/dark.
- Auth/route guard/password recovery, reusable onboarding evidence, disposable onboarding-completion mutation, completed-account navigation, persisted Arabic, Recovery/What If, privacy export, daily-loop/feedback mutations, Spiritual Grounding persistence/restore, notification-preference persistence/restore, and isolated destructive account deletion.
- Shared browser diagnostics for uncaught page errors, `console.error`, unexpected failed requests, and HTTP 5xx responses.
- Development-runtime and production-export performance probes.
- Production static-Web export smoke/direct-route hydration and static-size reporting.
- Local-only `npm run test:db` and `npm run lint:db` database gates.
- Fail-closed `npm run check:release:baseline` requiring the authorized Supabase project and distinct reusable English/Arabic/onboarding fixtures while stripping mutation/destructive/visual/performance opt-ins.
- Fail-closed dedicated mutation and destructive runners with role-collision protection.

### CP11 remaining
- After a disposable local Supabase reset, run `npm run check:release:baseline` from a trustworthy owner checkout and retain output.
- Run and inspect `npm run test:e2e:visual` with persisted-English and persisted-Arabic fixtures.
- Run the dedicated mutation journey with completed-mutation and onboarding-mutation fixtures.
- Run the isolated destructive deletion journey only with its disposable deletion account.
- Execute development-runtime and production-export performance probes and retain reports.
- Run Expo diagnostics plus Android/iOS export checks and representative native-device review.
- Perform a clean-checkout setup using the root README and record exact versions/results/fixes.

## Verification record
Historical owner-side baseline evidence recorded before the later CP2–CP11 hardening included root typecheck PASS, lint PASS, core/plugin tests PASS, Expo Doctor PASS, and Android/iOS export PASS. Those historical results do **not** validate the later changes.

Post-baseline reality:
- Workers have not run product tests, builds, typechecks, database suites/lint, E2E, performance probes, or native exports under the active task policy.
- Migrations `0009`–`0012` and delete-account v2 were previously applied/deployed; behavioral release proof remains pending.
- The current source/specification work must not be described as runtime PASS until owner execution exists.

## Known blockers / owner actions
See `automation/HUMAN_REQUIRED.md`. Current open owner actions are:
- Unlock the Windows user session for owner/runtime visual interaction evidence.
- Add Supabase Auth redirect allow-list entries for `mizan://**`, `http://localhost:8087/**`, and the exact production Web URL before release.
- Enable Supabase leaked/compromised-password protection and rerun the Security Advisor.

## Exact next executable action
1. Continue CP9 source work only if a concrete residual defect is demonstrated; otherwise leave runtime visual/focus/native/design-swap proof to owner validation.
2. Continue CP10 source review only for genuinely unreviewed client/security/account-sensitive boundaries; client source/config and public Supabase config now fail closed against the demonstrated secret/URL classes above.
3. Keep CP11 static harness aligned with the release contract without running forbidden execution gates. Owner validation should proceed as documented in `docs/CP11_RELEASE_READINESS.md` once the required fixtures/environment are available.
4. When CP0–CP11 gates have actual evidence, proceed to CP12 independent final review; do not mark `TASK_DONE` from static implementation alone.

## Evidence paths
- `README.md`
- `.env.example`
- `apps/app/README.md`
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP9_DESIGN_SWAP_PROOF.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `docs/CP11_RELEASE_READINESS.md`
- `apps/app/src/infrastructure/supabase/config.ts`
- `apps/app/__tests__/supabase-config-test.ts`
- `apps/app/__tests__/client-secret-source-policy-test.ts`
- `apps/app/__tests__/keyboard-focus-visual-policy-test.ts`
- `apps/app/__tests__/localized-number-policy-test.ts`
- `apps/app/__tests__/western-digit-source-policy-test.ts`
- `apps/app/__tests__/playwright-mutation-isolation-policy-test.ts`
- `tests/e2e/browser-assertions.ts`
- `tests/e2e/visual-evidence-live.spec.ts`
- `tests/e2e/product-live.spec.ts`
- `tests/e2e/onboarding-live.spec.ts`
- `tests/e2e/account-deletion-live.spec.ts`
- `playwright.config.ts`
- `playwright.production.config.ts`
- `supabase/tests/rls_cross_user.sql`
- `supabase/tests/account_data_export_security.sql`
- `supabase/migrations/0009_function_execute_hardening.sql`
- `supabase/migrations/0010_account_data_export.sql`
- `supabase/migrations/0011_life_season_expected_user_guard.sql`
- `supabase/migrations/0012_life_season_execute_hardening.sql`
- `supabase/functions/delete-account/index.ts`
- `automation/HUMAN_REQUIRED.md`
