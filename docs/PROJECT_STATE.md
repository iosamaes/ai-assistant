# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy source hardening is broadly implemented; execution-dependent gates remain owner validation.
- CP11 static verification/release readiness is prepared and continues to be hardened; execution is pending because current worker policy forbids workers from running product tests, builds, typechecks, database suites, GitHub Actions, or cloud CI.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `f2786fbae29a0ee1fa7bf77eb1504fc8fb80c208`.

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
- [ ] CP12 — Independent final review and handoff

## Latest productive changes
- `c15c1f7217fa8126f5502ed0029a3d1ec41d729a` — hardened the aggregate owner release baseline so a configured `MIZAN_E2E_SUPABASE_URL` must be a hosted HTTPS Supabase URL whose project ref is exactly the authorized `olfhjnropdrnujgpidfi` project. A missing/malformed/wrong-project URL now fails before any live quality command can run, without echoing credentials or the supplied URL.
- `8fd0447be7ee0c2142c3d68fa726bfcd9ea5d5de` + `b5c17f509e50c2dfc8963ed06da667c51a16a3c2` — extended the same project-authority fence into both the normal and production Playwright configurations. Any explicitly configured live E2E backend now fails closed unless it resolves to the named Supabase project, so standalone mutation, performance, visual, destructive, or production commands cannot silently target another project.
- `25ca9f3722b9c4ee1c2626dd043d17b781aa6a6e` + `6c6712c29d24a1c6dfc277939da13db803afa0a7` — extended the static Playwright release-safety specification to protect the authorized-project fence in the aggregate runner and both Playwright configs alongside the existing mutation/destructive/fixture isolation invariants.
- `87e77d5a5fe839cc05551c73629a1edd93de07ab` — updated `.env.example` to state the exact authorized hosted E2E project target while keeping all real credentials out of source control.
- `db173d9dc7ba95f4dc1bd7f88e488ddc43160936` — corrected the default Playwright development matrix so production-only `production-web.spec.ts` and `production-performance.spec.ts` are explicitly ignored there. Those specifications now remain tied to the dedicated production Playwright configuration and static-export server instead of being able to run against the Expo development server and masquerade as production-export evidence.
- `1427e8d759d19781d82387e91718f239d821a325` — extended the Playwright release-safety policy specification to guard that production/dev isolation and require the explicit production scripts to keep using `playwright.production.config.ts`.
- `5e1838d97c6fd31945978e44af4733a6397d73c1` — added generated local `supabase/config.toml` to the root ignore policy so following the documented `supabase init` clean-checkout flow does not dirty the repository or invite an environment-specific CLI config into source control.
- `1124d3bb30dcfa6d83999f83dfa43fb5c185bbe0` — hardened `npm run check:release:baseline` so the completed-English, completed-Arabic, and incomplete-onboarding fixtures must be three distinct accounts. Fixture emails are normalized with trim/lowercase before comparison, and only environment-variable names are reported on conflict so credentials are not exposed. This prevents a reused account from invalidating persisted-locale/onboarding release evidence while still reaching the aggregate runner.
- `0292b95a586a572ca9bbdfb1f849060a7994166a` — extended the Playwright release-safety policy specification to guard the new distinct-fixture preflight alongside the existing required-variable and fail-closed mutation/destructive protections.
- `cd0c8f61aa4ef929059a5ae2455a3a00439ed523` — updated `.env.example` to state explicitly that the non-destructive release baseline requires three distinct live accounts and rejects reused fixture emails.
- `f7e1ee35532da287c80310fb08ef0dcf0d3d3d54` — expanded the rollback-only account-export database specification across all ten current application-owned user data families. The test now seeds distinct caller/private-user rows for domain preferences, observations, action events, feedback outcomes, plugin settings, reflections, experiments, life-season history, and integration connections in addition to profiles; verifies every export section is present and caller-scoped; rejects nested `user_id` leakage across every collection; and retains authenticated-only/anonymous-denied function ACL coverage. This is static specification evidence only until owner validation runs the local database suite.
- `c71195df5236408f9508ea96cecc5c06c2e0c963` — hardened `npm run check:release:baseline` so it now fails before any quality command when the read-only live E2E fixtures required by the baseline are missing: public Supabase client values, completed-English credentials, completed-Arabic credentials, or the incomplete-onboarding credentials. This prevents required authenticated/RTL/onboarding suites from silently skipping and still producing a misleading aggregate PASS.
- `9527c697fd56eadcb9310b14d9a9bd38fb468b2d` — extended the Playwright release-safety policy specification to guard that baseline fixture preflight in addition to the existing mutation/destructive opt-in stripping and runner wiring invariants.
- `da8ab323d216b8d5cf48fca8a421f459f1f5d3c0` + `17d5bdf4fd7f750cd19c2ddecceb6636f219bbb4` — updated the root README and `.env.example` so clean-checkout validation states that individual live specs may skip without credentials but the aggregate release baseline deliberately requires the read-only completed-English, completed-Arabic, and onboarding fixture set; destructive deletion credentials remain outside the non-destructive baseline.
- `389434f1154cea9fd546512adf523b1319536454` — added a focused locale-number regression specification requiring Western digit rendering (`1234`) in both Arabic and English UI locales while still accepting Arabic-Indic and Eastern Arabic user input and normalizing it to Western digits. The specification is source evidence only until owner validation executes the app test suite.
- `5d03d0b6d2f933bf9e5b46658bcb82928945068d` + `fa39be250f52f04c8e586829d1a0350d250e8ff9` — gave the shared primary navigation `tablist` an explicit localized accessible name (`التنقل الرئيسي` / `Primary navigation`) instead of relying on a role-only screen-reader announcement, and extended the navigation regression specification to guard both Arabic and English labels alongside the existing RTL rail-divider assertions.
- `0a8fb1326b8be529ac983b6f6c4f2fbbb5b2e92f` — extended the Playwright mutation-isolation policy specification so the aggregate release baseline must keep its fail-closed safety boundary: root wiring must point to the repository runner, mutation/destructive/visual/performance opt-in flags must be removed from the child environment, and the aggregate command must not invoke mutation or account-deletion runners directly.
- `563e7494bf58acb751bca6afe185254f2dcc8ef4` + `6bb5b3dc6323b4c4dca997199381032d565791b3` — added the owner-side `npm run check:release:baseline` path through `scripts/run-release-baseline.mjs`. The runner strips `MIZAN_E2E_MUTATIONS`, `MIZAN_E2E_DESTRUCTIVE`, `MIZAN_E2E_VISUAL_EVIDENCE`, and `MIZAN_E2E_PERFORMANCE`, then fail-fast chains workspace checks, local database tests/lint, the normal Web E2E matrix, and production Web smoke/size. This prevents an owner shell with a stale destructive opt-in from silently turning the convenience baseline into a mutating or irreversible run.
- `7d04a1c4f52b2962d983af65f4c4dab20828edfd` + `b77d640f06a728c07a8256b37ee16c765b987306` — documented the aggregate baseline in the clean-checkout README and CP11 release ledger, while keeping live mutations, visual evidence, performance probes, destructive deletion, Expo Doctor, and Android/iOS exports as explicit separate gates.
- `fa621532c129eeb85edea8a041d1a1abcfcdd437` — added a static regression guard around the irreversible Playwright contract so future edits must preserve desktop-only isolation, explicit destructive opt-in, dedicated-fixture protection, the v2 `409 account_changed` expected-user fence, and strict post-delete HTTP `400` authentication rejection.
- `0fa422d3c90db3b381f355f31f35f53e865c948b` — added a fail-closed safety guard to the irreversible deletion harness: `MIZAN_E2E_DELETE_EMAIL` is rejected before any destructive action if it matches the reusable completed, persisted-Arabic, or onboarding fixtures, reducing the risk of owner validation accidentally deleting a shared test account.
- `249f70164e3042884ffc883f33e0f453080ad205` — extended the destructive account-deletion E2E to exercise the deployed v2 expected-user fence before real deletion: a valid access token paired with a deliberately different `expected_user_id` must return HTTP `409` with `account_changed`, and a fresh password grant must still succeed afterward. The same journey then performs the intended deletion and requires the previously valid credentials to return HTTP `400`, so generic backend failures cannot masquerade as deletion evidence.
- `2b8f7044c2fff10a252778bde332b7238930595a` — first hardened the destructive deletion proof by replacing a generic non-2xx assertion with explicit post-delete HTTP `400` credential rejection.
- `6cf2f9136d48960086dd1c68c3199cfb66860835` — added the root owner-side command `npm run test:db`, mapped to `supabase test db --local`, so CP11 database/RLS/security verification has one explicit local-only entry point instead of requiring ad-hoc manual invocation.
- `982821b080bf6f985e4e8ae179105323f42b2502` — added `npm run lint:db`, mapped to `supabase db lint --local --level warning --fail-on error`, so owner validation can surface warning-level schema/function findings while treating error-level database lint findings as a failing gate.
- `da0eba574441afb72b9f2050bba820a33e1fca72` + `a0c84725cad3611479ee1e54e3c030f115c86ff2` — updated the clean-checkout README to document the local Supabase reset, pgTAP/RLS/security test, and database lint workflow, with both commands explicitly scoped to the local stack rather than the hosted project.
- Immediately preceding release hardening remains current: MIZAN-owned app icon/favicon/adaptive/splash artwork replaced Expo starter branding; native iPad support is explicit; production static-Web smoke/performance harnesses exist; Life Seasons local drafts and the shared AppState persistence queue are account-fenced; destructive account deletion has a dedicated isolated E2E harness.
- These are static implementation/specification changes only. No test, Expo export, typecheck, native build, database suite/lint, E2E, or performance run was executed by workers.

