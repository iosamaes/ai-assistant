# CP10 Security, Privacy, and Owner-Data Control

Status: implementation in progress. This document records the current code/data boundary and the security/privacy work completed so far. Execution-dependent authorization/export/delete validation remains reserved for owner validation under the active task policy.

## Assets and trust boundaries

MIZAN currently stores personal life state, observations, action/feedback history, preferences, reflections, experiments, life-season history, and vendor-neutral integration lifecycle metadata. Authentication is owned by Supabase Auth. External-provider credentials are not stored in `public.integration_connections`; that table is metadata/state only.

The main security boundaries are:

- anonymous vs authenticated access;
- one authenticated user vs another authenticated user;
- client code vs Supabase database policy enforcement;
- client code vs server-only elevated operations;
- MIZAN-owned data vs original data held by an external provider.

Client filtering is never treated as an authorization boundary.

## Live Supabase audit — 2026-09-19

The authoritative project is `olfhjnropdrnujgpidfi`.

A live schema audit found ten current public client-visible tables:

- `profiles`
- `domain_preferences`
- `observations`
- `action_events`
- `feedback_outcomes`
- `plugin_settings`
- `reflections`
- `experiments`
- `life_season_history`
- `integration_connections`

All ten have RLS enabled and four CRUD policies. Every current user-owned table has a `user_id` foreign key to `auth.users(id) ON DELETE CASCADE`. `feedback_outcomes.action_event_id` also cascades to its parent action event. There are currently no Storage buckets.

`supabase/tests/rls_cross_user.sql` was expanded in CP10 so its rollback-only fixtures cover all ten current user-owned tables, assert cross-user read isolation across each table, reject representative cross-user writes, and preserve own-user writes. The test was updated but not executed by the worker because the active task policy reserves product/database test execution for owner validation.

## Function privileges and Life Season account fencing

The live audit originally found that Supabase default function ACLs had left anonymous execute permission on `set_life_season`, even though the RPC rejected a null `auth.uid()`. The trigger helper `set_updated_at` was also directly executable by client roles despite not being a client API. Migration `0009_function_execute_hardening.sql` removed those unnecessary grants.

A later account-switch review found a separate race: the Life Season screen fenced stale results in the client, but the atomic RPC itself derived only the session's current `auth.uid()`. If the authenticated session changed after the screen captured user A but before the request executed, user A's season/target payload could be applied to newly-active user B. The database now receives the user identity the client intended to mutate and rejects the transition when it differs from `auth.uid()`.

Migrations `0011_life_season_expected_user_guard.sql` and `0012_life_season_execute_hardening.sql` are committed and applied. The app threads `requestedUserId` through the application/infrastructure boundary into `p_expected_user_id`. The live RPC is now:

- `set_life_season(text, jsonb, uuid)`, `SECURITY INVOKER`, with an empty `search_path` inherited from the function body;
- guarded by `p_expected_user_id = auth.uid()` before any profile, target, or history mutation;
- executable by `authenticated`, `service_role`, and the database owner only;
- not executable by `anon` or public clients.

The post-migration live ACL read confirmed `authenticated_execute=true` and `anon_execute=false`. `supabase/tests/life_season_history.sql` now specifies both the expected-user rejection and anonymous execute denial in addition to its existing RLS/atomic-transition checks. The specification was updated but not run by the worker under the active validation policy.

Implementation commits: `77c965caacc1015feff66dd681d7532b0c26af39`, `db022a8c38944f653a77ab7997c1b28848cff46d`, `c4258f7317089583a5ce3b9b5fcaa4615c12da5e`, `2620b019108782ed5d8a973407b87f4154505a04`, `27d5b9cdcc1fd158afee7f62145a77a18081f51c`, and specification commit `25caf304a51bf69e60755a78b7c20e6d2440ec92`.

This is least-privilege and account-switch hardening rather than a substitute for RLS.

## Portable data export

Migration `0010_account_data_export.sql` is committed and applied. `public.export_my_data()`:

- requires an authenticated `auth.uid()`;
- is `SECURITY INVOKER` with an empty `search_path`;
- is executable by `authenticated` only, not anonymous/public clients;
- returns portable JSON containing all current application-owned data families for the caller;
- uses the same RLS boundary as normal client reads and explicit `user_id` filters;
- does not widen access to `auth.users`.

