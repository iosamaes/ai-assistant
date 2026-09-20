# CP11 — Test Matrix, Performance, and Release Readiness

Status: static verification harness is being prepared while CP9/CP10 runtime gates remain owner-side. No CP11 execution result is claimed by workers under the current task policy.

## Verification modes

### 1. Deterministic signed-out Web E2E
`npm run test:e2e` keeps Supabase client configuration blank by default and runs the existing auth/guard coverage without requiring credentials. Live-account specifications skip themselves when their explicit environment is absent.

### 2. Live completed-account Web E2E
Provide only public client configuration plus a dedicated completed-onboarding test account:
- `MIZAN_E2E_SUPABASE_URL`
- `MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY`
- `MIZAN_E2E_COMPLETED_EMAIL`
- `MIZAN_E2E_COMPLETED_PASSWORD`

This enables non-destructive checks for the adaptive navigation shell, Life Map/One Move/Insights/More routing, Recovery progression, What If scenario switching, Settings reachability, portable Privacy export, overflow checks, and browser page errors.

### 3. Live mutation E2E
Set `MIZAN_E2E_MUTATIONS=1` only when the configured account is disposable or dedicated to automation. This additionally enables check-in persistence, the One Move → explicit outcome feedback → Personal Learning loop, and an optional Spiritual Grounding preference toggle that restores its original state.

### 4. Live onboarding E2E
Use a separate account that is intentionally incomplete:
- `MIZAN_E2E_ONBOARDING_EMAIL`
- `MIZAN_E2E_ONBOARDING_PASSWORD`

The read-only onboarding check verifies branded onboarding without product navigation. With `MIZAN_E2E_MUTATIONS=1`, the dedicated account can complete the essential setup and must land on Today with product navigation present.

Real credentials never belong in source control; `.env.example` documents names only.

## Current E2E matrix

| CP11 journey | Specification | Current static coverage |
| --- | --- | --- |
| Auth / route guard | `tests/e2e/auth.spec.ts` | signed-out guard, locale switch, password-reset mode, overflow |
| Onboarding | `tests/e2e/onboarding-live.spec.ts` | incomplete account, no product chrome, essential setup completion behind mutation opt-in |
| Primary product shell | `tests/e2e/product-live.spec.ts` | Home shell plus Life Map, One Move, Insights, More across configured phone/tablet/desktop projects |
| Daily loop | `tests/e2e/product-live.spec.ts` | live low-energy check-in persistence behind mutation opt-in |
| Feedback learning | `tests/e2e/product-live.spec.ts` | repeated evidence → One Move accept → explicit 4/5 feedback → Personal Learning evidence |
| Recovery | `tests/e2e/product-live.spec.ts` | Recovery surface plus next-step interaction |
| Scenario / What If | `tests/e2e/product-live.spec.ts` | scenario switch plus assumption visibility |
| Settings / optional module | `tests/e2e/product-live.spec.ts` | Spiritual Grounding toggle and restore behind mutation opt-in |
| Privacy | `tests/e2e/product-live.spec.ts` | portable JSON export/download without destructive deletion |
| Responsive Web | Playwright projects | 390×844 phone, 834×1194 tablet portrait, 1194×834 tablet landscape, and 1440×900 desktop, with the existing overflow assertions executed by each applicable specification |

The Playwright project matrix deliberately uses the same Chromium engine with explicit viewport classes so layout regressions can be compared across widths without introducing a browser-engine variable. Native Android/iOS validation remains a separate owner/runtime gate.

## Still required before CP11 can close

- Run the full TypeScript, lint, unit/component/integration, database/policy, and Web E2E suites from a trustworthy checkout.
- Add or execute any missing behavior discovered by those runs; static specifications are not a PASS.
- Validate destructive account deletion only with an intentionally disposable account and confirm local cleanup behavior; do not reuse the normal completed-account fixture.
- Execute Expo diagnostics plus Android/iOS bundle/export checks available in the owner environment.
- Inspect production Web console/network behavior and production export output.
- Measure startup and representative interaction performance enough to catch blocking work, pathological rerenders, or large regressions.
- Validate Arabic RTL and English across representative phone/tablet/wide-Web classes, light/dark modes, and the CP9 design-swap evidence set.
- Record exact commands, versions, results, failures/fixes, and any owner release action in `docs/PROJECT_STATE.md` before claiming CP11 complete.

## Policy note

The current worker policy explicitly forbids workers from running product tests, builds, typechecks, database validation scripts, GitHub Actions, or cloud CI. Therefore every item above is implementation/specification evidence only until owner-side execution supplies the required runtime proof.
