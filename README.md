# MIZAN

MIZAN is a universal Expo/React Native personal decision-support application for Web, Android, and iOS. It combines a deterministic TypeScript intelligence core, an application-owned plugin/integration boundary, and Supabase-backed authentication/persistence while keeping missing evidence explicit rather than inventing scores.

## Repository layout

- `apps/app` — Expo Router application shared by Web, Android, and iOS.
- `packages/core` — deterministic TypeScript intelligence/domain engine.
- `packages/plugins` — first-party plugin registry and capability modules.
- `supabase/migrations` — backend schema/RLS/function migrations in order.
- `supabase/functions` — Supabase Edge Functions, including account deletion.
- `supabase/tests` — SQL authorization/security specifications for a disposable/local database.
- `supabase/dev` — development-only SQL fixture material.
- `tests/e2e` — Playwright Web journey coverage.
- `docs` — architecture, security, checkpoint, and release-readiness notes.

## Requirements

- Node.js **22.13.0 or newer**.
- npm (the committed `package-lock.json` is authoritative for dependency installation).
- For local backend work: Supabase CLI plus a Docker-compatible local container runtime.
- For native device/simulator work: the normal Expo/Android/iOS platform prerequisites for the target OS.

## Install

From the repository root:

```bash
npm ci
```

Do not commit real credentials. `.env.example` contains public configuration names and optional E2E variable names only.

## Environment

The application reads these public client values:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

For normal Expo development, place the real public values in `apps/app/.env.local` or provide them in the shell that launches Expo. Never place a Supabase service-role key in the app or any `EXPO_PUBLIC_*` variable.

The root `.env.example` also documents optional Playwright live-account variables. The reusable completed-English, completed-Arabic, and incomplete-onboarding accounts are separate read-only release fixtures. Persistent completed-account mutation journeys use another dedicated completed account through `MIZAN_E2E_COMPLETED_MUTATION_EMAIL` / `MIZAN_E2E_COMPLETED_MUTATION_PASSWORD`; onboarding completion uses a different disposable incomplete account through `MIZAN_E2E_ONBOARDING_MUTATION_EMAIL` / `MIZAN_E2E_ONBOARDING_MUTATION_PASSWORD`. This prevents repeated check-ins, feedback learning, plugin/notification preference validation, or onboarding completion from contaminating reusable release-baseline fixtures. Irreversible deletion uses its own dedicated disposable account. Visual-evidence capture, performance sampling, mutations, and destructive deletion remain separately opt-in.

## Run the app

From the repository root:

```bash
npm start
```

The app workspace uses Expo on port `8087`. Platform shortcuts are:

```bash
npm run web
npm run android
npm run ios
```

The same application source is used for all three targets.

## Local Supabase

The repository owns the migrations, SQL tests, Edge Function source, and development fixture under `supabase/`. A generated local Supabase CLI config is intentionally environment-specific and is not currently committed, so initialize it once in a local checkout before starting the local stack:

```bash
supabase init
supabase start
supabase db reset
```

`supabase db reset` recreates the local database from the ordered files in `supabase/migrations/`. With the local stack running, execute the repository's pgTAP/RLS/security suite and schema lint from the repository root with:

```bash
npm run test:db
npm run lint:db
```

`test:db` maps to `supabase test db --local`, so the SQL suite targets the local Supabase database rather than the hosted project. `lint:db` maps to `supabase db lint --local --level warning --fail-on error`: it reports warning-level findings while failing the command only for error-level schema/function findings. Run authorization/security scripts in `supabase/tests/` only against a disposable/local database; several intentionally create test identities inside rollback-only transactions.

The optional `supabase/dev/vertical_slice_fixture.sql` is development data, not production seed data. Apply it only to a disposable/local database when a representative development fixture is needed.

For hosted work, use the project selected by the deployment environment and apply migrations through the normal reviewed Supabase workflow. Never disable RLS or expose a service-role credential to the client to make local setup easier.

## Quality commands

Static/unit and local-database quality from the repository root:

