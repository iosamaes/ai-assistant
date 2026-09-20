# CP11 — Test Matrix, Performance, and Release Readiness

Status: the static verification harness is prepared and continues to be hardened while CP9/CP10 runtime gates remain owner-side. **No CP11 execution result is claimed by workers under the current task policy.**

## Verification modes

### 1. Deterministic signed-out Web E2E
`npm run test:e2e` keeps Supabase client configuration blank by default and runs signed-out auth/guard coverage without requiring credentials. Live-account specifications skip when their explicit environment is absent. Auth/route-guard, locale-switch, and password-reset journeys use the shared critical browser-diagnostic guard plus layout/overflow assertions. Auth also contains a real pointer-free `Tab`/Enter path for the language control, Email, Password, and enabled Sign in control.

### 2. Live completed-account Web E2E
Provide public client configuration plus a dedicated completed-onboarding account:
- `MIZAN_E2E_SUPABASE_URL`
- `MIZAN_E2E_SUPABASE_PUBLISHABLE_KEY`
- `MIZAN_E2E_COMPLETED_EMAIL`
- `MIZAN_E2E_COMPLETED_PASSWORD`

This enables non-destructive checks for the adaptive navigation shell, Life Map/One Move/Insights/More routing, CP9 owner-reference WHY/Personal Learning/Experiments/Integrations surfaces, Recovery, What If, Settings, portable Privacy export, overflow, keyboard reachability, and critical browser diagnostics. The keyboard path uses real sequential focus and Enter activation rather than programmatic focus/click.

For Arabic/RTL matrix evidence, configure a separate completed account whose persisted MIZAN locale is Arabic:
- `MIZAN_E2E_ARABIC_EMAIL`
- `MIZAN_E2E_ARABIC_PASSWORD`

The Arabic fixture is read-only. It waits for persisted Arabic locale hydration, verifies localized primary navigation and routing, repeats pointer-free keyboard activation after RTL hydration, and checks selected premium-reference routes without mutating another account's locale.

### 3. Live mutation E2E
Set `MIZAN_E2E_MUTATIONS=1` only with disposable/dedicated automation accounts. Mutation coverage includes check-in persistence, One Move → explicit outcome feedback → Personal Learning, Spiritual Grounding toggle/restore, notification-preference toggle → reload persistence → original-state restore → reload verification, and onboarding completion with its separate incomplete fixture.

Mutation-enabled product tests self-skip outside `desktop-light` so one shared live account is not written concurrently across the ten responsive/color projects. The explicit runner is:

```bash
npm run test:e2e:mutations
```

The notification preference journey verifies stored preference behavior only; device notification delivery is intentionally unavailable and not claimed.

### 4. Live onboarding E2E
Use a separate intentionally incomplete account:
- `MIZAN_E2E_ONBOARDING_EMAIL`
- `MIZAN_E2E_ONBOARDING_PASSWORD`

Read-only onboarding checks branded onboarding without product chrome. With mutation opt-in, the account completes essential setup once in `desktop-light` and must land on Today with product navigation present. Both modes use the shared browser-diagnostic guard.

### 5. Destructive account-deletion E2E
Use a dedicated completed account created only to be permanently deleted:
- `MIZAN_E2E_DELETE_EMAIL`
- `MIZAN_E2E_DELETE_PASSWORD`
- `MIZAN_E2E_DESTRUCTIVE=1`

`tests/e2e/account-deletion-live.spec.ts` exports the authenticated user id, seeds user-scoped pending-mutation and recent-snapshot cache sentinels, completes two-step deletion, verifies local caches are removed, checks no cleanup warning appeared, then verifies deleted credentials can no longer obtain a password session using the public publishable key. The irreversible journey executes only in `desktop-light`.

Run explicitly with:

```bash
npm run test:e2e:delete-account
```

Never use a reusable account.

### 6. CP9 visual-evidence capture
Set `MIZAN_E2E_VISUAL_EVIDENCE=1` only when intentionally collecting owner/runtime presentation evidence, then run:

```bash
npm run test:e2e:visual
```

The normal completed fixture used for the **English** half must have persisted English MIZAN locale. `signInEnglishCompletedAccount` verifies the English Home tab after profile hydration so an Arabic stored profile cannot be silently attached under an `en` screenshot name. The separate Arabic completed fixture must have persisted Arabic locale.

`tests/e2e/visual-evidence-live.spec.ts` remains read-only and captures Today, Life Map, WHY, and Check-in across every configured viewport/light-dark project for both locales. Before each screenshot it:
- verifies the intended localized surface marker;
- waits for known asynchronous loading text to disappear where applicable;
- rejects known load-error states rather than photographing them as evidence;
- waits for `document.fonts.ready`;
- requires authenticated navigation, no horizontal overflow, and no critical browser diagnostics.