## CP8 reliability state
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Static implementation covers durable per-user retry for check-ins and Invisible Wins, duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and restart/reconnect/concurrency specifications. CP8 cannot close until owner/runtime evidence confirms the required offline/reconnect behavior.

## CP9 presentation state
Detailed architecture: `docs/CP9_PRESENTATION_ARCHITECTURE.md`. Runtime design-swap procedure: `docs/CP9_DESIGN_SWAP_PROOF.md`.

The owner-approved premium reference is broadly implemented in static source: adaptive Home/Life Map/One Move/Insights/More navigation, shared semantic iconography, responsive Life Map radar, premium Today/One Move composition, WHY/Insights evidence language, What If range visualization, Experiments/Recovery/Onboarding/Personalization/Invisible Wins treatments, truthful bounded meters, premium Auth/Privacy/Settings/Integrations and secondary decision surfaces, Western-digit formatting, RTL-aware geometry, reduced-motion handling, dynamic-type/shared-control sizing, semantic light/dark roles, and MIZAN-owned native/Web branding.

Prepared owner/runtime evidence includes:
- `tests/e2e/visual-evidence-live.spec.ts` for Today/Life Map/WHY/interacted Check-in across the responsive light/dark matrix in persisted English and Arabic RTL.
- Real Tab/Enter keyboard journeys for Auth and the primary shell, including after Arabic RTL hydration.
- `apps/app/__tests__/app-navigation-rtl-test.tsx` for app-local Arabic/English rail-divider geometry plus localized screen-reader naming of the shared primary-navigation tablist.
- `apps/app/__tests__/localized-number-policy-test.ts` for the product rule that both Arabic and English UI render Western digits while localized Arabic/Persian numeric input remains accepted and normalized.
- `apps/app/__tests__/theme-contrast-policy-test.ts` for semantic normal-text contrast.
- `apps/app/__tests__/app-native-platform-config-policy-test.ts` for iPad support, responsive platform configuration, MIZAN-owned native/Web brand assets, starter-asset rejection, and light/dark splash configuration.
- `docs/CP9_DESIGN_SWAP_PROOF.md` for the deliberate owner-side design-swap proof.

