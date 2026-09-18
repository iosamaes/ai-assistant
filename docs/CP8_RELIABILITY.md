# CP8 Reliability / Offline Sync Progress

Status: implementation in progress; owner validation pending.

## Durable user-write retry slice

- Check-ins and Invisible Wins now carry stable client mutation IDs before the first network attempt.
- Migration `0008_offline_mutation_idempotency.sql` adds server-side uniqueness for those IDs so an ambiguous network failure can be retried without duplicating user data.
- The migration is applied to Supabase project `olfhjnropdrnujgpidfi` as `offline_mutation_idempotency`.
- Pending user mutations are stored in fixed durable per-user slots: SecureStore on native and localStorage on web. Each queued item is independent, so a successful retry removes only that item rather than rewriting the whole queue.
- The queue is bounded. If durable storage is unavailable or full, the UI keeps the unsaved user input instead of claiming success.
- Retry is serialized per user and runs when a usable authenticated session appears, before later check-in/reflection writes, and when the Invisible Wins view loads.
- Retried check-ins use `(user_id, client_mutation_id, metric)` idempotency. Retried reflections use `(user_id, client_mutation_id)` idempotency.
- Invisible Wins explicitly tells the user when a reflection is preserved locally for later sync and can render queued reflections even while the remote read is unavailable.
- `supabase/tests/offline_mutation_idempotency.sql` specifies duplicate-safe replay for both multi-metric check-ins and reflections; it has not been executed by workers.

## Integration retry / overlap posture

- CP7 normalized external observations already use stable provider dedupe keys and upserts on `(user_id, provider_id, external_dedupe_key)`, protecting overlapping windows and provider redelivery from duplicate observations.
- Health-provider reads now retry exactly once only for the transient `unavailable` failure class. Permission, validation, and other non-transient failures are not blindly retried.
- Sync failures are recorded as safe normalized lifecycle error codes on the existing integration connection instead of persisting raw provider error text.
- Successful reconnect/sync returns the connection to `connected`, clears the last error, and advances `lastSyncedAt`.
- Observation persistence remains idempotent and batch-oriented; if the later lifecycle-state write fails, the sync call reports failure rather than falsely claiming a complete sync.

## Recent Today-state persistence

- Today now has a user-scoped durable snapshot cache containing only derived Human State and Balance/Momentum output, not raw reflection notes, provider payloads, or credentials.
- Native storage uses SecureStore; Web uses localStorage. Storage failure never turns a successful live read into a false application failure.
- Snapshots expire after seven days and are rejected when malformed or implausibly future-dated.
- A live Today read refreshes the snapshot. When Supabase reads fail as `unavailable`, `not-configured`, or `session-expired`, the existing `loadCurrentHumanState` and `loadDailyOverview` paths can fall back to the most recent valid snapshot after restart instead of collapsing to an empty screen.
- Cached payloads are runtime-validated before use. Authorization/validation/conflict/unknown failures do not fall back to cache.
- The current global sync state already distinguishes ordinary offline application state. A later CP8 slice still needs a Today-specific visible stale-cache timestamp/source so a mid-session remote failure cannot be mistaken for freshly loaded data.

## Verification policy

Workers have not executed app tests, builds, typechecks, or database test scripts because the active task policy reserves execution-dependent gates for owner validation. This slice therefore remains verification-pending.

## Next CP8 slices

1. Add code/spec coverage for durable snapshot expiry/corruption plus offline enqueue/restart recovery/storage-full behavior and integration retry/partial-state behavior; leave execution evidence to the owner.
2. Make Today explicitly label cached/stale data with its saved timestamp when fallback occurs, including the mid-session failure case where global sync state may still look healthy.
3. Review user-visible sync state so every preserved-vs-unsaved distinction is explicit and never misleading.
4. After the above, independently review CP8 Definition of Done before proposing checkpoint completion.