Attachments retain stable `locale/project/surface` names. The harness only prepares reliable evidence collection; CP9 still requires a successful owner-side run, human inspection, interaction/focus review, and the explicit deliberate design-swap proof required by `automation/TASK.md`.

### 7. Read-only Web performance sanity
Set `MIZAN_E2E_PERFORMANCE=1` with the persisted-English completed account and run:

```bash
npm run test:e2e:performance
```

`tests/e2e/performance-live.spec.ts` runs only in `desktop-light` and does not mutate product data. It records authenticated Home readiness and successive Home → Life Map → One Move → Insights → More route-readiness durations, captures browser navigation/resource timing plus observed long-task durations, applies deliberately broad regression tripwires (15 s authenticated readiness, 5 s per primary route transition, 1 s maximum observed long task), checks overflow and critical browser diagnostics, and attaches a structured `performance-sanity.json` report.

These ceilings are **not product SLOs** and a passing run is not production performance proof. The Playwright command uses the controlled Expo E2E runtime; CP11 still requires owner inspection of the production Web export, real startup/common-interaction measurements, and investigation of any pathological rerender or bundle regression before release.

### 8. Production Web static-export smoke and size evidence
The normal Playwright matrix intentionally uses the Expo development server. CP11 also has a separate production-export path:

```bash
npm run test:e2e:production
```

`playwright.production.config.ts` first runs `npm run export:web`, then `npm run report:web-size`, and serves `apps/app/dist` on port `8092` through `scripts/serve-expo-static.mjs` before executing `tests/e2e/production-web.spec.ts` against representative **390×844 light** and **1440×900 dark** projects. The repository-owned server has no new package dependency and resolves exact static files plus Expo static route shapes (`route.html` / `route/index.html`) without hiding a missing export behind an SPA fallback.

`scripts/report-expo-static-size.mjs` is dependency-free and reports the exported file count, total static bytes, JavaScript raw/gzip bytes, CSS raw/gzip bytes, aggregate gzip bytes for compressible assets, and the 15 largest files. It deliberately does not invent a product SLO or arbitrary hard ceiling before a reviewed production baseline exists. The owner should retain the report and investigate material growth or a pathological single asset/chunk rather than treating a successful route smoke as bundle evidence.

The signed-out production smoke directly requests `/today`, requires the shipped route guard to land on the bilingual Auth surface, verifies locale switching and overflow, and applies the shared page/console/network/5xx diagnostics. When the normal live Supabase and persisted-English completed-account variables are supplied, the same command also verifies authenticated direct `/life-map` hydration, persisted session continuity across a document navigation, primary shell routes, a direct WHY route, selected-tab semantics, overflow, and critical browser diagnostics.

The harness is static readiness only until it is actually executed. It does not replace the broader responsive development-server matrix, production interaction/startup performance review, or native release validation.

## Shared static guards

`tests/e2e/browser-assertions.ts` provides a common guard for uncaught page errors, browser `console.error`, unexpected failed requests, and HTTP 5xx responses. Expected Chromium `net::ERR_ABORTED` navigation cancellations are excluded. The shared bounded `tabTo` helper proves keyboard reachability using actual sequential focus.

`apps/app/__tests__/playwright-mutation-isolation-policy-test.ts` guards the single-project mutation isolation contract.

`apps/app/__tests__/production-logging-privacy-policy-test.ts` rejects ad-hoc production `console.*` sinks across app/core/plugin/Edge source except the existing development-only sanitized render diagnostic.

`apps/app/__tests__/notification-preferences-policy-test.ts` guards opt-in defaults, account fencing, persisted reminder keys, disabled-row fallback, consent timestamp clearing when all categories are off, contextual accessibility labels, anti-gaming copy, and truthful no-delivery disclosure.

`apps/app/__tests__/notification-preferences-session-fencing-test.tsx` adds behavioral account-switch specifications: a stale user-A load cannot replace user-B preferences, and completion of an in-flight user-A save cannot alter user-B state after the account changes. This specification is present but **not executed** under worker policy.

## Current E2E matrix

