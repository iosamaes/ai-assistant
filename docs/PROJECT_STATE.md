# MIZAN Project State

## Current checkpoint
- Active engineering checkpoint: **CP9 — Responsive UX, accessibility, localization, polish, and design-swappability** (`IN_PROGRESS`).
- CP10 security/privacy implementation has started in parallel because the remaining CP9 gate is primarily owner-side runtime/visual evidence; this does not mark CP9 complete.
- Product authority: GitHub `iosamaes/ai-assistant@main`.
- Task digest: `8ad16d4d56ff9369c3f35fa3ce11a13de5260df5`.
- Current worker policy: GitHub source changes and explicitly authorized Supabase product/schema mutations are allowed; workers must not run product tests, builds, typechecks, validation database scripts, GitHub Actions, or cloud CI. Execution-dependent gates remain owner validation.

## Checkpoints
- [x] CP0 — Reconnaissance, product model, executable plan
- [ ] CP1 — Universal application foundation — `BLOCKED_HUMAN` only for owner-side responsive/locale evidence
- [ ] CP2 — Supabase, auth, ownership, persistence — implementation present; owner/runtime validation pending
- [ ] CP3 — Deterministic intelligence core — implementation present; validation pending
- [ ] CP4 — First complete daily loop — implementation present; validation pending
- [ ] CP5 — Insight, explanation, personal learning — implementation present; validation pending
- [ ] CP6 — Advanced decision tools — implementation present; validation pending
- [ ] CP7 — Plugins, unified integrations, provider boundaries — implementation present; validation pending
- [ ] CP8 — Reliability, offline tolerance, sync — statically reviewed complete; owner/runtime validation pending
- [ ] CP9 — Responsive UX, accessibility, localization, polish, design-swappability — **IN_PROGRESS**
- [ ] CP10 — Security, privacy, owner-data control — **IN_PROGRESS in parallel; live schema audit/export/delete foundation present; validation and remaining audit work pending**
- [ ] CP11 — Test matrix, performance, release readiness
- [ ] CP12 — Independent final review and handoff

## CP8 current implementation
Detailed ledger: `docs/CP8_RELIABILITY.md`.

Current implementation includes durable per-user retry for check-ins and Invisible Wins, stable client mutation IDs and duplicate-safe replay, normalized integration idempotency, recent Today snapshot caching with validation/expiry, explicit cached/queued presentation, experiment terminal-state conflict protection, atomic Life Season transitions, and recorded reconnect/restart/concurrency specifications.

CP8 is not credited `DONE` until owner/runtime evidence confirms restart/reload and offline/reconnect behavior.

## CP9 current implementation
Presentation boundary:
- centralized semantic palette, typography, spacing, radii, controls/touch sizing, border, interaction, and responsive layout tokens;
- shared `MizanText`, `Card`, `MizanTextInput`, `PrimaryButton`, `SecondaryButton`, and `ChoiceChip`;
- centralized responsive `Screen` behavior;
- reduced-motion navigation behavior;
- broad static pass over RTL, dynamic type, accessibility states/live regions, async interaction fencing, localization, and repeated visual semantics across primary routes.

