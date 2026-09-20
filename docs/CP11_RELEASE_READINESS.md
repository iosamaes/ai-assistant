# CP11 — Test Matrix, Performance, and Release Readiness

Status: static verification harness is being prepared while CP9/CP10 runtime gates remain owner-side. No CP11 execution result is claimed by workers under the current task policy.

## Verification modes

### 1. Deterministic signed-out Web E2E
`npm run test:e2e` keeps Supabase client configuration blank by default and runs the existing auth/guard coverage without requiring credentials. Live-account specifications skip themselves when their explicit environment is absent. Signed-out route-guard, locale-switch, and password-reset journeys now use the same shared critical browser-diagnostic guard as the live-account journeys, in addition to their layout/overflow assertions.

### 2. Live completed-account Web E2E
Provide only public client configuration plus a dedicated completed-onboarding test account:
- `MIZAN_E2E_SUPABASE_URL`
- `MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY`
- `MIZAN_E2E_COMPLETED_EMAIL`
- `MIZAN_E2E_COMPLETED_PASSWORD`

This enables non-destructive checks for the adaptive navigation shell, Life Map/One Move/Insights/More routing, the CP9 owner-reference WHY/Personal Learning/Experiments/Integrations surfaces, Recovery progression, What If scenario switching, Settings reachability, portable Privacy export, overflow checks, and critical browser diagnostics. The owner-reference evidence surfaces are intentionally read-only and execute across the full responsive/light-dark project matrix. The live journeys collect uncaught page errors, browser `console.error` messages, failed requests other than expected Chromium navigation aborts, and HTTP 5xx responses. The same diagnostic helper is shared by signed-out auth, completed-account, onboarding, and destructive-deletion journeys so critical browser/runtime failures are judged consistently. This is a verification harness only; it is not a substitute for executing the production Web build and inspecting its console/network behavior.

For Arabic/RTL matrix evidence, configure a second completed account whose saved MIZAN profile locale is already Arabic:
- `MIZAN_E2E_ARABIC_EMAIL`
- `MIZAN_E2E_ARABIC_PASSWORD`

The Arabic fixture is deliberately read-only. It signs in through the normal auth path, waits for the persisted Arabic profile locale to hydrate, then verifies Arabic primary navigation and major shell routing across the same responsive/light-dark matrix without changing the shared account locale during the test. It now also visits WHY, Personal Learning, Experiments, and Integrations in Arabic across that matrix, asserting their localized production headings plus overflow and critical browser diagnostics. This avoids a cross-project persistence race while giving owner validation a deterministic RTL path.

### 3. Live mutation E2E
Set `MIZAN_E2E_MUTATIONS=1` only when the configured account is disposable or dedicated to automation. This additionally enables check-in persistence, the One Move → explicit outcome feedback → Personal Learning loop, and an optional Spiritual Grounding preference toggle that restores its original state.

Mutation-enabled product tests self-skip outside the single `desktop-light` Playwright project. This keeps the shared live account from receiving the same write journey concurrently across the ten responsive/color-scheme projects while preserving the full matrix for non-destructive coverage. The explicit single-project runner is `npm run test:e2e:mutations`; the tests still require the live-account environment and `MIZAN_E2E_MUTATIONS=1` to perform writes.

### 4. Live onboarding E2E
Use a separate account that is intentionally incomplete:
- `MIZAN_E2E_ONBOARDING_EMAIL`
- `MIZAN_E2E_ONBOARDING_PASSWORD`

The read-only onboarding check verifies branded onboarding without product navigation. With `MIZAN_E2E_MUTATIONS=1`, the dedicated account can complete the essential setup and must land on Today with product navigation present. Because completion consumes the account's incomplete-onboarding state, mutation mode skips the read-only onboarding matrix and runs the completion journey once in `desktop-light`; this avoids racing a one-time state transition against parallel responsive projects. Both onboarding modes use the shared critical browser-diagnostic guard, so uncaught page errors, console errors, unexpected request failures, or HTTP 5xx responses are surfaced alongside layout/assertion failures.

