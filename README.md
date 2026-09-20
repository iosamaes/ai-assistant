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

The root `.env.example` also documents optional Playwright live-account variables. The normal completed account, Arabic completed account, incomplete onboarding account, and destructive deletion account are intentionally separate fixtures because their test lifecycles differ. Mutation and destructive modes stay opt-in.

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

`supabase db reset` recreates the local database from the ordered files in `supabase/migrations/`. Run authorization/security scripts in `supabase/tests/` only against a disposable/local database; several intentionally create test identities inside rollback-only transactions.

The optional `supabase/dev/vertical_slice_fixture.sql` is development data, not production seed data. Apply it only to a disposable/local database when a representative development fixture is needed.

For hosted work, use the project selected by the deployment environment and apply migrations through the normal reviewed Supabase workflow. Never disable RLS or expose a service-role credential to the client to make local setup easier.

## Quality commands

Static/unit quality from the repository root:

```bash
npm run typecheck
npm run lint
npm test
npm run check
```

Web E2E uses Playwright and starts the app on port `8091`:

```bash
npm run test:e2e
```

Live account coverage is enabled only when the matching `MIZAN_E2E_*` environment variables from `.env.example` are present. Mutation journeys require `MIZAN_E2E_MUTATIONS=1` and are deliberately isolated to the `desktop-light` project:

```bash
npm run test:e2e:mutations
```

The destructive deletion journey requires a dedicated disposable account plus `MIZAN_E2E_DESTRUCTIVE=1`:

```bash
npm run test:e2e:delete-account
```

Never point that destructive test at a reusable account. See `docs/CP11_RELEASE_READINESS.md` for the responsive/light-dark matrix and the exact fixture contract.

## Export / build readiness

Expo development commands above do not create signed store binaries. For production export validation, run Expo from the app workspace, for example:

```bash
cd apps/app
npx expo export --platform web
npx expo export --platform android
npx expo export --platform ios
```

Web export should be browser-verified for fatal console/network errors and representative responsive layouts. Android/iOS exports validate the JavaScript/native bundle graph available without owner signing credentials; store-signed artifacts and publication remain owner release operations.

Before release, also run the complete matrix described in `docs/CP11_RELEASE_READINESS.md`, including database/RLS checks, representative Arabic RTL and English layouts, light/dark modes, privacy export/deletion, offline/reconnect behavior, and performance sanity checks.

## Architecture and product rules

- Core intelligence remains deterministic without an AI provider and keeps uncertainty/missing evidence explicit.
- Provider SDKs and payloads stay behind application-owned capability/adaptor boundaries; they do not leak into `packages/core` or feature business logic.
- Supabase user-owned data is protected by ownership/RLS boundaries; client code never receives a service-role secret.
- Arabic uses RTL layout while numeric display remains Western digits (`1234`).
- The presentation layer is intentionally swappable through semantic tokens, shared visual primitives/navigation, and feature composition rather than changes to core algorithms, data contracts, or provider infrastructure.

## Current status

`docs/PROJECT_STATE.md` is the current engineering ledger. It records implemented checkpoints, static evidence, remaining owner/runtime validation, and known release blockers. Do not infer a release PASS from the presence of a test or harness alone; final completion requires the execution evidence and independent review defined in `automation/TASK.md`.