The app boundary `apps/app/src/infrastructure/supabase/privacy.ts` calls this RPC and adds only the signed-in account email/creation timestamp available from the local authenticated session. `apps/app/src/app/privacy.tsx` exposes the export through Settings: Web downloads JSON and native platforms use the platform share sheet.

The client re-checks the expected user after export. If the active session changes while the RPC is in flight, the payload is discarded instead of being returned under a different active account.

When the application data model gains a new user-owned table, the export RPC must be updated in the same schema change so export completeness does not silently drift.

## Account deletion

`supabase/functions/delete-account/index.ts` is committed and deployed to the authoritative Supabase project as the `delete-account` Edge Function with JWT verification enabled. The hardened expected-user implementation is deployed as function version 2.

The deletion boundary is deliberately server-side and account-fenced:

1. the client verifies that the expected account still owns the local session before starting;
2. the client sends an authenticated request with the explicit `DELETE` confirmation token and `expected_user_id` captured from the initiating account;
3. the Edge Function validates the bearer token to resolve the actual Supabase user;
4. the Edge Function compares the token-resolved user id to `expected_user_id` and returns `409 account_changed` before any deletion if they differ;
5. only the server function reads `SUPABASE_SERVICE_ROLE_KEY` from the Edge runtime environment;
6. the server calls the Auth admin delete-user operation only for the verified matching user;
7. the existing `ON DELETE CASCADE` ownership constraints remove all current application-owned database rows;
8. after confirmed server deletion, the client purges that deleted user's pending offline mutation slots and recent daily snapshot from app-owned local storage;
9. the client clears the local auth session only when that same deleted user is still active, so a concurrent account switch cannot sign out the new user.

The server-side expected-user comparison closes the destructive race that a client-only preflight cannot close: a session change between the client's `getSession()` call and Edge invocation can no longer delete the newly-active account. Implementation commits: Edge guard `3ec7793959b43cfd0a48e4210c91cc6acc3a1cc6`, client request binding `1edb466025638721aeda9487e2fec34322ddf354`, and focused client specification `a47b4d337c2c70867e40c9a54b005db4a34c0c11`.

The local cleanup path is explicit rather than silently assumed. `clearPendingUserMutations()` removes every user-keyed retry slot, and `clearRecentDailySnapshot()` removes the user-keyed cached Today snapshot. `deleteMyAccount()` returns `localDataCleared` separately from server deletion success because a device/browser storage failure cannot roll back an already-confirmed server deletion. If local cleanup cannot be confirmed, the privacy screen tells the user that the account was deleted but local app/site data should be cleared before sharing the device. Earlier implementation commits: `cf78a9ad33cb7b370ed7807d2b9eb43890b693e1`, `cabc2ccaf37dfb16e9b273306ce90aa6e1e71a65`, `0e57f7ccc98cb9c0ef4f08c5c7ecea7050f4fd78`, and `53a28408a49292a596fc454152c8323c90ff157a`.

The service-role key is not present in client source or client environment names and is not returned in responses. The Edge Function intentionally does not log bearer tokens, user IDs, request bodies, exported data, or service errors containing sensitive payloads.

The UI uses a two-step destructive flow. It also states the provider boundary clearly: deletion removes the MIZAN account, MIZAN-owned data, MIZAN connection metadata, and the currently known app-owned local caches for that user, but cannot erase original records held independently in a user's account with an external provider.

The destructive confirmation is scoped to the active account rather than only to screen-local state. When the active `userId` changes, any open delete confirmation and prior status message are cleared, and the final destructive action remains disabled unless the confirmation belongs to the currently active account. Implementation: `92c7f06ad33534b905e38252bfa4758bf950c907`; focused screen regression specification: `apps/app/__tests__/privacy-screen-session-fencing-test.tsx` in `6c84bb8915103f16af68d4c630dc7373aece431a`. The specification was added but not executed under the active worker policy.

## Optional-data consent

Optional spiritual-grounding preference and external integration lifecycle/consent state remain user-controlled. Integration connection rows contain no provider credentials.