| CP11 journey | Specification | Current static coverage |
| --- | --- | --- |
| Auth / route guard | `tests/e2e/auth.spec.ts` | signed-out guard, locale switch, password recovery, overflow, shared diagnostics, real Tab/Enter traversal |
| Onboarding | `tests/e2e/onboarding-live.spec.ts` | read-only incomplete-account matrix; mutation completion once in `desktop-light` |
| Primary product shell | `tests/e2e/product-live.spec.ts` | Home/Life Map/One Move/Insights/More routing, overflow, pointer and keyboard paths, persisted-Arabic shell coverage |
| Premium reference evidence surfaces | `tests/e2e/product-live.spec.ts` | WHY, Personal Learning, Experiments, Integrations read-only localized/overflow coverage |
| CP9 visual evidence | `tests/e2e/visual-evidence-live.spec.ts` | locale-verified, load-settled, font-settled Today/Life Map/WHY/Check-in screenshots across the responsive/light-dark matrix |
| Browser diagnostics / keyboard | `tests/e2e/browser-assertions.ts` | shared page/console/network/5xx guard plus bounded real Tab traversal |
| Performance sanity | `tests/e2e/performance-live.spec.ts` | opt-in read-only desktop sample of authenticated readiness, primary route latency, resource timing, long tasks, overflow, and critical diagnostics |
| Production Web export | `playwright.production.config.ts` + `tests/e2e/production-web.spec.ts` + `scripts/report-expo-static-size.mjs` | actual static export, bundle/static-asset size measurement, direct-route serving/hydration, auth guard/locale, optional authenticated direct routes and shell on representative phone-light/desktop-dark projects |
| Daily loop | `tests/e2e/product-live.spec.ts` | live check-in write behind mutation opt-in in `desktop-light` |
| Feedback learning | `tests/e2e/product-live.spec.ts` | evidence → One Move accept → explicit usefulness → Personal Learning |
| Recovery / What If | `tests/e2e/product-live.spec.ts` | recovery step interaction and scenario switch/assumption visibility |
| Spiritual Grounding | `tests/e2e/product-live.spec.ts` | optional preference toggle and restoration |
| Notification preferences | `tests/e2e/notification-preferences-live.spec.ts` + app regression specs | toggle/reload/restore/reload live journey plus source policy and stale-load/stale-save account-switch fencing |
| Privacy export | `tests/e2e/product-live.spec.ts` | authenticated portable JSON export/download |
| Privacy deletion | `tests/e2e/account-deletion-live.spec.ts` | dedicated irreversible account, two-step confirmation, local cache cleanup, post-delete credential rejection |
| Responsive Web | Playwright projects | 320×568, 390×844, 834×1194, 1194×834, 1440×900; each in light and dark |

The ten main Web projects use the same Chromium engine with explicit viewport and color-scheme variation so layout/theme regressions are comparable without adding a browser-engine variable. Native Android/iOS remains a separate owner/runtime gate. Shared-account mutations, performance sampling, and irreversible deletion run once in `desktop-light`; read-only visual evidence intentionally uses the full matrix. Production static-export smoke has its own two-project config so build/export behavior is verified without multiplying that heavier gate ten times.

## Release documentation

- Root `README.md` documents Node/npm requirements, clean install, public Supabase configuration, local Supabase initialization/reset, app/test/E2E commands, stable CP9 visual evidence collection, opt-in performance sampling, production static-export smoke and size report, destructive-test safety, Expo exports, architecture invariants, and status pointers.
- `.env.example` documents variable names only. It explicitly distinguishes the persisted-English and persisted-Arabic completed fixtures and keeps mutation, visual-evidence, performance, and destructive modes opt-in.
- `apps/app/README.md` is MIZAN-specific rather than the create-expo-app starter and documents the explicit export scripts plus owner-side Expo Doctor step.
- Documentation is static evidence only until an owner/new-engineer completes a clean-checkout run successfully.

## Still required before CP11 can close

- Run TypeScript, lint, unit/component/integration, database/policy, and Web E2E suites from a trustworthy checkout.
- Execute the responsive read-only matrix without mutation mode; inspect assertion output **and** visible keyboard focus/interaction behavior.
- Run `npm run test:e2e:visual` with the persisted-English and persisted-Arabic completed fixtures, inspect all Today/Life Map/WHY/Check-in attachments, and retain reviewed evidence.
- Run `npm run test:e2e:mutations` only with dedicated/disposable fixtures, including notification preference persistence/restoration.
- Run the prepared destructive deletion journey only with its dedicated disposable account.
- Execute `npm run test:e2e:performance`, inspect its attached measurements and any budget failure.
- Execute `npm run test:e2e:production`, inspect the static-export browser diagnostics/direct-route behavior, retain the emitted Web size report as a baseline, and investigate material bundle/static-asset growth separately from interaction/startup performance.
- Execute Expo diagnostics plus Android/iOS export checks available in the owner environment.
- Investigate blocking startup work or pathological rerenders if runtime measurements or profiling indicate them.
- Validate Arabic RTL and English across representative device classes/light-dark states; screenshots do not replace interaction validation or the deliberate CP9 design-swap proof.
- Perform a clean-checkout setup run using the documented README flow and correct any missing prerequisite/configuration/test/export step.
- Record exact commands, versions, results, failures/fixes, Web size evidence, and owner release actions in `docs/PROJECT_STATE.md` before claiming CP11 complete.

## Policy note

The active worker policy explicitly forbids workers from running product tests, builds, typechecks, database validation scripts, GitHub Actions, or cloud CI. Everything above is implementation/specification readiness only until owner-side execution supplies the required proof.