### CP9 remaining
- Make only demonstrated residual accessibility/RTL/localization/focus/presentation fixes; do not manufacture speculative polish.
- Execute and inspect the prepared runtime visual matrix across narrow/common phone, tablet portrait/landscape, wide Web, Arabic/English, and light/dark.
- Manually inspect keyboard focus indicators and representative interactions.
- Run representative iPhone/iPad validation and verify the product-owned app icon plus light/dark splash in release-capable native output.
- Execute and record the deliberate design-swap proof. CP9 remains open until runtime evidence exists.

## CP10 security/privacy state
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Implemented source hardening includes user-owned table/RLS review, cross-user policy specifications, function-execute hardening migration `0009`, authenticated portable export migration `0010`, Life Season expected-user fencing migrations `0011`/`0012`, JWT-protected `delete-account` Edge Function v2 with expected-user matching, export/two-step deletion and local-cache purge attempts, consent rechecks around integration sync, safer logging/error boundaries, broad account-switch/session fencing, account-owned Life Seasons drafts, and account-bound queued profile/preference persistence. The database export specification now seeds and verifies caller isolation/completeness across every current application-owned user data family, while the prepared destructive E2E explicitly covers both the `expected_user_id` mismatch guard and post-delete credential rejection, refuses to run if the destructive fixture reuses a normal E2E account, and has a static policy test protecting those safety invariants.

### CP10 remaining
- Owner/runtime validation for cross-user/database specifications, Life Season expected-user/local-draft behavior, queued AppState persistence account switching, export/delete/local purge, destructive Edge deletion v2, consent-revocation races, account-switch/session-binding cases, offline replay ownership, and notification-preference isolation/persistence.
- Supabase leaked-password protection remains an owner action in `automation/HUMAN_REQUIRED.md`.