The health-integration sync path re-reads authoritative connection state before the first provider read, before any retry, and again after the provider read before persistence. A sync is rejected when the matching connection is not currently `connected`, has been disconnected, has a different consent timestamp, or no longer carries the requested/required scopes. Successful sync bookkeeping is also conditional on the same connection still being connected with the same consent timestamp; it no longer upserts a `connected` state that could overwrite a concurrent revocation. Sync-error bookkeeping only mutates rows that are still connected, so a stale provider failure cannot change a disabled connection back into another active lifecycle state.

`apps/app/__tests__/integration-consent-revocation-test.ts` specifies four revocation races: already-disabled consent prevents any provider call, revocation during a provider read discards the result before persistence, revocation between a temporary provider failure and retry prevents the retry, and a final state race cannot reactivate the connection. These specifications were added but not executed by workers under the current policy.

The broader current-code optional-module audit found no second provider-backed collection path that can bypass this health-sync fencing. Spiritual Grounding currently persists only the app-owned plugin preference; disabling it writes `enabled=false` and clears `consented_at`, and the plugin manifest has no external `dataRequirements`. Time-context and approximate-location capabilities currently expose only typed deterministic/unavailable adapters and centralized registration; there is no application path that reads either provider and persists collected data today. Any future collector for those capabilities must adopt the same authoritative connection/consent recheck before provider access and before persistence rather than relying on UI state.

The integration settings presentation is also fenced to the initiating session. Async connection loads carry both an active-user check and a monotonically invalidated request id, and disconnect completion is discarded after an account switch. Implementation commit: `374ddcb24e43c62b103ff0037c889d2b24931c7f`; regression specification: `apps/app/__tests__/integrations-screen-session-fencing-test.tsx` in `b732b58cfed218e42555c110cc6f80ff5e8f52df`. The specification was added but not run by the worker under the active policy.

## Focused export/deletion security specifications

`supabase/tests/account_data_export_security.sql` specifies the database-side export boundary with rollback-only fixtures. It asserts that `anon` lacks execute privilege, `authenticated` retains execute privilege, the export payload is scoped to the active caller, another user's observation marker cannot leak into the JSON, and nested records do not re-emit `user_id`. Commit: `db58d7c6ab58be4e1260ea85bdeaa50fffedb741`.

`apps/app/__tests__/privacy-session-fencing-test.ts` specifies that the client refuses export/deletion for a different active session, returns coarse errors rather than backend/Edge bodies, keeps local data untouched on server deletion failure, binds the Edge request to `expected_user_id`, purges only the deleted user's local caches after confirmed deletion, does not sign out a newly-active account, and distinguishes confirmed server deletion from incomplete local cleanup. Latest specification commit: `a47b4d337c2c70867e40c9a54b005db4a34c0c11`.

`apps/app/__tests__/privacy-screen-session-fencing-test.tsx` additionally specifies the presentation-level consent boundary: a delete confirmation opened by user A is invalidated when user B becomes active, and user B must begin a fresh two-step confirmation before any destructive call is allowed. Commit: `6c84bb8915103f16af68d4c630dc7373aece431a`.

These are implementation/specification evidence only. They were not executed by the worker under the current policy, and the deployed Edge Function plus Web/native local-purge behavior still need owner-side end-to-end validation.

## Logging and error-reporting boundary

The export/deletion and Auth boundaries return coarse application error kinds and do not expose raw database, Auth, service-role, bearer-token, or provider error bodies to user-facing code. The deletion Edge Function returns stable error codes and contains no request/token/user-data logging.

The root render error boundary originally passed the complete `Error` object to `console.error`, and an earlier hardening pass reduced that to the error name plus React component stack. The remaining error-name field was still application-controlled and therefore could be populated with backend or user-derived data. It has now been removed as well: the development diagnostic logs only a fixed event label plus React's component stack and serializes no `Error` field at all. Production rendering does not use that debug log path. Implementation commits: `7e78c5ff94bd6331098ff436d892b76a968749e8`, `4f8437153debe805139b67e471b337e1c2dfae4f`. `apps/app/__tests__/app-error-boundary-privacy-test.tsx` specifies that arbitrary error name/message content is absent from the diagnostic (`5f78a05ca0fba452378d241e0912e7443f924cce`); the specification was added but not executed under the active worker policy.