Latest static CP9 work:
- **Integrations Western-digit timestamp hardening:** Arabic `Last sync` and consent timestamps now use `ar-QA-u-nu-latn`, preventing `Intl.DateTimeFormat` from reintroducing Arabic-Indic digits on the Integrations surface and bringing those dynamic dates into the owner-wide ASCII `0-9` policy. Commit `0dace9d1d5555aef1d802f66469a5786110b0bac`.
- **Today cross-user async-state fencing:** Today now associates its loaded daily snapshot and pending feedback target with the current user, clears prior-user state during reloads, prevents a new session from deriving recommendations or submitting feedback against stale prior-user data, and announces current-state/balance/momentum loading/error/empty transitions politely to screen readers. Commit `8b097bc8911ac91846bd51f92a19701c9057ed25`.
- **Owner-wide Western-digit policy:** the mission now requires Western/ASCII digits `0-9` in both Arabic and English UI. `formatLocalizedNumber` always emits Latin digits, while localized input parsing remains tolerant of Arabic-Indic/Eastern keyboard input and normalizes it before calculation. Static Arabic copy across current routes/i18n was swept back to Western digits, and Arabic date/time formatting uses the `nu-latn` numbering-system extension so Arabic language/RTL presentation does not reintroduce `١٢٣`. Current route/i18n static scan found no Arabic-Indic/Eastern digit literals outside the intentional parser acceptance logic. Task commit `3ef3d3da60b45cce94b6b6680c1f56e6f0844c00`; formatter commit `a5e3a2864ba49700ac92de8fdfb33b49981c18ab`; translation/date cleanup continued through `81011c087f2990eb82e13275507cbfa69a04c0ef`.
- **Personal Learning digit/state hardening:** Arabic Personal Learning history dates now force the Latin numbering system (`ar-QA-u-nu-latn`) so localized dates still obey the owner-wide Western-digit policy. The screen also clears prior action history before a new user/session load and renders learned-action cards only from a confirmed ready state, preventing stale prior-user learning data from remaining visible during loading or after a failed reload. Commit `8e94d06ff3c903488ca881adcad7a9f6f35dc4a2`.
- **Personalization stale-state fencing:** Personalization now clears the previous Human State Vector before loading a new user/session and renders maturity/progression content only when the load is confirmed ready. This prevents stale personalization state from appearing alongside loading/error UI or leaking across a user switch. Commit `467ffd4d34467a960112186e746478be2aa73c97`.
- **Spiritual Grounding preference async-state honesty:** the preference hook now clears a prior user's choice before loading a new session, fences load/save responses to the current user, clears stale choice on load failure, and rolls back optimistic enable/disable changes when persistence fails. This prevents cross-user stale consent state or an unsaved preference from being presented as authoritative. Commit `833d1755f4cb879468af6d2e6656438985248356`.
- **Integration fallback localization:** unknown/future provider ids, capability ids, and permission scopes no longer fall through to raw technical identifiers in shipped UI; Integrations now uses localized generic fallbacks in Arabic and English while keeping known provider/scope labels specific. Commit `8e1182e90339cb98411d26dffbc0fb628383bb69`.
- **Invisible Wins state honesty:** load failures are now tracked separately from save feedback, so a failed history request no longer renders the contradictory “no reflections yet” empty state at the same time. The load failure remains a polite live announcement. Commit `6c9062a858a58b68603de703218695a02757e95f`.
- **Integrations async-state fencing:** refresh failures now clear stale connection data, connection cards render only for a confirmed ready state, and a successful disconnect keeps controls fenced until the authoritative reload finishes. This prevents stale “connected” UI or a second disconnect action while the refreshed lifecycle state is unresolved. Commit `412658e1ddf1f51676d2b1c0beae7f244c505843`.
- **Numeric localization extended to Life Seasons, Value Alignment, and Check-in:** Life Seasons now uses locale-aware digits for its 1–5 target copy, target chips, and recorded target history; Value Alignment locale-formats evidence counts; Check-in locale-formats rating-chip text and the corresponding assistive labels. Commits `61153d3900ff788c2914b630ad9b72f767dba7fc`, `6f0092940b23a86a12bc1334245f3ec95371cd25`, `b1de3ea1bdd63c7b9bf5ade1cd143a076504a1ca`.
- **Insights dynamic-type hardening:** header/detail rows now wrap and allow text shrinkage consistently with the already-hardened WHY/Life Map patterns, reducing narrow-width and large-text collision risk. Commit `a7737820279ef87ffff7c6aebba67994682b121b`.
- **Numeric localization specification:** `apps/app/__tests__/advanced-tools-test.ts` covers Arabic and English formatted-number output in addition to localized decimal parsing. Commit `4cd50a79e013ba78cd25ced4e6a6d99600a236fb`; not worker-run under current policy.
- **Recent accessibility/interaction hardening already on main:** async state fencing across onboarding, auth, password recovery, What If, Invisible Wins, Experiments, Life Seasons, Settings and Check-in; disabled semantics in shared fields/chips; keyboard-safe shared scrolling; startup-safe reduced motion; root fallback bidi parity; unknown-data honesty in Capacity; localized integration metadata; live-region/RTL/dynamic-type fixes across primary surfaces.

The TASK-required final design-swap proof is **not claimed**. It still requires owner visual/runtime validation using a substantially different visual direction and representative device widths.

## CP10 current implementation
Detailed ledger/threat model: `docs/CP10_SECURITY_PRIVACY.md`.

