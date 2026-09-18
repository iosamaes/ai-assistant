# MIZAN Integration Architecture

This note records the CP7 external-capability boundary required by `automation/TASK.md` section 6.1. It is deliberately small: MIZAN shares lifecycle/provenance rules across integrations, while each capability keeps its own typed contract.

## Boundary

Feature and core code must not import vendor SDKs or vendor payload types.

```text
Feature/application logic
        |
        v
Capability contract
(TimeContextProvider / HealthDataProvider / LocationContextProvider)
        |
        v
Provider adapter
        |
        v
Vendor/platform SDK or server boundary when one is actually configured
```

`packages/core` consumes canonical MIZAN evidence and observations only. Provider identity, OAuth, SDK types, secrets, and raw payloads stay outside the core.

## Shared lifecycle, not a God API

`public.integration_connections` stores only vendor-neutral lifecycle state: capability, provider id, connected/configured/disabled/error state, granted scopes, consent timestamp, last sync, safe error code, disconnect timestamp, and non-secret metadata. It must never contain provider tokens or private API keys.

There is intentionally no `doAnything(provider,type,payload)` interface and no universal provider switch. Current focused contracts live in `apps/app/src/integrations/contracts.ts`:

- `TimeContextProvider`
- `HealthDataProvider`
- `LocationContextProvider`

A genuinely new capability gets one new focused contract rather than widening an unrelated interface.

## Normalization and provenance

Vendor adapters must normalize data before persistence/core use. `NormalizedExternalObservation` carries metric, normalized value/unit, observed time, provider id, external item id when available, stable dedupe key, and optional evidence quality.

Migration `0007_integration_architecture.sql` adds matching provenance fields to `observations` plus idempotency indexes. `upsertNormalizedExternalObservations` persists normalized observations with `source='integration'`; raw provider payloads are not stored by default.

## Provider-swap proof

`Cost of Yes` now has two application paths:

- explicit user-entered context through `assessExplicitCostOfYes`;
- provider-backed context through `assessCostOfYesWithTimeContext`.

The provider-backed function depends only on `TimeContextProvider`. `apps/app/src/integrations/provider-registry.ts` can return `deterministic-primary`, `deterministic-alternate`, or `unavailable` implementations of the same contract. Swapping between those implementations requires no edit to `packages/core`, the Cost of Yes scoring function, or feature-screen business rules. A future Google/Apple/calendar adapter should satisfy the same contract and be registered in the time-context registry.

No production calendar provider is configured in this repository yet, so the proof intentionally uses deterministic alternate adapters rather than inventing credentials or a fake production connection.

## New-capability proof

`HealthDataProvider` was introduced separately from time context, then wired to `syncHealthData`, normalization, provenance/idempotent persistence, and lifecycle state. This did not require widening `TimeContextProvider`, editing Cost of Yes logic, or adding provider conditionals to `packages/core`.

`LocationContextProvider` is a second focused contract whose output is intentionally approximate semantic context (`home`, `work`, `travel`, `other`, `unknown`) rather than raw continuous coordinates. No location collection runs until a future explicit feature and permission flow selects an adapter.

## Plugins vs providers

Plugins define product meaning: dimensions, actions, and optional data requirements. Providers supply capabilities. A plugin can declare that it benefits from `health_data` or `time_context`, but it must not know Garmin, Apple, Google, Fitbit, Oura, or any other vendor payload.

`packages/plugins/src/registry.ts` resolves enabled/disabled/degraded/unavailable plugin state from capability availability and scopes. Optional provider absence degrades a plugin rather than crashing it; required missing data can make a plugin unavailable. Disabled plugins contribute no dimensions/actions.

## Adding a provider for an existing capability

1. Implement the existing capability contract at an infrastructure/server boundary.
2. Normalize vendor payloads inside that adapter.
3. Register the adapter in that capability's small registry/configuration point.
4. Persist lifecycle/provenance through the existing application/infrastructure functions.
5. Add provider-specific secret/OAuth handling server-side when required.
6. Add tests/specifications for permission failure, unavailable provider, normalization, idempotency, disconnect/revoke, and fallback behavior.

Do not edit `packages/core` or feature business rules merely because the vendor changed.

## Adding a new capability

1. Confirm a real product feature needs it.
2. Add one focused typed capability contract.
3. Add the minimum lifecycle scopes/state needed for it using the existing shared lifecycle model.
4. Implement adapter(s) and normalization/application orchestration.
5. Let plugins/features depend on the capability contract, not the vendor.

Do not create a generic integration platform, service locator, runtime plugin marketplace, or dependency-injection framework.

## Security and privacy

- Private API keys, refresh tokens, privileged OAuth exchanges, and provider webhooks belong on a server-side boundary such as Supabase Edge Functions when required.
- Request only scopes needed by the enabled feature.
- Disconnect/revoke updates lifecycle state; CP10 owns full privacy/export/delete verification for imported account data.
- Location uses the least precise context that satisfies the feature; continuous precise tracking is not part of the current architecture.
- AI providers, when later added, must return validated structured output before influencing product behavior. Free-form model prose cannot become unvalidated core state.