The targeted source audit covers Supabase public configuration/client setup, generic data-access error classification, integration persistence/sync error classification, session storage, pending offline mutations, the recent daily snapshot cache, integration UI presentation, global app-state session/persistence handling, authentication/password-update presentation, baseline-target persistence, experiment persistence, What If trial-data persistence, reflection persistence, Life Season persistence, onboarding-context persistence, One Move decision/history reads, pending explicit-feedback lookup, plugin-setting persistence, the app-owned integration contracts/adapters/provider registry, and the privacy/export/deletion boundary. These paths either use raw provider/database messages only for internal coarse classification and return stable kinds/codes, expose no provider-specific secret material, or contain no sensitive logging sink. Provider sync persistence records a sanitized stage/kind error code rather than a raw provider message.

The application-layer review has explicitly inspected action-feedback/outcome handling, daily intelligence/cache fallback, daily recommendation decision recording, check-in submission/queueing, capacity calculations, Cost of Yes provider context, Spiritual Grounding preference persistence, user-target assembly, personal learning, scenario learning, Human ROI, Value Alignment, WHY, Recovery, and Life Seasons. These paths contain no logging sink and propagate structured/coarse failures rather than serializing raw backend/provider error bodies. Cost of Yes can read an injected time-context provider but does not persist the provider payload; the current shipped UI does not wire that capability into an active collector.

The shared presentation boundary has now also been directly inspected: `mizan-ui`, `screen`, `app-navigation`, `app-icon`, `branded-illustration`, `theme`, and localized number-input formatting contain no raw backend/provider logging path and do not serialize user payloads. `AppErrorBoundary` remains the only presentation-level diagnostic sink found in that sweep, and its development-only diagnostic is limited to a fixed event label plus React's component stack. The presentation audit does not claim runtime proof and does not broaden the security boundary; it narrows the remaining CP10 source-review surface to still-unreviewed application/package paths.

The authentication static review found one concrete policy inconsistency rather than a logging leak: password recovery/update already required 8 characters while new-account creation allowed 6. New-account creation now requires 8 characters and presents the existing localized minimum-length guidance, while sign-in intentionally keeps its 6-character client threshold so existing accounts are not rejected client-side. `apps/app/__tests__/auth-screen-test.tsx` specifies the new-account 8-character boundary; the specification was added but not executed under the active worker policy. Implementation commit: `82fb811d77e01bfd61d07f3bdbbbcda92d3b6e9d`; specification commit: `8b7b7258f054a7f5eedb1a320a9c8cea2f199bf1`.

A broader repository-wide source-level log/error-reporting review is still required before CP10 can be considered complete. The current review must not be treated as proof that every application screen, future adapter, or telemetry path is clean.

## Auth hardening still requiring owner action

The live Supabase Security Advisor currently reports `auth_leaked_password_protection`: compromised-password/leaked-password protection is disabled. The available connector cannot change Auth password-security settings, so the exact owner action is recorded in `automation/HUMAN_REQUIRED.md` with the Supabase remediation reference.

## Remaining CP10 work

- Execute the expanded cross-user authorization suite, the Life Season expected-user specification, and `account_data_export_security.sql` in the owner validation environment and record evidence.
- Execute the expanded privacy client specifications and validate the deployed delete-account v2 authentication/expected-user/deletion boundary end to end without exposing service credentials.
- Verify export, account deletion, local cache purge, and the local-cleanup warning path end to end from Web and at least one native target.
- Complete the repository-wide logging/error-reporting sensitive-data audit beyond the targeted boundaries already reviewed.
- Owner-validate the health consent-revocation races and the integration-screen/account-switch/privacy-confirmation/Life-Season fencing; apply the same lifecycle fencing if future time/location collectors are wired.
- Re-run the live Supabase Security Advisor after the owner enables leaked-password protection.
- Re-review the export/delete/local-cache inventory whenever new user-owned tables, storage buckets, local persistence stores, providers, or provider-side credentials are introduced.