Security/privacy work completed in this slice:
- **Live RLS inventory:** the authoritative Supabase project currently has ten public client-visible user-owned tables; all ten report RLS enabled with four CRUD policies, and all current `user_id` foreign keys point to `auth.users(id) ON DELETE CASCADE`. No Storage buckets currently exist.
- **Cross-user test expansion:** `supabase/tests/rls_cross_user.sql` now covers all ten current user-owned tables for read isolation plus representative cross-user write rejection while preserving own-user writes. Commit `4368b83e7a9cc42dcf2667c6a970129541eaac05`; not worker-run under current policy.
- **Function ACL least privilege:** live audit found anonymous execute on `set_life_season` and direct client execute on trigger helper `set_updated_at`. Migration `0009_function_execute_hardening.sql` removed anonymous/public execute from the user RPC and removed public/anon/authenticated direct execute from the trigger helper while retaining authenticated use of `set_life_season`. Commit `769ab19bbe5de6e1a5395b03a77ac14b53bb0fd2`; migration applied successfully to project `olfhjnropdrnujgpidfi` and live ACLs were re-read after application.
- **Portable export RPC:** migration `0010_account_data_export.sql` adds authenticated-only, `SECURITY INVOKER` `export_my_data()` returning all current application-owned data families as portable JSON under the caller's existing RLS boundary. Commit `ae38bc26526ec3d1b7e9201c8ed0395fbbe8dc6b`; migration applied successfully and live ACL re-read confirms no anon/public execute.
- **Account deletion server boundary:** `supabase/functions/delete-account/index.ts` validates JWT plus an explicit deletion confirmation and uses the Edge runtime service-role secret only server-side to hard-delete the authenticated Supabase Auth user. Existing cascades delete all current MIZAN-owned rows. Source commit `0f71a0aaad89aa17e4dd0fb9596fadcd83116750`; deployed Edge Function `delete-account` is ACTIVE with JWT verification enabled.
- **Client privacy boundary/UI:** `apps/app/src/infrastructure/supabase/privacy.ts` exposes coarse export/delete results without leaking backend errors; `apps/app/src/app/privacy.tsx` provides Arabic/English export plus two-step permanent deletion; Web export downloads JSON and native export uses the platform share sheet. The route is registered in `_layout.tsx`, and Settings now exposes a visible Privacy & Data entry point. Commits `4a8ede924fca0176fd117f847b21c1e87a35cc30`, `fcf7d3b593911cd1c53310ac8d8f0652b7c3c8cd`, `e9bba3f21445a60509ec72d76872faac511b9b9e`, `692e4bd4720bc4d790cca60144abbc5223ad9133`.
- **Privacy cross-user/session fencing:** export now requires the expected active user before the RPC and re-checks that same identity after the RPC before returning any payload/account metadata; a mid-flight session switch discards the old payload instead of risking mixed account metadata or delivery to a different session. Account deletion also verifies its initiating user and clears the local session only if that same user remains active, while the Privacy screen binds each async action to the initiating `userId` and ignores stale results after a user switch. Commits `0477db9b58d94e0dea919fad70d329dce0b52074`, `cd20bb8d8f9a3a4ceee27499bcd6a30baf6c3180`.
- **Privacy session-fencing specifications:** `apps/app/__tests__/privacy-session-fencing-test.ts` specifies same-user export success, mid-flight export discard, pre-RPC identity mismatch rejection, deletion without signing out a newly active user, and local sign-out when the deleted user is still active. Commit `e9716ba30916ecc011a012a0121fb970c3094826`; not worker-run under current policy.
- **Threat model/documentation:** `docs/CP10_SECURITY_PRIVACY.md` records assets, trust boundaries, RLS/function/storage inventory, export/delete design, service-role separation, provider-side deletion boundary, logging posture, and remaining CP10 work. Commit `cb5cd867c56a73eab531c8b83b5ac18acc044533`.
- **Auth advisor owner action:** the live Supabase Security Advisor reports leaked-password protection disabled. This cannot be changed by the available connector, so a non-blocking exact owner action was added to `automation/HUMAN_REQUIRED.md` rather than stopping engineering work.

CP10 is **not complete**. Remaining requirements include owner-executed authorization/export/delete validation, remaining focused function-ACL/delete-boundary specifications, repository-wide sensitive logging/error-reporting audit, and explicit proof that optional-data consent revocation stops future collection.

## Test matrix progress
- Broad CP2–CP9 app/runtime validation scaffolding exists (`d32636ddd253e3ec688376a4a42596e2844704df`).
- Localized-number input parsing plus Western-digit output coverage exists; Arabic-Indic/Eastern keyboard input is accepted for normalization, while both Arabic and English formatted output are asserted as `0-9`. Latest expectation update: `5421ecd4c3dc84c52f6e0005774b886109365eb2`.
- CP10 cross-user RLS coverage now includes every current public user-owned table, but the updated suite has not been executed by workers.
- CP10 privacy session-fencing specifications now cover export/deletion identity-switch races in `apps/app/__tests__/privacy-session-fencing-test.ts`; they have not been executed by workers.
- These suites have **not** been executed by workers under the current policy; no PASS is claimed from their presence alone.

