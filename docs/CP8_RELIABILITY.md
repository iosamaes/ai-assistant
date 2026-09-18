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

## Integration retry / overlap posture

CP7 already normalized external observations with stable provider dedupe keys and upserts on `(user_id, provider_id, external_dedupe_key)`. That protects overlapping windows and provider redelivery from duplicate observations. CP8 still needs an explicit provider retry/reconnect policy around transient read/persist/state failures and clearer partial-sync state recording.

## Verification policy

Workers have not executed app tests, builds, typechecks, or database test scripts because the active task policy reserves execution-dependent gates for owner validation. This slice therefore remains verification-pending.

## Next CP8 slices

1. Add explicit integration transient retry/reconnect behavior without weakening the capability-specific provider boundaries.
2. Add practical recent-state/query persistence so Today and other key surfaces remain meaningful after restart or temporary remote failure.
3. Add code/spec coverage for offline enqueue, restart recovery, idempotent replay, storage-full handling, expired sessions, provider overlap/redelivery, and partial sync; leave execution evidence to the owner.
4. Review user-visible sync state so every preserved-vs-unsaved distinction is explicit and never misleading.