### 5. Destructive account-deletion E2E
Use a separate completed account created only to be permanently deleted:
- `MIZAN_E2E_DELETE_EMAIL`
- `MIZAN_E2E_DELETE_PASSWORD`
- `MIZAN_E2E_DESTRUCTIVE=1`

`tests/e2e/account-deletion-live.spec.ts` is intentionally isolated from the normal completed-account fixture. Before deletion it exports the account to obtain the authenticated user id, seeds user-scoped pending-mutation and recent-snapshot cache sentinels, completes the two-step deletion UI, verifies both caches are removed, confirms no local-cleanup warning appeared, and then verifies the deleted credentials can no longer obtain a Supabase password session using only the public publishable key. The journey also uses the shared critical browser-diagnostic guard, so destructive validation cannot pass while hiding uncaught page errors, console errors, unexpected request failures, or HTTP 5xx responses. This specification is irreversible by design and must never run against a reusable account. It self-skips in every project except `desktop-light`, so the disposable account is deleted exactly once instead of being reused across the ten responsive/color-scheme projects. The explicit runner is `npm run test:e2e:delete-account`; it still requires the destructive environment opt-in above.

The generic browser assertions live in `tests/e2e/browser-assertions.ts`, while account configuration/sign-in helpers remain in `tests/e2e/live-account.ts`. This keeps browser/runtime diagnostics independent from fixture/account concerns. Real credentials never belong in source control; `.env.example` documents names only. `apps/app/__tests__/playwright-mutation-isolation-policy-test.ts` statically guards the single-project mutation isolation contract so future E2E edits do not silently reintroduce shared-account races.

`apps/app/__tests__/production-logging-privacy-policy-test.ts` adds a static privacy guard over production app/core/plugin/Edge source: ad-hoc `console.*` sinks are rejected, with only the existing development-only sanitized render-boundary `console.error` allowed. The specification also asserts that this one allowed diagnostic keeps only the fixed event label plus React component stack rather than application-controlled error name/message/stack fields. It has not been executed by workers under the active policy.

## Current E2E matrix

| CP11 journey | Specification | Current static coverage |
| --- | --- | --- |
| Auth / route guard | `tests/e2e/auth.spec.ts` | signed-out guard, locale switch, password-reset mode, overflow, shared critical browser diagnostics |
| Onboarding | `tests/e2e/onboarding-live.spec.ts` | incomplete-account/no-product-chrome checks across the responsive matrix when mutation mode is off; essential setup completion is mutation-gated and isolated to one `desktop-light` project; both paths use shared critical browser diagnostics |
| Primary product shell | `tests/e2e/product-live.spec.ts` | English/default completed-account shell plus Life Map, One Move, Insights, More across configured phone/tablet/desktop projects; optional dedicated Arabic completed account repeats the primary shell route/overflow checks with persisted Arabic RTL across the same matrix |
| CP9 premium reference evidence surfaces | `tests/e2e/product-live.spec.ts` | read-only WHY, Personal Learning, Experiments, and Integrations route/heading/overflow checks across the full responsive/light-dark matrix for the normal completed account and, when configured, the dedicated persisted-Arabic account |
| Browser diagnostics | `tests/e2e/browser-assertions.ts`, all E2E journey specs | signed-out auth, completed-account, Arabic, onboarding, mutation, and destructive-deletion journeys share one guard for uncaught page errors, console errors, unexpected failed requests, and HTTP 5xx responses; expected Chromium `net::ERR_ABORTED` navigation cancellations are excluded |
| Daily loop | `tests/e2e/product-live.spec.ts` | live low-energy check-in persistence behind mutation opt-in and isolated to `desktop-light` |
| Feedback learning | `tests/e2e/product-live.spec.ts` | repeated evidence → One Move accept → explicit 4/5 feedback → Personal Learning evidence, mutation-gated and isolated to `desktop-light` |
| Recovery | `tests/e2e/product-live.spec.ts` | Recovery surface plus next-step interaction |
| Scenario / What If | `tests/e2e/product-live.spec.ts` | scenario switch plus assumption visibility |
| Settings / optional module | `tests/e2e/product-live.spec.ts` | Spiritual Grounding toggle and restore behind mutation opt-in and isolated to `desktop-light` |
| Privacy export | `tests/e2e/product-live.spec.ts` | portable JSON export/download without destructive deletion |
| Privacy deletion | `tests/e2e/account-deletion-live.spec.ts` | dedicated completed deletion account, two-step destructive confirmation, user-scoped Web cache cleanup, server-side credential rejection after deletion, and shared critical browser diagnostics; separately gated by `MIZAN_E2E_DESTRUCTIVE=1` and executed once in `desktop-light` |
| Responsive Web | Playwright projects | 320×568 narrow phone, 390×844 common phone, 834×1194 tablet portrait, 1194×834 tablet landscape, and 1440×900 desktop; every viewport runs in both light and dark emulated color schemes, and existing overflow assertions execute in each applicable project |