## Exact next executable action
1. Continue the repository-wide CP9 static pass only for concrete remaining defects: untranslated production literals, Western-digit regressions, semantic RTL, accessibility states/live announcements, truncation/dynamic-type risks, keyboard/focus gaps, and unjustified duplicated global visual decisions.
2. In parallel continue CP10 static engineering: audit logs/error-reporting and provider/optional-module consent revocation paths for sensitive-data leakage or collection-after-revocation; add focused authorization/export/delete specifications where gaps are found without running them.
3. Revisit already-audited CP9 surfaces only when inspection finds a concrete defect; do not create abstraction-only cleanup.
4. Leave representative-width runtime checks, post-baseline tests/builds/typechecks/database validation suites, end-to-end export/delete proof, CP1–CP8 execution-dependent evidence, and final design-swap proof to owner validation under the active policy.

## Verification record
Previously recorded owner-side baseline evidence:
- Root typecheck PASS.
- Lint PASS.
- Core tests 3/3 PASS.
- Plugin tests 2/2 PASS.
- Expo Doctor 21/21 PASS.
- Android export PASS.
- iOS export PASS.
- Earlier auth/data-access app typecheck and lint PASS.

Post-baseline:
- No worker-run app tests, builds, typechecks, validation database scripts, cloud CI, or GitHub Actions are claimed for CP2–CP10 changes.
- Authorized product migrations `function_execute_hardening` and `account_data_export` were applied to the named Supabase project and their resulting live function ACLs were queried directly; this is implementation/state evidence, not a test-suite PASS.
- `delete-account` Edge Function deployment reports ACTIVE with JWT verification enabled; no end-to-end destructive deletion test was run by the worker.
- Current CP9 evidence remains static implementation/code-review evidence until owner validation runs the validation matrix and representative device/browser/screen-reader checks.

## Known blockers / risks
- CP1: Windows session must be unlocked normally for true narrow-phone Arabic/English interaction evidence; see `automation/HUMAN_REQUIRED.md`.
- CP2: hosted Supabase Auth redirect allow-list owner action remains open; see `automation/HUMAN_REQUIRED.md`.
- CP10: Supabase leaked-password protection remains disabled pending the recorded owner Auth-setting action; see `automation/HUMAN_REQUIRED.md`.
- Cross-user/database specifications and all post-baseline runtime/type/build gates still require owner execution evidence.
- Recent Today snapshot native SecureStore behavior/capacity still needs owner runtime validation.
- Static CP9 review is not a substitute for visual/device/screen-reader validation.
- Privacy export/delete UI and Edge deletion still need owner Web/native end-to-end validation before the CP10 gate can be credited.
- No real AI, wearable, calendar, or location credentials are configured; deterministic/unavailable adapters remain the supported fallback path.

## Evidence paths
- `docs/CP8_RELIABILITY.md`
- `docs/CP9_PRESENTATION_ARCHITECTURE.md`
- `docs/CP10_SECURITY_PRIVACY.md`
- `supabase/tests/rls_cross_user.sql`
- `supabase/migrations/0009_function_execute_hardening.sql`
- `supabase/migrations/0010_account_data_export.sql`
- `supabase/functions/delete-account/index.ts`
- `apps/app/src/infrastructure/supabase/privacy.ts`
- `apps/app/src/app/privacy.tsx`
- `apps/app/__tests__/privacy-session-fencing-test.ts`
- `apps/app/src/constants/theme.ts`
- `apps/app/src/components/mizan-ui.tsx`
- `apps/app/src/components/screen.tsx`
- `apps/app/src/i18n/number-input.ts`
- `apps/app/src/application/spiritual-grounding.ts`
- `apps/app/src/app/onboarding.tsx`
- `apps/app/src/app/what-if.tsx`
- `apps/app/src/app/cost-of-yes.tsx`
- `apps/app/src/app/human-roi.tsx`
- `apps/app/src/app/insights.tsx`
- `apps/app/src/app/why.tsx`
- `apps/app/src/app/capacity.tsx`
- `apps/app/src/app/life-map.tsx`
- `apps/app/src/app/personal-learning.tsx`
- `apps/app/src/app/personalization.tsx`
- `apps/app/src/app/experiments.tsx`
- `apps/app/src/app/recovery.tsx`
- `apps/app/src/app/life-seasons.tsx`
- `apps/app/src/app/value-alignment.tsx`
- `apps/app/src/app/check-in.tsx`
- `apps/app/src/app/today.tsx`
- `apps/app/src/app/invisible-wins.tsx`
- `apps/app/src/app/integrations.tsx`
- `apps/app/src/app/settings.tsx`
- `apps/app/__tests__/advanced-tools-test.ts`
- `automation/HUMAN_REQUIRED.md`