```bash
npm run typecheck
npm run lint
npm test
npm run check
npm run test:db   # requires the local Supabase stack
npm run lint:db   # requires the local Supabase stack
```

After `supabase db reset` has completed successfully on the local disposable stack, the owner can run the non-destructive CP11 baseline in one fail-fast command:

```bash
npm run check:release:baseline
```

Before running that aggregate baseline, configure the **read-only release fixtures** from `.env.example`: the public `MIZAN_E2E_SUPABASE_*` values, the completed English account, the completed Arabic account, and the reusable incomplete onboarding account. The runner fails immediately when any of those variables are missing so required authenticated/RTL/onboarding suites cannot silently skip and still produce a misleading green baseline. The dedicated mutation accounts are intentionally not required by this non-destructive baseline.

That command chains the workspace typecheck/lint/unit suite, local database tests and lint, the normal Web E2E matrix, and the production static-Web smoke/size path. It intentionally does **not** opt into live mutations, CP9 screenshot capture, performance probes, irreversible account deletion, Expo Doctor, or Android/iOS exports; those remain explicit follow-up gates so an aggregate command cannot accidentally mutate or delete a fixture.

Web E2E uses Playwright and starts the app on port `8091`:

```bash
npm run test:e2e
```

Live account coverage is enabled only when the matching `MIZAN_E2E_*` environment variables from `.env.example` are present. The explicit mutation command is fail-closed: it enables `MIZAN_E2E_MUTATIONS=1` itself, requires the public Supabase values, the three reusable role-email identifiers (`MIZAN_E2E_COMPLETED_EMAIL`, `MIZAN_E2E_ARABIC_EMAIL`, `MIZAN_E2E_ONBOARDING_EMAIL`) for collision checking, a dedicated completed-mutation account, and a separate disposable onboarding-mutation account. It rejects protected reusable/deletion fixture reuse, rejects reuse of the same email for both mutation roles, and then runs the mutation journeys once in `desktop-light`:

```bash
npm run test:e2e:mutations
```

Do not point `MIZAN_E2E_COMPLETED_MUTATION_EMAIL` at the reusable `MIZAN_E2E_COMPLETED_EMAIL` account, and do not point `MIZAN_E2E_ONBOARDING_MUTATION_EMAIL` at the reusable `MIZAN_E2E_ONBOARDING_EMAIL` account. Daily-loop/feedback journeys persist data, while onboarding completion permanently changes an account from incomplete to complete. The two mutation fixtures are therefore intentionally separate from each other and from reusable release evidence. The reusable-role email identifiers are required by the mutation runner even when their passwords are not needed by the mutation journeys, because a fail-closed separation check cannot prove non-reuse if those identities are absent.

CP9 visual-evidence capture is read-only and separately opt-in. Configure the normal completed account with a persisted English MIZAN locale and the separate completed Arabic-profile account, set `MIZAN_E2E_VISUAL_EVIDENCE=1`, then run:

```bash
npm run test:e2e:visual
```

That command captures Today, Life Map, WHY, and Check-in for English and persisted-Arabic accounts across every configured phone/tablet/desktop and light/dark Playwright project. Before each screenshot, the harness waits for the intended localized surface, waits for its loading state to settle where applicable, rejects known load-error states, and waits for browser fonts so mislabeled or half-loaded captures cannot silently count as evidence. Screenshots are attached to the Playwright test output; their presence is evidence only after the run actually succeeds.

CP11 also has an opt-in, read-only Web performance sanity sample. With the persisted-English completed account configured, set `MIZAN_E2E_PERFORMANCE=1` and run:

```bash
npm run test:e2e:performance
```

The sample runs once in `desktop-light`, records authenticated Home readiness plus primary-shell route transition durations, captures resource-timing and browser long-task data, and attaches `performance-sanity.json` to the Playwright result. Its broad timing ceilings are regression tripwires rather than product SLOs. This command uses the controlled E2E Expo runtime; the production static export has a separate performance probe described below so the two results can be compared rather than conflated.

The destructive deletion journey requires a dedicated disposable account plus `MIZAN_E2E_DESTRUCTIVE=1`:

```bash
npm run test:e2e:delete-account
```

Never point that destructive test at a reusable account or either mutation-validation account. The public runner requires the configured email identity for every protected reusable/mutation fixture before it will enter Playwright, then refuses the deletion email if it matches any of those roles. This makes fixture-separation proof fail closed instead of treating missing protected identities as evidence of uniqueness. See `docs/CP11_RELEASE_READINESS.md` for the responsive/light-dark matrix and the exact fixture contract.

## Export / build readiness

Expo development commands above do not create signed store binaries. Production export validation is exposed from the repository root so clean-checkout instructions do not depend on changing directories:

```bash
npm run export:web
npm run export:android
npm run export:ios
```

These map directly to `expo export --platform web|android|ios` in the app workspace. For Expo compatibility diagnostics, run `npx expo-doctor` from `apps/app` during owner validation.

After a Web export exists, `npm run report:web-size` inspects `apps/app/dist` without adding another dependency. It reports total static bytes, JavaScript and CSS raw/gzip totals, aggregate gzip size for compressible assets, and the 15 largest exported files. Record that output during release validation so an obvious bundle/static-asset regression is visible rather than relying on visual smoke alone.

A separate production-Web smoke command first creates the static Web export, prints the same production size report, serves `apps/app/dist` through the repository-owned dependency-free static server, then runs representative phone-light and desktop-dark Playwright checks against the exported files rather than the Expo development server:

```bash
npm run test:e2e:production
```

The signed-out production smoke runs without live credentials; when the normal `MIZAN_E2E_SUPABASE_*` plus persisted-English completed-account credentials are present, the same command also verifies authenticated direct-route hydration and primary-shell navigation from the static export. It checks shared browser page/console/network/5xx diagnostics and horizontal overflow. This harness must still be executed and its output inspected before it counts as release evidence.

With the same persisted-English completed fixture and `MIZAN_E2E_PERFORMANCE=1`, CP11 can also measure the actual served static export instead of the Expo development runtime:

```bash
npm run test:e2e:production:performance
```

This command rebuilds/reports/serves `apps/app/dist` through the production Playwright configuration, runs once in the production desktop project, measures authenticated Home readiness and primary-shell route transitions, captures production resource timing and browser long tasks, and attaches `production-performance-sanity.json`. The broad timing limits are regression tripwires rather than product SLOs. Retain this report alongside the Web size report and compare it with `performance-sanity.json`; investigate material differences or pathological main-thread work before release.

The Web export should also be inspected for representative responsive layouts and production interaction/startup performance. The size and timing reports are measurement evidence, not proof that an individual chunk is optimally split or that every device class is fast; investigate material regressions against the reviewed release baseline. Android/iOS exports validate the JavaScript/native bundle graph available without owner signing credentials; store-signed artifacts and publication remain owner release operations.

Before release, also run the complete matrix described in `docs/CP11_RELEASE_READINESS.md`, including database/RLS checks, representative Arabic RTL and English layouts, light/dark modes, privacy export/deletion, offline/reconnect behavior, and both controlled-runtime and production-export performance sanity checks.

## Architecture and product rules

- Core intelligence remains deterministic without an AI provider and keeps uncertainty/missing evidence explicit.
- Provider SDKs and payloads stay behind application-owned capability/adaptor boundaries; they do not leak into `packages/core` or feature business logic.
- Supabase user-owned data is protected by ownership/RLS boundaries; client code never receives a service-role secret.
- Arabic uses RTL layout while numeric display remains Western digits (`1234`).
- The presentation layer is intentionally swappable through semantic tokens, shared visual primitives/navigation, and feature composition rather than changes to core algorithms, data contracts, or provider infrastructure.

## Current status

`docs/PROJECT_STATE.md` is the current engineering ledger. It records implemented checkpoints, static evidence, remaining owner/runtime validation, and known release blockers. Do not infer a release PASS from the presence of a test or harness alone; final completion requires the execution evidence and independent review defined in `automation/TASK.md`.
