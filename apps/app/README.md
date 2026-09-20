# MIZAN application workspace

This directory contains the shared Expo Router application for MIZAN Web, Android, and iOS. It is part of the root npm workspace; install dependencies and run normal project commands from the repository root unless a command explicitly says otherwise.

## Start

From the repository root:

```bash
npm ci
npm start
```

Platform shortcuts:

```bash
npm run web
npm run android
npm run ios
```

The app development server uses port `8087`. Playwright uses the workspace-only `web:e2e` command on port `8091` through the root E2E scripts.

## Public configuration

The application reads:

```text
EXPO_PUBLIC_SUPABASE_URL
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

For local Expo development, supply those public values in the launching shell or `apps/app/.env.local`. Never place a Supabase service-role secret in this workspace or in any `EXPO_PUBLIC_*` variable.

## Workspace quality commands

These scripts exist in this package:

```bash
npm run typecheck
npm run lint
npm test
npm run test:watch
```

The root project also provides aggregate workspace checks and the Playwright release matrix. See the root `README.md` and `docs/CP11_RELEASE_READINESS.md` before release validation.

## Export validation

From this directory, Expo export checks can be run with:

```bash
npx expo export --platform web
npx expo export --platform android
npx expo export --platform ios
```

These commands validate exportability; they are not a replacement for signed store builds, native device validation, or the complete CP11 release gate.

## Source layout

- `src/app` — Expo Router routes/screens.
- `src/application` — application orchestration and product use cases.
- `src/components` — shared presentation primitives/navigation.
- `src/infrastructure` — Supabase, offline persistence, and provider boundaries.
- `src/state` — application/session state.
- `__tests__` — app-level unit/component/source-policy regression specifications.

The deterministic decision engine and plugin contracts live in root `packages/`, not in screen components. Product data/backend schema lives under root `supabase/`.

For complete setup, local Supabase instructions, E2E fixture safety, architecture rules, and current project status, use the root `README.md` and `docs/PROJECT_STATE.md`.