## CP11 static readiness
Detailed ledger: `docs/CP11_RELEASE_READINESS.md`.

Prepared readiness includes:
- Main Web matrix at **320×568**, **390×844**, **834×1194**, **1194×834**, and **1440×900**, each in light/dark.
- Auth/route guard/password recovery, onboarding, completed-account navigation, persisted Arabic locale coverage, Recovery/What If, privacy export, live daily-loop and feedback-learning mutations, Spiritual Grounding toggle/restore, notification preference persistence/restore, destructive account deletion with a dedicated-only fixture guard, explicit HTTP `409 account_changed` expected-user fencing, explicit HTTP `400` post-delete credential rejection, and a source-level policy guard for those irreversible-test invariants, plus browser diagnostics, production logging policy, semantic contrast policy, and CP9 visual capture.
- Read-only performance sampling for both the controlled Expo E2E runtime and the served static production Web export.
- Production static-Web export smoke, direct-route hydration coverage, static-size reporting, and explicit Web/Android/iOS Expo export scripts.
- All configured live Playwright paths now fail closed unless `MIZAN_E2E_SUPABASE_URL` targets the authorized hosted Supabase project `olfhjnropdrnujgpidfi`; the aggregate release runner independently enforces the same authority before invoking child commands, and the source-policy specification guards both layers.
- The default development Playwright matrix explicitly excludes the production static-export smoke/performance specifications; those remain bound to `playwright.production.config.ts`, and a source-policy guard protects the separation so development-server runs cannot be mistaken for production-export evidence.
- Root `npm run test:db` provides an explicit local-only Supabase pgTAP/RLS/security suite entry point, and `npm run lint:db` provides a local database lint gate that reports warnings while failing on errors.
- Root `npm run check:release:baseline` now gives the owner a single fail-fast baseline after local Supabase reset. Its repository runner removes all mutation/destructive/visual/performance opt-in flags, requires the public Supabase client values plus completed-English, completed-Arabic, and incomplete-onboarding credentials before any child command runs, rejects reuse of any of those three fixture accounts after normalized email comparison, and rejects a hosted live URL for any Supabase project other than `olfhjnropdrnujgpidfi`. This prevents required authenticated/RTL/onboarding suites from silently skipping, reusing one persisted account under incompatible evidence roles, or targeting an unauthorized backend. The static Playwright policy specification guards the safety boundary, required-variable preflight, distinct-fixture contract, and project-authority fence.
- Generated local `supabase/config.toml` is ignored at the repository root, matching the documented owner-side `supabase init` clean-checkout workflow and keeping environment-specific CLI config out of source control.
- Native iPad eligibility and MIZAN-owned app icon/favicon/adaptive/splash contracts are guarded statically.

### CP11 remaining
- After a disposable local Supabase reset and with the documented read-only baseline fixtures configured for the authorized project, execute `npm run check:release:baseline` from a trustworthy owner checkout and retain the output. The runner covers TypeScript, lint, unit/component/integration, local database test/lint, normal Web E2E, and production Web smoke/size while forcibly disabling opt-in mutation/destructive modes.
- Execute and inspect keyboard/focus journeys, visual evidence, live mutation journeys, development-runtime performance sampling, production-export performance sampling, and destructive deletion only with documented fixtures.
- Run Expo diagnostics and Android/iOS export checks; include representative iPhone/iPad runtime review and verify branded icon/splash surfaces in release-capable native output.
- Continue repository hygiene review only for demonstrated dead flags, stale mocks/debug surfaces, console noise, or validated unused dependencies.
- Perform a clean-checkout setup from the root README and record exact commands, versions, results, failures/fixes, database-test/lint evidence, Web size evidence, performance evidence, and owner release actions.

## Exact next executable action
1. Continue CP9 static work only when a concrete residual defect is demonstrated; otherwise preserve the prepared runtime evidence for owner validation.
2. Keep CP10 source review limited to genuinely new security/account-sensitive boundaries.
3. Keep CP11 static harness aligned with the release contract; the next owner-side baseline is reproducible as `supabase init` → `supabase start` → `supabase db reset` → configure the documented distinct read-only `MIZAN_E2E_*` fixtures for `https://olfhjnropdrnujgpidfi.supabase.co` → `npm run check:release:baseline`, followed by the explicit opt-in visual/mutation/performance/destructive/native gates documented in `docs/CP11_RELEASE_READINESS.md`.
