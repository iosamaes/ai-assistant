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

## Function privileges

The live audit found that Supabase default function ACLs had left anonymous execute permission on `set_life_season`, even though the RPC itself rejected a null `auth.uid()`. The trigger helper `set_updated_at` was also directly executable by client roles despite not being a client API.

Migration `0009_function_execute_hardening.sql` is committed and applied. Current live ACLs are now:

- `set_life_season(text, jsonb)`: `authenticated`, `service_role`, and database owner only; no anonymous/public execute grant.
- `set_updated_at()`: service role and database owner only; no public/anonymous/authenticated direct execute grant.
- both functions remain `SECURITY INVOKER`.

This is least-privilege hardening rather than a substitute for RLS.

## Portable data export

Migration `0010_account_data_export.sql` is committed and applied. `public.export_my_data()`:

- requires an authenticated `auth.uid()`;
- is `SECURITY INVOKER` with an empty `search_path`;
- is executable by `authenticated` only, not anonymous/public clients;
- returns portable JSON containing all current application-owned data families for the caller;
- uses the same RLS boundary as normal client reads and explicit `user_id` filters;
- does not widen access to `auth.users`.

The app boundary `apps/app/src/infrastructure/supabase/privacy.ts` calls this RPC and adds only the signed-in account email/creation timestamp available from the local authenticated session. `apps/app/src/app/privacy.tsx` exposes the export through Settings: Web downloads JSON and native platforms use the platform share sheet.

When the application data model gains a new user-owned table, the export RPC must be updated in the same schema change so export completeness does not silently drift.

## Account deletion

`supabase/functions/delete-account/index.ts` is committed and deployed to the authoritative Supabase project as the `delete-account` Edge Function with JWT verification enabled.

The deletion boundary is deliberately server-side:

1. the client must send an authenticated request plus an explicit `DELETE` confirmation token;
2. the Edge Function validates the bearer token to resolve the actual Supabase user;
3. only the server function reads `SUPABASE_SERVICE_ROLE_KEY` from the Edge runtime environment;
4. the server calls the Auth admin delete-user operation for that authenticated user;
5. the existing `ON DELETE CASCADE` ownership constraints remove all current application-owned rows;
6. the client clears its local session after confirmed deletion.

The service-role key is not present in client source or client environment names and is not returned in responses. The Edge Function intentionally does not log bearer tokens, user IDs, request bodies, exported data, or service errors containing sensitive payloads.

The UI uses a two-step destructive flow. It also states the provider boundary clearly: deletion removes the MIZAN account, MIZAN-owned data, and MIZAN connection metadata, but cannot erase original records held independently in a user's account with an external provider.

## Optional-data consent

Optional spiritual-grounding preference and external integration lifecycle/consent state remain user-controlled. Integration connection rows contain no provider credentials.

The health-integration sync path now re-reads authoritative connection state before the first provider read, before any retry, and again after the provider read before persistence. A sync is rejected when the matching connection is not currently `connected`, has been disconnected, has a different consent timestamp, or no longer carries the requested/required scopes. Successful sync bookkeeping is also conditional on the same connection still being connected with the same consent timestamp; it no longer upserts a `connected` state that could overwrite a concurrent revocation. Sync-error bookkeeping only mutates rows that are still connected, so a stale provider failure cannot change a disabled connection back into another active lifecycle state.

`apps/app/__tests__/integration-consent-revocation-test.ts` specifies four revocation races: already-disabled consent prevents any provider call, revocation during a provider read discards the result before persistence, revocation between a temporary provider failure and retry prevents the retry, and a final state race cannot reactivate the connection. These specifications were added but not executed by workers under the current policy.

This closes the concrete health-sync collection/reconnect gap statically. CP10 still needs the broader optional-module pass, including spiritual-grounding and any future provider-backed collectors, plus owner runtime validation of the integration revocation behavior.

## Logging and error-reporting boundary

The new export/deletion code returns coarse error states to the UI and does not expose raw database, Auth, service-role, bearer-token, or provider error bodies. The root render error boundary logs an error and component stack only under `__DEV__`; production rendering does not use that debug log path.

A broader source-level log/error-reporting review is still required before CP10 can be considered complete, especially as provider adapters or telemetry are added.

## Auth hardening still requiring owner action

The live Supabase Security Advisor currently reports `auth_leaked_password_protection`: compromised-password/leaked-password protection is disabled. The available connector cannot change Auth password-security settings, so the exact owner action is recorded in `automation/HUMAN_REQUIRED.md` with the Supabase remediation reference.

## Remaining CP10 work

- Execute the expanded cross-user authorization suite in the owner validation environment and record evidence.
- Add focused tests for authenticated-only export/function ACL behavior and the delete-account boundary without exposing service credentials.
- Verify export and account deletion end to end from Web and at least one native target.
- Complete the repository-wide logging/error-reporting sensitive-data audit.
- Complete the broader optional-module consent-revocation audit beyond the now-fenced health-integration sync path, and owner-validate the revocation races.
- Re-run the live Supabase Security Advisor after the owner enables leaked-password protection.
- Re-review the export/delete inventory whenever new user-owned tables, storage buckets, providers, or provider-side credentials are introduced.
