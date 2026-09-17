# MIZAN Durable Decisions

## 2026-09-17 — Expo SDK 57 compatibility family
**Decision:** Use the stable Expo SDK 57 compatibility family already scaffolded: React Native 0.86, React 19.2.3, React Native Web 0.21, Node 22.13.x minimum.

**Reason:** Expo's current stable SDK reference explicitly maps SDK 57 to those versions. React Native 0.87 is active independently, but forcing it into Expo SDK 57 would violate Expo's supported version mapping.

**Consequence:** Upgrade within SDK 57-compatible package ranges with `expo install`/Expo diagnostics; do not independently bump React Native across Expo's compatibility boundary.

## 2026-09-17 — Deterministic core before AI
**Decision:** Core state derivation, confidence, ranking, and learning rules remain pure deterministic TypeScript. AI is an optional explanation/conversation adapter.

**Reason:** MIZAN must remain useful offline/provider-less, testable, explainable, and provider-independent.

**Consequence:** Provider outages or missing keys cannot remove the daily loop; secret-backed AI calls live behind a server-side adapter.

## 2026-09-17 — Static first-party plugin registry
**Decision:** Plugins are compile-time typed modules registered in one obvious place.

**Reason:** This proves extensibility without paying the complexity/security cost of runtime plugin loading.

**Consequence:** No marketplace, sandbox, remote executable plugin, or dynamic package manager is part of this mission.
