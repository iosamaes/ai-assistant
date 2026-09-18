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
- A durable recent Today snapshot persists derived Human State plus Balance/Momentum output, without raw reflection notes, provider payloads, or credentials.
- Recent Today snapshots are user-scoped, runtime-validated, expire after seven days, and are discarded when malformed or implausibly future-dated.
- `loadDailySnapshot` falls back only for `unavailable` / `not-configured`; session expiry, authorization, invalid-data, conflict, and unknown failures remain explicit.
- Today now consumes one `DailySnapshot` for current state plus Balance/Momentum, preventing duplicated independent reads from disagreeing about freshness/source.
- Today explicitly labels cached fallback data even when global sync state appears healthy, includes the saved `cachedAt` timestamp, and distinguishes `not-configured` from transient `unavailable` using `degradedBy`.
- Non-executed verification specifications now cover snapshot expiry/corruption, durable queue restart/full-storage behavior, idempotent replay, and integration retry/partial-state behavior in `docs/CP8_RELIABILITY.md`.
- Detailed CP8 implementation ledger: `docs/CP8_RELIABILITY.md`.

## CP8 remaining sub-items
- Review every preserved-vs-unsaved user-facing message so in-memory preservation, durable queued preservation, and failure to persist are never conflated.
- Review whether any realistic concurrent edit requires version/timestamp conflict handling; do not add generic conflict machinery without a concrete entity need.
- Convert the documented reliability scenarios into executable app-level tests when the owner validation/test harness is available; workers must not execute those tests under the current policy.
- Owner validation must exercise cache expiry/corruption, queue restart/full storage, reconnect replay, cached Today presentation, and integration partial-state behavior on Web plus at least one native runtime before CP8 can be marked `DONE`.

## Exact next executable action
1. Audit all CP8 user-visible sync/offline messages and align wording with the actual preservation guarantee (`screen-only`, durable queued, or unsaved).
2. Inspect realistic concurrent-edit surfaces and add version/timestamp handling only where a concrete race exists.
3. Re-review CP8 Definition of Done against current code; leave runtime execution evidence to owner validation.

## Verification record
Previously recorded execution evidence from the owner-side baseline:
- Root typecheck PASS, lint PASS, core tests 3/3 PASS, plugin tests 2/2 PASS, Expo Doctor 21/21 PASS, Android export PASS, iOS export PASS.
- Earlier auth/data-access app typecheck and lint were recorded PASS.

Current worker policy:
- No app tests, builds, typechecks, database scripts, cloud CI, or GitHub Actions were executed for the post-baseline CP2–CP8 work.
- Earlier CP8 commits: `98a987259cfbb5e653477495d2fba49af1a6a3b5` (durable snapshot storage), `54e2e644bff98f5780bbdca3260e322a13446266` (wire Today intelligence reads to cache fallback), `94a637bf0386d1846af401b96363314704432da3` (preserve explicit expired-session handling).
- Current auto2 CP8 commits: `ca363297b0c17487243fd4fa4500d9682ed5a23d` (single-source Today snapshot + visible cached-source/timestamp notice) and `26bbbfcf1f099038b0337968318caf081843f2fb` (non-executed reliability specifications).

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- The recent Today snapshot is intentionally a compact best-effort cache; native SecureStore capacity/behavior still needs owner runtime validation.
- Reliability scenarios are currently documented specifications rather than executed evidence because the active worker policy prohibits workers from running those gates.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `apps/app/src/app/today.tsx`
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
