# CP8 Reliability / Offline Sync Progress

Status: implementation review complete; owner validation pending.

## Durable user-write retry slice

- Check-ins and Invisible Wins now carry stable client mutation IDs before the first network attempt.
- Migration `0008_offline_mutation_idempotency.sql` adds server-side uniqueness for those IDs so an ambiguous network failure can be retried without duplicating user data.
- The migration is applied to Supabase project `olfhjnropdrnujgpidfi` as `offline_mutation_idempotency`.
- Pending user mutations are stored in fixed durable per-user slots: SecureStore on native and localStorage on web. Each queued item is independent, so a successful retry removes only that item rather than rewriting the whole queue.
- The queue is bounded. If durable storage is unavailable or full, the UI keeps the unsaved user input instead of claiming success.
- Retry is serialized per user and runs when a usable authenticated session appears, before later check-in/reflection writes, and when the Invisible Wins view loads.
- Retried check-ins use `(user_id, client_mutation_id, metric)` idempotency. Retried reflections use `(user_id, client_mutation_id)` idempotency.
- Invisible Wins explicitly tells the user when a reflection is preserved locally for later sync and can render queued reflections even while the remote read is unavailable.
- Queued check-ins now remain on the check-in screen with an explicit Arabic/English message that the entry is durably stored on this device for later sync; only a confirmed server save navigates directly to Today.
- `supabase/tests/offline_mutation_idempotency.sql` specifies duplicate-safe replay for both multi-metric check-ins and reflections; it has not been executed by workers.

## User-visible preservation wording audit

The CP8 wording audit distinguishes three guarantees rather than using generic “saved” language:

- **Durably queued on device:** queued check-ins and queued Invisible Wins explicitly say they are stored on this device and will be retried when connectivity returns.
- **Screen/session only:** profile/onboarding preference sync messages explicitly say the latest unsaved change remains visible in the current session. Those preference writes do not claim a durable offline queue.
- **Not preserved for later sync:** One Move decisions, explicit action feedback, experiment lifecycle changes, Life Season changes, and integration disconnects currently have no durable offline mutation queue. Their failure paths do not claim later synchronization; the interactive screen state/draft remains available for a manual retry where applicable.
- **Cached read, not a saved write:** Today’s cache notice explicitly identifies a saved snapshot, includes its timestamp, and distinguishes transient live-data unavailability from an unconfigured live source.
- Queue-storage failure remains a failure: when SecureStore/localStorage cannot preserve a check-in/reflection mutation, application code does not return a queued success and the user input remains available for retry instead of being described as durable.

## Integration retry / overlap posture

- CP7 normalized external observations already use stable provider dedupe keys and upserts on `(user_id, provider_id, external_dedupe_key)`, protecting overlapping windows and provider redelivery from duplicate observations.
- Health-provider reads now retry exactly once only for the transient `unavailable` failure class. Permission, validation, and other non-transient failures are not blindly retried.
- Sync failures are recorded as safe normalized lifecycle error codes on the existing integration connection instead of persisting raw provider error text.
- Successful reconnect/sync returns the connection to `connected`, clears the last error, and advances `lastSyncedAt`.
- Observation persistence remains idempotent and batch-oriented; if the later lifecycle-state write fails, the sync call reports failure rather than falsely claiming a complete sync.

## Recent Today-state persistence

- Today has a user-scoped durable snapshot cache containing only derived Human State and Balance/Momentum output, not raw reflection notes, provider payloads, or credentials.
- Native storage uses SecureStore; Web uses localStorage. Storage failure never turns a successful live read into a false application failure.
- Snapshots expire after seven days and are rejected when malformed or implausibly future-dated.
- A live Today read refreshes the snapshot. When Supabase reads fail as `unavailable` or `not-configured`, `loadDailySnapshot` can fall back to the most recent valid snapshot after restart instead of collapsing to an empty screen.
- `session-expired` deliberately does not fall back, so Today keeps explicit session-refresh/error handling instead of hiding an expired credential behind cached data.
- Cached payloads are runtime-validated before use. Authorization/validation/conflict/unknown failures do not fall back to cache.
- Today now consumes a single `DailySnapshot` for current state plus Balance/Momentum, avoiding two independent reads that could disagree about source/freshness.
- When `DailySnapshot.source === 'cache'`, Today displays an explicit saved-snapshot notice even if the global sync indicator still appears healthy. The notice includes the `cachedAt` timestamp and distinguishes `not-configured` from transient `unavailable` via `degradedBy`.

## Concurrent-edit review

CP8 intentionally does **not** introduce a generic conflict/version engine. The actual mutable entities were reviewed by invariant and user harm:

- Check-ins and Invisible Wins are append-only user evidence with client mutation idempotency, so there is no same-record edit race to resolve.
- Normalized integration observations are provider-keyed idempotent upserts; overlap/redelivery is handled by dedupe rather than optimistic record editing.
- Experiment terminal lifecycle is a real concurrent-edit surface: two devices can try to cancel/complete the same active experiment. Lifecycle updates now include `status = 'active'` in the write predicate and use `maybeSingle`; a stale second terminal mutation returns `conflict` instead of overwriting the already-finished state.
- Life Season transitions are executed by one database RPC transaction, and `life_season_history_one_active_per_user_idx` enforces at most one active season. A concurrent transition cannot silently produce two active seasons; adding a general version column would not improve the current invariant enough to justify the extra machinery.
- Profile, locale, enabled-domain, and onboarding preference writes are serialized inside one running client. Cross-device last-write-wins remains acceptable for these low-risk preference snapshots because they do not carry irreversible financial/medical actions or append-only evidence; no generic conflict UI is added.
- One Move choices and feedback are append-style events/outcomes, so duplicate prevention/ownership is the relevant reliability concern rather than mutable-row versioning.

## Non-executed reliability specifications

These scenarios are the required owner/test-harness assertions for the next verification pass. Workers have not executed them.

### Snapshot expiry / corruption

1. A persisted snapshot exactly within the seven-day freshness window is returned with the original `cachedAt` and payload.
2. A snapshot older than seven days is discarded and the storage slot is cleared.
3. Invalid JSON is discarded and cleared instead of propagating an exception or fabricated state.
4. A record with the wrong version, missing `cachedAt`, or missing payload is discarded and cleared.
5. A non-date `cachedAt` is discarded and cleared.
6. A snapshot timestamp more than 60 seconds in the future is discarded and cleared.
7. Storage read/delete failure returns `storage-unavailable` without converting malformed data into a valid snapshot.
8. A live successful `loadDailySnapshot` remains successful even if writing the refreshed cache fails.
9. `unavailable` and `not-configured` may use a valid cached snapshot; `session-expired`, `unauthorized`, `invalid`, `conflict`, and `unknown` must not.
10. A cached Today render must expose `source='cache'`, the original `cachedAt`, and the triggering `degradedBy` value; a live render must expose `source='live'` with null cache metadata.

### Durable queue restart / storage-full behavior

1. Enqueueing a check-in/reflection writes an independent per-user slot with the stable mutation ID unchanged across retry.
2. Re-reading after process/module restart reconstructs all valid slots and sorts them by `createdAt`.
3. Re-enqueueing the same mutation ID replaces its slot rather than consuming another slot.
4. Removing one successful replay clears only that mutation; unrelated queued writes remain durable.
5. Corrupt JSON or a slot belonging to a different user is ignored and never replayed under the current user.
6. When all 16 slots contain valid distinct mutations, enqueue returns `queue-full` and no existing slot is overwritten.
7. SecureStore/localStorage read or write failure returns `storage-unavailable`; UI/application code must keep the user's unsaved input visible and must not claim durable preservation.
8. After reconnect, serialized replay sends each mutation through the existing idempotent server path and removes only confirmed successes.
9. An ambiguous retry must preserve the original client mutation ID so server uniqueness prevents duplication.
10. A queued check-in must display the durable-on-device message and must not be presented as a confirmed live/server save.

### Integration retry / partial state

1. A transient provider read classified `unavailable` is retried once and only once.
2. Permission, invalid-data, not-configured, and other non-transient failures are not blindly retried.
3. Re-delivered provider observations with the same dedupe key do not create duplicate rows.
4. If observations persist but the later connection-lifecycle update fails, the sync result reports failure rather than a false complete success.
5. A later successful sync returns the connection to `connected`, clears the normalized error code, and advances `lastSyncedAt` without storing raw provider error payloads.

### Concurrent experiment lifecycle

1. Two clients loading the same active experiment may race to finish/cancel it; only the first terminal transition may update the row.
2. A later stale terminal mutation must return `conflict` because the row no longer satisfies `status = 'active'`.
3. A stale terminal request must not overwrite `completed` with `cancelled` or vice versa.

## Verification policy

Workers have not executed app tests, builds, typechecks, database scripts, cloud CI, or GitHub Actions because the active task policy reserves execution-dependent gates for owner validation. The specifications above are recorded requirements, not claimed passing evidence.

## Next CP8 slices

1. Owner validation: exercise snapshot expiry/corruption, queue restart/full-storage, reconnect replay, queued check-in wording/presentation, Today cached-source presentation, integration partial-state behavior, and the concurrent experiment terminal-state guard on Web plus at least one native development runtime.
2. Re-review the CP8 gate against that execution evidence before moving CP8 to `DONE`.
