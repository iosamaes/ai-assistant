# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP8 — Reliability, offline tolerance, and sync behavior** (`IN_PROGRESS`).
- CP1 is `BLOCKED_HUMAN` only for owner-side responsive/locale evidence.
- CP2 through CP7 have implementation slices on `main` but remain checkpoint-verification pending under the current worker policy.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `db05d2d78fc71edb1b71880d9e74535318fa6f4a`.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation — owner validation pending
- [ ] CP2 — Supabase, auth, ownership, persistence — owner validation pending
- [ ] CP3 — Deterministic intelligence core — implementation present, validation pending
- [ ] CP4 — First complete daily loop — implementation present, validation pending
- [ ] CP5 — Insight, explanation, personal learning — implementation present, validation pending
- [ ] CP6 — Advanced decision tools — implementation present, validation pending
- [ ] CP7 — Plugins and provider boundaries — implementation present, validation pending
- [ ] CP8 — Reliability, offline tolerance, sync — **IN_PROGRESS**
- [ ] CP9 — Responsive UX, accessibility, localization, polish
- [ ] CP10 — Security, privacy, owner-data control
- [ ] CP11 — Test matrix, performance, release readiness
- [ ] CP12 — Independent final review and handoff

## CP8 completed implementation sub-items
- Durable user-write retry exists for check-ins and Invisible Wins using per-user SecureStore slots on native and localStorage on Web.
- Check-in/reflection mutations carry stable client mutation IDs and migration `0008_offline_mutation_idempotency.sql` adds duplicate-safe server uniqueness.
- Retry is serialized per user; successful replay removes only the successful queued item.
- Integration observation ingestion is idempotent by provider dedupe key; transient provider reads use bounded retry and lifecycle failures persist only safe normalized error codes.
- A durable recent Today snapshot now persists derived Human State plus Balance/Momentum output, without raw reflection notes, provider payloads, or credentials.
- Recent Today snapshots are user-scoped, runtime-validated, expire after seven days, and are discarded when malformed or implausibly future-dated.
- Existing `loadCurrentHumanState` and `loadDailyOverview` paths now use the recent snapshot when live reads fail as `unavailable` or `not-configured`, allowing Today to remain meaningful across restart/temporary remote failure when a valid cache exists.
- `session-expired` deliberately remains an explicit error path so the existing Today session-refresh behavior is not hidden by cached data.
- Authorization, invalid-data, conflict, and unknown failures do not fall back to cached state.
- Detailed CP8 implementation ledger: `docs/CP8_RELIABILITY.md`.

## CP8 remaining sub-items
- Add code/spec coverage for snapshot expiry/corruption, queue restart recovery/storage-full behavior, and integration retry/partial-state behavior. Workers must not execute those tests under the current policy.
- Make Today explicitly show when it is rendering cached data and the snapshot timestamp, including a mid-session remote failure where global sync state may still appear healthy.
- Review all preserved-vs-unsaved user-visible states for precise wording.
- Review whether any realistic concurrent edit requires version/timestamp conflict handling; do not add generic conflict machinery without a concrete entity need.
- Owner validation must verify reload/restart behavior on Web and at least one native development runtime before CP8 can be marked `DONE`.

## Exact next executable action
1. Add a Today-specific cache freshness/source presentation path using the existing `DailySnapshot.source`, `cachedAt`, and `degradedBy` metadata; do not invent a second cache.
2. Add non-executed specifications for cache expiry/corruption and durable queue recovery/storage-full behavior.
3. Re-review CP8 Definition of Done against current code, then leave runtime execution evidence to owner validation.

## Verification record
Previously recorded execution evidence from the owner-side baseline:
- Root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access app typecheck and lint were recorded PASS.

Current worker policy:
- No app tests, builds, typechecks, database scripts, cloud CI, or GitHub Actions were executed for the post-baseline CP2–CP8 work.
- CP8 product commits from this run: `98a987259cfbb5e653477495d2fba49af1a6a3b5` (durable snapshot storage), `54e2e644bff98f5780bbdca3260e322a13446266` (wire Today intelligence reads to cache fallback), and `94a637bf0386d1846af401b96363314704432da3` (preserve explicit expired-session handling).
- Latest CP8 documentation correction before this ledger update: `da9123ead785bef746b22b989db7cf6df071171b`.

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- The recent Today snapshot is intentionally a compact best-effort cache; native SecureStore capacity/behavior still needs owner runtime validation.
- Until the next CP8 UI slice, a mid-session remote read may use valid cached Today data without a Today-specific saved-at label, even though ordinary app-level offline state is already represented globally.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `apps/app/src/infrastructure/offline/pending-mutations.ts`
- `apps/app/src/infrastructure/offline/recent-daily-snapshot.ts`
- `apps/app/src/application/offline-sync.ts`
- `apps/app/src/application/daily-intelligence.ts`
- `apps/app/src/application/check-in.ts`
- `apps/app/src/infrastructure/supabase/reflections.ts`
- `apps/app/src/application/integrations.ts`
- `apps/app/src/infrastructure/supabase/integrations.ts`
- `supabase/migrations/0008_offline_mutation_idempotency.sql`
- `supabase/tests/offline_mutation_idempotency.sql`
- `automation/HUMAN_REQUIRED.md`