The Playwright project matrix deliberately uses the same Chromium engine with explicit viewport classes and emulated light/dark color schemes so layout and appearance regressions can be compared without introducing a browser-engine variable. The five viewport classes × two color schemes produce ten static Web projects. Native Android/iOS validation remains a separate owner/runtime gate. Stateful live mutations and irreversible deletion are deliberate exceptions to the full matrix and run once in `desktop-light`; the other projects remain read-only for those shared-account journeys.

## Release documentation

- Root `README.md` now documents Node/npm requirements, clean install, public Supabase environment configuration, local Supabase initialization/reset, run commands, quality/E2E commands, destructive-test safety, Expo export validation, architecture invariants, and the current status ledger.
- `apps/app/README.md` no longer contains create-expo-app starter/reset-project instructions. It now documents the actual MIZAN workspace commands, public client configuration, quality/export commands, source layout, and pointers back to the root release documentation.
- Documentation is static evidence only until an owner/new-engineer clean checkout actually follows it successfully; any mismatch found during that run must be corrected before CP11 can close.

## Still required before CP11 can close

- Run the full TypeScript, lint, unit/component/integration, database/policy, and Web E2E suites from a trustworthy checkout.
- Add or execute any missing behavior discovered by those runs; static specifications are not a PASS.
- Run the responsive read-only matrix without `MIZAN_E2E_MUTATIONS=1`; for the RTL half of the owner evidence, provide the dedicated completed Arabic-profile account documented above rather than mutating the normal completed account locale across parallel projects.
- Enable mutation mode only with dedicated/disposable live accounts and use `npm run test:e2e:mutations` for the isolated `desktop-light` write journeys.
- Execute the prepared destructive deletion specification only with an intentionally disposable dedicated account; do not reuse the normal completed-account fixture. Use `npm run test:e2e:delete-account` after configuring the documented environment and setting `MIZAN_E2E_DESTRUCTIVE=1`.
- Execute Expo diagnostics plus Android/iOS bundle/export checks available in the owner environment.
- Inspect production Web console/network behavior and production export output. The shared Playwright diagnostics make critical runtime noise testable but do not constitute a PASS until executed against the intended build/runtime.
- Measure startup and representative interaction performance enough to catch blocking work, pathological rerenders, or large regressions.
- Validate Arabic RTL and English across representative phone/tablet/wide-Web classes, light/dark modes, and the CP9 design-swap evidence set.
- Perform a clean-checkout setup run using the documented README flow and correct any missing prerequisite, environment, Supabase, test, or export step discovered there.
- Record exact commands, versions, results, failures/fixes, and any owner release action in `docs/PROJECT_STATE.md` before claiming CP11 complete.

## Policy note

The current worker policy explicitly forbids workers from running product tests, builds, typechecks, database validation scripts, GitHub Actions, or cloud CI. Therefore every item above is implementation/specification evidence only until owner-side execution supplies the required runtime proof.
